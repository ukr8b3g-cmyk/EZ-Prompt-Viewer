const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Designer=require('../designer_adapters.js');
const Workflow=require('../workflow_adapter.js');
const {parserContext,graph}=require('./helpers/parser-harness.cjs');
const {png}=require('./helpers/container-fixtures.cjs');
const fixtures=['H3_Character_Sheet_Designer_wf.json','QwenImage21_Character_Sheet_Designer_wf.json'];
for(const file of fixtures) {
  const workflow=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/workflows',file),'utf8'));
  const api=Workflow.toGraph(workflow).graph;
  const designer=Object.values(api).find(Designer.supports);
  const compiled=Designer.resolve(designer,0);
  for(const [kind,value,expectedKind] of [['workflow',workflow,'workflow-reconstructed'],['prompt',api,'reconstructed']]) {
    test(`${file}: PNG ${kind} uses active compiled state with explicit provenance`,()=>{
      const result=parserContext().parseMetadata(png(kind,Buffer.from(JSON.stringify(value))),{name:'synthetic.png'});
      assert.equal(result.positive,compiled.text.trim());assert.equal(result.provenance.kind,expectedKind);
      assert.equal(result.provenance.compilers[0].compilerVersion,compiled.provenance.compilerVersion);
      assert.ok(result.provenance.compilers[0].source.startsWith('https://github.com/'));
      assert.match(result.warnings.join(' '),/not a saved|not verify|not a verified/);assert.match(result.settings,/Size: 2816x1280/);
    });
  }
  for(const reverse of [false,true]) test(`${file}: literal API prompt outranks authoring workflow ${reverse}`,()=>{
    const records=[{label:'PNG prompt',value:graph('actual persisted literal')},{label:'PNG workflow',value:workflow}];if(reverse)records.reverse();
    const r=parserContext().normalizeRecords(records);assert.equal(r.positive,'actual persisted literal');assert.equal(r.provenance.kind,'saved-graph');
  });
  test(`${file}: invalid Designer state cannot expose stale previews`,()=>{
    const copy=JSON.parse(JSON.stringify(api));const node=Object.values(copy).find(Designer.supports);node.inputs.state_json='{"schema_version":999}';node.inputs.prompt='obsolete preview';
    const r=parserContext().normalizeRecords([{label:'PNG prompt',value:copy}]);assert.equal(r.positive,'');assert.ok(r.warnings.length);
  });
}
test('Designer numeric and image ports are never negative prompt outputs',()=>{
  const workflow=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/workflows',fixtures[0])));const api=Workflow.toGraph(workflow).graph;const entry=Object.entries(api).find(([,n])=>Designer.supports(n));
  for(const output of [1,2,3]){const r=parserContext().resolveComfyPromptReference(api,[entry[0],output],'negative');assert.equal(r.resolved,false);assert.equal(r.text,'');}
});
test('a genuine metadata-free synthetic PNG cannot reconstruct prompt text',()=>{
  const r=parserContext().parseMetadata(png(null,Buffer.alloc(0)),{name:'metadata-free.png'});assert.equal(r.positive,'');assert.equal(r.records.length,0);assert.equal(r.provenance,null);
});
test('settings-only generic workflow cannot suppress existing Krea reconstruction',()=>{
  const c=parserContext();const workflow={nodes:[{id:1,type:'Krea2ElementFramingV1Prompt',widgets_values:['saved layout description']},{id:2,type:'Krea2ElementFramingV1Canvas',widgets_values:[1024,1024,null,'{"boxes":[]}']},{id:3,type:'KSampler',widgets_values:[1,'fixed',20,7,'euler','normal',1]}],links:[]};
  const r=c.normalizeRecords([{label:'PNG workflow',value:workflow}]);assert.equal(JSON.parse(r.positive).high_level_description,'saved layout description');
});
for(const file of fixtures)test(`${file}: active linked state and options compile without stale fallback`,()=>{
  const workflow=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/workflows',file)));const api=Workflow.toGraph(workflow).graph;
  const [id,node]=Object.entries(api).find(([,n])=>Designer.supports(n));const expected=Designer.resolve(node,0).text.trim();
  for(const name of ['state_json','use_layout_image','style']){api['linked-'+name]={class_type:'Primitive',inputs:{value:node.inputs[name]}};node.inputs[name]=['linked-'+name,0];}
  const c=parserContext();const r=c.extractComfyPromptData(api);assert.equal(r.positive,expected);assert.match(r.settings,/Size: 2816x1280/);
  api['linked-state_json'].inputs.value=[id,0];const unresolved=c.extractComfyPromptData(api);assert.equal(unresolved.positive,'');assert.ok(unresolved.warnings.length);
});
test('workflow conversion preserves Designer future signature rejection and version warnings',()=>{
  const workflow=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/workflows',fixtures[0])));const node=workflow.nodes.find(Designer.supports);
  node.properties.ver='unknown-future-compiler';let r=parserContext().normalizeRecords([{label:'PNG workflow',value:workflow}]);assert.match(r.warnings.join(' '),/unknown-future-compiler/);
  node.outputs[0].name='future_different_output';r=parserContext().normalizeRecords([{label:'PNG workflow',value:workflow}]);assert.equal(r.positive,'');assert.match(r.warnings.join(' '),/signature/);
});
test('linked Designer DAG failures are memoized across state and option inputs',()=>{
  const c=parserContext();const g={};const depth=20;for(let i=0;i<depth;i++)g[i]={class_type:'QwenImage21CharacterSheetDesigner',inputs:i===depth-1?{state_json:'invalid'}:{state_json:[String(i+1),0],use_layout_image:[String(i+1),0],style:[String(i+1),0]}};
  let calls=0;const original=c.resolveComfyDesignerOutput;c.resolveComfyDesignerOutput=(...args)=>{calls++;return original(...args)};
  assert.equal(c.resolveComfyPromptReference(g,['0',0],'positive').resolved,false);assert.equal(calls,depth);
});
