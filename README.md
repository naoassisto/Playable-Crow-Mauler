# Playable Crow Mauler

A playable Crow Mauler campaign for **Fear & Hunger 1**, by Naoassisto.

Enter the dungeon with 5,000 HP, two actions per turn, and the original monster's Maul, Peck, Flock of crows, and Empty stare. Guards leave you alone; other living NPCs fight or flee. Includes a custom battle sprite, a text intro, and three adapted solo endings.

**Requires your own copy of Fear & Hunger 1.** This repository contains the mod and its documentation. The game is not included. Fear & Hunger 2: Termina is unsupported.

## Download

Current version: **1.7.0-beta.1**.

[Download the mod](https://github.com/naoassisto/Playable-Crow-Mauler/releases/download/v1.7.0-beta.1/Playable-Crow-Mauler-1.7.0-beta.1.zip). The ZIP contains the five mod files, this installation guide, and the third-party license notice.

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

## What changes

- Single-headed Crow Mauler with 5,000 HP and two freely chosen actions per turn.
- Maul, Peck, Flock of crows, and Empty stare adapted from the original enemy skills.
- Custom rear-view battle sprite and an optional text intro.
- Guards ignore Mauler. Other identified living NPCs fight or flee; dialogue, trading, and recruitment are disabled.
- Original roaming Crow Mauler encounters are suppressed during Mauler runs.
- Adapted endings E, B, and D.
- Human campaigns retain their original gameplay behavior.

## Compatibility and beta status

Built for the tested English Fear & Hunger database (`System.versionId 14145329`). The loader checks database hashes locally and stops if a file differs from the [compatibility profile](www/js/crow-mauler-compatibility.json). Translations, other game builds, and mods that edit database JSON may be blocked.

Mods replacing `js/main.js` need a combined loader. Mods using skill IDs 341–344 or changing characters, parties, NPCs, battles, intros, or endings can conflict. Start with a clean compatible installation. Dungeon Nights is unsupported.

This is a beta. Automated checks have covered character setup, intro, combat, saves, NPC behavior, and ending transitions. Native Windows gameplay, a complete manual campaign, and a final-boss balance pass remain unverified.

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

## Uninstall

Close the game. Restore your backed-up `js/main.js` and remove the other four files listed above if no other mod uses them. Keep your original pre-mod backup when updating. Do not load Mauler saves without the mod.

## Report a problem

[Open an issue](https://github.com/naoassisto/Playable-Crow-Mauler/issues/new) with your OS, game language/build, mod version, other installed mods, and the steps that reproduce the problem. Include the exact error text. For an unsupported-data error, include the named file.

## Credits and permissions

An unofficial fan mod by Naoassisto, who supplied the story and player battle sprite. The sprite is included with permission for distribution with this mod. Fear & Hunger and its original characters, art, audio, and data belong to their respective creators. Original mauler/mauler2 assets are referenced from the player's own installation and are not included here.

The physical-attack fix is adapted from Coelocanth's 2018 physical_attack_animation plugin and retains its [BSD-style license](LICENSE-Coelocanth.txt). Other original game plugins are used from the installed game and are not redistributed. The mod and sprite have no broader reuse license; contact Naoassisto before reuploads, ports, or inclusion in another mod.
