'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const adapters = require('../designer_adapters.js');
const fixtures = path.join(__dirname, 'fixtures/designer');
const golden = JSON.parse(fs.readFileSync(path.join(fixtures, 'golden.json'), 'utf8'));
const clone = value => JSON.parse(JSON.stringify(value));
const base = () => clone(golden.find(item => item.name === 'h3-selection-0').node);
const stateNode = raw => ({ class_type: 'H3CharacterSheetDesigner', inputs: { state_json: typeof raw === 'string' ? raw : JSON.stringify(raw) } });
const state = () => JSON.parse(base().inputs.state_json);

function parity(cases) {
  for (const item of cases) {
    const original = JSON.stringify(item.node);
    for (const [slot, field] of ['prompt', 'width', 'height'].entries()) {
      const result = adapters.resolve(item.node, slot);
      assert.equal(result.resolved, true, item.name + ': ' + result.warnings.join('; '));
      assert.equal(result.text, String(item.expected[field]), item.name + '/' + field);
      assert.equal(result.value, item.expected[field]);
      assert.equal(result.provenance.state_json, item.expected.state_json, item.name + '/canonical state');
      assert.equal(result.provenance.kind, 'reconstructed');
      assert.equal(result.provenance.exactSnapshot, false);
      assert.equal(result.provenance.outputSlot, slot);
      assert.equal(result.provenance.outputName, field);
      assert.match(result.provenance.compilerVersion, /^[a-f0-9]{40}$/);
      assert.match(result.provenance.compilerSource, /^https:\/\/github.com\//);
      assert.ok(result.warnings.some(warning => warning.includes('not a saved execution-output snapshot')));
    }
    assert.equal(JSON.stringify(item.node), original, 'Reconstruction must not change metadata');
  }
}

for (const item of golden) test('Python golden parity: ' + item.name, () => parity([item]));

test('browser global works without Node or external libraries', () => {
  const context = vm.createContext({ TextEncoder });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../designer_adapters.js'), 'utf8'), context);
  assert.ok(context.DesignerAdapters);
  assert.equal(context.DesignerAdapters.resolve(base(), 0).text, adapters.resolve(base(), 0).text);
});

test('only exact node types match; titles and lookalike class names do not', () => {
  assert.equal(adapters.supports(base()), true);
  assert.equal(adapters.supports({ class_type: 'CLIPTextEncode' }), false);
  assert.equal(adapters.supports(null), false);
  for (const node of [{ title: 'H3CharacterSheetDesigner', inputs: base().inputs }, { class_type: 'MyH3CharacterSheetDesigner', inputs: base().inputs }, { type: 'QwenImage21CharacterSheetDesignerUnknown', inputs: base().inputs }]) assert.equal(adapters.resolve(node, 0).code, 'unsupported_node');
});

test('vendored source snapshots match freshly verified GitHub blob IDs', () => {
  const blobs = JSON.parse(fs.readFileSync(path.join(fixtures, 'upstream-blobs.json')));
  const sources = JSON.parse(fs.readFileSync(path.join(fixtures, 'sources.json')));
  for (const [relative, expected] of Object.entries(blobs)) {
    const bytes = fs.readFileSync(path.join(fixtures, 'upstream', relative));
    const blob = crypto.createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
    assert.equal(blob, expected, relative);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), sources.files[relative], relative);
  }
});

test('old three-slot and reference four-slot contracts never invent negative prompts', () => {
  assert.equal(adapters.resolve(base(), 1).value, golden.find(c => c.name === 'h3-selection-0').expected.width);
  for (const type of adapters.supportedTypes) {
    const node = { class_type: type, inputs: base().inputs };
    assert.equal(adapters.resolve(node, 3).code, type === 'H3CharacterSheetDesigner' ? 'unsupported_output' : 'non_text_output');
    for (const slot of [-1, 4, 0.5, '0', 'negative', null]) assert.equal(adapters.resolve(node, slot).resolved, false);
  }
  const node = base(); node.outputs = [{ name: 'prompt' }, { name: 'negative' }, { name: 'height' }];
  assert.equal(adapters.resolve(node, 0).code, 'unsupported_signature');
});

test('official five-view H3 state wins over obsolete linked three-view text', () => {
  const workflow = JSON.parse(fs.readFileSync(path.join(fixtures, 'upstream/H3-Character-Sheet-Designer/workflows/H3_Character_Sheet_Designer_wf.json')));
  const designer = workflow.nodes.find(n => n.type === 'H3CharacterSheetDesignerReference');
  const stale = workflow.nodes.find(n => n.id === 18).widgets_values[0];
  assert.ok(stale.includes('subject_definitions:'));
  const actual = adapters.resolve(designer, 0);
  assert.equal(actual.resolved, true);
  assert.notEqual(actual.text, stale);
  assert.ok(actual.text.includes('Show exactly 5 selected depictions: 2 bust portraits, 3 full-body views.'));
  assert.ok(actual.text.includes('Panel face_left:'));
});

