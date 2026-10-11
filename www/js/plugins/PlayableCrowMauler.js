/*:
 * @plugindesc Playable Crow Mauler v1.7 — original enemy stats and attacks.
 * @author Naoassisto
 * @help
 * Load LAST. Choose Crow Mauler on the title screen, then Enter the dungeon.
 * Uses actor 1 as a campaign compatibility slot, only in new Mauler saves.
 * Original actors, enemy records and existing saves are not replaced.
 * See the release README.txt for adaptations and removal instructions.
 */
(function() {
    'use strict';
    var MOD = window.CrowMaulerMod = { version: 1.7, skills: [341, 342, 343, 344] };
    var playerBattleImage = 'crow_mauler_player';
    var playerBattleHeight = 206 * 1.7;
    // This user-supplied PNG is unencrypted; exempt this exact file only.
    Decrypter._ignoreList.push('img/sv_actors/' + playerBattleImage + '.png');
    function active(actor) { return !!(actor && actor._crowMauler); }
    function run() { return !!($gameSystem && $gameSystem._crowMaulerRun); }
    function command(code, parameters, indent) {
        return {code: code, parameters: parameters || [], indent: indent || 0};
    }

    function maulerTroop(id) { return id === 51 || id === 52 || id === 135; }
    function maulerNpc(event) {
        if (/^Crow Mauler/i.test(event.name) || event.name === 'crow_controller' ||
                event.name === 'crow_head') return true;
        // mauler1 also contains unrelated characters in slots 3 and 7.
        return event.pages.some(function(page) {
            return page.image.characterName === 'mauler1' &&
                [0, 1, 2, 4, 5, 6].indexOf(page.image.characterIndex) >= 0;
        });
    }
    var findPage = Game_Event.prototype.findProperPageIndex;
    Game_Event.prototype.findProperPageIndex = function() {
        // No event page means no graphic, collision, chase or touch battle.
        if (run() && maulerNpc(this.event())) return -1;
        return findPage.call(this);
    };
    var commonActive = Game_CommonEvent.prototype.isActive;
    Game_CommonEvent.prototype.isActive = function() {
        if (run() && this._commonEventId === 90) return false;
        return commonActive.call(this);
    };
    var condition = Game_Interpreter.prototype.command111;
    Game_Interpreter.prototype.command111 = function() {
        if (run() && this._params[0] === 0) {
            // Use only the bed's existing safe-rest branch, without setting
            // a boss-defeated flag, awarding loot or removing the save point.
            if (this._params[1] === 771 && this._params[2] === 0 &&
                    this._list.some(function(c) {
                        return c.code === 301 && c.parameters[0] === 0 && c.parameters[1] === 52;
                    })) {
                this._branch[this._indent] = true;
                return true;
            }
            // These announcements share events with doors/map transfers.
            // Skip their conditional block, never the whole door event.
            if (this._params[1] === 786 && this._params[2] === 1 &&
                    this._list.slice(this._index + 1, this._index + 8).some(function(c) {
                        return c.code === 401 && c.parameters[0] ===
                            'You feel a terrible presence entering these dungeons...';
                    })) {
                this._branch[this._indent] = false;
                this.skipBranch();
                return true;
            }
        }
        return condition.call(this);
    };
    var encounter = Game_Player.prototype.makeEncounterTroopId;
    Game_Player.prototype.makeEncounterTroopId = function() {
        var id = encounter.call(this);
        return run() && maulerTroop(id) ? 0 : id;
    };
    var battleCommand = Game_Interpreter.prototype.command301;
    Game_Interpreter.prototype.command301 = function() {
        var id = this._params[0] === 0 ? this._params[1] :
            (this._params[0] === 1 ? $gameVariables.value(this._params[1]) : 0);
        var finale = run() && MOD.isVoidFinalBattle && MOD.isVoidFinalBattle(this);
        if (finale && !$gameParty.inBattle()) {
            $gameTemp._maulerVoidBattle = true;
            $gameSystem._maulerVoidVictory = false;
        }
        if (run() && maulerTroop(id) && !finale) {
            // Defensive guard for scripted/arrow-triggered encounters. Taking
            // the escape outcome avoids victory rewards and defeat handlers.
            this._branch[this._indent] = 1;
            return true;
        }
        return battleCommand.call(this);
    };
    var afterLoad = Game_System.prototype.onAfterLoad;
    Game_System.prototype.onAfterLoad = function() {
        afterLoad.call(this);
        // Remove an already-spawned NPC when loading an older Mauler save.
        if (run()) $gameMap.requestRefresh();
    };

    // User-authored story. Blank lines separate paragraphs; * marks italics.
    var introPages = [
        "Your orders were simple.\n\nRestore discipline. Secure the prisoners. Keep the dungeons in the service of Rondon.\n\nYou accepted the captaincy believing that a firm hand would be enough.",
        "The guards were insubordinate. The priests refused to explain their work. Prisoners disappeared from locked cells, and the men responsible for counting them had stopped reporting the losses.\n\nYou began keeping a diary.",
        "You recorded what you could not correct. The neglect. The cruelty. What Trortur had done to a child left in his care.\n\nYou considered having him arrested.\n\nInstead, you avoided the torture chambers.",
        "When the prisoner Le’garde arrived, the priests demanded custody. They intended to take him below the mines.\n\nYou objected. An order bearing the authority of your superiors settled the matter.\n\nYou handed him over.\n\nThat night, you dreamed of crows.",
        "The dreams continued.\n\nThere were shapes moving behind the clouds. Patterns you almost understood. You would wake with the certainty that something had been explained to you, only to forget it before you could reach for your diary.",
        "Soon, you began seeing the patterns while awake.\n\nIn the damp stone. In the arrangement of the bodies. In the movements of your own men.\n\nYou slept less.\n\nFor the first time since your arrival, the dungeons began to make sense.",
        "You had mistaken the corruption for a failure of discipline.\n\nIt was deeper than that.\n\nYou could see it in everyone around you. The guards. The priests. The prisoners begging through their doors.\n\nThere was no one you could trust with the task.",
        "You opened your diary one last time.\n\n*I will start the purge.*\n\n*I will root out the madness.*\n\n*Only I can do it.*",
        "You left your quarters without your uniform.\n\nA length of cloth was enough. You would be going deep, and the passages were hot.\n\nSomeone called your name as you passed.\n\nYou kept walking.",
        "You cannot remember how long you have been below.\n\nOne arm has grown heavy. Its weight feels useful.\n\nYou try to speak an order, but your mouth no longer makes the proper sounds.",
        "It does not matter. No one here obeys orders.\n\nBeyond a nearby door, you hear someone moving.\n\nYou have not inspected that room yet.",
        "*A terrifying presence has entered the world…*"
];
    function Scene_MaulerIntro() { this.initialize.apply(this, arguments); }
    Scene_MaulerIntro.prototype = Object.create(Scene_Base.prototype);
    Scene_MaulerIntro.prototype.constructor = Scene_MaulerIntro;
    Scene_MaulerIntro.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this._page = 0;
        this._text = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        this.addChild(this._text);
        // The game's DisableMouse plugin installs a no-op input listener.
        // Listen only while this scene exists, without changing gameplay input.
        this._clickHandler = function(event) {
            var x = Graphics.pageToCanvasX(event.pageX);
            var y = Graphics.pageToCanvasY(event.pageY);
            if (event.button === 0 && Graphics.isInsideCanvas(x, y)) this._clicked = true;
        }.bind(this);
        document.addEventListener('mousedown', this._clickHandler);
        this.drawPage();
    };
    Scene_MaulerIntro.prototype.drawPage = function() {
        var b = this._text.bitmap;
        b.fillAll('black');
        b.fontFace = Window_Base.prototype.standardFontFace();
        b.fontSize = 26;
        b.textColor = '#ffffff';
        b.outlineWidth = 0;
        var width = Math.min(680, Graphics.width - 96);
        var left = (Graphics.width - width) / 2;
        var rows = [], y = 0;
        (this._pages || introPages)[this._page].split('\n\n').forEach(function(paragraph) {
            var italic = paragraph.charAt(0) === '*';
            if (italic) paragraph = paragraph.slice(1, -1);
            b.fontItalic = italic;
            var line = '';
            paragraph.split(' ').forEach(function(word) {
                var next = line ? line + ' ' + word : word;
                if (line && b.measureTextWidth(next) > width) {
                    rows.push({text: line, italic: italic, y: y});
                    y += 34;
                    line = word;
                } else line = next;
            });
            rows.push({text: line, italic: italic, y: y});
            y += 50;
        });
        var height = y - 16;
        var top = (Graphics.height - 56 - height) / 2;
        this._pageBounds = {top: top, bottom: top + height, width: width, rows: rows};
        rows.forEach(function(row) {
            b.fontItalic = row.italic;
            b.drawText(row.text, left, top + row.y, width, 34, 'left');
        });
        b.fontItalic = false;
        b.fontSize = 18;
        b.textColor = '#999999';
        b.drawText('Enter / click to continue', 0, Graphics.height - 48, Graphics.width, 28, 'center');
        // Do not carry the choice-confirm input into the first text page.
        Input.clear();
        TouchInput.clear();
        this._clicked = false;
        this._inputDelay = 12;
    };
    Scene_MaulerIntro.prototype.terminate = function() {
        document.removeEventListener('mousedown', this._clickHandler);
        Scene_Base.prototype.terminate.call(this);
    };
    Scene_MaulerIntro.prototype.update = function() {
        Scene_Base.prototype.update.call(this);
        if (this._inputDelay > 0) { this._inputDelay--; return; }
        if (this.isActive() && !SceneManager.isSceneChanging() &&
                (Input.isTriggered('ok') || TouchInput.isTriggered() || this._clicked)) {
            this._page++;
            if (this._page < introPages.length) this.drawPage();
            else {
                $gameTemp._crowMaulerIntroPlaying = false;
                this.popScene();
            }
        }
    };
    MOD.TextScene = Scene_MaulerIntro;
    var pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(name, args) {
        if (name === 'CrowMaulerIntro' && run()) {
            $gameTemp._crowMaulerIntroPlaying = true;
            SceneManager.push(Scene_MaulerIntro);
            this.setWaitMode('crowMaulerIntro');
        } else pluginCommand.call(this, name, args);
    };
    var waitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'crowMaulerIntro') {
            if ($gameTemp._crowMaulerIntroPlaying) return true;
            this._waitMode = '';
            return false;
        }
        return waitMode.call(this);
    };

    function replaceIntro(list) {
        var text = list.findIndex(function(c) {
            return c.code === 401 && c.parameters[0] === 'Play intro?';
        });
        if (text < 0) return list;
        var choice = list[text + 1];
        if (list[text - 1].code !== 101 || choice.code !== 102 ||
                choice.parameters[0].join('|') !== 'Yes|No') {
            throw new Error('Crow Mauler: unrecognized intro event layout');
        }
        var no = -1, end = -1;
        for (var i = text + 2; i < list.length; i++) {
            if (list[i].indent !== choice.indent) continue;
            if (list[i].code === 402 && list[i].parameters[0] === 1) no = i;
            if (list[i].code === 404) { end = i; break; }
        }
        if (no < 0 || end < 0) throw new Error('Crow Mauler: missing no-intro setup');
        // Both choices use the original skip-intro world initialization.
        // Only Yes plays our text scene; the human movie/map stays unreachable.
        var setup = list.slice(no + 1, end).map(function(c) {
            return command(c.code, c.parameters, c.indent - 1);
        });
        var prompt = list.slice(0, text + 2);
        return prompt.concat([
            command(402, [0, 'Yes'], choice.indent),
            command(356, ['CrowMaulerIntro'], choice.indent + 1),
            command(0, [], choice.indent + 1),
            command(402, [1, 'No'], choice.indent),
            command(0, [], choice.indent + 1),
            command(404, [], choice.indent)
        ], setup, list.slice(end + 1));
    }

    // Clone before database plugins parse their notetags. Fixed IDs survive saves.
    var onLoad = DataManager.onLoad;
    DataManager.onLoad = function(object) {
        if (object === $dataSkills) {
            [93, 85, 161, 94].forEach(function(sourceId, index) {
                var id = MOD.skills[index];
                if (object[id] && !object[id]._crowMaulerSkill) {
                    throw new Error('Crow Mauler skill ID conflict: ' + id);
                }
                var skill = JSON.parse(JSON.stringify(object[sourceId]));
                skill.id = id;
                skill._crowMaulerSkill = true;
                skill.stypeId = 1;
                skill.occasion = 1;
                // CE 240 mutilates ACTORS, so it must not run for player attacks.
                skill.effects = skill.effects.filter(function(e) { return e.code !== 44; });
                skill.description = [
                    '40 damage (10% variance). Fracture; 30% arm and leg infection each.',
                    'Peck the target off. Physical hit; decapitates a struck enemy part.',
                    '20 damage (20% variance). 40% chance of permanent blindness.',
                    'Stare with empty eyes. Uses an action; no damage or status effect.'
                ][index];
                if (index === 3) skill.name = 'Empty stare';
                object[id] = skill;
            });
        }
        onLoad.call(this, object);
        if (object === $dataMap && run() && $gamePlayer._newMapId === 10 && object.events[1]) {
            var pages = object.events[1].pages;
            // Keep native actor setup, world randomization and difficulty events.
            // Bypass the human portrait picker and install the Mauler text intro.
            pages[3].list = [command(121, [213, 213, 0]), command(121, [295, 295, 0]), command(0)];
            pages[4].list = replaceIntro(pages[4].list);
        }
    };

    MOD.begin = function() {
        DataManager.setupNewGame();
        $gameSystem._crowMaulerRun = true;
        var actor = $gameActors.actor(1);
        actor._crowMauler = true;
        actor.setName('Crow Mauler');
        actor.setNickname('');
        actor._skills = [];
        actor._equips.forEach(function(e) { e.setObject(null); });
        MOD.skills.forEach(function(id) { actor.learnSkill(id); });
        actor.recoverAll();
        $gameSwitches.setValue(246, true);
        $gameSwitches.setValue(214, true);
        $gameSwitches.setValue(296, true);
        $gameVariables.setValue(9, 1);
        $gamePlayer.refresh();
        SceneManager.goto(Scene_Map);
    };

    var titleList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function() {
        titleList.call(this);
        this._list.splice(1, 0, {name: 'Crow Mauler', symbol: 'crowMauler', enabled: true, ext: null});
    };
    var titleWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        titleWindow.call(this);
        this._commandWindow.setHandler('crowMauler', function() { SceneManager.push(Scene_CrowMauler); });
    };
    function Window_MaulerStart() { this.initialize.apply(this, arguments); }
    Window_MaulerStart.prototype = Object.create(Window_Command.prototype);
    Window_MaulerStart.prototype.constructor = Window_MaulerStart;
    Window_MaulerStart.prototype.windowWidth = function() { return 360; };
    Window_MaulerStart.prototype.makeCommandList = function() {
        this.addCommand('Enter the dungeon', 'begin');
        this.addCommand('Back', 'cancel');
    };
    function Scene_CrowMauler() { this.initialize.apply(this, arguments); }
    Scene_CrowMauler.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_CrowMauler.prototype.constructor = Scene_CrowMauler;
    Scene_CrowMauler.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        var panel = new Window_Base(0, 0, Graphics.boxWidth, Graphics.boxHeight);
        panel.backOpacity = 255;
        this.addWindow(panel);
        panel.contents.fontSize = 36;
        panel.drawText('CROW MAULER', 24, 16, 740);
        panel.contents.fontSize = 20;
        var lines = ['A terrifying presence joins the descent.', '',
            'Body: 5,000 HP     MP: 0',
            'ATK / DEF / MAT / MDF / AGI / LUK: 10',
            'Hit: 95%     Evasion: 5%', '',
            'Maul — fracture and infections',
            'Peck — decapitation',
            'Flock of crows — damage and blindness',
            'Empty stare — pass an action'];
        lines.forEach(function(line, i) { panel.drawText(line, 266, 68 + i * 26, 494); });
        var sprite = new Sprite(ImageManager.loadEnemy('mauler', 0));
        sprite.x = 36; sprite.y = 113;
        this.addChild(sprite);
        this._commands = new Window_MaulerStart(400, 490);
        this._commands.setHandler('begin', function() { this._commands.deactivate(); MOD.begin(); }.bind(this));
        this._commands.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._commands);
    };

    // The mercenary slot preserves food, limbs, dialogue and party event wiring.
    var paramBase = Game_Actor.prototype.paramBase;
    Game_Actor.prototype.paramBase = function(id) {
        return active(this) ? $dataEnemies[127].params[id] : paramBase.call(this, id);
    };
    var paramPlus = Game_Actor.prototype.paramPlus;
    Game_Actor.prototype.paramPlus = function(id) {
        return active(this) ? this._paramPlus[id] : paramPlus.call(this, id);
    };
    var traits = Game_Actor.prototype.traitObjects;
    Game_Actor.prototype.traitObjects = function() {
        if (!active(this)) return traits.call(this);
        // Auto Battle is an enemy implementation detail, not a player trait.
        var natural = $dataEnemies[127].traits.filter(function(t) { return !(t.code === 63 && t.dataId === 0); });
        return this.states().concat([{traits: natural.concat([{code: 41, dataId: 1, value: 1}])}]);
    };
    var attack = Game_Actor.prototype.attackSkillId;
    Game_Actor.prototype.attackSkillId = function() { return active(this) ? 341 : attack.call(this); };
    var times = Game_Actor.prototype.makeActionTimes;
    Game_Actor.prototype.makeActionTimes = function() { return active(this) ? 2 : times.call(this); };
    var canEquip = Game_Actor.prototype.canEquip;
    Game_Actor.prototype.canEquip = function(item) { return active(this) ? false : canEquip.call(this, item); };
    var addState = Game_Actor.prototype.isStateAddable;
    Game_Actor.prototype.isStateAddable = function(id) {
        // Human phobia scripts otherwise permanently penalize a zero-MP monster.
        if (active(this) && [63,65,66,67,68,69,70,71].indexOf(id) >= 0) return false;
        return addState.call(this, id);
    };
    var gameData = Game_Interpreter.prototype.gameDataOperand;
    Game_Interpreter.prototype.gameDataOperand = function(type, p1, p2) {
        // Campaign sanity checks read actor MP through this operand. No spell MP
        // is granted: combat and menus still use the authentic zero MP statistic.
        if (type === 3 && p1 === 1 && p2 === 3 && active($gameActors.actor(1))) return 100;
        return gameData.call(this, type, p1, p2);
    };

    var character = Game_Actor.prototype.characterName;
    var characterIndex = Game_Actor.prototype.characterIndex;
    var face = Game_Actor.prototype.faceName;
    var faceIndex = Game_Actor.prototype.faceIndex;
    var battler = Game_Actor.prototype.battlerName;
    Game_Actor.prototype.characterName = function() { return active(this) ? 'mauler1' : character.call(this); };
    Game_Actor.prototype.characterIndex = function() { return active(this) ? 0 : characterIndex.call(this); };
    Game_Actor.prototype.faceName = function() { return active(this) ? 'CM_Mauler' : face.call(this); };
    Game_Actor.prototype.faceIndex = function() { return active(this) ? 0 : faceIndex.call(this); };
    Game_Actor.prototype.battlerName = function() { return active(this) ? 'CM_Mauler' : battler.call(this); };
    var drawClass = Window_Base.prototype.drawActorClass;
    Window_Base.prototype.drawActorClass = function(actor, x, y, width) {
        if (active(actor)) { this.resetTextColor(); this.drawText('Crow Mauler', x, y, width || 168); }
        else drawClass.call(this, actor, x, y, width);
    };
    // Derive UI bitmaps in memory from the installed original encrypted asset.
    // No original image is overwritten or exported by the mod.
    var images = {};
    function portrait(kind) {
        if (images[kind]) return images[kind];
        var out = images[kind] = new Bitmap(kind === 'face' ? 576 : 182, kind === 'face' ? 288 : 360);
        ImageManager.loadEnemy('mauler', 0).addLoadListener(function(src) {
            if (kind === 'face') out.blt(src, 28, 0, 144, 144, 0, 0, 144, 144);
            else out.blt(src, 0, 0, src.width, src.height, 0, 58, 182, 246);
        });
        return out;
    }
    var loadFace = ImageManager.loadFace;
    ImageManager.loadFace = function(name, hue) { return name === 'CM_Mauler' ? portrait('face') : loadFace.call(this, name, hue); };
    var reserveFace = ImageManager.reserveFace;
    ImageManager.reserveFace = function(name, hue, reservation) {
        return name === 'CM_Mauler' ? portrait('face') : reserveFace.call(this, name, hue, reservation);
    };
    var loadPicture = ImageManager.loadPicture;
    ImageManager.loadPicture = function(name, hue) { return name === 'CM_Mauler_1' ? portrait('bust') : loadPicture.call(this, name, hue); };
    var updateBitmap = Sprite_Actor.prototype.updateBitmap;
    Sprite_Actor.prototype.updateBitmap = function() {
        if (!active(this._actor)) {
            if (this._crowMaulerGraphic) {
                this._mainSprite.scale.set(1, 1);
                this._mainSprite.x = 0;
                this._battlerName = null;
                this.bitmap = null;
                this._crowMaulerGraphic = false;
            }
            return updateBitmap.call(this);
        }
        this._crowMaulerGraphic = true;
        this._battlerName = 'CM_Mauler';
        this._mainSprite.bitmap = ImageManager.loadBitmap('img/sv_actors/', playerBattleImage, 0, true);
        this._mainSprite.anchor.x = 0.5;
        this._mainSprite.anchor.y = 1;
        if (this._shadowSprite) this._shadowSprite.visible = false;
        if (this._weaponSprite) this._weaponSprite.visible = false;
    };
    var updateFrame = Sprite_Actor.prototype.updateFrame;
    Sprite_Actor.prototype.updateFrame = function() {
        if (!active(this._actor)) return updateFrame.call(this);
        var b = this._mainSprite.bitmap;
        if (b && b.width && b.height) {
            var scale = playerBattleHeight / b.height;
            this._mainSprite.scale.set(scale, scale);
            // Keep the enlarged weapon inside the left edge at the actor home.
            this._mainSprite.x = Math.max(0, b.width * scale / 2 + 8 - this._homeX);
            this._mainSprite.setFrame(0, 0, b.width, b.height);
            if (!this.bitmap) this.bitmap = new Bitmap(Math.round(b.width * scale), playerBattleHeight);
        }
    };

    // Peck's Headless state has no intrinsic engine effect. The original common
    // event kills the actor. For enemies, kill only the selected battler/part;
    // the target troop's own limb/death events retain control of the encounter.
    var apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        apply.call(this, target);
        if (active(this.subject()) && this.item().id === 342 && target.isEnemy() &&
                target.result().isHit() && target.isStateAffected(31)) {
            target.gainHp(-target.hp);
            target.performCollapse();
        }
    };

    var nameInput = Game_Interpreter.prototype.command303;
    Game_Interpreter.prototype.command303 = function() {
        if (run() && this._mapId === 10 && this._params[0] === 1) return true;
        return nameInput.call(this);
    };
    var transfer = Game_Player.prototype.reserveTransfer;
    Game_Player.prototype.reserveTransfer = function(mapId, x, y, d, fade) {
        if (run() && $gameMap && $gameMap.mapId() === 10 && mapId !== 10) {
            var actor = $gameActors.actor(1);
            // Vanilla skip-intro grants mercenary gear/skills. Restore this kit
            // once, after that branch finishes and before the dungeon begins.
            actor._skills = MOD.skills.slice();
            actor.learnSkill(40); // Run: original escape command.
            // Talk is unavailable in Mauler mode.
            actor._equips.forEach(function(e) { e.setObject(null); });
            actor.setNickname('');
            actor.clearStates();
            actor.recoverAll();
        }
        transfer.call(this, mapId, x, y, d, fade);
    };
})();

