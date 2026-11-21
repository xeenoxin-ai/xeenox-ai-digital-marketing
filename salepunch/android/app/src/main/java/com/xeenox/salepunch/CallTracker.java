package com.xeenox.salepunch;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.CallLog;
import android.provider.MediaStore;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyCallback;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.webkit.CookieManager;
import android.webkit.WebView;

import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * Follows one call from dial to hang-up:
 *  1. dials the lead from this phone's SIM (ACTION_CALL),
 *  2. waits for the phone to go idle again,
 *  3. reads the call log for the real length and whether it was answered,
 *  4. finds the recording saved by the phone's built-in call recorder,
 *  5. uploads both to SalePunch (/api/calls/{id}/finish).
 * The pending call is kept in SharedPreferences, so it is finished even if the
 * app was closed during the call (it is picked up again when the app opens).
 */
class CallTracker {
    private static final String TAG = "SalePunch";
    private static final String PREFS = "salepunch_call";
    private static final int MAX_TRIES = 5;

    private final MainActivity activity;
    private final WebView web;
    private final SharedPreferences prefs;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final Executor io = Executors.newSingleThreadExecutor();
    private boolean offhookSeen = false;
    private boolean finishing = false;
    private Object listener; // PhoneStateListener or TelephonyCallback

    CallTracker(MainActivity activity, WebView web) {
        this.activity = activity;
        this.web = web;
        this.prefs = activity.getSharedPreferences(PREFS, 0);
    }

    // ---------------------------------------------------------------- start
    void start(String callId, String phone) {
        prefs.edit()
            .putString("id", callId)
            .putString("phone", phone)
            .putLong("start", System.currentTimeMillis())
            .putInt("tries", 0)
            .apply();
        offhookSeen = false;
        finishing = false;
        listen();
        Uri tel = Uri.parse("tel:" + Uri.encode(phone));
        boolean canCall = activity.has(Manifest.permission.CALL_PHONE);
        try {
            activity.startActivity(new Intent(canCall ? Intent.ACTION_CALL : Intent.ACTION_DIAL, tel));
        } catch (Exception e) {
            Log.w(TAG, "dial failed", e);
            activity.startActivity(new Intent(Intent.ACTION_DIAL, tel));
        }
    }

    /** The app came back to the front: maybe the call ended while we were not listening. */
    void onAppResumed() {
        if (prefs.getString("id", null) == null || finishing) return;
        long started = prefs.getLong("start", 0);
        if (System.currentTimeMillis() - started < 5000) return;
        if (callState() == TelephonyManager.CALL_STATE_IDLE) scheduleFinish(3000);
    }

    // ---------------------------------------------------------------- call state
    private int callState() {
        try {
            TelephonyManager tm = (TelephonyManager) activity.getSystemService(android.content.Context.TELEPHONY_SERVICE);
            if (Build.VERSION.SDK_INT >= 31 && !activity.has(Manifest.permission.READ_PHONE_STATE)) return TelephonyManager.CALL_STATE_IDLE;
            return tm.getCallState();
        } catch (Exception e) {
            return TelephonyManager.CALL_STATE_IDLE;
        }
    }

    private void onState(int state) {
        if (state == TelephonyManager.CALL_STATE_OFFHOOK) offhookSeen = true;
        if (state == TelephonyManager.CALL_STATE_IDLE && offhookSeen && prefs.getString("id", null) != null) {
            offhookSeen = false;
            scheduleFinish(4000); // give the phone's recorder a moment to save the file
        }
    }

    private void listen() {
        if (listener != null || !activity.has(Manifest.permission.READ_PHONE_STATE)) return;
        TelephonyManager tm = (TelephonyManager) activity.getSystemService(android.content.Context.TELEPHONY_SERVICE);
        try {
            if (Build.VERSION.SDK_INT >= 31) {
                Cb cb = new Cb();
                tm.registerTelephonyCallback(activity.getMainExecutor(), cb);
                listener = cb;
            } else {
                PhoneStateListener l = new PhoneStateListener() {
                    @Override
                    public void onCallStateChanged(int state, String number) { onState(state); }
                };
                tm.listen(l, PhoneStateListener.LISTEN_CALL_STATE);
                listener = l;
            }
        } catch (SecurityException e) {
            Log.w(TAG, "cannot listen to call state", e);
        }
    }

