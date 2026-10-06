'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const adapter = require('../workflow_adapter.js');

const fixture = name => JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/workflows', name), 'utf8'));
const unresolved = value => Boolean(value && value._workflow_unresolved === true);
const node = (id, type, inputs = [], widgets_values = [], outputs = [{ name: 'out', type: 'STRING' }]) => ({ id, type, mode: 0, inputs, widgets_values, outputs });
const input = (name, link, type = 'STRING') => ({ name, type, link, widget: { name } });
const link = (id, from, slot, to, targetSlot, type = 'STRING') => [id, from, slot, to, targetSlot, type];
const definition = (id, nodes, links, inputs = [{ name: 'text', type: 'STRING' }], outputs = [{ name: 'out', type: 'STRING' }]) => ({ id, inputNode: { id: -10 }, outputNode: { id: -20 }, inputs, outputs, nodes, links });

function nestedWorkflow() {
  const inner = definition('inner', [node(1, 'CLIPTextEncode', [input('text', 1)], ['inner stale'])], [link(1, -10, 0, 1, 0), link(2, 1, 0, -20, 0)]);
  const outer = definition('outer', [node(1, 'inner', [input('text', 1)], ['outer stale'])], [link(1, -10, 0, 1, 0), link(2, 1, 0, -20, 0)]);
  return {
    nodes: [node(1, 'PrimitiveString', [], ['active']), node(2, 'outer', [input('text', 1)], ['instance stale']), node(3, 'KSampler', [input('positive', 2, 'CONDITIONING')])],
    links: [link(1, 1, 0, 2, 0), link(2, 2, 0, 3, 0)], definitions: { subgraphs: [inner, outer] }
  };
}

test('official H3 five-view Designer overrides obsolete three-view linked widgets across the subgraph', () => {
  const workflow = fixture('H3_Character_Sheet_Designer_wf.json');
  assert.match(workflow.nodes.find(n => n.id === 18).widgets_values_named.source, /three-view/);
  const { graph, warnings, provenance } = adapter.toGraph(workflow);
  assert.equal(graph['wf:23'].class_type, 'H3CharacterSheetDesignerReference');
  assert.deepEqual(JSON.parse(graph['wf:23'].inputs.state_json).views, ['face_front', 'face_left', 'body_front', 'body_left', 'body_back']);
  assert.equal(graph['wf:23'].inputs.use_layout_image, false);
  assert.equal(graph['wf:23'].inputs.style, 'none');
  assert.deepEqual(graph['wf:18/5'].inputs.prompt, ['wf:23', 0]);
  assert.deepEqual(graph['wf:18/5'].inputs.width, ['wf:23', 1]);
  assert.deepEqual(graph['wf:18/5'].inputs.height, ['wf:23', 2]);
  assert.deepEqual(graph['wf:18/5'].inputs['ref_images.ref_image_1'], ['wf:23', 3]);
  assert.deepEqual(graph['wf:18/7'].inputs.conditioning, ['wf:18/5', 0]);
  assert.deepEqual(graph['wf:18/10'].inputs.guider, ['wf:18/7', 0]);
  assert.deepEqual(graph['wf:20'].inputs.images, ['wf:18/12', 0]);
  assert.equal(graph['wf:18/8'].inputs.sampler_name, 'euler');
  assert.equal(graph['wf:18/1'].inputs.unet_name, 'minimax\\DasiwaMinimaxH3_dasiwaHybridV2_int8.safetensors');
  assert.doesNotMatch(JSON.stringify(graph), /three-view|BEGIN_LAYOUT_JSON/);
  assert.deepEqual(provenance.nodes['wf:18/5'].path, ['18', '5']);
  assert.equal(provenance.nodes['wf:18/5'].inputs.prompt.kind, 'link');
  assert.equal(warnings.length, 0);
});

