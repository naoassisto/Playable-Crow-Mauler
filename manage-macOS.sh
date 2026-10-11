#!/bin/bash
# Offline helper; also accepts: bash manage-macOS.sh install /path/to/game
set -euo pipefail
package=$(cd "$(dirname "$0")" && pwd)
mode=${1:-install}
case "$mode" in install|uninstall) ;; *) echo 'Expected install or uninstall'; exit 1;; esac
chosen=${2:-}
if [ -z "$chosen" ]; then
    chosen=$(osascript -e 'POSIX path of (choose folder with prompt "Select the Fear & Hunger game folder (containing Game.app or www)")')
fi
root=''
for candidate in "$chosen" "$chosen/www" "$chosen/Contents/Resources/app.nw" "$chosen/Game.app/Contents/Resources/app.nw"; do
    if [ -f "$candidate/js/plugins.js" ] && [ -f "$candidate/data/System.json" ]; then
        root=$(cd "$candidate" && pwd); break
    fi
done
[ -n "$root" ] || { echo 'Game folder not found. Choose the folder containing www or Game.app.'; exit 1; }
backup="$root/.crow-mauler-backup"
hash() { shasum -a 256 "$1" | cut -d ' ' -f 1; }
if [ "$mode" = install ]; then
    [ ! -e "$backup" ] || { echo 'A Crow Mauler backup already exists. Uninstall that installation first.'; exit 1; }
    # Validate the entire package and destination before touching installed files.
    while IFS=$'\t' read -r digest file; do
        [ "$(hash "$package/www/$file")" = "$digest" ] || { echo "Damaged package: $file"; exit 1; }
        [ ! -L "$root/$file" ] || { echo "Refusing symbolic link: $file"; exit 1; }
    done < "$package/payload-sha256.tsv"
    mkdir "$backup"
    cp "$package/payload-sha256.tsv" "$backup/installed.tsv"
    : > "$backup/existed.txt"
    while IFS=$'\t' read -r digest file; do
        if [ -e "$root/$file" ]; then
            mkdir -p "$backup/original/$(dirname "$file")"
            cp -p "$root/$file" "$backup/original/$file"
            printf '%s\n' "$file" >> "$backup/existed.txt"
        fi
    done < "$backup/installed.tsv"
    # All backups are complete before the first payload write. Roll back on error.
    rollback() {
        while IFS=$'\t' read -r digest file; do
            if grep -Fxq "$file" "$backup/existed.txt"; then
                cp -p "$backup/original/$file" "$root/$file" || true
            else
                rm -f "$root/$file"
            fi
        done < "$backup/installed.tsv"
        echo "Install failed; originals restored. Backup retained at $backup"
    }
    trap rollback ERR
    while IFS=$'\t' read -r digest file; do
        mkdir -p "$root/$(dirname "$file")"
        cp "$package/www/$file" "$root/$file"
    done < "$backup/installed.tsv"
    touch "$backup/complete"
    trap - ERR
    echo 'Installed. Launch the game and select Crow Mauler on the title screen.'
else
    [ -f "$backup/complete" ] || { echo 'No completed helper installation found. Use the manual removal instructions.'; exit 1; }
    # Preflight everything: never partially remove a mod after a conflict.
    while IFS=$'\t' read -r digest file; do
        [ -f "$root/$file" ] && [ "$(hash "$root/$file")" = "$digest" ] || {
            echo "Changed or missing since install: $file. Restore the installed version before retrying, or uninstall manually."; exit 1;
        }
        if grep -Fxq "$file" "$backup/existed.txt"; then
            [ -f "$backup/original/$file" ] || { echo "Backup missing: $file"; exit 1; }
        fi
    done < "$backup/installed.tsv"
    while IFS=$'\t' read -r digest file; do
        if grep -Fxq "$file" "$backup/existed.txt"; then
            cp -p "$backup/original/$file" "$root/$file"
        else
            rm "$root/$file"
        fi
    done < "$backup/installed.tsv"
    mv "$backup" "$root/.crow-mauler-restored-$(date +%Y%m%d-%H%M%S)-$$"
    echo 'Uninstalled. Original files restored; saves untouched. Do not load Mauler saves without the mod.'
fi
