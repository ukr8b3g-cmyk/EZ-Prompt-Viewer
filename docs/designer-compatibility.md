# Designer reconstruction compatibility

`designer_adapters.js` is a dependency-free browser/Node adapter for the three exact node types below. It reconstructs text from the serialized `state_json` and resolved options, using a port of pinned upstream Python compilers. It does **not** claim to recover the exact text executed by an unknown installed version, infer text from image pixels, or use stale prompt-preview widgets.

## Pinned sources and output contracts

Sources and commit existence were read from GitHub on 2026-10-06. Every retained file is byte-for-byte verified against its GitHub blob ID in `tests/fixtures/designer/upstream-blobs.json`; `sources.json` also records SHA-256 hashes.

| Exact class/type | Pinned source | Output slots |
| --- | --- | --- |
| `H3CharacterSheetDesigner` | [H3 `652abf0`](https://github.com/ukr8b3g-cmyk/H3-Character-Sheet-Designer/blob/652abf0cd185026e986e649086b6189953e8952a/h3_character_sheet/node.py) | 0 prompt, 1 width, 2 height |
| `H3CharacterSheetDesignerReference` | [H3 Reference `652abf0`](https://github.com/ukr8b3g-cmyk/H3-Character-Sheet-Designer/blob/652abf0cd185026e986e649086b6189953e8952a/h3_character_sheet/reference_node.py) | 0 prompt, 1 width, 2 height, 3 layout_image |
| `QwenImage21CharacterSheetDesigner` | [Qwen `277da76`](https://github.com/ukr8b3g-cmyk/Qwen-Image-2.1-Character-Sheet-Designer/blob/277da76a9de9f4b31b8d23d92b2db3694c581bd7/qwen_image21_character_sheet/node.py) | 0 prompt, 1 width, 2 height, 3 layout_image |

None of these nodes exposes a negative-prompt output. A Qwen workflow's negative conditioning belongs to its separate active graph path; slot 1 is the numeric width, never a negative prompt. Slot 3 is an image and deliberately remains unresolved by this text/scalar adapter. The adapter does not render layout images or require ComfyUI, Python, numpy, torch, a GPU, or a network connection at runtime.

The catalogs, text, and layout algorithms are derived from the corresponding upstream authors' implementations. Their original Python files are retained unmodified for attribution and differential verification. No repository-root `LICENSE` was present at either pinned revision when checked; this documentation does not assign an upstream license or change upstream rights.

## Integration

The same module exports `globalThis.DesignerAdapters` in a browser and `module.exports` in Node.

```js
if (DesignerAdapters.supports(node)) {
  return DesignerAdapters.resolve(node, outputSlot);
}
```

A supported node with invalid state must remain unresolved. Do not then scan arbitrary widgets or unrelated branches looking for text. Unknown ordinary nodes can be handled by the caller's other adapters.

A successful result contains:

- `resolved: true`, `text`, and `value` (string for slot 0; number for slots 1/2)
- `provenance.kind: "reconstructed"` and `exactSnapshot: false`
- Exact node type/ID when available, output slot/name, compiler repository/version/source URL
- `provenance.state_json`, the canonical semantic state serialized with the pinned Python compiler's ordering and ASCII escaping
- Metadata-declared version, when available, and a warning if it differs from the reconstruction pin
- A standing reconstruction warning, including when metadata declares the same version. Matching version metadata alone does not prove what executed

Failures contain `resolved: false`, empty `text`, null provenance, a stable diagnostic `code`, and human-readable `warnings`. Unknown types also return this shape; use `supports` to avoid intercepting ordinary nodes.

## State and options

Supported: schemas 1 and 2; every nonempty subset of the seven defined views; auto and manual canvas geometry; all eight part-directive keys; all ten Reference/Qwen styles; layout-reference ON and OFF. Missing optional Reference/Qwen options use their pinned upstream defaults (`false`, `none`). Old H3 has no style/layout-reference option. Free-form directives are literal text and are never evaluated.

Input priority:

1. A provided API `inputs.state_json` or option value is authoritative, including invalid values; never fall back to widgets when it fails
2. GUI `widgets_values_named` provides known fields, but conflicting positional values are rejected as ambiguous
3. Positional GUI widgets use only the exact class's registered order: state_json, then optional use_layout_image and style

Linked API inputs or linked GUI widget inputs must be resolved through the active graph by the caller before reconstruction. GUI display titles, similar node names, preview prompt strings, and arbitrary text elsewhere in the workflow cannot authorize compilation. Unknown output signatures, future schemas, unknown keys/views/parts/styles, invalid integer sizes, duplicate JSON keys, non-finite numbers, unpaired Unicode surrogates, and excessive state/part text are rejected.

The state budget is 64 KiB of UTF-8; each part directive is at most 1,000 UTF-16 code units, matching upstream. The bounded parser additionally caps nesting at 32, well above the valid schema's nesting depth. Size reconstruction uses the pinned standalone maximum of 16,384. ComfyUI's runtime `MAX_RESOLUTION` is not known from saved metadata: `runtimeLimitVerified` remains false. Larger states require a separately verified compatibility update rather than silently accepting a different environment limit.

Geometry uses reduced BigInt rational arithmetic, exact round-half-up to six decimals, and exact 32-pixel ceiling. H3 legacy's fixed coordinate tokens and H3 Reference OFF's Python float JSON formatting are intentionally distinct. Unicode, part ordering, source text, spacing, and final newlines are preserved. The `state_json` output is semantic state, not the compiled prompt.

## Reproducible verification

Run the normal dependency-free Node suite:

```sh
node --test tests/designer-adapters.test.cjs
```

It tests 29 checked-in Python golden cases plus browser export, exact node/slot recognition, immutable inputs, malformed/future states, option validation, source hashes, and provenance. Official H3/Qwen workflow Designer nodes are included. The H3 regression explicitly rejects the old three-view widget text while reconstructing the active five-view state.

Run the broader offline differential test with Python 3:

```sh
DESIGNER_EXHAUSTIVE=1 node --test tests/designer-adapters.test.cjs
```

This compiles 1,339 state/option combinations with the retained authoritative Python sources and compares all 4,017 prompt/width/height outputs, plus canonical state JSON, against JavaScript. Coverage includes all 127 nonempty view subsets, auto/manual sizing, varied dimensions, Unicode/newlines/quotes in directives, style variants, and both layout-reference modes. This is compiler parity verification; it is not a ComfyUI frontend, Electron packaging, or image-generation test.

Regenerate reviewed catalogs and compact goldens offline:

```sh
python3 tests/fixtures/designer/generate.py
```

This updates only the generated-catalog block in the adapter and fixture outputs; handwritten validation, geometry, and prompt-port code remain intact. Do not accept regenerated differences without review. When supporting a new upstream version, fetch and verify the new source commit/file blobs, inspect schema and output contract changes, update the port and declared pins together, regenerate fixtures, run both suites, and review prompt diffs. Do not silently replace the current pin just because a newer upstream commit exists.