test('official Qwen fixture keeps named instance values, active links, ports and KSampler roots', () => {
  const { graph, warnings } = adapter.toGraph(fixture('QwenImage21_Character_Sheet_Designer_wf.json'));
  assert.equal(JSON.parse(graph['wf:15'].inputs.state_json).views.length, 5);
  assert.equal(graph['wf:15'].inputs.use_layout_image, true);
  assert.deepEqual(graph['wf:498/485'].inputs.prompt, ['wf:15', 0]);
  assert.equal(graph['wf:498/485'].inputs.negative_prompt, '');
  assert.deepEqual(graph['wf:498/482'].inputs.positive, ['wf:498/485', 0]);
  assert.deepEqual(graph['wf:498/482'].inputs.negative, ['wf:498/485', 1]);
  assert.equal(graph['wf:498/482'].inputs.seed, 792351110812704);
  assert.equal(graph['wf:498/482'].inputs.sampler_name, 'euler');
  assert.equal(graph['wf:498/482'].inputs.steps, 30);
  assert.deepEqual(graph['wf:20'].inputs.images, ['wf:498/481', 0]);
  assert.equal(warnings.length, 0);
});

test('nested subgraph boundaries flatten in both directions without leaking stale widgets', () => {
  const { graph } = adapter.toGraph(nestedWorkflow());
  assert.deepEqual(graph['wf:2/1/1'].inputs.text, ['wf:1', 0]);
  assert.deepEqual(graph['wf:3'].inputs.positive, ['wf:2/1/1', 0]);
  assert.equal(graph['wf:1'].inputs.value, 'active');
  assert.doesNotMatch(JSON.stringify(graph), /stale/);
});

test('separate instances and escaped original IDs cannot collide', () => {
  const workflow = nestedWorkflow();
  workflow.nodes.push(node('2/1', 'CLIPTextEncode', [], ['top-level']), node(4, 'outer', [input('text', null)]));
  workflow.nodes.at(-1).widgets_values_named = { text: 'second instance' };
  const { graph } = adapter.toGraph(workflow);
  assert.equal(graph['wf:2%2F1'].inputs.text, 'top-level');
  assert.equal(graph['wf:4/1/1'].inputs.text, 'second instance');
  assert.deepEqual(graph['wf:2/1/1'].inputs.text, ['wf:1', 0]);
});

test('input and output boundary ports match names even when exposed order differs', () => {
  const sub = definition('reordered', [node(7, 'CLIPTextEncode', [input('text', 1)], ['stale'])], [link(1, -10, 1, 7, 0), link(2, 7, 0, -20, 1)], [{ name: 'width', type: 'INT' }, { name: 'text', type: 'STRING' }], [{ name: 'width', type: 'INT' }, { name: 'out', type: 'CONDITIONING' }]);
  const workflow = { nodes: [node(1, 'PrimitiveString', [], ['active']), node(2, 'reordered', [input('text', 1)], [], [{ name: 'out', type: 'CONDITIONING' }]), node(3, 'KSampler', [input('positive', 2)])], links: [link(1, 1, 0, 2, 0), link(2, 2, 0, 3, 0)], definitions: { subgraphs: [sub] } };
  const { graph } = adapter.toGraph(workflow);
  assert.deepEqual(graph['wf:2/7'].inputs.text, ['wf:1', 0]);
  assert.deepEqual(graph['wf:3'].inputs.positive, ['wf:2/7', 0]);
});

test('linked input overrides both named and positional values, including dangling links', () => {
  const linked = node(2, 'CLIPTextEncode', [input('text', 1)], ['stale positional']);
  linked.widgets_values_named = { text: 'stale named' };
  const workflow = { nodes: [node(1, 'PrimitiveString', [], ['active']), linked], links: [link(1, 1, 0, 2, 0)] };
  assert.deepEqual(adapter.toGraph(workflow).graph['wf:2'].inputs.text, ['wf:1', 0]);
  workflow.links = [];
  const result = adapter.toGraph(workflow);
  assert.ok(unresolved(result.graph['wf:2'].inputs.text));
  assert.ok(result.warnings.some(w => /dangling/i.test(w)));
  assert.doesNotMatch(JSON.stringify(result.graph), /stale/);
});

