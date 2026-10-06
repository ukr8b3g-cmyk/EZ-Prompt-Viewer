const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
for (const file of ['main.js','designer_adapters.js','workflow_adapter.js']) {
  if (!fs.existsSync(file)) throw new Error(`Missing runtime file: ${file}`);
  new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
}
const html=fs.readFileSync('avif_prompt_viewer.html','utf8');
for(const [i,match] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].entries()) {
  const src=match[1].match(/\bsrc=["']([^"']+)["']/i);
  if(src){ if(!fs.existsSync(path.resolve(src[1])))throw new Error('Missing script resource '+src[1]); }
  else new vm.Script(match[2],{filename:'viewer-inline-'+i+'.js'});
}
console.log('Runtime syntax and script resources verified');
