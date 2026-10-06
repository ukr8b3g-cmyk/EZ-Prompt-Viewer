const test = require('node:test');
const assert = require('node:assert/strict');
const {parserContext} = require('./helpers/parser-harness.cjs');
const {png,jpeg,webp,avif,enc,exif,graph} = require('./helpers/container-fixtures.cjs');
for (const e of ['utf8','latin1','utf16le','utf16be']) {
  const expected=e==='latin1'?'café déjà vu':'美しい猫, café, красивая девушка';
  const raw=enc(JSON.stringify({prompt:graph(expected)}),e);
  for (const [name,bytes] of [['png',png('prompt',raw)],['jpg',jpeg(0xfe,raw)],['webp',webp('XMP ',raw)],['avif',avif(raw)]]) {
    test(name+' graph preserves '+e,()=>assert.equal(parserContext().parseMetadata(bytes,{name:'synthetic.'+name}).positive,expected));
  }
}
for(const e of ['utf8','utf16le','utf16be']) for(const bom of [false,true]) for(const little of [false,true]) {
  if(e==='utf8'&&bom)continue;
  const expected='美しい猫, café, красивая девушка';
  const payload=exif(expected+'\nNegative prompt: blur\nSteps: 20, Seed: 123',e,little,bom);
  for(const [name,bytes] of [['jpg',jpeg(0xe1,payload)],['webp',webp('EXIF',payload)]]) {
    test(name+' UserComment '+e+' BOM='+bom+' TIFF LE='+little,()=>assert.equal(parserContext().parseMetadata(bytes,{name:'comment.'+name}).positive,expected));
  }
}