test('mismatched target and nonexistent output slots remain unresolved', () => {
  const workflow = { nodes: [node(1, 'PrimitiveString', [], ['source']), node(2, 'CLIPTextEncode', [input('text', 1)], ['stale'])], links: [link(1, 1, 0, 999, 0)] };
  assert.ok(unresolved(adapter.toGraph(workflow).graph['wf:2'].inputs.text));
  workflow.links = [link(1, 1, 4, 2, 0)];
  assert.ok(unresolved(adapter.toGraph(workflow).graph['wf:2'].inputs.text));
});

test('unknown positional widgets are explicitly unresolved rather than guessed from prose', () => {
  const workflow = { nodes: [node(1, 'UnknownPromptProcessor', [input('text', null)], ['looks like a plausible prompt'])], links: [] };
  const { graph, warnings } = adapter.toGraph(workflow);
  assert.ok(unresolved(graph['wf:1'].inputs.text));
  assert.doesNotMatch(JSON.stringify(graph), /plausible prompt/);
  assert.ok(warnings.some(w => /unsupported/i.test(w)));
});

test('named values are used only with supported widget fields and never inferred from labels', () => {
  const text = node(1, 'CLIPTextEncode', [], ['old']);
  text.widgets_values_named = { text: 'named current', arbitrary: 'unrelated' };
  const { graph } = adapter.toGraph({ nodes: [text], links: [] });
  assert.equal(graph['wf:1'].inputs.text, 'named current');
  assert.equal(graph['wf:1'].inputs.arbitrary, undefined);
});

test('disabled and bypassed widgets cannot become active prompt sources', () => {
  const source = node(1, 'PrimitiveString', [], ['active']);
  const bypassed = node(2, 'CLIPTextEncode', [input('text', 1)], ['bypassed stale']);
  bypassed.mode = 4;
  const workflow = { nodes: [source, bypassed, node(3, 'CLIPTextEncode', [input('text', 2)], ['stale'])], links: [link(1, 1, 0, 2, 0), link(2, 2, 0, 3, 0)] };
  const bypass = adapter.toGraph(workflow);
  assert.equal(bypass.graph['wf:2'], undefined);
  assert.deepEqual(bypass.graph['wf:3'].inputs.text, ['wf:1', 0]);
  bypassed.mode = 2;
  const disabled = adapter.toGraph(workflow);
  assert.equal(disabled.graph['wf:2'], undefined);
  assert.ok(unresolved(disabled.graph['wf:3'].inputs.text));
  assert.doesNotMatch(JSON.stringify(disabled.graph), /stale/);
});

test('ambiguous bypass input choice is unresolved', () => {
  const bypassed = node(2, 'UnknownSwitch', [input('a', 1), input('b', 2)], ['wrong']);
  bypassed.mode = 4;
  const workflow = { nodes: [node(1, 'PrimitiveString', [], ['a']), node(4, 'PrimitiveString', [], ['b']), bypassed, node(3, 'CLIPTextEncode', [input('text', 3)])], links: [link(1, 1, 0, 2, 0), link(2, 4, 0, 2, 1), link(3, 2, 0, 3, 0)] };
  assert.ok(unresolved(adapter.toGraph(workflow).graph['wf:3'].inputs.text));
});

test('recursive definitions terminate with explicit unresolved output and warning', () => {
  const sub = definition('recursive', [node(1, 'recursive')], [link(1, 1, 0, -20, 0)], []);
  const workflow = { nodes: [node(1, 'recursive'), node(2, 'CLIPTextEncode', [input('text', 1)], ['stale'])], links: [link(1, 1, 0, 2, 0)], definitions: { subgraphs: [sub] } };
  const result = adapter.toGraph(workflow);
  assert.ok(unresolved(result.graph['wf:2'].inputs.text));
  assert.ok(result.warnings.some(w => /recursive|cycle/i.test(w)));
});

