package com.xeenox.salepunch;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;
import android.webkit.CookieManager;

import org.json.JSONObject;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Keeps this phone "ready for calls": every few seconds it asks SalePunch
 * whether the agent clicked Call on a computer, and if so dials the lead from
 * this phone's SIM. The call is then tracked and uploaded by CallTracker.
 */
public class ReadyService extends Service {
    private static final String TAG = "SalePunch";
    private static final String CHANNEL = "ready";
    private static final int NOTE_ID = 7;
    private static final long POLL_MS = 4000;
    static final String ACTION_STOP = "com.xeenox.salepunch.STOP";

    private final Handler main = new Handler(Looper.getMainLooper());
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private boolean running = false;
    private String lastState = "";

    static void start(Context ctx) {
        Intent i = new Intent(ctx, ReadyService.class);
        if (Build.VERSION.SDK_INT >= 26) ctx.startForegroundService(i);
        else ctx.startService(i);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            running = false;
            stopForeground(STOP_FOREGROUND_REMOVE);
            stopSelf();
            return START_NOT_STICKY;
        }
        showNotification("Ready for calls", "Click Call on your computer and this phone dials the lead.");
        if (!running) {
            running = true;
            main.post(this::tick);
        }
        return START_STICKY;
    }

    private void tick() {
        if (!running) return;
        io.execute(() -> {
            long next = POLL_MS;
            try {
                CallTracker t = CallTracker.get(this);
                t.checkPending();
                next = poll(t.busy());
            } catch (Exception e) {
                Log.w(TAG, "poll failed", e);
                setState("offline", "Can't reach SalePunch", "Check the internet connection. Retrying…");
                next = 15000;
            }
            main.postDelayed(this::tick, next);
        });
    }

    /** Returns the delay before the next poll. */
    private long poll(boolean busy) throws Exception {
        Uri app = Uri.parse(BuildConfig.APP_URL);
        String origin = app.getScheme() + "://" + app.getHost();
        String cookie = CookieManager.getInstance().getCookie(origin);
        if (cookie == null || !cookie.contains("sp_session=")) {
            setState("signed_out", "Sign in to SalePunch", "Open the app and sign in to take calls from your computer.");
            return 15000;
        }
        HttpURLConnection con = (HttpURLConnection) new URL(origin + "/api/phone/next").openConnection();
        try {
            con.setRequestMethod("POST");
            con.setConnectTimeout(10000);
            con.setReadTimeout(15000);
            con.setDoOutput(true);
            con.setRequestProperty("x-salepunch", "1");
            con.setRequestProperty("content-type", "application/json");
            con.setRequestProperty("cookie", cookie);
            try (OutputStream out = con.getOutputStream()) {
                out.write(("{\"version\":\"" + BuildConfig.VERSION_NAME + "\",\"busy\":" + busy + "}").getBytes(StandardCharsets.UTF_8));
            }
            int code = con.getResponseCode();
            if (code == 401) {
                setState("signed_out", "Sign in to SalePunch", "Open the app and sign in to take calls from your computer.");
                return 15000;
            }
            if (code < 200 || code >= 300) throw new java.io.IOException("HTTP " + code);
            String text;
            try (InputStream in = con.getInputStream()) {
                java.io.ByteArrayOutputStream buf = new java.io.ByteArrayOutputStream();
                byte[] chunk = new byte[4096];
                int n;
                while ((n = in.read(chunk)) > 0) buf.write(chunk, 0, n); // readAllBytes() needs Android 13+
                text = buf.toString("UTF-8");
            }
            if (!busy) setState("ready", "Ready for calls", "Click Call on your computer and this phone dials the lead.");
            JSONObject call = new JSONObject(text).optJSONObject("call");
            if (call != null) {
                String id = call.getString("id");
                String phone = call.getString("phone");
                String name = call.optString("name", "");
                main.post(() -> CallTracker.get(this).start(id, phone));
                setState("calling:" + id, "Calling " + (name.isEmpty() ? phone : name), "The call is recorded and uploaded when it ends.");
                return 8000;
            }
            return POLL_MS;
        } finally {
            con.disconnect();
        }
    }

    private void setState(String state, String title, String text) {
        if (state.equals(lastState)) return;
        lastState = state;
        main.post(() -> showNotification(title, text));
    }

    private void showNotification(String title, String text) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(CHANNEL) == null) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, "Ready for calls", NotificationManager.IMPORTANCE_LOW);
            ch.setDescription("Shows that calls clicked on your computer will be dialled from this phone");
            nm.createNotificationChannel(ch);
        }
        PendingIntent open = PendingIntent.getActivity(this, 0, new Intent(this, MainActivity.class), PendingIntent.FLAG_IMMUTABLE);
        PendingIntent stop = PendingIntent.getService(this, 1, new Intent(this, ReadyService.class).setAction(ACTION_STOP), PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CHANNEL) : new Notification.Builder(this);
        Notification n = b.setSmallIcon(android.R.drawable.stat_sys_phone_call)
                .setContentTitle(title)
                .setContentText(text)
                .setOngoing(true)
                .setContentIntent(open)
                .addAction(new Notification.Action.Builder(null, "Stop", stop).build())
                .build();
        if (Build.VERSION.SDK_INT >= 34) startForeground(NOTE_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        else startForeground(NOTE_ID, n);
    }

    @Override
    public void onDestroy() {
        running = false;
        io.shutdownNow();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}
