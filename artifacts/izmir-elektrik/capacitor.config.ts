import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.izmir.kesintitakibi",
  appName: "İzmir Kesinti Takibi",

  /* Die APK lädt die App immer live von der deployed Replit-URL.
   * Kein lokaler Build nötig — immer aktuellste Version. */
  webDir: "dist/public",

  server: {
    url: "REPLIT_DEPLOY_URL_PLACEHOLDER",
    cleartext: false,
  },

  android: {
    backgroundColor: "#0b4d7a",
    allowMixedContent: false,
    captureInput: true,
  },

  plugins: {},
};

export default config;
