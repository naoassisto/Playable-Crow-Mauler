const assert=require('node:assert/strict'), fs=require('node:fs'),path=require('node:path'),
  os=require('node:os'),vm=require('node:vm'),crypto=require('node:crypto'),cp=require('node:child_process');
const workspace=path.resolve(__dirname,'..');
const release=workspace;
const original=process.env.CROW_MAULER_GAME_ROOT;
const fixtureData={'data/System.json': '{"versionId":14145329}\n'};
const code=fs.readFileSync(path.join(release,'www/js/main.js'),'utf8');
const profile=original
  ? JSON.parse(fs.readFileSync(path.join(release,'www/js/crow-mauler-compatibility.json')))
  : {data_sha256:Object.fromEntries(Object.entries(fixtureData).map(([file,data])=>
      [file,crypto.createHash('sha256').update(data).digest('hex')]))};
if(original) for(const [file,hash] of Object.entries(profile.data_sha256)) {
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(original,file),'utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n')).digest('hex'),hash,file);
}
const game=fs.mkdtempSync(path.join(os.tmpdir(),'mauler-release-game-'));
try {
  const root=path.join(game,'www');fs.mkdirSync(path.join(root,'js'),{recursive:true});
  fs.mkdirSync(path.join(root,'data'));fs.mkdirSync(path.join(root,'save'));
  fs.writeFileSync(path.join(root,'data/System.json'),'{}');
  fs.writeFileSync(path.join(root,'js/main.js'),'original custom loader\n');
  fs.writeFileSync(path.join(root,'js/plugins.js'),'original registry\n');
  fs.writeFileSync(path.join(root,'save/file1.rpgsave'),'private saved game\n');
  function helper(mode,ok=true) {
    const r=cp.spawnSync('bash',[path.join(release,'manage-macOS.sh'),mode,game],{encoding:'utf8'});
    assert.equal(r.status===0,ok,r.stdout+r.stderr);return r;
  }
  helper('install');
  assert.equal(fs.readFileSync(path.join(root,'js/main.js'),'utf8'),code);
  assert.equal(fs.readFileSync(path.join(root,'js/plugins.js'),'utf8'),'original registry\n');
  helper('install',false); // duplicate install must preserve the first backup
  fs.appendFileSync(path.join(root,'js/main.js'),'// later mod\n');
  assert.match(helper('uninstall',false).stdout,/Changed or missing/);
  assert.ok(fs.existsSync(path.join(root,'img/sv_actors/crow_mauler_player.png')));
  fs.writeFileSync(path.join(root,'js/main.js'),code);
  helper('uninstall');
  assert.equal(fs.readFileSync(path.join(root,'js/main.js'),'utf8'),'original custom loader\n');
  assert.equal(fs.readFileSync(path.join(root,'save/file1.rpgsave'),'utf8'),'private saved game\n');
  assert.ok(!fs.existsSync(path.join(root,'js/plugins/PlayableCrowMauler.js')));
  helper('install');helper('uninstall'); // reinstall after removal

  function boot({native=false,bad=false,missing=false,win=false,crlf=false}={}) {
    const before=[{name:'YEP_EventChasePlayer',status:!missing,parameters:{}},
      {name:'physical_attack_animation',status:true,parameters:{PhysicalAttacks:'false',SkillTypes:'4'}},
      {name:'AnotherMod',status:true,parameters:{custom:'keep'}},
      {name:'PlayableCrowMauler',status:true,parameters:{}}];
    const saved=JSON.stringify(before);let loaded=null,started=false,message='';
    const context={window:{location:{pathname:win?'/C:/Games/Fear%20and%20Hunger/www/index.html':'/Games/Fear%20and%20Hunger/www/index.html'}},
      $plugins:before,PluginManager:{setup:list=>loaded=list},SceneManager:{run:()=>started=true},Scene_Boot:function(){},
      document:{body:{appendChild:p=>message=p.textContent},createElement:()=>({style:{}})}};
    if(native) {
      context.process={versions:{nw:'0.29.0'}};
      context.require=name=>name==='fs'?{readFileSync:file=>{
        const relative=file.split('/www/')[1];assert.ok(relative,'Game folder resolved');
        if(relative==='js/crow-mauler-compatibility.json')return JSON.stringify(profile);
        if(bad && relative==='data/System.json') return 'changed';
        let text=original ? fs.readFileSync(path.join(original,relative),'utf8') : fixtureData[relative];
        return crlf?'\uFEFF'+text.replace(/\r?\n/g,'\r\n'):text;
      }}:require(name);
    }
    vm.runInNewContext(code,context);context.window.onload();
    assert.equal(JSON.stringify(before),saved,'Original registry must not be mutated');
    return {loaded,started,message};
  }
  for(const opts of [{},{native:true},{native:true,win:true,crlf:true}]) {
    const result=boot(opts);assert.ok(result.started);
    assert.deepEqual(Array.from(result.loaded,p=>p.name),['YEP_EventChasePlayer','CrowMaulerPhysicalAttackFix','AnotherMod','PlayableCrowMauler']);
    assert.equal(result.loaded[1].parameters.SkillTypes,'4');
    assert.equal(result.loaded[2].parameters.custom,'keep');
  }
  for(const opts of [{native:true,bad:true},{missing:true}]) {
    const result=boot(opts);assert.equal(result.started,false);assert.equal(result.loaded,null);
    assert.match(result.message,/Unsupported or modified|Required original/);
  }
  console.log('PASS: ' + (original ? 'installed game profile, ' : 'synthetic database fixture, ') + ' native/browser bootstrap, Windows paths, BOM/CRLF normalization, registry preservation, dependency/data rejection, install/backup/uninstall/conflict/reinstall/save preservation.');
} finally {fs.rmSync(game,{recursive:true,force:true});}