    private class Cb extends TelephonyCallback implements TelephonyCallback.CallStateListener {
        @Override
        public void onCallStateChanged(int state) { onState(state); }
    }

    // ---------------------------------------------------------------- finish
    private void scheduleFinish(long delayMs) {
        if (finishing) return;
        finishing = true;
        main.postDelayed(() -> io.execute(this::finish), delayMs);
    }

    private void finish() {
        String id = prefs.getString("id", null);
        if (id == null) { finishing = false; return; }
        String phone = prefs.getString("phone", "");
        long start = prefs.getLong("start", System.currentTimeMillis());
        int tries = prefs.getInt("tries", 0) + 1;
        prefs.edit().putInt("tries", tries).apply();

        CallInfo info = readCallLog(phone, start);
        Recording rec = findRecording(phone, start);
        boolean answered = info != null ? info.durationSec > 0 : rec != null;
        // The recording often appears a few seconds after the call ends.
        if (answered && rec == null && tries < MAX_TRIES) {
            finishing = false;
            scheduleFinish(5000L * tries);
            return;
        }
        String status = answered ? "completed" : "no_answer";
        long duration = info != null ? info.durationSec : Math.max(0, (System.currentTimeMillis() - start) / 1000);
        long startedAt = info != null ? info.date : start;
        boolean ok = upload(id, status, duration, startedAt, rec);
        if (ok || tries >= MAX_TRIES + 3) prefs.edit().clear().apply();
        finishing = false;
        String js = "window.salepunchCallDone && window.salepunchCallDone('" + id.replaceAll("[^A-Za-z0-9]", "") + "', " + ok + ")";
        main.post(() -> web.evaluateJavascript(js, null));
    }

    private static class CallInfo { long date; long durationSec; }

    private static String last10(String number) {
        String d = number == null ? "" : number.replaceAll("\\D", "");
        return d.length() > 10 ? d.substring(d.length() - 10) : d;
    }

    private CallInfo readCallLog(String phone, long start) {
        if (!activity.has(Manifest.permission.READ_CALL_LOG)) return null;
        String want = last10(phone);
        String[] cols = { CallLog.Calls.NUMBER, CallLog.Calls.DATE, CallLog.Calls.DURATION, CallLog.Calls.TYPE };
        try (Cursor c = activity.getContentResolver().query(CallLog.Calls.CONTENT_URI, cols,
                CallLog.Calls.DATE + " >= ? AND " + CallLog.Calls.TYPE + " = ?",
                new String[] { String.valueOf(start - 15000), String.valueOf(CallLog.Calls.OUTGOING_TYPE) },
                CallLog.Calls.DATE + " DESC")) {
            while (c != null && c.moveToNext()) {
                if (!want.isEmpty() && !last10(c.getString(0)).equals(want)) continue;
                CallInfo i = new CallInfo();
                i.date = c.getLong(1);
                i.durationSec = c.getLong(2);
                return i;
            }
        } catch (Exception e) {
            Log.w(TAG, "call log read failed", e);
        }
        return null;
    }

    private static class Recording { Uri uri; String name; String mime; long size; }

