# Building and checking the mod

The editable gameplay source is in `www/`. The repository also contains the installation helpers and documentation bundled with the downloads. No game installation is required to build the release packages.

## Requirements

- Python 3.9 or later for packaging (standard library only).
- Node.js 18 or later for JavaScript checks.
- Bash and `shasum` for the helper regression tests on macOS/Linux.

Players do not need these development tools.

## Build

From the repository root:

```sh
python3 scripts/build-release.py
```

This writes the standard and manual-install ZIPs, along with their SHA-256 files, into `dist/`. The build reads an explicit file list, checks the five payload hashes, and uses fixed archive timestamps and permissions. No game files or local development folders are collected. The manual package omits all six helper files. Both packages contain identical gameplay files.

If you intentionally change a gameplay file, refresh `payload-sha256.tsv` before building:

```sh
python3 scripts/build-release.py --update-hashes
```

Review the source and checksum changes together. Keep `www/js/crow-mauler-compatibility.json` tied to the tested game database; do not disable the compatibility check just to accept another build.

## Check

```sh
node --check www/js/main.js
node --check www/js/plugins/PlayableCrowMauler.js
node --check www/js/plugins/CrowMaulerPhysicalAttackFix.js
bash -n manage-macOS.sh
node tests/release.cjs
python3 scripts/build-release.py
```

The regression test runs installation, backup, conflict rejection, removal, and reinstall against temporary fixtures. It checks that saves and the plugin registry survive these operations. Loader checks cover plugin order, dependency failure, changed database rejection, Windows paths, and BOM/CRLF normalization. Without a game path, these loader checks use synthetic database data.

To also verify the compatibility profile against your own installation, pass the directory containing `data/` and `js/`:

```sh
CROW_MAULER_GAME_ROOT='/path/to/game/www' node tests/release.cjs
```

On macOS, that directory is usually `Game.app/Contents/Resources/app.nw`. This optional check reads database files locally; it does not copy them into the repository or releases.

## Test scope

The repository checks cover packaging, the loader, and the Bash helper. Gameplay changes also require testing in a compatible copy of Fear & Hunger. Check both Mauler and human runs, separate save slots, NPC reactions, intro skip/play, and ending transitions. Native Windows gameplay, PowerShell helper execution, a complete manual campaign, and the Void boss balance remain unverified for this beta.

## Release contents

`scripts/build-release.py` defines the archive file list. Keep the game engine, database JSON, original sprites/audio, saves, and third-party plugins outside that list. The only redistributed third-party plugin code is the licensed physical-attack fix, with its notice intact. The compatibility profile stores hashes only.

The intro in `intro-text.json` is a readable reference; the runtime text is embedded in `PlayableCrowMauler.js`. Keep both in sync when editing the story.
