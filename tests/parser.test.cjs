const test = require('node:test');
const assert = require('node:assert/strict');
const { parserContext, graph } = require('./helpers/parser-harness.cjs');

test('UTF-8 scan wins over corrupted Latin-1 candidate atomically', () => {
  const c = parserContext();
  const expected = '美しい猫, café';
  const result = c.parseMetadata(Buffer.from('prompt: ' + JSON.stringify(graph(expected))), {name:'unknown.bin'});
  assert.equal(result.positive, expected);
});
for (const reverse of [false, true]) test('structured graph takes precedence over fallback scan, order=' + reverse, () => {
  const c = parserContext();
  const records = [{label:'PNG prompt',value:graph('actual',20)},{label:'Scan prompt',value:graph('stale',40)}];
  if (reverse) records.reverse();
  const r = c.normalizeRecords(records);
  assert.equal(r.positive,'actual'); assert.equal(r.settings,'Steps: 20');
  assert.equal(JSON.parse(r.prompt)['1'].inputs.text,'actual');
});
for (const reverse of [false, true]) test('literal graph wins over Krea workflow reconstruction, order=' + reverse, () => {
  const c = parserContext();
  const records = [{label:'PNG prompt',value:graph('saved compiled prompt')},{label:'PNG workflow',value:{nodes:[{type:'Krea2ElementFramingV1Prompt',widgets_values:['saved layout']}]}}];
  if (reverse) records.reverse();
  assert.equal(c.normalizeRecords(records).positive,'saved compiled prompt');
});
for (const positive of ['cat', 'красивая девушка', 'a dog', '美しい猫']) test('trusted A1111 preserves '+positive, () => {
  const r = parserContext().normalizeRecords([{label:'PNG parameters',value:positive+'\nSteps: 20, Seed: 1'}]);
  assert.equal(r.positive,positive); assert.equal(r.settings,'Steps: 20, Seed: 1');
});
test('unresolved active switch cannot fall through to inactive prompt or model', () => {
  const c = parserContext();
  const g = {'1':{class_type:'OpaqueConditioningProducer',inputs:{}},'2':{class_type:'CLIPTextEncode',inputs:{text:'inactive branch prompt'}},'3':{class_type:'ComfySwitchNode',inputs:{switch:true,on_true:['1',0],on_false:['2',0]}},'4':{class_type:'KSampler',inputs:{positive:['3',0]}}};
  const r = c.extractComfyPromptData(g);
  assert.equal(r.positive,''); assert.equal(r.positiveResolved,false);
  assert.equal(c.findComfyUpstreamNode(g,['3',0],n=>n.class_type==='CLIPTextEncode'),null);
});
test('model and LoRA walkers share active switch selection', () => {
  const c=parserContext(); const g={'1':{class_type:'UNETLoader',inputs:{unet_name:'active.safetensors'}},'2':{class_type:'LoraLoader',inputs:{model:['1',0],lora_name:'active-lora.safetensors',strength_model:1}},'3':{class_type:'ComfySwitchNode',inputs:{switch:true,on_true:['2',0],on_false:['1',0]}},'4':{class_type:'KSampler',inputs:{model:['3',0]}}};
  assert.deepEqual([...c.collectActiveComfyLoras(g,['3',0])],['active-lora.safetensors @1']);
  assert.match(c.extractComfyPromptData(g).settings,/Model: active\.safetensors/);
});
test('unknown latent width is not null or zero', () => {
  const r=parserContext().extractComfyPromptData({'1':{class_type:'EmptyLatentImage',inputs:{width:['missing',0],height:768}},'2':{class_type:'KSampler',inputs:{latent_image:['1',0]}}});
  assert.doesNotMatch(r.settings,/Size:/);
});
for (const depth of [4,8,12,16]) test('no-hit upstream traversal visits each node once at depth '+depth, () => {
  const c=parserContext(), g={}; for(let i=0;i<depth;i++)g[i]={class_type:'PassThrough',inputs:i+1<depth?{model:[String(i+1),0]}:{}};
  let count=0; assert.equal(c.findComfyUpstreamNode(g,['0',0],()=>{count++;return false;}),null); assert.equal(count,depth);
});
for (const length of [200000,200001,350000]) test('valid large JSON parsed before display trim '+length, () => {
  const c=parserContext(), g=graph('preserved prompt'); g['3']={class_type:'Note',inputs:{value:''}};
  g['3'].inputs.value='x'.repeat(length-JSON.stringify(g).length); const value=JSON.stringify(g); assert.equal(value.length,length);
  assert.equal(c.normalizeRecords([{label:'PNG prompt',value}]).positive,'preserved prompt');
});
test('JSON candidate limit also bounds scan work', () => {
  const c=parserContext(); const old=c.findJsonEnd; let scans=0; c.findJsonEnd=(...a)=>{scans++;return old(...a)};
  assert.equal(c.extractJsonAround(Array.from({length:100},()=>'{"prompt":"x"}').join('\n'),'prompt').length,8); assert.equal(scans,8);
});
test('cyclic graph terminates without a hit', () => {
  const c=parserContext(); let visits=0; assert.equal(c.findComfyUpstreamNode({'1':{class_type:'Loop',inputs:{model:['2',0]}},'2':{class_type:'Loop',inputs:{model:['1',0]}}},['1',0],()=>{visits++;return false}),null); assert.equal(visits,2);
});
test('metadata-free image remains empty', () => {
  const c=parserContext(); const bytes=Buffer.from('89504e470d0a1a0a0000000049454e44ae426082','hex'); const r=c.parseMetadata(bytes,{name:'empty.png'});
  assert.equal(r.records.length,0); assert.equal(r.positive,'');
});
