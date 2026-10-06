// Verify the resources actually installed by NSIS, not just the build directory.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
(async()=>{
  const appDir=process.argv[2];
  assert.ok(appDir,'Pass the installed application directory');
  const resources=path.join(appDir,'resources');
  const pkg=require('../package.json');
  assert.equal(pkg.version,'1.2.0');
  assert.equal(require('../package-lock.json').version,pkg.version);
  assert.equal(require('../package-lock.json').packages[''].version,pkg.version);
  assert.equal(pkg.build.appId,'local.ez-prompt-viewer');
  assert.equal(pkg.build.productName,'EZ Prompt Viewer');
  assert.equal(pkg.build.nsis.shortcutName,'EZ Prompt Viewer');
  const asar=await import('@electron/asar');
  const archive=path.join(resources,'app.asar');
  assert.equal(JSON.parse(asar.extractFile(archive,'package.json').toString()).version,pkg.version);
  assert.equal(hash(asar.extractFile(archive,'main.js')),hash(fs.readFileSync('main.js')));
  for(const name of ['avif_prompt_viewer.html','designer_adapters.js','workflow_adapter.js','README.md','assets/icon.ico','assets/icon.png','assets/about-character.gif','assets/about-character.png','assets/about-character.webp']){
    const original=fs.readFileSync(name);
    assert.ok(original.length>0);
    assert.equal(hash(fs.readFileSync(path.join(resources,name))),hash(original),`Installed resource differs: ${name}`);
  }
  const html=fs.readFileSync(path.join(resources,'avif_prompt_viewer.html'),'utf8');
  assert.match(html,/const appVersion = "1\.2\.0"/);
  for(const name of ['designer_adapters.js','workflow_adapter.js'])assert.ok(html.includes(`src="${name}"`),`HTML does not load ${name}`);
  const exe=fs.readFileSync(path.join(appDir,'EZ Prompt Viewer.exe'));
  assert.equal(exe.subarray(0,2).toString(),'MZ');
  const pe=exe.readUInt32LE(0x3c);
  assert.equal(exe.subarray(pe,pe+4).toString(),'PE\0\0');
  assert.equal(exe.readUInt16LE(pe+4),0x8664,'Application must be Windows AMD64');
  console.log('Installed package verified: version 1.2.0, x64 PE, app.asar, runtime HTML, both adapters, README and icons');
})().catch(error=>{console.error(error);process.exit(1);});
