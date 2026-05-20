import subprocess
import sys

print("=" * 50)
print("  İzmir Kesinti Takibi — GitHub Push")
print("=" * 50)
print()
print("Bitte gib deine GitHub-Daten ein:")
print()

username = input("GitHub-Benutzername: ").strip()
repo     = input("Repository-Name (z.B. izmir-kesinti): ").strip()
token    = input("Personal Access Token (ghp_...): ").strip()

if not username or not repo or not token:
    print("\nFehler: Alle Felder müssen ausgefüllt sein.")
    sys.exit(1)

remote_url = f"https://{username}:{token}@github.com/{username}/{repo}.git"

def run(cmd, **kwargs):
    print(f"\n$ {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True, **kwargs)
    if result.stdout:
        print(result.stdout.strip())
    if result.stderr:
        print(result.stderr.strip())
    return result

print("\n--- Git-Konfiguration ---")
run(["git", "config", "user.email", f"{username}@users.noreply.github.com"])
run(["git", "config", "user.name", username])
run(["git", "remote", "remove", "origin"])
run(["git", "remote", "add", "origin", remote_url])

print("\n--- Dateien vorbereiten ---")
run(["git", "add", "-A"])
r = run(["git", "commit", "-m", "Update: Live-URL + vereinfachter Workflow"])
if r.returncode != 0 and "nothing to commit" not in (r.stdout + r.stderr):
    run(["git", "commit", "--allow-empty", "-m", "Update: Live-URL + vereinfachter Workflow"])

print("\n--- Remote-Änderungen holen (pull --rebase) ---")
r = run(["git", "pull", "--rebase", "origin", "main"])
if r.returncode != 0:
    print("Pull fehlgeschlagen — versuche trotzdem zu pushen...")

print("\n--- Push zu GitHub ---")
r = run(["git", "push", "-u", "origin", "main"])

if r.returncode == 0:
    print()
    print("=" * 50)
    print("  Erfolgreich hochgeladen!")
    print(f"  https://github.com/{username}/{repo}")
    print(f"  Actions: https://github.com/{username}/{repo}/actions")
    print("  Der APK-Build startet jetzt automatisch (~5 Min).")
    print("=" * 50)
else:
    print()
    print("Push fehlgeschlagen. Versuche Force-Push...")
    r2 = run(["git", "push", "--force-with-lease", "-u", "origin", "main"])
    if r2.returncode == 0:
        print()
        print("=" * 50)
        print("  Erfolgreich hochgeladen (force)!")
        print(f"  https://github.com/{username}/{repo}/actions")
        print("=" * 50)
    else:
        print()
        print("Fehler beim Push. Bitte Token und Repo-Name prüfen.")
