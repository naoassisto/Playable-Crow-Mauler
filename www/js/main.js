// Playable Crow Mauler 1.7.0-beta.1 — Naoassisto
// A standalone MV entry point. The player's plugins.js remains untouched.
(function() {
    'use strict';
    function stop(message) {
        window.onload = function() {
            document.body.textContent = '';
            var panel = document.createElement('pre');
            panel.style.cssText = 'color:white;background:#111;padding:30px;white-space:pre-wrap;font:18px sans-serif';
            panel.textContent = 'Playable Crow Mauler could not start.\n\n' + message +
                '\n\nClose the game. See README.txt for compatibility and removal instructions.';
            document.body.appendChild(panel);
        };
    }
    // Check the database locally in the desktop game, before any plugins run.
    // Browser harnesses lack Node; they validate the profile separately.
    if (typeof require === 'function' && typeof process !== 'undefined' && process.versions && process.versions.nw) {
        try {
            var fs = require('fs'), path = require('path'), crypto = require('crypto');
            var filename = decodeURIComponent(window.location.pathname);
            if (/^\/[A-Za-z]:\//.test(filename)) filename = filename.slice(1);
            var root = path.dirname(filename);
            var profile = JSON.parse(fs.readFileSync(path.join(root, 'js/crow-mauler-compatibility.json'), 'utf8'));
            Object.keys(profile.data_sha256).forEach(function(file) {
                var content = fs.readFileSync(path.join(root, file), 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
                var hash = crypto.createHash('sha256').update(content).digest('hex');
                if (hash !== profile.data_sha256[file]) throw new Error('Unsupported or modified game data: ' + file);
            });
        } catch (error) {
            stop(error.message);
            return;
        }
    }
    if (!$plugins.some(function(p) { return p.name === 'YEP_EventChasePlayer' && p.status; })) {
        stop('Required original plugin YEP_EventChasePlayer is disabled or missing.');
        return;
    }
    // Substitute the licensed animation-parser fix at the original load position.
    // Re-register Mauler once, last, including when upgrading a development copy.
    var list = $plugins.filter(function(p) {
        return p.name !== 'PlayableCrowMauler' && p.name !== 'CrowMaulerPhysicalAttackFix';
    }).map(function(p) {
        if (p.name !== 'physical_attack_animation' || !p.status) return p;
        return {name:'CrowMaulerPhysicalAttackFix', status:true,
            description:'Compatible physical-attack animation parser', parameters:p.parameters};
    });
    list.push({name:'PlayableCrowMauler', status:true, description:'Playable Crow Mauler by Naoassisto', parameters:{}});
    PluginManager.setup(list);
    window.onload = function() { SceneManager.run(Scene_Boot); };
})();
