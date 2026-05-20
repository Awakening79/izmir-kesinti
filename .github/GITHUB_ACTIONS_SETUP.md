# GitHub Actions Setup — İzmir Kesinti Takibi

## Überblick

Es gibt zwei Workflows:

| Datei | Zweck | Trigger |
|-------|-------|---------|
| `android-build.yml` | Debug-APK (Testgerät) | Push zu main/master oder manuell |
| `android-release.yml` | Signiertes AAB (Play Store) | Nur manuell |

---

## Schritt 1 — Repository auf GitHub erstellen

1. Gehe zu https://github.com/new
2. Neues Repository erstellen (privat oder öffentlich)
3. Dieses Replit-Projekt pushen:

```bash
git remote add origin https://github.com/DEIN-USERNAME/DEIN-REPO.git
git push -u origin main
```

> In Replit: Shell öffnen → obige Befehle ausführen.
> GitHub fragt nach Login → Personal Access Token verwenden
> (https://github.com/settings/tokens → "repo"-Scope).

---

## Schritt 2 — APK herunterladen (Debug-Build)

Sobald der Push erfolgt ist:

1. GitHub → dein Repository → **Actions**-Tab
2. Workflow **"Android APK Build"** anklicken
3. Den laufenden oder letzten Workflow-Run öffnen
4. Unten unter **Artifacts** → `izmir-kesinti-takibi-debug-X` herunterladen
5. ZIP entpacken → `app-debug.apk` auf dein Android-Gerät übertragen
6. Auf dem Gerät: **Einstellungen → Sicherheit → Unbekannte Quellen** erlauben → APK antippen → Installieren

---

## Schritt 3 — Manuellen Build starten (optional)

Falls du ohne Push einen Build starten willst:

1. GitHub → Actions → **Android APK Build**
2. Rechts: **"Run workflow"** → Branch auswählen → **Run workflow**

---

## Schritt 4 — Play Store AAB (Release-Build)

Für den Google Play Store brauchst du einen signierten Keystore.

### 4a — Keystore erstellen (einmalig, lokal)

```bash
keytool -genkey -v \
  -keystore izmir-kesinti.jks \
  -alias izmir \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### 4b — Keystore als GitHub Secret hinterlegen

```bash
# Keystore als Base64 kodieren
base64 -i izmir-kesinti.jks | pbcopy   # macOS
base64 izmir-kesinti.jks               # Linux → Ausgabe kopieren
```

Dann in GitHub → Repository → **Settings → Secrets → Actions → New secret**:

| Secret-Name | Wert |
|-------------|------|
| `KEYSTORE_BASE64` | Base64-kodierter Keystore (oben kopiert) |
| `KEYSTORE_PASSWORD` | Passwort des Keystores |
| `KEY_ALIAS` | Alias (z. B. `izmir`) |
| `KEY_PASSWORD` | Passwort des Keys |

### 4c — Release-Workflow starten

1. GitHub → Actions → **Android Release AAB**
2. **"Run workflow"** → Version Name + Version Code eingeben
3. AAB herunterladen → in Google Play Console hochladen

---

## Build-Zeiten (Richtwerte)

| Build-Typ | Erste Ausführung | Folgebuilds (mit Cache) |
|-----------|-----------------|------------------------|
| Debug APK | ~8–12 Min | ~4–6 Min |
| Release AAB | ~10–15 Min | ~5–8 Min |

---

## APK auf Gerät installieren (ohne Play Store)

**Methode 1 — USB:**
```bash
adb install app-debug.apk
```

**Methode 2 — Direkt:**
- APK per E-Mail/WhatsApp/Cloud an dich senden
- Auf dem Gerät öffnen
- "Unbekannte Quellen" in den Einstellungen erlauben