test('ordinary graph dependency cycles are diagnosed and cut', () => {
  const workflow = { nodes: [node(1, 'CLIPTextEncode', [input('text', 1)]), node(2, 'CLIPTextEncode', [input('text', 2)])], links: [link(1, 2, 0, 1, 0), link(2, 1, 0, 2, 0)] };
  const { graph, warnings } = adapter.toGraph(workflow);
  assert.ok(unresolved(graph['wf:1'].inputs.text) || unresolved(graph['wf:2'].inputs.text));
  assert.ok(warnings.some(w => /cycle/i.test(w)));
});

test('subgraph link cycles and dangling boundaries never fall back to inner stale text', () => {
  const workflow = nestedWorkflow();
  workflow.nodes[1].inputs[0].link = 3;
  workflow.links.push(link(3, 2, 0, 2, 0));
  let result = adapter.toGraph(workflow);
  assert.ok(result.warnings.some(w => /cycle/i.test(w)));
  workflow.links = [];
  result = adapter.toGraph(workflow);
  assert.ok(unresolved(result.graph['wf:2/1/1'].inputs.text));
  assert.doesNotMatch(JSON.stringify(result.graph), /stale/);
});

test('budgets bound expanded nodes, nesting depth, links and resolution work', () => {
  const workflow = nestedWorkflow();
  for (const limits of [{ maxNodes: 2 }, { maxDepth: 1 }, { maxLinks: 1 }, { maxResolutionSteps: 1 }]) {
    const result = adapter.toGraph(workflow, limits);
    assert.ok(result.warnings.some(w => /limit|budget/i.test(w)), JSON.stringify(limits));
    if (limits.maxNodes) assert.ok(Object.keys(result.graph).length <= 2);
  }
});

test('adapter is pure, accepts frozen workflow objects and handles malformed input', () => {
  const workflow = nestedWorkflow();
  const before = JSON.stringify(workflow);
  function freeze(value) { if (value && typeof value === 'object') { Object.freeze(value); Object.values(value).forEach(freeze); } }
  freeze(workflow);
  adapter.toGraph(workflow);
  assert.equal(JSON.stringify(workflow), before);
  for (const bad of [null, [], 'not a workflow', {}, { nodes: [null, 7], links: ['bad'] }]) {
    const result = adapter.toGraph(bad);
    assert.equal(Object.keys(result.graph).length, 0);
    assert.ok(result.warnings.length > 0);
  }
});

test('browser build exposes only WorkflowAdapter without requiring Node', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../workflow_adapter.js'), 'utf8'), context);
  assert.equal(typeof context.WorkflowAdapter.toGraph, 'function');
  assert.deepEqual(Object.keys(context), ['WorkflowAdapter']);
});

test('input budget exhaustion cannot reveal a linked widget hidden beyond the limit', () => {
  const text = node(1, 'CLIPTextEncode', [input('clip', null, 'CLIP'), input('text', 99)], ['stale']);
  const { graph, warnings } = adapter.toGraph({ nodes: [text], links: [] }, { maxInputs: 1 });
  assert.ok(unresolved(graph['wf:1'].inputs._workflow_unresolved_inputs));
  assert.doesNotMatch(JSON.stringify(graph), /stale/);
  assert.ok(warnings.some(w => /input budget/i.test(w)));
});

