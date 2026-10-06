# ComfyUI workflow adapter

`workflow_adapter.js` is a pure, local workflow-to-API-graph conversion layer. It
exports `WorkflowAdapter` in a browser and the same object through CommonJS.
It has no dependencies, executes no ComfyUI/custom-node code, does not compile
Designer prompts, and does not mutate the supplied workflow.

```js
const { graph, warnings, provenance } = WorkflowAdapter.toGraph(workflow);
```

The caller should run its typed prompt/conditioning resolver against `graph`,
starting from supported sampling roots. Converting a workflow is not proof that
it was the workflow actually executed when the image was generated. An embedded
API prompt, when available, remains the preferable execution record. Do not scan
all graph strings for prompt-like text.

## Result contract

- `graph`: a null-prototype map of API-style `{class_type, inputs}` nodes
- Active links: `[namespacedNodeId, outputSlot]`
- Scalar widgets: strings, finite numbers, or booleans with an explicit supported
  node/widget binding
- Unresolved values: `{_workflow_unresolved: true, reason, ...}` objects; callers
  must not stringify these as prompt text or replace them with saved widget text
- `warnings`: bounded, human-readable strings describing unresolved or invalid
  data
- `provenance.nodes[id]`: original node ID, original type, instance path, and
  per-input origin (`widget`, `named-widget`, `link`, `boundary-widget`, or
  `unresolved`), with original link ID and final source where applicable

IDs use `wf:` followed by URI-escaped original node IDs, joined by `/` for
subgraph instance nesting. For example, root node 23 is `wf:23`; inner node 5 in
instance 18 is `wf:18/5`. A root node literally named `18/5` is `wf:18%2F5`.
Lone UTF-16 surrogates have a separate `%uXXXX` escape; no string IDs collide
with their literal percent-escaped forms. Object maps are prototype-neutral.

`isUnresolved(value)` and frozen `LIMITS` are also exported. Tests may reduce
limits with the optional second argument to `toGraph`; callers cannot raise
hard limits.

## Authoritative inputs

1. A non-null/non-undefined `inputs[slot].link` is authoritative. Zero is a valid
   link ID. A dangling link, wrong target, disabled source, invalid output slot,
   cycle, or resource-limit failure remains unresolved. It never revives the
   linked widget's old value.
2. Supported nodes use `widgets_values_named`, then object-form `widgets_values`,
   then an explicit node-specific positional widget layout. Explicit `widget.name`
   aliases bind supported widget fields. No labels, prose, JSON contents, or
   apparent prompt length are used to infer input names.
3. Unknown widgets remain unresolved. Unknown nodes can preserve linked inputs,
   but their behavior must be handled by a separate typed resolver. This adapter
   cannot choose an unknown node's active branch or reconstruct its output.
4. Empty non-widget sockets remain absent. Notes do not contribute prompt fields.
5. Node mode 2 (never/disabled) contributes no executable node. Mode 4 (bypass)
   contributes no saved widgets and can only route a uniquely matching connected
   input by output type/name. Ambiguity is unresolved. Reroutes are resolved by
   their unique connected input.

The explicit widget table covers the three H3/Qwen Designer types, the native
H3/Qwen text/conditioning encoders, CLIP text encoders (including SDXL and Flux),
common primitive nodes, sampling/guidance/scheduler nodes, loaders, common
conditioning operations, image input/output nodes, and recognized notes. Adding
another node requires verifying its widget layout and adding regression tests;
this is intentionally not a generic all-widget extractor.

## Subgraphs

The adapter instantiates definitions from `definitions.subgraphs`, including
nested local definitions and repeated instances. It accepts six-element legacy
link arrays and serialized link objects with `id`, `origin_id`, `origin_slot`,
`target_id`, `target_slot`, and `type`.

- Definition `inputNode.id` and `outputNode.id` identify boundary nodes
- Definition input slots match an instance's exposed inputs by **name**, not
  index: an instance may omit widget-only sockets or expose a different order
- Boundary links recursively resolve into the parent scope; definition outputs
  resolve to their unique internal producer, preserving its output slot
- Named instance widgets are the source of unlinked boundary literals; an inner
  node's saved widget value is not a substitute for an instance value
- Opaque positional-only subgraph instance widgets are explicitly unresolved
  when no named binding is serialized; their order is not guessed
- Unused definitions are not executed; recursive definitions, duplicate IDs,
  ambiguous ports/links, and dependency cycles are diagnosed

This supports the official native ComfyUI subgraph format. Arbitrary custom
node group formats, runtime expansion, unknown switch behavior, and custom node
code execution are outside its contract.

## Genuine workflow regressions

The fixtures were copied byte-for-byte from the official repository workflow
files used in this investigation, not reduced or repaired to make tests pass:

| Fixture | Source |
| --- | --- |
| `H3_Character_Sheet_Designer_wf.json` | `ukr8b3g-cmyk/H3-Character-Sheet-Designer`, `workflows/H3_Character_Sheet_Designer_wf.json` |
| `QwenImage21_Character_Sheet_Designer_wf.json` | `ukr8b3g-cmyk/Qwen-Image-2.1-Character-Sheet-Designer`, `workflows/QwenImage21_Character_Sheet_Designer_wf.json` |

Snapshot SHA-256:

- H3: `d723af0d4d692eb654e10db84892a32493a688df253a99da94751bcc8e5b915d`
- Qwen: `0698670f1dd68639fdbf88c64e031208c54b1c299ab8eb80129732e132e95d71`

The H3 fixture deliberately contains obsolete **three-view** prompt text in both
instance 18 and encoder node 5. The authoritative Designer node 23 instead has
five selected views. The adapter must produce:

```text
wf:18/5.prompt       -> wf:23 output 0
wf:18/7.conditioning -> wf:18/5 output 0
wf:18/10.guider      -> wf:18/7 output 0
```

No three-view text from either stale widget may appear in the adapted graph.
The Qwen fixture preserves Designer node 15, encoder 485, its separate positive
and negative output slots, KSampler 482, and instance-level sampling values.
Both genuine fixtures currently adapt without warnings. Designer state is
retained only as the typed `state_json` input, for the dedicated compiler.

## Safety bounds and validation

Hard limits: 10,000 expanded nodes, 50,000 links, 16 subgraph levels, 100,000 link
resolution steps, 128 link-resolution depth, 1,000 definitions, 100,000 input
slots/boundary output ports, and 250 detailed warnings plus a truncation notice.
Exhausting the input budget suppresses a whole node's widget interpretation so
that a linked field beyond the budget cannot accidentally reveal its stale
positional value. Dependency-cycle checking is iterative; boundary lookup is
indexed instead of rescanning every link.

Run focused checks with:

```sh
node --check workflow_adapter.js
node --test tests/workflow-adapter.test.cjs
```

Tests cover untouched official workflows, nested and repeated instances,
reordered boundary ports, linked-widget precedence and aliases, missing links,
unknown widgets, inactive/bypassed nodes, ordinary and boundary cycles, recursive
definitions, resource limits, unusual IDs, malformed data, immutability, and the
browser global export. They do not claim that arbitrary ComfyUI custom nodes can
be executed or reproduced offline.