// Mauler-only guard recognition and hostile NPC interactions.
(function() {
    'use strict';
    function run() { return !!($gameSystem && $gameSystem._crowMaulerRun); }
    function cmd(code, parameters, indent) { return {code:code, parameters:parameters || [], indent:indent || 0}; }
    var guards = [1,2,3,4,7,8,44,45,48,112,117,118,128,129,136,143,144,148,175,192,195,196,207,215,216];
    function guardTroop(id) { return guards.indexOf(id) >= 0; }
    function guardImage(name) { return /^(guard[12]|moonless_guard1)$/.test(name); }
    // Explicit identities prevent a companion's cutscene from borrowing another
    // character's battle (e.g. D'arce's fight inside Le'garde's event).
    var identities = [
        [/^mercenary/, [67,68], 'Cahara'], [/^dark_priest/, [69,70], 'Enki'],
        [/^knight/, [119], "D'arce"], [/^outlander/, [120], 'Ragnvaldr'],
        [/^(captain|\$legarde)/, [], "Le'garde"], [/^(girl|\$girl|\$cagedgirl)/, [], 'Girl'],
        [/^(\$beheadedwizard|\$naked_nashrah)/, [14], "Nas'hrah"],
        [/^\$sergregor/, [205], 'Ser Seymor'], [/^\$isaiyah/, [138], 'Isayah'],
        [/^\$seril[12]/, [140], 'Seril'], [/^\$dwarf/, [17,168], 'Trortur'],
        [/^\$old_guardian$/, [101], 'Old guardian'],
        [/^\$nosramus/, [], 'Nosramus'], [/^\$pocketcat/, [], 'Pocketcat'],
        [/^\$buckman$/, [], 'Buckman'], [/^\$jeanne/, [], 'Jeanne'],
        [/^\$merchant/, [], 'Merchant'], [/^\$nilvan/, [], 'Nilvan'],
        [/^\$francois/, [115,116], 'Francois'], [/^tormented_one1$/, [72,53], 'Chambara'],
        [/^moonless$/, [23], 'Moonless'], [/^demon_child/, [], 'Demon child'],
        [/^\$(people|sitting|naked[1-4]|bunnies|wolfmask)/, [], 'Resident'],
        [/^!chained1$/, [], 'Prisoner']
    ];
    function identity(image) {
        for (var i=0; i<identities.length; i++) if (identities[i][0].test(image)) return identities[i];
        return null;
    }
    function spoken(list) { return list.some(function(c) { return c.code===401 && /\\c\[7\].+\\c\[0\]/i.test(c.parameters[0]); }); }
    function battles(list) { return list.filter(function(c) { return c.code===301 && c.parameters[0]===0 && $dataTroops[c.parameters[1]] && $dataTroops[c.parameters[1]].members.length>0; }); }
    function deadPage(event, page) {
        var text = page.list.filter(function(c) { return c.code===401; }).slice(0,3).map(function(c) {return c.parameters[0];}).join(' ');
        if (/^(Dead|.*DEAD$)/i.test(event.name) || /^(circle\d|.*_miasma)$/.test(event.name)) return true;
        if (/dead|corpse|here lies|soul stone|throat is cut|body is lifeless/i.test(text) && !spoken(page.list)) return true;
        // Corpse/limb sheets are not living actors, even when a quest discusses them.
        return /dead|\$flesh|\$dweller_massacre|\$characters_dead|\$charred_body|\$buckman2/.test(page.image.characterName);
    }
    function describeUncached(event, page, mapId) {
        if (!page || mapId===10 || mapId===73 || deadPage(event,page)) return null;
        var image=page.image.characterName;
        if (!image || /^mauler/.test(image) || image==='$girl4' || /^(body|legs)$/.test(event.name)) return null;
        var own=battles(page.list), person=identity(image);
        if (guardImage(image) && (own.some(function(c) {return guardTroop(c.parameters[1]);}) || [0,1,4].indexOf(page.image.characterIndex)>=0)) {
            return {kind:'guard', troop:0, name:'Guard'};
        }
        // A corpse page has no battle. Walking enemy pages do; unidentified props
        // (doors, containers, mechanisms) must retain their original interactions.
        var creature=/^(\$(cavedweller|cavegnome|cavemother|ghoul|harvestman|husk|hydra|iron_shakespeare|maneba|minerghost|old_guardian|priest|redman|scarab|servants|spider|tallknight|tomb_raider|uterus|black_angel|blight|embryo|seed_marriage)|cavedweller|ghoul|lizard|marriage_of_flesh|mumbler|night_lurch|skeleton1|snatcher1|white_angel|yellow_mage|bloodyman)/.test(image);
        if (!person && !creature && !spoken(page.list)) return null;
        if (!person && !creature && /^[!$].*(door|chest|objects|tileset|blood|lever|trap)/i.test(image)) return null;
        if (!person && !spoken(page.list) && !own.length && !page.list.some(function(c) {return c.code===301;})) return null;
        // Downed human sprites without speech/recruitment are corpses, not new NPCs.
        if (person && !spoken(page.list) && !own.length && (page.image.characterIndex===5 || (image==='moonless' && page.image.characterIndex===3))) return null;
        var allowed=person ? person[1] : null;
        if (image==='moonless' && page.image.characterIndex>=4) allowed=null; // jaggedjaws
        if (image==='tormented_one1' && page.image.characterIndex>=4) allowed=null; // molded
        var candidates=[];
        [page].concat(event.pages.filter(function(p) {return p!==page && (p.image.characterName===image || !person);})).forEach(function(p) {
            battles(p.list).forEach(function(c) {
                var id=c.parameters[1];
                if (!guardTroop(id) && [51,52,135].indexOf(id)<0 && (!allowed || allowed.indexOf(id)>=0)) candidates.push({page:p,command:c});
            });
        });
        var found=candidates[0], troop=found ? found.command.parameters[1] : (allowed && allowed[0]) || 0;
        return {kind:troop?'battle':'flee',troop:troop,name:person?person[2]:event.name,source:found || null};
    }
    var reactionCache = new WeakMap();
    function describe(event, page, mapId) {
        if (!page) return null;
        if (!reactionCache.has(page)) reactionCache.set(page,describeUncached(event,page,mapId));
        return reactionCache.get(page);
    }
    // Exposed for the database-wide audit and integration tests.
    CrowMaulerMod.describeNpc = describe;
    CrowMaulerMod.guardTroops = guards.slice();
    function key(event) { return event._mapId + ':' + event._eventId; }
    function memory() { return $gameSystem._maulerNpcOutcomes || ($gameSystem._maulerNpcOutcomes={}); }
    function outcome(event) { return memory()[key(event)]; }
    function reaction(event) {
        if (!run() || event._erased) return null;
        var data=event.event();
        if(!data || data._maulerStory) return null;
        var page=data.pages[event._pageIndex];
        return page ? describe(data,page,event._mapId) : null;
    }
    function victoryEffects(info) {
        if (!info.source) return [];
        var list=info.source.page.list, battle=info.source.command, start=list.indexOf(battle);
        var win=false, effects=[];
        for(var i=start+1;i<list.length;i++) {
            var c=list[i];
            if(c.indent===battle.indent && c.code===601) {win=true;continue;}
            if(c.indent===battle.indent && [602,603,604].indexOf(c.code)>=0) break;
            // Only unconditional native defeat/loot flags, never dialogue choices,
            // recruitment, teleportation or another NPC's conditional quest branch.
            if(win && c.indent===battle.indent+1 && [121,122,123,126,127,128].indexOf(c.code)>=0) effects.push(cmd(c.code,c.parameters,1));
        }
        return effects;
    }
    function battleList(info) {
        return [cmd(117,[74]),cmd(301,[0,info.troop,true,true]),cmd(601)]
            .concat(victoryEffects(info),[cmd(356,['MaulerNpcDefeated'],1),cmd(117,[66],1),cmd(0,[],1),
                cmd(602),cmd(117,[66],1),cmd(356,['MaulerNpcEscaped'],1),cmd(0,[],1),
                cmd(603),cmd(117,[47],1),cmd(0,[],1),cmd(604),cmd(0)]);
    }
    var meets=Game_Event.prototype.meetsConditions;
    Game_Event.prototype.meetsConditions=function(page) {
        if(run() && guardImage(page.image.characterName)) {
            var conditions=Object.assign({},page.conditions), changed=false;
            ['1','2'].forEach(function(n) {
                if(conditions['switch'+n+'Valid'] && conditions['switch'+n+'Id']===107) {
                    conditions['switch'+n+'Valid']=false;changed=true;
                }
            });
            if(changed) return meets.call(this,Object.assign({},page,{conditions:conditions}));
        }
        return meets.call(this,page);
    };
    var list=Game_Event.prototype.list;
    Game_Event.prototype.list=function() {
        var info=reaction(this);
        if(!info) return list.call(this);
        if(info.kind!=='battle' || outcome(this)) return [cmd(0)];
        return battleList(info);
    };
    function configure(event) {
        var info=reaction(event);
        if(!info) return null;
        event._trigger=info.kind==='battle'?2:0; // removes friendly autorun/parallel dialogue
        event._interpreter=null;
        event._chasePlayer=false;event._fleePlayer=false;
        event._chaseRange=0;event._fleeRange=0;event._alertLock=0;
        if(outcome(event)) {event.erase();return null;}
        return info;
    }
    var setup=Game_Event.prototype.setupPage;
    Game_Event.prototype.setupPage=function() { setup.call(this); if(run()) configure(this); };
    var auto=Game_Event.prototype.checkEventTriggerAuto;
    Game_Event.prototype.checkEventTriggerAuto=function() { if(!reaction(this)) auto.call(this); };
    var start=Game_Event.prototype.start;
    Game_Event.prototype.start=function() {
        var info=reaction(this);
        if(info && info.kind!=='battle') {if(info.kind==='flee') this._maulerFleeFrames=1;return;}
        start.call(this);
    };
    var chase=Game_Event.prototype.chaseConditions;
    Game_Event.prototype.chaseConditions=function(distance) {
        if(reaction(this)) return false;
        return chase.call(this,distance);
    };
    // Check intervening map tiles so people never attack through a closed room.
    function visible(event, range) {
        var dx=$gameMap.deltaX($gamePlayer.x,event.x),dy=$gameMap.deltaY($gamePlayer.y,event.y);
        if(Math.abs(dx)+Math.abs(dy)>range) return false;
        var x=event.x,y=event.y;
        while(x!==$gamePlayer.x || y!==$gamePlayer.y) {
            var sx=$gameMap.deltaX($gamePlayer.x,x),sy=$gameMap.deltaY($gamePlayer.y,y);
            var d=Math.abs(sx)>=Math.abs(sy) && sx!==0 ? (sx>0?6:4) : (sy>0?2:8);
            if(!$gameMap.isPassable(x,y,d)) return false;
            x=$gameMap.roundXWithDirection(x,d);y=$gameMap.roundYWithDirection(y,d);
            if(!$gameMap.isPassable(x,y,10-d)) return false;
            if($gameMap.eventsXyNt(x,y).some(function(other) {return other!==event && other.isNormalPriority();})) return false;
        }
        return true;
    }
    var movement=Game_Event.prototype.updateSelfMovement;
    Game_Event.prototype.updateSelfMovement=function() {
        var info=reaction(this);
        if(!info || info.kind==='guard') return movement.call(this);
        // Hostile NPCs are controlled below; ignore their friendly movement routes.
    };
    var update=Game_Event.prototype.update;
    Game_Event.prototype.update=function() {
        var info=run()?configure(this):null;
        update.call(this);
        if(!info || info.kind==='guard' || $gameMap.isEventRunning() || $gameMessage.isBusy() ||
                $gamePlayer.isTransferring() || !(SceneManager._scene instanceof Scene_Map) || SceneManager.isSceneChanging()) return;
        if(this._maulerCooldown>0) {this._maulerCooldown--;return;}
        if(info.kind==='battle') {
            if(!this.isTransparent() && this.opacity()>0 && visible(this,3)) this.start();
        } else if(this._maulerFleeFrames || visible(this,6)) {
            this._maulerFleeFrames=(this._maulerFleeFrames || 0)+1;
            this.setMoveSpeed(5);
            if(!this.isMoving()) {this.moveAwayFromPlayer();if(!this.isMovementSucceeded()) this.moveRandom();}
            // Trapped/caged NPCs still retreat out of interaction instead of
            // blocking a doorway forever. Persist departure across map reloads.
            if(this._maulerFleeFrames>75) this.setOpacity(Math.max(0,this.opacity()-17));
            if(this.opacity()===0) {memory()[key(this)]='fled';this.erase();}
        }
    };
    var plugin=Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand=function(name,args) {
        if(run() && (name==='MaulerNpcDefeated' || name==='MaulerNpcEscaped')) {
            var event=$gameMap.event(this._eventId);
            if(event) {
                if(name==='MaulerNpcDefeated') {memory()[key(event)]='defeated';event.refresh();if(reaction(event)) event.erase();}
                else event._maulerCooldown=180;
            }
        } else plugin.call(this,name,args);
    };
    // Defensive guard for scripted/variable battles outside the guard's own event.
    var battle=Game_Interpreter.prototype.command301;
    Game_Interpreter.prototype.command301=function() {
        if(run()) {
            var id=this._params[0]===0?this._params[1]:this._params[0]===1?$gameVariables.value(this._params[1]):0;
            if(guardTroop(id)) {this._branch[this._indent]=1;$gameScreen.startTint([0,0,0,0],1);return true;}
        }
        return battle.call(this);
    };
    var encounter=Game_Player.prototype.makeEncounterTroopId;
    Game_Player.prototype.makeEncounterTroopId=function() {var id=encounter.call(this);return run()&&guardTroop(id)?0:id;};
    // No recruitment or battle negotiation, including old Mauler saves and
    // companion/merchant dialogue invoked by invisible cutscene controllers.
    var addActor=Game_Party.prototype.addActor;
    Game_Party.prototype.addActor=function(id) {if(!run() || id===1) addActor.call(this,id);};
    var skills=Game_Actor.prototype.skills;
    Game_Actor.prototype.skills=function() {return skills.call(this).filter(function(s){return !run() || [11,87].indexOf(s.id)<0;});};
    var usable=Game_BattlerBase.prototype.meetsSkillConditions;
    Game_BattlerBase.prototype.meetsSkillConditions=function(skill) {return !(run() && this.isActor() && [11,87].indexOf(skill.id)>=0) && usable.call(this,skill);};
    var showText=Game_Interpreter.prototype.command101;
    Game_Interpreter.prototype.command101=function() {
        if(run()) {
            for(var n=this._index+1; this._list[n] && this._list[n].code===401; n++) {
                if(/\\c\[7\].+\\c\[0\]/i.test(this._list[n].parameters[0])) this._maulerSilenced=true;
            }
            if(this._maulerSilenced) {
                while(this._list[this._index+1] && this._list[this._index+1].code===401) this._index++;
                return true;
            }
        }
        return showText.call(this);
    };
    var choices=Game_Interpreter.prototype.command102;
    Game_Interpreter.prototype.command102=function() {
        if(run() && this._maulerSilenced) {this._branch[this._indent]=-2;return true;}
        return choices.call(this);
    };
    var clear=Game_Interpreter.prototype.clear;
    Game_Interpreter.prototype.clear=function() {clear.call(this);this._maulerSilenced=false;};
})();

