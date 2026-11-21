package com.xeenox.salepunch;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.ArrayList;
import java.util.List;

/**
 * SalePunch phone app: opens the SalePunch web app and gives it a
 * "SalePunchPhone" bridge, so tapping Call dials from this phone's SIM and the
 * phone's own call recording is uploaded automatically when the call ends.
 */
public class MainActivity extends Activity {
    private static final int REQ_PERMS = 1;
    private static final int REQ_FILE = 2;

    private WebView web;
    private CallTracker tracker;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUserAgentString(s.getUserAgentString() + " SalePunchApp/" + BuildConfig.VERSION_NAME);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false);

        tracker = new CallTracker(this, web);
        web.addJavascriptInterface(new Bridge(), "SalePunchPhone");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme() == null ? "" : uri.getScheme();
                if (scheme.equals("tel")) { // a plain tel: link: just open the dialer
                    startActivity(new Intent(Intent.ACTION_DIAL, uri));
                    return true;
                }
                Uri home = Uri.parse(BuildConfig.APP_URL);
                if (home.getHost() != null && home.getHost().equals(uri.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (ActivityNotFoundException ignored) { }
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                CookieManager.getInstance().flush();
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try {
                    startActivityForResult(params.createIntent(), REQ_FILE);
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });
        setContentView(web);
        askPermissions();
        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(BuildConfig.APP_URL);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onResume() {
        super.onResume();
        tracker.onAppResumed(); // finish a call whose end we missed
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_FILE && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            fileCallback = null;
        }
    }

    static String[] neededPermissions() {
        List<String> p = new ArrayList<>();
        p.add(Manifest.permission.CALL_PHONE);
        p.add(Manifest.permission.READ_PHONE_STATE);
        p.add(Manifest.permission.READ_CALL_LOG);
        if (Build.VERSION.SDK_INT >= 33) p.add(Manifest.permission.READ_MEDIA_AUDIO);
        else p.add(Manifest.permission.READ_EXTERNAL_STORAGE);
        return p.toArray(new String[0]);
    }

    boolean has(String permission) {
        return checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED;
    }

    private void askPermissions() {
        List<String> missing = new ArrayList<>();
        for (String p : neededPermissions()) if (!has(p)) missing.add(p);
        if (!missing.isEmpty()) requestPermissions(missing.toArray(new String[0]), REQ_PERMS);
    }

    /** Methods the web app can call as window.SalePunchPhone.*. */
    private class Bridge {
        @JavascriptInterface
        public String version() { return BuildConfig.VERSION_NAME; }

        /** True when the app may dial and read call logs. */
        @JavascriptInterface
        public boolean ready() {
            return has(Manifest.permission.CALL_PHONE) && has(Manifest.permission.READ_CALL_LOG);
        }

        @JavascriptInterface
        public void askPermissions() {
            runOnUiThread(() -> {
                boolean blocked = false;
                for (String p : neededPermissions()) {
                    if (!has(p) && !shouldShowRequestPermissionRationale(p)) blocked = true;
                }
                MainActivity.this.askPermissions();
                if (blocked) { // permanently denied: open this app's settings
                    Intent i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName()));
                    startActivity(i);
                }
            });
        }

        /** Dial `phone` from this phone's SIM and track call `callId`. */
        @JavascriptInterface
        public void call(String callId, String phone) {
            runOnUiThread(() -> tracker.start(callId, phone));
        }

        /** Opens the phone dialer's settings so the agent can turn on auto recording. */
        @JavascriptInterface
        public void openRecorderSettings() {
            runOnUiThread(() -> {
                try { startActivity(new Intent("android.telecom.action.SHOW_CALL_SETTINGS")); }
                catch (Exception e) { startActivity(new Intent(Intent.ACTION_DIAL)); }
            });
        }
    }
}
