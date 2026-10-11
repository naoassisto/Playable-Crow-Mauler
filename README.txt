PLAYABLE CROW MAULER — 1.7.0-beta.1
By Naoassisto | Fear & Hunger 1 | Manual installation

QUICK INSTALL — WINDOWS / LINUX
1. Close the game. Extract this entire ZIP to a temporary folder first.
2. Open your Fear & Hunger install folder. In Steam: right-click the game >
   Manage > Browse local files. You should see the game's existing www folder.
3. Back up www/js/main.js somewhere outside the game (and back up your saves).
4. Copy the ZIP's www folder into that game folder. MERGE folders and replace
   main.js when asked. Do not delete the game's existing www folder.
5. Launch normally. Choose Crow Mauler on the TITLE screen, then Enter the
   dungeon. Choose a difficulty and Yes/No for the custom text intro.
   Use a separate save slot. Normal New Game still offers the human characters.

Only main.js replaces an original game file on a clean installation. No edits
to plugins.js, database files or saves are required. No Python or mod manager
is required. Make sure you have www/js/main.js, not www/www/js/main.js.

OPTIONAL WINDOWS HELPER (AUTOMATIC BACKUP)
Instead of steps 3–4, double-click Install-Windows.cmd in the extracted ZIP,
then select the folder containing www. It backs up every overwritten payload
file under www/.crow-mauler-backup. Double-click Uninstall-Windows.cmd and
select the same game folder to restore them. Keep the extracted package.
The helper uses built-in Windows PowerShell; it does not require admin rights.
If Windows restricts script execution, use the manual instructions above.
Native Windows execution of these optional helpers still needs a tester.

MACOS
Double-click Install-macOS.command in the extracted folder and select the game
folder (or Game.app). It finds Contents/Resources/app.nw and backs up the files
it replaces. Uninstall-macOS.command restores that backup. If macOS blocks the
helper, install manually: Show Package Contents on Game.app, open
Contents/Resources/app.nw, back up js/main.js, then merge the CONTENTS of this
ZIP's www into app.nw. Do not replace the entire app.nw or js directory.
Finder's Option-drag can offer Merge; the helper avoids folder-merge ambiguity.

WHAT YOU GET
- Playable single-headed Crow Mauler: 5,000 HP, two actions per turn, Maul,
  Peck, Flock of crows and Empty stare, adapted from the original enemy data.
- Custom rear-view player sprite, enlarged by 70%, and a text-only intro.
- Guards ignore Mauler. Identified living NPCs fight or flee; no dialogue,
  trading or recruitment. Corpses, loot and ordinary doors remain usable.
- Original roaming Crow Mauler encounters are suppressed for Mauler runs.
- Three adapted solo endings: E, B and D. Ending D culminates in a fight
  against the stronger two-headed Crow Mauler in the Void.
- Human runs keep their original gameplay behavior.
See GAMEPLAY.txt for statistics, effects, ending routes and limitations.

COMPATIBILITY / BETA STATUS
Requires your own installed copy of Fear & Hunger 1. Not Termina.
Built against the supplied English database, System.versionId 14145329.
The desktop loader compares normalized database SHA-256 hashes to the tested
profile. A changed/unrecognized database stops with a named-file error rather
than applying event IDs to an incompatible build. No online check is made.
Other releases, translations and mods that alter database JSON may be blocked.
Do not bypass the check without reviewing those differences.

Not compatible out of the box with mods that replace js/main.js or occupy
skill IDs 341–344. Character/party, NPC, event, intro, ending and battle mods
can also conflict. Install on a clean copy first. Replacing main.js again
disables this mod's loader. A combined loader needs a manual merge.
The existing plugins.js is preserved; the licensed physical-animation fix is
substituted at runtime without overwriting the original physical plugin.
No Vortex/automatic mod-manager support is claimed.

This is a beta: automated browser engine checks cover character start, intro,
attacks, sprites, saves, NPC behavior and ending transitions. Native Windows
gameplay and a full manual campaign have not been verified. Dungeon Nights is
unsupported. The final boss encounter has not received a full balance pass.

UPDATING / UNINSTALLING
Close the game first. If a helper installed it, uninstall with the matching
helper before installing a later version. Helpers refuse to overwrite a file
changed since their installation; resolve that conflict before retrying.
For a manual install, restore YOUR backed-up js/main.js, then remove:
  js/plugins/PlayableCrowMauler.js
  js/plugins/CrowMaulerPhysicalAttackFix.js
  js/crow-mauler-compatibility.json
  img/sv_actors/crow_mauler_player.png
Only remove those added files if another installed mod is not using them.
No save is deleted. Do not load Mauler saves without this mod. Original human
saves can be used after removal. If you lost main.js, verifying game files in
Steam can restore it, but may overwrite other installed modifications too.

TROUBLESHOOTING
No Crow Mauler title option: check the install path and whether another mod
replaced main.js. Fully quit and relaunch after copying files.
Unsupported data error: use a clean compatible installation; provide the
named file, game language/build and other mod names with your bug report.
Missing sprite: check img/sv_actors/crow_mauler_player.png was copied too.
Report your OS, difficulty, game build/language, exact error and reproduction
steps. Attach a separate copy of a save only if you want to share it.

This archive contains mod code and the supplied player sprite, not the game.
Credits and third-party license notices: CREDITS.txt and LICENSE-Coelocanth.txt.