// Mauler-only campaign gates and endings. Database files stay untouched.
(function() {
    'use strict';
    var MOD=CrowMaulerMod;
    function run() { return !!($gameSystem && $gameSystem._crowMaulerRun); }
    function c(code,p,i) { return {code:code,parameters:p || [],indent:i || 0}; }
    function flag(id,on) { return c(121,[id,id,on===false?1:0]); }
    function text(value) { return [c(101,['',0,0,2])].concat(value.split('\n').map(function(line){return c(401,[line]);})); }
    function finish(route) { return c(356,['MaulerEnding '+route]); }
    function battle(id,route) {
        // Explicit win/loss branches: losing never awards an ending; no escape
        // from these final encounters. Keep the game's combat setup/cleanup.
        return [c(117,[74]),c(301,[0,id,false,true]),c(601),
            c(117,[66],1),c(356,['MaulerEnding '+route],1),c(0,[],1),
            c(603),c(117,[47],1),c(0,[],1),c(604),c(0)];
    }
    var voidEvents={140:[4],160:[286,486,504,505],185:[64,65,286,486]};
    MOD.isVoidFinalBattle=function(interpreter) {
        var command=interpreter._list && interpreter._list[interpreter._index];
        var ids=voidEvents[$gameMap.mapId()];
        return !!(ids && ids.indexOf(interpreter._eventId)>=0 && command &&
            command._maulerVoidFinale && command.code===301 &&
            command.parameters[0]===0 && command.parameters[1]===135);
    };
    function voidBattle() {
        var list=battle(135,'D');
        list[1]._maulerVoidFinale=true;
        return text('Something waits at the end of the void.\nTwo beaks turn towards you. Its maul scrapes the ground.\nA terrifying presence stands in your way.').concat(list);
    }
    var setupTroop=Game_Troop.prototype.setup;
    Game_Troop.prototype.setup=function(id) {
        setupTroop.call(this,id);
        if(run() && id===135 && $gameTemp._maulerVoidBattle) {
            // Use the game's stronger mauler2 records without changing the
            // selected difficulty or mutating the original enemy database.
            var forms={0:529,1:530,2:531,4:532};
            Object.keys(forms).forEach(function(index) {
                this.members()[index].transform(forms[index]);
                this.members()[index].recoverAll();
            },this);
        }
    };
    function setList(event,page,list) {
        event._maulerStory=true;
        page.list=list;
    }
    function allPages(event,list,trigger) {
        var page=JSON.parse(JSON.stringify(event.pages[0]));
        Object.keys(page.conditions).forEach(function(k){if(/Valid$/.test(k)) page.conditions[k]=false;});
        page.image.characterName='';page.image.tileId=0;page.priorityType=0;
        page.trigger=trigger;page.moveType=0;
        event.pages=[page];setList(event,page,list);
    }
    function transfer(map,x,y) { return c(201,[0,map,x,y,2,0]); }
    function release() { return [flag(202,false),flag(410,false),c(211,[1]),c(223,[[0,0,0,0],1,false])]; }
    var supportedMaps=[24,74,131,138,140,142,146,159,160,185,86];
    MOD.patchEndingMap=function(map,id) {
        if(!run() || !map || map._maulerEndings || supportedMaps.indexOf(id)<0) return;
        map._maulerEndings=true;
        // Clone only edited maps. A reload/new normal game reads original JSON.
        map.events=JSON.parse(JSON.stringify(map.events));
        var events=map.events;
        if(id===74 || id===131) events.forEach(function(e) {
            if(!e) return;
            e.pages.forEach(function(p) {
                if(p.list.some(function(x){return x.code===201 && x.parameters[1]===86;})) {
                    setList(e,p,[c(111,[0,1000,0]),c(356,['MaulerEnding E'],1),c(0,[],1),c(411)]
                        .concat(text('The mist still seals the road.\nThe prisoner\'s cell lies deeper in the dungeon.').map(function(x){x.indent=1;return x;}),[c(0,[],1),c(412),c(0)]));
                }
            });
        });
        if(id===138) {
            // Dream reached through the normal Tower/Skin Granny sequence.
            // Nilvan has no combat troop: she withdraws, leaving the gate key.
            allPages(events[3],release().concat(text('The figure withdraws into the dream.\nAn Endless soul remains where she stood.'),
                [c(356,['MaulerEndlessSoul']),flag(1804),flag(1805),transfer(120,38,28),c(0)]),3);
        }
        if(id===146) {
            // The native scene moves a human actor stand-in with a non-skippable
            // route. Hostility erases that stand-in, leaving the camera locked.
            setList(events[4],events[4].pages[0],release().concat([
                flag(2187,false),flag(1839),flag(2748),transfer(160,23,13),c(0)]));
            var throne=events[338], page=throne.pages[1];
            setList(throne,page,text('The throne stands empty.').concat([
                c(102,[['Claim the throne','Leave'],-1,1,2,0]),c(402,[0,'Claim the throne']),
                c(121,[2187,2187,0],1),c(0,[],1),c(402,[1,'Leave']),c(0,[],1),c(404),c(0)]));
        }
        if(id===142) {
            // Normal Gauntlet arrival and every duplicate trigger select the
            // solo Gro-goroth route. No Girl transformation/controller waits.
            [25,27,29,30,31].forEach(function(n){allPages(events[n],[flag(1899),c(0)],1);});
            allPages(events[26],battle(169,'B'),3);
            events[26].pages[0].conditions.switch1Valid=true;
            events[26].pages[0].conditions.switch1Id=1899;
            [24,47].forEach(function(n){allPages(events[n],[c(0)],0);});
        }
        if(id===140) allPages(events[4],voidBattle(),3);
        if(id===160 || id===185) {
            var ids=id===160?[286,486,504,505]:[64,65,286,486];
            ids.forEach(function(n){allPages(events[n],voidBattle(),1);});
        }
        if(id===159) {
            // Old saves in the Girl's transformation return to a valid solo
            // finale rather than waiting forever for the absent companion.
            events.forEach(function(e){if(e) allPages(e,[c(0)],0);});
            allPages(events[16],release().concat([flag(1899),transfer(142,35,27),c(0)]),3);
        }
        if(id===86) {
            // Never run human ending choreography/achievements for actor slot 1.
            events.forEach(function(e){if(e) allPages(e,[c(0)],0);});
            allPages(events[4],[finish('RECOVER'),c(0)],3);
        }
    };
    var setup=Game_Map.prototype.setup;
    Game_Map.prototype.setup=function(id) {MOD.patchEndingMap($dataMap,id);setup.call(this,id);repair(id);if(run()) $gameSystem._maulerEndingVersion=1.7;};
    function soul(id,switchId) {
        if(!$gameParty.hasItem($dataItems[id])) $gameParty.gainItem($dataItems[id],1);
        $gameSwitches.setValue(switchId,true);
    }
    function repair(id) {
        if(!run()) return;
        // Reaching Le'garde's level-7 prison resolves the escape objective even
        // when the living prisoner flees. No dialogue/recruitment is necessary.
        if(id===24) $gameSwitches.setValue(1000,true);
        // Recover the key after the already-completed, silenced Nilvan dream.
        if($gameSwitches.value(1805)) soul(126,1182);
        if([125,146].indexOf(id)>=0) {
            var outcomes=$gameSystem._maulerNpcOutcomes || {};
            if($gameMap.events().some(function(e) {
                return outcomes[id+':'+e.eventId()]==='defeated' && e.event().pages.some(function(p){return /^\$francois/.test(p.image.characterName);});
            })) {
                soul(127,1181);[1816,1821,1822].forEach(function(n){$gameSwitches.setValue(n,true);});
            }
        }
    }
    var loaded=Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded=function() {
        var id=$gamePlayer.isTransferring()?$gamePlayer._newMapId:$gameMap.mapId();
        MOD.patchEndingMap($dataMap,id);
        if(run() && !$gamePlayer.isTransferring() && $gameSystem._maulerEndingVersion!==1.7) {
            // Serialized interpreters retain old lists; replace those only in
            // affected cinematic maps. Ordinary dungeon saves keep their state.
            if([86,138,140,142,146,159,160,185].indexOf(id)>=0) {
                $gameMap._interpreter.clear();$gameMessage.clear();
                $gameMap.events().forEach(function(e){e._erased=false;e._pageIndex=-2;e.refresh();});
                $gameSwitches.setValue(202,false);$gameSwitches.setValue(410,false);
                $gamePlayer.setTransparent(false);$gameScreen.startTint([0,0,0,0],1);
            }
            $gameSystem._maulerEndingVersion=1.7;
        }
        repair(id);loaded.call(this);
    };
    // The NPC battle adapter may bypass a boss's separate reward controller.
    // Give only the actual defeated boss's progression reward, once per item.
    var endBattle=BattleManager.endBattle;
    BattleManager.endBattle=function(result) {
        if(run() && $gameTemp._maulerVoidBattle && $gameTroop._troopId===135) {
            if(result===0) $gameSystem._maulerVoidVictory=true;
            $gameTemp._maulerVoidBattle=false;
        }
        if(run() && result===0) {
            var id=$gameTroop._troopId, map=$gameMap.mapId();
            if(id===110) {soul(128,1184);$gameSwitches.setValue(1747,true);}
            if(id===75 && map===78) {
                soul(129,1183);[1029,1001,1608].forEach(function(n){$gameSwitches.setValue(n,true);});
            }
            if([115,116].indexOf(id)>=0 && [125,146].indexOf(map)>=0) {
                soul(127,1181);[1816,1821,1822].forEach(function(n){$gameSwitches.setValue(n,true);});
            }
        }
        endBattle.call(this,result);
    };
    var gainItem=Game_Interpreter.prototype.command126;
    Game_Interpreter.prototype.command126=function() {
        if(run() && [126,127,128,129].indexOf(this._params[0])>=0 && this._params[1]===0 && $gameParty.hasItem($dataItems[this._params[0]])) return true;
        return gainItem.call(this);
    };
    var epilogues={
        E:['ENDING E — BEYOND THE GATES\n\nThe prisoner\'s cell is behind you. The mist parts at the fortress gate.\n\nFor the first time in years, your feet touch the road to Rondon.',
           'The guards do not stop you.\n\nFar below, doors remain unopened. Above, there are towns whose streets you have never inspected.\n\nYou drag the weight of your arm into the morning.'],
        B:['ENDING B — THE LAST INSPECTION\n\nAt the bottom of the world, you strike at the traces of a god.\n\nFor a moment, the chamber falls silent.',
           'Then the patterns become clear.\n\nThe stone. The bodies. The crows. Your own hands.\n\nThere is nothing left to correct. There never was.\n\nThe maul slips from your arm. No order follows.'],
        D:['ENDING D — THE ETERNAL WARDEN\n\nThe two-headed thing lies still. Its broken maul rests beside your own.\n\nFor a moment, you recognize what you might have become.\n\nThen you step over it.',
           'The dungeon stretches beyond sight. Every door belongs to you now.\n\nNo prisoner is ever released. No guard is ever relieved.\n\nYou have restored discipline.\n\nThe inspection will never end.'],
        R:['CROW MAULER — JOURNEY COMPLETE\n\nThis journey reached an ending written for another life.\n\nThe captain cannot remember that life. Only the descent remains.',
           'Somewhere behind him, a door closes.\n\nFor once, he does not turn back.']
    };
    function Scene_MaulerEnding() {this.initialize.apply(this,arguments);}
    Scene_MaulerEnding.prototype=Object.create(MOD.TextScene.prototype);
    Scene_MaulerEnding.prototype.constructor=Scene_MaulerEnding;
    Scene_MaulerEnding.prototype.create=function() {
        var route=$gameSystem._maulerEnding || 'R';
        this._pages=epilogues[route].concat(['THE END\n\nFear & Hunger — Miro Haverinen\n\nCrow Mauler playable mod\n\nJourney complete.\n\nContinue to return to the title screen.']);
        AudioManager.stopAll();MOD.TextScene.prototype.create.call(this);
    };
    Scene_MaulerEnding.prototype.update=function() {
        Scene_Base.prototype.update.call(this);
        if(this._inputDelay>0) {this._inputDelay--;return;}
        if(this.isActive() && !SceneManager.isSceneChanging() && (Input.isTriggered('ok') || TouchInput.isTriggered() || this._clicked)) {
            this._page++;
            if(this._page<this._pages.length) this.drawPage();
            else {SceneManager.goto(Scene_Title);SceneManager.clearStack();}
        }
    };
    MOD.EndingScene=Scene_MaulerEnding;
    MOD.endingPages=epilogues;
    MOD.finishEnding=function(route) {
        if(!run()) return;
        var recovering=route==='RECOVER';
        if(recovering) route=$gameSystem._maulerEnding ||
            ($gameSwitches.value(1891)?'B':$gameSwitches.value(1889)?'D':
            [1892,1890,2647,2249].some(function(n){return $gameSwitches.value(n);})?'R':'E');
        // An old completed human/1.6 D save gets a labelled recovery ending;
        // a new D completion must be earned by winning the Void encounter.
        if(route==='D' && !$gameSystem._maulerVoidVictory) {
            if(recovering) route='R';
            else return;
        }
        if(!epilogues[route]) return;
        $gameSystem._maulerEnding=route;
        $gameSystem._maulerCompleted=true;
        $gameMessage.clear();$gameTemp.clearCommonEvent();
        $gamePlayer.clearTransferInfo();$gameScreen.clear();
        SceneManager.goto(Scene_MaulerEnding);
    };
    var plugin=Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand=function(name,args) {
        if(run() && name==='MaulerEnding') {MOD.finishEnding(args[0]);this._index=this._list.length;}
        else if(run() && name==='MaulerEndlessSoul') soul(126,1182);
        else plugin.call(this,name,args);
    };
})();
