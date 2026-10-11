# Playable Crow Mauler

A playable Crow Mauler campaign for **Fear & Hunger 1**, by Naoassisto.

Enter the dungeon with 5,000 HP, two actions per turn, and the original monster's Maul, Peck, Flock of crows, and Empty stare. Guards leave you alone; other living NPCs fight or flee. Includes a custom battle sprite, a text intro, and three adapted solo endings.

**Requires your own copy of Fear & Hunger 1.** This repository contains the mod and its documentation. The game is not included. Fear & Hunger 2: Termina is unsupported.

## Download

Current version: **1.7.0-beta.1**.

| Download | Contents |
| --- | --- |
| [Manual install ZIP](https://github.com/naoassisto/Playable-Crow-Mauler/releases/download/v1.7.0-beta.1/Playable-Crow-Mauler-1.7.0-beta.1-Manual.zip) | Recommended: copy the five mod files into your game. |
| [ZIP with optional helpers](https://github.com/naoassisto/Playable-Crow-Mauler/releases/download/v1.7.0-beta.1/Playable-Crow-Mauler-1.7.0-beta.1.zip) | Same gameplay files, plus Windows/macOS backup and uninstall scripts. |
| [Release notes and checksums](https://github.com/naoassisto/Playable-Crow-Mauler/releases/tag/v1.7.0-beta.1) | Changes, limitations, and SHA-256 files for both downloads. |

Use one of the ZIPs above for installation. GitHub's automatic **Source code** downloads also contain the development tools.

## Install

### Windows / Linux

1. Close the game and extract the download.
2. In Steam, right-click Fear & Hunger → **Manage → Browse local files**. Find the existing `www` folder.
3. Back up `www/js/main.js` outside the game folder. Back up your saves as well.
4. Merge the download's `www` folder into the game folder. Replace `main.js` when asked. Keep the existing folders and their other contents.
5. Launch the game. Choose **Crow Mauler** on the title screen, then **Enter the dungeon**. Use a separate save slot.

The final path should be `www/js/main.js`, not `www/www/js/main.js`. Normal **New Game** still offers the human characters.

### macOS

Right-click `Game.app` → **Show Package Contents** → `Contents/Resources/app.nw`. Back up `js/main.js`. Copy the five files from the download's `www` into the matching locations inside `app.nw`, replacing `main.js`. Copy individual files to avoid replacing whole folders in Finder.

For optional automatic backup helpers, see [the full installation guide](README.txt). The [manual installation guide](docs/README-manual.txt) covers removal and updates too.

## What changes

- Single-headed Crow Mauler with 5,000 HP and two freely chosen actions per turn.
- Maul, Peck, Flock of crows, and Empty stare adapted from the original enemy skills.
- Custom rear-view battle sprite and an optional text intro.
- Guards ignore Mauler. Other identified living NPCs fight or flee; dialogue, trading, and recruitment are disabled.
- Original roaming Crow Mauler encounters are suppressed during Mauler runs.
- Adapted endings E, B, and D. **Route spoilers:** [gameplay reference](GAMEPLAY.txt) and [ending details](ending-audit.txt).
- Human campaigns retain their original gameplay behavior.

## Compatibility and beta status

Built for the tested English Fear & Hunger database (`System.versionId 14145329`). The loader checks database hashes locally and stops if a file differs from the [compatibility profile](www/js/crow-mauler-compatibility.json). Translations, other game builds, and mods that edit database JSON may be blocked.

Mods replacing `js/main.js` need a combined loader. Mods using skill IDs 341–344 or changing characters, parties, NPCs, battles, intros, or endings can conflict. Start with a clean compatible installation. Dungeon Nights is unsupported.

This is a beta. Automated checks have covered character setup, intro, combat, saves, NPC behavior, and ending transitions. Native Windows gameplay and the PowerShell helpers still need testing; a complete manual campaign and final-boss balance pass are outstanding.

## Files

The complete gameplay payload is five files:

| File | Purpose |
| --- | --- |
| [`www/js/plugins/PlayableCrowMauler.js`](www/js/plugins/PlayableCrowMauler.js) | Character, skills, NPC behavior, intro, and endings. |
| [`www/js/main.js`](www/js/main.js) | Loads the mod and checks compatibility; replaces the game's entry point. |
| [`www/js/plugins/CrowMaulerPhysicalAttackFix.js`](www/js/plugins/CrowMaulerPhysicalAttackFix.js) | Licensed physical-attack animation compatibility fix. |
| [`www/js/crow-mauler-compatibility.json`](www/js/crow-mauler-compatibility.json) | Hashes for the tested database; no game database contents. |
| [`www/img/sv_actors/crow_mauler_player.png`](www/img/sv_actors/crow_mauler_player.png) | Player battle sprite. |

Only `main.js` replaces an original file on a clean installation. The other four files are added. The game engine, original art/audio, database files, `plugins.js`, and saves are not distributed here.

Additional references: [intro text](intro-text.json), [changelog](CHANGELOG.txt), [build and test instructions](docs/DEVELOPMENT.md), and [credits](CREDITS.txt).

## Uninstall

Close the game. If a helper installed the mod, use the matching uninstall helper. For a manual installation, restore your backed-up `js/main.js` and remove the other four files listed above if no other mod uses them. Keep your original pre-mod backup when updating. Do not load Mauler saves without the mod.

## Report a problem

[Open an issue](https://github.com/naoassisto/Playable-Crow-Mauler/issues/new?template=bug_report.md) with your OS, game language/build, mod version, other installed mods, and the steps that reproduce the problem. Include the exact error text. For an unsupported-data error, include the named file.

## Credits and permissions

An unofficial fan mod by Naoassisto. Fear & Hunger and its original characters, art, audio, and data belong to their respective creators. The player battle sprite is included with permission for distribution with this mod.

The physical-attack fix retains Coelocanth's [BSD-style license](LICENSE-Coelocanth.txt). The mod and sprite have no broader reuse license; contact Naoassisto before reuploads, ports, or inclusion in another mod. See [CREDITS.txt](CREDITS.txt).
