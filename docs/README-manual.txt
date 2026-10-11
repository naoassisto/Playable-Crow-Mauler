PLAYABLE CROW MAULER — 1.7.0-beta.1 — MANUAL INSTALL
By Naoassisto | Fear & Hunger 1

This download contains the same gameplay files as 1.7.0-beta.1. The optional
Windows and macOS installer/uninstaller scripts have been omitted. Install by
copying the included www folder; no scripts need to be launched manually.

WINDOWS / LINUX — INSTALL
1. Close the game. Extract this entire ZIP to a temporary folder.
2. Open the Fear & Hunger installation folder. In Steam, right-click the game
   and choose Manage > Browse local files. Find the existing www folder.
3. Back up www/js/main.js outside the game folder. Back up your saves too.
4. Copy this download's www folder into the game folder. MERGE folders and
   replace main.js when asked. Do not delete the existing www folder.
5. Launch the game normally. Choose Crow Mauler on the title screen, then
   Enter the dungeon. Choose a difficulty and whether to play the text intro.
   Use a separate save slot. Normal New Game still offers the human characters.

The resulting path must be www/js/main.js, not www/www/js/main.js.
Only main.js replaces an original game file on a clean installation. The four
other payload files are added. plugins.js, database files and saves are not
overwritten. No Python, PowerShell, terminal commands or mod manager is needed.

MACOS — INSTALL
Close the game. Right-click Game.app and select Show Package Contents. Open
Contents/Resources/app.nw. Back up its js/main.js outside the application.
Copy the files below from this download's www into the matching folders inside
app.nw, replacing main.js when asked. Copying individual files avoids Finder's
folder replacement behavior. Do not replace the entire app.nw, js or img folder.

FILES TO COPY (relative to www on Windows/Linux, or app.nw on macOS)
  js/main.js
  js/plugins/PlayableCrowMauler.js
  js/plugins/CrowMaulerPhysicalAttackFix.js
  js/crow-mauler-compatibility.json
  img/sv_actors/crow_mauler_player.png

UNINSTALL
Close the game. Restore YOUR backed-up js/main.js, then remove the other four
files above if no other installed mod uses them. Saves are retained. Do not load
Mauler saves without this mod. Original human saves can be used after removal.
If you lost the original main.js, Steam's Verify integrity can restore it but
may also overwrite other modifications. Back up your other mods first.
If upgrading an older manual installation, retain your original pre-mod backup;
do not replace it with this mod's main.js.

COMPATIBILITY
Requires your own installed copy of Fear & Hunger 1, not Termina. Built against
the supplied English database, internal System.versionId 14145329. The desktop
loader checks normalized database SHA-256 hashes offline and stops on an
unrecognized or modified database. Translations, different builds and mods
that change database JSON may be incompatible. The error identifies the file.

Mods replacing js/main.js require a combined loader. Other mods using skill
IDs 341–344 or changing characters, NPCs, parties, battles, intros and endings
can conflict. Install on a clean compatible copy first. Vortex support is not
claimed. Dungeon Nights is unsupported. The original physical-animation plugin
is substituted at runtime by the included licensed fix; its file is untouched.

GAMEPLAY
Play as Crow Mauler with 5,000 HP, two actions per turn, Maul, Peck, Flock of
crows and Empty stare. Includes the custom rear-view battle sprite and text
intro. Guards ignore Mauler; identified living NPCs fight or flee. No dialogue,
trading or recruitment. Original roaming Mauler encounters are suppressed.
Three adapted solo endings: E, B and D, with a stronger two-headed Void finale.
See GAMEPLAY.txt for exact statistics, effects, adaptations and ending spoilers.

BETA STATUS
Automated browser engine checks cover character start, intro, attacks, sprite,
save serialization, NPC behavior and ending transitions. Native Windows gameplay
and a complete manual campaign have not been verified. The Void encounter has
not had a full balance pass. Native Steam integration is not covered by browser
tests. Archive checks do not constitute an antivirus scan or Nexus approval.

TROUBLESHOOTING
No title option: check the folder path and whether another mod replaced main.js.
Fully close and restart the game after copying files.
Unsupported data: use the compatible clean database. Include the named file,
game language/build, OS and other mods in a bug report.
Missing sprite: confirm img/sv_actors/crow_mauler_player.png was copied.

Credits: CREDITS.txt. Third-party terms: LICENSE-Coelocanth.txt.
This is an unofficial mod; the original game is not included.
