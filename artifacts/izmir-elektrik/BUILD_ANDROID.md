# Android APK Build-Anleitung — İzmir Kesinti Takibi

## Voraussetzungen (lokal installieren)

| Tool | Version | Link |
|------|---------|-------|
| Node.js | ≥ 20 | https://nodejs.org |
| pnpm | ≥ 9 | `npm i -g pnpm` |
| JDK | 17 | https://adoptium.net |
| Android Studio | Flamingo+ | https://developer.android.com/studio |
| Android SDK | API 34+ | über Android Studio SDK Manager |

---

## Schritt 1 — Projekt klonen & Abhängigkeiten installieren

```bash
# Repository klonen (falls noch nicht geschehen)
git clone <your-repo-url>
cd <repo-dir>
pnpm install
```

---

## Schritt 2 — Web-App bauen

```bash
pnpm --filter @workspace/izmir-elektrik run build
# Ausgabe: artifacts/izmir-elektrik/dist/
```

> **Tipp:** Wenn die App auf den Live-Server zeigen soll (einfachste Option),
> kommentiere in `capacitor.config.ts` den `server.url`-Block ein und trage
> deine Replit-Deployment-URL ein. Dann ist kein Schritt 2 nötig.

---

## Schritt 3 — Android-Plattform hinzufügen

```bash
cd artifacts/izmir-elektrik

# Nur beim ersten Mal:
npx cap add android

# Bei jedem weiteren Build:
npx cap sync android
```

---

## Schritt 4 — Android-Overrides einspielen

Kopiere die vorbereiteten Konfigurationsdateien aus `android-overrides/`
in das generierte `android/`-Verzeichnis:

```bash
# Aus artifacts/izmir-elektrik/
cp android-overrides/app/src/main/AndroidManifest.xml \
   android/app/src/main/AndroidManifest.xml

cp android-overrides/app/src/main/res/values/styles.xml \
   android/app/src/main/res/values/styles.xml

cp android-overrides/app/src/main/res/values/colors.xml \
   android/app/src/main/res/values/colors.xml

cp android-overrides/app/src/main/res/values-night/styles.xml \
   android/app/src/main/res/values-night/styles.xml
```

Diese Dateien aktivieren:
- **Vollbild** (`android:windowFullscreen="true"`) — Status- und Navigationsleiste ausgeblendet
- **Hochformat gesperrt** (`android:screenOrientation="portrait"`)
- **App-Name** „İzmir Kesinti Takibi"
- **Primärfarbe** Deep-Blue `#0B4D7A` (passend zum Web-App-Design)

---

## Schritt 5 — In Android Studio öffnen & APK erstellen

```bash
npx cap open android
```

In Android Studio:
1. **Build → Generate Signed Bundle / APK**
2. APK auswählen → Keystore anlegen (oder vorhandenen nutzen)
3. Release-Variante wählen → Fertig stellen
4. APK liegt unter `android/app/release/app-release.apk`

---

## App-Einstellungen (Zusammenfassung)

| Einstellung | Wert |
|-------------|------|
| App-ID | `com.izmir.kesintitakibi` |
| App-Name | İzmir Kesinti Takibi |
| Bildschirmausrichtung | Nur Hochformat (portrait) |
| Vollbild | Ja — Status- und Navigationsleiste ausgeblendet |
| Min. Android-Version | API 22 (Android 5.1) |
| Ziel-API | 34 (Android 14) |
| Hintergrundfarbe | `#0B4D7A` (Deep Blue) |

---

## Capacitor vs. Cordova

Beide Konfigurationsdateien liegen bereit:

- **`capacitor.config.ts`** → für Capacitor (empfohlen, moderner)
- **`config.xml`** → für Cordova / PhoneGap (alternativ)

Capacitor benötigt `pnpm run build` + `npx cap sync android`.
Cordova benötigt `cordova build android` nach `cordova platform add android`.
