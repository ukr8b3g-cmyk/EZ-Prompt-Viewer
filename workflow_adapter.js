/* Pure, conservative ComfyUI workflow -> API graph adapter. No node execution. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WorkflowAdapter = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Positional layouts are explicit node contracts, never a scan for plausible prose.
  // null entries are frontend-only controls (e.g. seed control_after_generate).
  const WIDGETS = Object.freeze({
    H3CharacterSheetDesigner: ['state_json'],
    H3CharacterSheetDesignerReference: ['state_json', 'use_layout_image', 'style'],
    QwenImage21CharacterSheetDesigner: ['state_json', 'use_layout_image', 'style'],
    CLIPTextEncode: ['text'],
    CLIPTextEncodeSDXL: ['width', 'height', 'crop_w', 'crop_h', 'target_width', 'target_height', 'text_g', 'text_l'],
    CLIPTextEncodeSDXLRefiner: ['ascore', 'width', 'height', 'text'],
    CLIPTextEncodeFlux: ['clip_l', 't5xxl', 'guidance'],
    TextEncodeQwenImageEdit: ['prompt'],
    TextEncodeQwenImageEditPlus: ['prompt'],
    TextEncodeQwenImage21: ['prompt', 'negative_prompt', 'resolution'],
    MiniMaxH3ReferenceToVideo: ['prompt', 'width', 'height', 'length', 'ref_image_size'],
    MiniMaxH3ImageToVideo: ['prompt', 'width', 'height', 'length'],
    PrimitiveString: ['value'],
    PrimitiveStringMultiline: ['value'],
    PrimitiveInt: ['value', null],
    PrimitiveFloat: ['value'],
    PrimitiveBoolean: ['value'],
    KSampler: ['seed', null, 'steps', 'cfg', 'sampler_name', 'scheduler', 'denoise'],
    KSamplerAdvanced: ['add_noise', 'noise_seed', null, 'steps', 'cfg', 'sampler_name', 'scheduler', 'start_at_step', 'end_at_step', 'return_with_leftover_noise'],
    SamplerCustom: ['add_noise', 'noise_seed', null, 'cfg'],
    SamplerCustomAdvanced: [],
    BasicGuider: [],
    CFGGuider: ['cfg'],
    DualCFGGuider: ['cfg_conds', 'cfg_cond2_negative', 'style'],
    BasicScheduler: ['scheduler', 'steps', 'denoise'],
    KSamplerSelect: ['sampler_name'],
    RandomNoise: ['noise_seed', null],
    EmptyLatentImage: ['width', 'height', 'batch_size'],
    EmptySD3LatentImage: ['width', 'height', 'batch_size'],
    EmptyHunyuanLatentVideo: ['width', 'height', 'length', 'batch_size'],
    CheckpointLoaderSimple: ['ckpt_name'],
    CheckpointLoader: ['config_name', 'ckpt_name'],
    UNETLoader: ['unet_name', 'weight_dtype'],
    CLIPLoader: ['clip_name', 'type', 'device'],
    DualCLIPLoader: ['clip_name1', 'clip_name2', 'type', 'device'],
    TripleCLIPLoader: ['clip_name1', 'clip_name2', 'clip_name3'],
    VAELoader: ['vae_name'],
    LoraLoader: ['lora_name', 'strength_model', 'strength_clip'],
    LoraLoaderModelOnly: ['lora_name', 'strength_model'],
    CLIPSetLastLayer: ['stop_at_clip_layer'],
    ConditioningZeroOut: [],
    ConditioningCombine: [],
    ConditioningConcat: [],
    ConditioningAverage: ['conditioning_to_strength'],
    ConditioningSetArea: ['width', 'height', 'x', 'y', 'strength'],
    ConditioningSetAreaPercentage: ['width', 'height', 'x', 'y', 'strength'],
    ConditioningSetTimestepRange: ['start', 'end'],
    FluxGuidance: ['guidance'],
    VAEDecode: [],
    VAEEncode: [],
    ImageFromBatch: ['batch_index', 'length'],
    LoadImage: ['image', null],
    SaveImage: ['filename_prefix'],
    SaveImageAdvanced: ['filename_prefix', 'format', 'bit_depth', 'color_space'],
    PreviewImage: [],
    PreviewAny: [],
    QwenImage21Cache: ['device', 'dtype'],
    // Notes are deliberately recognized as non-executable and have no prompt fields.
    Note: [],
    MarkdownNote: []
  });
  const LIMITS = Object.freeze({ maxNodes: 10000, maxLinks: 50000, maxDepth: 16, maxResolutionSteps: 100000, maxResolutionDepth: 128, maxDefinitions: 1000, maxInputs: 100000, maxWarnings: 250 });
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const validId = value => typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));
  const scalar = value => typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value));
  const unresolved = (reason, detail) => Object.assign({ _workflow_unresolved: true, reason }, detail || {});
  const isUnresolved = value => record(value) && value._workflow_unresolved === true;
  const isLink = value => Array.isArray(value) && value.length === 2 && typeof value[0] === 'string' && Number.isInteger(value[1]);
  function encodeId(value) {
    // encodeURIComponent throws on a lone UTF-16 surrogate, which JSON can contain.
    let encoded = '';
    for (const part of value) {
      const code = part.charCodeAt(0);
      encoded += part.length === 1 && code >= 0xd800 && code <= 0xdfff
        ? '%u' + code.toString(16).toUpperCase() : encodeURIComponent(part);
    }
    return encoded;
  }
  const graphId = path => 'wf:' + path.map(encodeId).join('/');
  const targetKey = (id, slot) => JSON.stringify([String(id), slot]);

  function toGraph(workflow, options) {
    const limits = {};
    for (const [name, maximum] of Object.entries(LIMITS)) {
      const value = options && options[name];
      limits[name] = Number.isInteger(value) && value >= 1 ? Math.min(value, maximum) : maximum;
    }
    const graph = Object.create(null);
    const warnings = [];
    const provenance = { format: 'comfyui-workflow', nodes: Object.create(null) };
    const warned = new Set();
    const scopes = [];
    const count = { nodes: 0, links: 0, definitions: 0, inputs: 0, resolutions: 0 };
    function warn(message) {
      if (warned.has(message)) return;
      if (warnings.length >= limits.maxWarnings) {
        if (warnings.length === limits.maxWarnings) warnings.push('Workflow warning limit reached; further warnings omitted.');
        return;
      }
      warned.add(message);
      warnings.push(message);
    }
    function fail(reason, where, detail) {
      warn(reason + (where ? ' (' + where + ')' : ''));
      return unresolved(reason, detail);
    }
    function parseLink(value) {
      const link = Array.isArray(value)
        ? { id: value[0], origin_id: value[1], origin_slot: value[2], target_id: value[3], target_slot: value[4], type: value[5] }
        : value;
      if (!record(link) || !validId(link.id) || !validId(link.origin_id) || !validId(link.target_id) || !Number.isInteger(link.origin_slot) || link.origin_slot < 0 || !Number.isInteger(link.target_slot) || link.target_slot < 0) return null;
      return link;
    }
    function buildScope(data, path, parent, instance, ancestors, inheritedDefinitions) {
      let definitions = inheritedDefinitions;
      const listedDefinitions = data.definitions && data.definitions.subgraphs;
      if (Array.isArray(listedDefinitions) && listedDefinitions.length) {
        if (count.definitions < limits.maxDefinitions) definitions = new Map(inheritedDefinitions);
        const local = new Set();
        for (const definition of listedDefinitions) {
          if (++count.definitions > limits.maxDefinitions) { warn('Workflow definition budget limit reached'); break; }
          if (!record(definition) || !validId(definition.id) || !Array.isArray(definition.nodes)) { warn('Malformed subgraph definition'); continue; }
          const id = String(definition.id);
          if (local.has(id)) { definitions.set(id, null); warn('Duplicate subgraph definition: ' + id); }
          else { local.add(id); definitions.set(id, definition); }
        }
      }
      const scope = { data, path, parent, instance, definitions, nodes: new Map(), links: new Map(), targetLinks: new Map(), outputNames: new Map() };
      if (Array.isArray(data.outputs)) {
        if (data.outputs.length > limits.maxInputs - count.inputs) warn('Workflow boundary port budget limit reached');
        else {
          count.inputs += data.outputs.length;
          data.outputs.forEach((port, index) => {
            if (!record(port) || typeof port.name !== 'string') return;
            scope.outputNames.set(port.name, scope.outputNames.has(port.name) ? null : index);
          });
        }
      }
      scopes.push(scope);
      if (Array.isArray(data.links)) for (const raw of data.links) {
        if (++count.links > limits.maxLinks) { warn('Workflow link budget limit reached'); break; }
        const link = parseLink(raw);
        if (!link) { warn('Malformed workflow link'); continue; }
        const key = String(link.id);
        if (scope.links.has(key)) { scope.links.set(key, null); warn('Duplicate workflow link: ' + graphId(path) + '#' + key); }
        else scope.links.set(key, link);
        const destination = targetKey(link.target_id, link.target_slot);
        scope.targetLinks.set(destination, scope.targetLinks.has(destination) ? null : key);
      }
      for (const node of data.nodes) {
        if (++count.nodes > limits.maxNodes) { warn('Workflow node budget limit reached'); break; }
        if (!record(node) || !validId(node.id) || typeof node.type !== 'string') { warn('Malformed workflow node'); continue; }
        const id = String(node.id);
        if (scope.nodes.has(id)) { scope.nodes.set(id, null); warn('Duplicate workflow node: ' + graphId(path.concat(id))); continue; }
        const inputs = Array.isArray(node.inputs) ? node.inputs : [];
        const inputLimit = inputs.length > limits.maxInputs - count.inputs;
        if (inputLimit) warn('Workflow input budget limit reached (' + graphId(path.concat(id)) + ')');
        else count.inputs += inputs.length;
        const inputNames = new Map();
        if (!inputLimit) inputs.forEach((input, index) => {
          if (!record(input) || typeof input.name !== 'string') return;
          inputNames.set(input.name, inputNames.has(input.name) ? null : index);
        });
        scope.nodes.set(id, { node, inputs: inputLimit ? [] : inputs, inputNames, inputLimit, scope, path: path.concat(id), id: graphId(path.concat(id)), child: null, blocked: null });
      }
      for (const entry of scope.nodes.values()) {
        if (!entry || entry.node.mode === 2 || entry.node.mode === 4) continue;
        if (definitions.has(entry.node.type)) {
          const definition = definitions.get(entry.node.type);
          if (!definition) entry.blocked = 'Ambiguous subgraph definition';
          else if (ancestors.has(definition)) entry.blocked = 'Recursive subgraph definition cycle';
          else if (path.length >= limits.maxDepth) entry.blocked = 'Subgraph nesting depth limit reached';
          else entry.child = buildScope(definition, entry.path, scope, entry, new Set([...ancestors, definition]), definitions);
          if (entry.blocked) warn(entry.blocked + ' (' + entry.id + ')');
          continue;
        }
        graph[entry.id] = { class_type: entry.node.type, inputs: Object.create(null) };
        provenance.nodes[entry.id] = { path: entry.path.slice(), originalId: entry.node.id, type: entry.node.type, inputs: Object.create(null) };
      }
      return scope;
    }
    function inputName(entry, input) {
      const schema = own(WIDGETS, entry.node.type) ? WIDGETS[entry.node.type] : [];
      const widgetName = record(input.widget) && input.widget.name;
      return typeof widgetName === 'string' && schema.includes(widgetName) ? widgetName : input.name;
    }
    function widgetValue(entry, name) {
      const node = entry.node;
      const schema = own(WIDGETS, node.type) ? WIDGETS[node.type] : null;
      if (!schema || !schema.includes(name)) return { found: false, unsupported: true };
      const named = record(node.widgets_values_named) ? node.widgets_values_named : record(node.widgets_values) ? node.widgets_values : null;
      if (named && own(named, name)) return { found: true, value: named[name], kind: 'named-widget' };
      const index = schema.indexOf(name);
      if (Array.isArray(node.widgets_values) && index < node.widgets_values.length) return { found: true, value: node.widgets_values[index], kind: 'widget' };
      return { found: false };
    }
    function literal(value, where) {
      return scalar(value) ? value : fail('Unsupported non-scalar widget value', where);
    }
    function step(where, trail, key) {
      if (++count.resolutions > limits.maxResolutionSteps) return fail('Workflow resolution budget limit reached', where);
      if (trail.size >= limits.maxResolutionDepth) return fail('Workflow link resolution depth limit reached', where);
      if (trail.has(key)) return fail('Workflow boundary or bypass link cycle', where);
      return null;
    }
    function readInput(entry, index, trail) {
      if (entry.inputLimit) return fail('Workflow input budget limit reached', entry.id);
      const input = entry.inputs[index];
      if (!record(input) || typeof input.name !== 'string') return fail('Malformed workflow input', entry.id);
      if (input.link !== null && input.link !== undefined) return resolveLink(entry.scope, input.link, entry.node.id, index, trail);
      const name = inputName(entry, input);
      const value = widgetValue(entry, name);
      if (value.found) return literal(value.value, entry.id + '.' + name);
      return fail(value.unsupported ? 'Unsupported widget input' : 'Unconnected workflow input', entry.id + '.' + input.name);
    }
    function resolveLink(scope, linkId, targetId, targetSlot, trail) {
      const where = graphId(scope.path) + '#' + String(linkId);
      const key = 'link:' + where;
      const stopped = step(where, trail, key);
      if (stopped) return stopped;
      if (!validId(linkId)) return fail('Invalid workflow link identifier', where);
      const link = scope.links.get(String(linkId));
      if (!link) return fail('Dangling or ambiguous workflow link', where, { linkId });
      if (String(link.target_id) !== String(targetId) || link.target_slot !== targetSlot) return fail('Workflow link target mismatch', where, { linkId });
      return resolveOutput(scope, link.origin_id, link.origin_slot, new Set([...trail, key]));
    }
    function boundaryInput(scope, slot, trail) {
      const port = Array.isArray(scope.data.inputs) && scope.data.inputs[slot];
      if (!record(port) || typeof port.name !== 'string' || !scope.instance) return fail('Missing subgraph input boundary', graphId(scope.path));
      const instance = scope.instance;
      if (instance.inputLimit) return fail('Workflow input budget limit reached', instance.id);
      const exposedIndex = instance.inputNames.get(port.name);
      if (exposedIndex === null) return fail('Ambiguous subgraph input name', instance.id + '.' + port.name);
      // Names, not positions: exposed sockets omit converted widget-only inputs.
      if (exposedIndex !== undefined) {
        const input = instance.inputs[exposedIndex];
        if (input.link !== null && input.link !== undefined) return resolveLink(instance.scope, input.link, instance.node.id, exposedIndex, trail);
      }
      // Named instance values are explicitly serialized widget bindings. The inner
      // node's saved widget is not the instance's value and must not be a fallback.
      const named = record(instance.node.widgets_values_named) ? instance.node.widgets_values_named : record(instance.node.widgets_values) ? instance.node.widgets_values : null;
      if (named && own(named, port.name)) return literal(named[port.name], instance.id + '.' + port.name);
      return fail('Unresolved subgraph widget binding (named value required)', instance.id + '.' + port.name);
    }
    function resolveOutput(scope, nodeId, slot, trail) {
      const key = 'output:' + graphId(scope.path.concat(String(nodeId))) + ':' + slot;
      const stopped = step(key, trail, key);
      if (stopped) return stopped;
      const nextTrail = new Set([...trail, key]);
      if (scope.parent && record(scope.data.inputNode) && String(scope.data.inputNode.id) === String(nodeId)) return boundaryInput(scope, slot, nextTrail);
      const entry = scope.nodes.get(String(nodeId));
      if (!entry) return fail('Dangling or ambiguous workflow source node', key);
      const node = entry.node;
      if (node.mode === 2) return fail('Source node is disabled', entry.id);
      if (Array.isArray(node.outputs) && (!record(node.outputs[slot]))) return fail('Missing workflow output port', key);
      if (node.mode === 4 || node.type === 'Reroute') {
        if (entry.inputLimit) return fail('Workflow input budget limit reached', entry.id);
        const inputs = entry.inputs;
        const output = Array.isArray(node.outputs) ? node.outputs[slot] : null;
        let matches = inputs.map((input, index) => ({ input, index })).filter(item => record(item.input) && item.input.link !== null && item.input.link !== undefined && (node.type === 'Reroute' || (output && (item.input.type === output.type || item.input.type === '*' || output.type === '*'))));
        if (matches.length > 1 && output) {
          const named = matches.filter(item => item.input.name === output.name);
          if (named.length === 1) matches = named;
        }
        if (matches.length !== 1) return fail('Unresolved or ambiguous bypass routing', entry.id);
        return readInput(entry, matches[0].index, nextTrail);
      }
      if (entry.blocked) return fail(entry.blocked, entry.id);
      if (entry.child) {
        const child = entry.child;
        const output = Array.isArray(node.outputs) ? node.outputs[slot] : null;
        const declared = Array.isArray(child.data.outputs) ? child.data.outputs : [];
        let outputSlot = output ? child.outputNames.get(output.name) : undefined;
        // Fall back to an index only when the instance has no output descriptors.
        if (!output && !Array.isArray(node.outputs) && declared[slot]) outputSlot = slot;
        if (!Number.isInteger(outputSlot) || !record(child.data.outputNode)) return fail('Unresolved subgraph output boundary', key);
        const linkId = child.targetLinks.get(targetKey(child.data.outputNode.id, outputSlot));
        if (linkId === null || linkId === undefined) return fail('Dangling or ambiguous subgraph output link', key);
        return resolveLink(child, linkId, child.data.outputNode.id, outputSlot, nextTrail);
      }
      if (!own(graph, entry.id)) return fail('Workflow source excluded by resource limit', entry.id);
      return [entry.id, slot];
    }
    function fill(entry) {
      const target = graph[entry.id];
      if (!target) return;
      const sources = provenance.nodes[entry.id].inputs;
      if (entry.inputLimit) {
        target.inputs._workflow_unresolved_inputs = unresolved('Workflow input budget limit reached');
        sources._workflow_unresolved_inputs = { kind: 'unresolved' };
        return;
      }
      const schema = own(WIDGETS, entry.node.type) ? WIDGETS[entry.node.type] : [];
      const inputs = entry.inputs;
      const names = new Map();
      inputs.forEach((input, index) => {
        if (!record(input) || typeof input.name !== 'string') return;
        const name = inputName(entry, input);
        names.set(name, names.has(name) ? null : index);
      });
      for (const name of schema) {
        if (!name || names.has(name)) continue;
        const value = widgetValue(entry, name);
        if (!value.found) continue;
        target.inputs[name] = literal(value.value, entry.id + '.' + name);
        sources[name] = { kind: isUnresolved(target.inputs[name]) ? 'unresolved' : value.kind };
      }
      for (let index = 0; index < inputs.length; index++) {
        const input = inputs[index];
        if (!record(input) || typeof input.name !== 'string') { warn('Malformed workflow input (' + entry.id + ')'); continue; }
        const name = inputName(entry, input);
        const where = entry.id + '.' + name;
        if (names.get(name) === null) {
          target.inputs[name] = fail('Ambiguous duplicate input name', where);
          sources[name] = { kind: 'unresolved' };
          continue;
        }
        const linked = input.link !== null && input.link !== undefined;
        const widget = widgetValue(entry, name);
        if (!linked && !widget.found && !input.widget) continue; // Optional empty socket.
        target.inputs[name] = readInput(entry, index, new Set());
        const value = target.inputs[name];
        sources[name] = { kind: isUnresolved(value) ? 'unresolved' : linked ? (isLink(value) ? 'link' : 'boundary-widget') : widget.kind };
        if (linked) sources[name].linkId = input.link;
        if (isLink(value)) sources[name].source = value.slice();
      }
      if (!own(WIDGETS, entry.node.type) && ((Array.isArray(entry.node.widgets_values) && entry.node.widgets_values.length) || (record(entry.node.widgets_values_named) && Object.keys(entry.node.widgets_values_named).length) || (record(entry.node.widgets_values) && Object.keys(entry.node.widgets_values).length)) && !inputs.some(input => record(input) && input.widget)) {
        // Unknown unnamed widgets are retained as a fact, never as guessed inputs.
        provenance.nodes[entry.id].unresolvedWidgets = true;
        target.inputs._workflow_unresolved_widgets = unresolved('Unsupported positional widgets');
        warn('Unsupported positional widgets (' + entry.id + ', ' + entry.node.type + ')');
      }
    }
    function cutGraphCycles() {
      // Iterative DFS also bounds stack use on large but valid acyclic workflows.
      const color = new Map();
      for (const start of Object.keys(graph)) {
        if (color.has(start)) continue;
        color.set(start, 1);
        const stack = [{ id: start, edges: Object.entries(graph[start].inputs), at: 0 }];
        while (stack.length) {
          const current = stack[stack.length - 1];
          if (current.at >= current.edges.length) { color.set(current.id, 2); stack.pop(); continue; }
          const [name, value] = current.edges[current.at++];
          if (!isLink(value) || !own(graph, value[0])) continue;
          if (color.get(value[0]) === 1) {
            graph[current.id].inputs[name] = fail('Workflow dependency cycle', current.id + '.' + name);
            provenance.nodes[current.id].inputs[name] = { kind: 'unresolved', reason: 'cycle' };
          } else if (!color.has(value[0])) {
            color.set(value[0], 1);
            stack.push({ id: value[0], edges: Object.entries(graph[value[0]].inputs), at: 0 });
          }
        }
      }
    }

    if (!record(workflow) || !Array.isArray(workflow.nodes)) {
      warn('Not a ComfyUI workflow with a nodes array');
      return { graph, warnings, provenance };
    }
    buildScope(workflow, [], null, null, new Set(), new Map());
    for (const scope of scopes) for (const entry of scope.nodes.values()) if (entry) fill(entry);
    cutGraphCycles();
    return { graph, warnings, provenance };
  }

  return Object.freeze({ toGraph, isUnresolved, LIMITS });
});