test('canonical state is the only prompt source; preview strings never substitute for missing state', () => {
  const original = base(), json = original.inputs.state_json;
  assert.equal(adapters.resolve({ type: original.class_type, widgets_values: [json, 'STALE PREVIEW'] }, 0).text, adapters.resolve(original, 0).text);
  assert.equal(adapters.resolve({ type: original.class_type, widgets_values: ['subject_definitions: STALE'] }, 0).resolved, false);
  assert.equal(adapters.resolve({ class_type: original.class_type, inputs: { prompt: 'STALE', compiled_prompt: 'STALE' } }, 0).code, 'missing_state');
  assert.equal(adapters.resolve({ type: original.class_type, widgets_values: [json], widgets_values_named: { state_json: '{}' } }, 0).code, 'conflicting_state');
  assert.equal(adapters.resolve({ class_type: original.class_type, inputs: { state_json: null }, widgets_values: [json] }, 0).resolved, false);
});

test('linked input fields remain unresolved instead of using stale saved widgets', () => {
  const node = { type: 'H3CharacterSheetDesignerReference', inputs: [{ name: 'state_json', link: 7 }], widgets_values: [base().inputs.state_json, false, 'none'] };
  assert.equal(adapters.resolve(node, 0).code, 'linked_input');
  for (const key of ['state_json', 'use_layout_image', 'style']) {
    const api = { class_type: node.type, inputs: { state_json: base().inputs.state_json, [key]: ['42', 0] } };
    assert.equal(adapters.resolve(api, 0).resolved, false);
  }
});

test('future versions, malformed fields, unknown parts and unsafe numeric tokens are rejected', () => {
  const cases = [
    raw => { raw.schema_version = 3; }, raw => { raw.schema_version = true; },
    raw => { raw.extra = true; }, raw => { delete raw.size; }, raw => { raw.views = []; },
    raw => { raw.views = ['future_view']; }, raw => { raw.views = 'body_front'; },
    raw => { raw.size.mode = 'future'; }, raw => { raw.size.body_height = 33; },
    raw => { raw.size.body_height = true; }, raw => { raw.size.manual_width = '2240'; },
    raw => { raw.size.body_height = 16416; },
    raw => { raw.schema_version = 2; raw.part_prompts = { future_part: 'red' }; },
    raw => { raw.schema_version = 2; raw.part_prompts = { face: 4 }; },
    raw => { raw.schema_version = 2; raw.part_prompts = { face: 'a'.repeat(1001) }; },
    raw => { raw.schema_version = 2; raw.part_prompts = { face: '\ud800' }; }
  ];
  for (const change of cases) { const raw = state(); change(raw); const r = adapters.resolve(stateNode(raw), 0); assert.equal(r.resolved, false, change.toString()); assert.equal(r.text, ''); }
  for (const raw of ['null', '[]', '{}', '{"schema_version":1,"schema_version":2}', base().inputs.state_json.replace('1120', '1120.0'), base().inputs.state_json.replace('1120', '1.12e3'), base().inputs.state_json.replace('1120', 'Infinity'), base().inputs.state_json + ' trailing', ' '.repeat(65537)]) assert.equal(adapters.resolve(stateNode(raw), 0).resolved, false, raw.slice(0, 100));
});

test('unknown styles and non-boolean options never default silently', () => {
  for (const inputs of [{ use_layout_image: 'false' }, { use_layout_image: 0 }, { style: 'future_style' }, { style: null }]) {
    const node = { class_type: 'QwenImage21CharacterSheetDesigner', inputs: { ...base().inputs, ...inputs } };
    assert.equal(adapters.resolve(node, 0).resolved, false);
  }
});

test('declared version mismatch remains explicit reconstruction uncertainty', () => {
  const node = base(); node.properties = { ver: 'older-release' };
  const result = adapters.resolve(node, 0);
  assert.equal(result.resolved, true);
  assert.equal(result.provenance.declaredVersion, 'older-release');
  assert.ok(result.warnings.some(warning => warning.includes('older-release')));
  assert.equal(result.provenance.runtimeLimitVerified, false);
});

test('strict state size limit counts UTF-8 bytes rather than only characters', () => {
  const raw = JSON.stringify(state()).replace('"views"', '"' + '漢'.repeat(23000) + '"');
  assert.ok(raw.length < 65536);
  assert.equal(adapters.resolve(stateNode(raw), 0).code, 'state_too_large');
});

test('prototype-like JSON keys are data and cannot alter objects', () => {
  const raw = base().inputs.state_json.replace('"schema_version":1', '"schema_version":1,"__proto__":{"polluted":true}');
  assert.equal(adapters.resolve(stateNode(raw), 0).code, 'unknown_key');
  assert.equal({}.polluted, undefined);
});

// Optional broader differential coverage retains compact, reviewed checked-in goldens.
test('exhaustive offline Python differential parity', { skip: process.env.DESIGNER_EXHAUSTIVE !== '1' }, () => {
  const result = spawnSync(process.env.PYTHON || 'python3', [path.join(fixtures, 'generate.py'), '--exhaustive'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr);
  const cases = JSON.parse(result.stdout);
  assert.equal(cases.length, 1339);
  parity(cases);
});
