import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor configuration for İzmir Kesinti Takibi Android app.
 *
 * Build steps (run on a machine with Android Studio installed):
 *   1.  pnpm --filter @workspace/izmir-elektrik run build
 *   2.  npx cap add android          (first time only)
 *   3.  npx cap sync android
 *   4.  npx cap open android         (opens Android Studio)
 *   5.  In Android Studio → Build → Generate Signed Bundle / APK
 *
 * If you want the WebView to always load the live deployed version instead
 * of the bundled build, uncomment `server.url` below and fill in your
 * Replit deployment domain (e.g. https://izmir-elektrik.yourusername.replit.app).
 */
const config: CapacitorConfig = {
  appId: "com.izmir.kesintitakibi",
  appName: "İzmir Kesinti Takibi",

  /* Points at the Vite build output — produced by `pnpm run build` */
  webDir: "dist",

  /*
   * Uncomment to load the live deployed web app instead of a local bundle.
   * This is the simplest option: no extra build step required on device.
   */
  // server: {
  //   url: "https://izmir-elektrik.YOURNAME.replit.app",
  //   cleartext: false,
  // },

  android: {
    /* Matches the deep-blue primary colour of the app */
    backgroundColor: "#0b4d7a",

    /* Allow mixed content only in dev; never in production */
    allowMixedContent: false,

    /* Capacitor handles this; keep the WebView's built-in zoom disabled */
    captureInput: true,
  },

  plugins: {
    /* No extra plugins required for the current feature set */
  },
};

export default config;
