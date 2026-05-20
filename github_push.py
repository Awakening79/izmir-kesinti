import subprocess
import sys
import os

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

# Configure git user if not set
run(["git", "config", "user.email", f"{username}@users.noreply.github.com"])
run(["git", "config", "user.name", username])

# Remove existing origin if any
run(["git", "remote", "remove", "origin"])

# Add new origin with token
r = run(["git", "remote", "add", "origin", remote_url])

# Stage all files
print("\n--- Dateien vorbereiten ---")
run(["git", "add", "-A"])

# Commit
r = run(["git", "commit", "-m", "Initial commit — İzmir Kesinti Takibi"])
if r.returncode != 0 and "nothing to commit" not in (r.stdout + r.stderr):
    run(["git", "commit", "--allow-empty", "-m", "Initial commit — İzmir Kesinti Takibi"])

# Push
print("\n--- Push zu GitHub ---")
r = run(["git", "push", "-u", "origin", "main"])

if r.returncode == 0:
    print()
    print("=" * 50)
    print("  Erfolgreich hochgeladen!")
    print(f"  https://github.com/{username}/{repo}")
    print(f"  Actions: https://github.com/{username}/{repo}/actions")
    print("  Der APK-Build startet jetzt automatisch (~8 Min).")
    print("=" * 50)
else:
    # Try 'master' branch as fallback
    print("\nVersuche Branch 'master'...")
    r2 = run(["git", "push", "-u", "origin", "master"])
    if r2.returncode == 0:
        print()
        print("=" * 50)
        print("  Erfolgreich hochgeladen!")
        print(f"  https://github.com/{username}/{repo}/actions")
        print("=" * 50)
    else:
        print()
        print("Fehler beim Push. Mögliche Ursachen:")
        print("  1. Das Repository existiert noch nicht auf GitHub.")
        print(f"     Bitte zuerst erstellen: https://github.com/new")
        print("  2. Token hat keine 'repo'-Berechtigung.")
        print("  3. Benutzername oder Token falsch eingegeben.")