    /** Newest audio file saved since the call started, preferring call-recorder folders. */
    private Recording findRecording(String phone, long start) {
        String perm = Build.VERSION.SDK_INT >= 33 ? Manifest.permission.READ_MEDIA_AUDIO : Manifest.permission.READ_EXTERNAL_STORAGE;
        if (!activity.has(perm)) return null;
        Uri coll = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
        String pathCol = Build.VERSION.SDK_INT >= 29 ? MediaStore.Audio.Media.RELATIVE_PATH : MediaStore.Audio.Media.DATA;
        String[] cols = { MediaStore.Audio.Media._ID, MediaStore.Audio.Media.DISPLAY_NAME, MediaStore.Audio.Media.MIME_TYPE,
                MediaStore.Audio.Media.SIZE, MediaStore.Audio.Media.DATE_ADDED, pathCol };
        String digits = last10(phone);
        Recording best = null;
        int bestScore = -1;
        try (Cursor c = activity.getContentResolver().query(coll, cols,
                MediaStore.Audio.Media.DATE_ADDED + " >= ?", new String[] { String.valueOf(start / 1000 - 10) },
                MediaStore.Audio.Media.DATE_ADDED + " DESC")) {
            while (c != null && c.moveToNext()) {
                long size = c.getLong(3);
                if (size < 2000) continue; // empty / still being written
                String name = c.getString(1) == null ? "" : c.getString(1);
                String path = c.getString(5) == null ? "" : c.getString(5);
                String hay = (path + "/" + name).toLowerCase(Locale.ROOT);
                int score = 0;
                if (hay.contains("call")) score += 3;
                if (hay.contains("record")) score += 1;
                if (!digits.isEmpty() && hay.replaceAll("\\D", "").contains(digits)) score += 4;
                if (hay.contains("whatsapp") || hay.contains("voice note") || hay.contains("ringtone")) score -= 10;
                if (score > bestScore) {
                    bestScore = score;
                    best = new Recording();
                    best.uri = ContentUris.withAppendedId(coll, c.getLong(0));
                    best.name = name.isEmpty() ? "call.m4a" : name;
                    best.mime = c.getString(2) == null ? "audio/mp4" : c.getString(2);
                    best.size = size;
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "recording search failed", e);
        }
        return bestScore >= 0 ? best : null;
    }

    // ---------------------------------------------------------------- upload
    private boolean upload(String id, String status, long durationSec, long startedAt, Recording rec) {
        HttpURLConnection con = null;
        try {
            Uri app = Uri.parse(BuildConfig.APP_URL);
            String origin = app.getScheme() + "://" + app.getHost();
            String boundary = "----SalePunch" + UUID.randomUUID();
            con = (HttpURLConnection) new URL(origin + "/api/calls/" + Uri.encode(id) + "/finish").openConnection();
            con.setRequestMethod("POST");
            con.setDoOutput(true);
            con.setConnectTimeout(20000);
            con.setReadTimeout(120000);
            con.setChunkedStreamingMode(64 * 1024);
            con.setRequestProperty("x-salepunch", "1");
            con.setRequestProperty("content-type", "multipart/form-data; boundary=" + boundary);
            String cookie = CookieManager.getInstance().getCookie(origin);
            if (cookie != null) con.setRequestProperty("cookie", cookie);

            try (DataOutputStream out = new DataOutputStream(con.getOutputStream())) {
                field(out, boundary, "status", status);
                field(out, boundary, "duration_sec", String.valueOf(durationSec));
                field(out, boundary, "started_at", Instant.ofEpochMilli(startedAt).toString());
                if (rec != null) {
                    out.write(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"audio\"; filename=\""
                            + rec.name.replace("\"", "") + "\"\r\nContent-Type: " + rec.mime + "\r\n\r\n").getBytes(StandardCharsets.UTF_8));
                    ContentResolver cr = activity.getContentResolver();
                    try (InputStream in = cr.openInputStream(rec.uri)) {
                        byte[] buf = new byte[64 * 1024];
                        int n;
                        while (in != null && (n = in.read(buf)) > 0) out.write(buf, 0, n);
                    }
                    out.write("\r\n".getBytes(StandardCharsets.UTF_8));
                }
                out.write(("--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
            }
            int code = con.getResponseCode();
            Log.i(TAG, "upload " + id + " -> " + code);
            return code >= 200 && code < 300;
        } catch (Exception e) {
            Log.w(TAG, "upload failed", e);
            return false;
        } finally {
            if (con != null) con.disconnect();
        }
    }

    private static void field(OutputStream out, String boundary, String name, String value) throws java.io.IOException {
        out.write(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"" + name + "\"\r\n\r\n" + value + "\r\n")
                .getBytes(StandardCharsets.UTF_8));
    }
}