test('lone surrogate and reserved-string IDs are safe, unambiguous and prototype-neutral', () => {
  const ids = ['\ud800', '%uD800', '__proto__', 'constructor', 'a/b', 'a%2Fb', '日本語'];
  const { graph } = adapter.toGraph({ nodes: ids.map(id => node(id, 'PrimitiveString', [], [id])), links: [] });
  assert.equal(Object.keys(graph).length, ids.length);
  assert.equal(graph['wf:%uD800'].inputs.value, '\ud800');
  assert.equal(graph['wf:%25uD800'].inputs.value, '%uD800');
  assert.equal(graph['wf:__proto__'].inputs.value, '__proto__');
});

test('duplicate nodes, links and input names do not select an arbitrary source', () => {
  const workflow = { nodes: [node(1, 'PrimitiveString', [], ['first']), node(1, 'PrimitiveString', [], ['second']), node(2, 'CLIPTextEncode', [input('text', 1)], ['stale'])], links: [link(1, 1, 0, 2, 0)] };
  assert.ok(unresolved(adapter.toGraph(workflow).graph['wf:2'].inputs.text));
  workflow.nodes.shift();
  workflow.links.push(link(1, 1, 0, 2, 0));
  assert.ok(unresolved(adapter.toGraph(workflow).graph['wf:2'].inputs.text));
  workflow.links.pop();
  workflow.nodes[1].inputs.push(input('text', null));
  assert.ok(unresolved(adapter.toGraph(workflow).graph['wf:2'].inputs.text));
});

test('subgraph unlinked widgets without an explicit name binding are unresolved', () => {
  const workflow = nestedWorkflow();
  workflow.nodes[1].inputs[0].link = null;
  const { graph, warnings } = adapter.toGraph(workflow);
  assert.ok(unresolved(graph['wf:2/1/1'].inputs.text));
  assert.doesNotMatch(JSON.stringify(graph), /stale/);
  assert.ok(warnings.some(w => /named value required/i.test(w)));
});

test('local nested definitions and pass-through reroutes are resolved', () => {
  const workflow = nestedWorkflow();
  const inner = workflow.definitions.subgraphs.shift();
  workflow.definitions.subgraphs[0].definitions = { subgraphs: [inner] };
  inner.nodes[0].type = 'Reroute';
  const { graph } = adapter.toGraph(workflow);
  assert.deepEqual(graph['wf:3'].inputs.positive, ['wf:1', 0]);
});

test('explicit widget.name aliases remain authoritative over saved named and positional text', () => {
  const aliased = input('displayed_text', 1);
  aliased.widget.name = 'text';
  const text = node(2, 'CLIPTextEncode', [aliased], ['stale']);
  text.widgets_values_named = { text: 'stale named' };
  const { graph } = adapter.toGraph({ nodes: [node(1, 'PrimitiveString', [], ['active']), text], links: [link(1, 1, 0, 2, 0)] });
  assert.deepEqual(graph['wf:2'].inputs.text, ['wf:1', 0]);
  assert.doesNotMatch(JSON.stringify(graph), /stale/);
});

test('unknown named widgets are explicitly unresolved and not treated as executable prompts', () => {
  const unknown = node(1, 'UnknownTextNode');
  unknown.widgets_values_named = { prompt: 'tempting but unsupported' };
  const { graph } = adapter.toGraph({ nodes: [unknown], links: [] });
  assert.ok(unresolved(graph['wf:1'].inputs._workflow_unresolved_widgets));
  assert.doesNotMatch(JSON.stringify(graph), /tempting/);
});

test('official workflow fixture bytes remain unchanged', () => {
  const { createHash } = require('node:crypto');
  const hashes = {
    'H3_Character_Sheet_Designer_wf.json': '463e3220c9dbd6603c1c3f29d3bd750117d1df59316d82c4b6bae5996e61a5a8',
    'QwenImage21_Character_Sheet_Designer_wf.json': '6c0273767f4df88d89eec9d9a5bddc0417ebd3143ad598c56b1d13a9f88aa733'
  };
  for (const [name, expected] of Object.entries(hashes)) {
    const bytes = fs.readFileSync(path.join(__dirname, 'fixtures/workflows', name));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected);
  }
});
