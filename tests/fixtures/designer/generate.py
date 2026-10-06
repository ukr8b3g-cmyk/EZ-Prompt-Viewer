#!/usr/bin/env python3
"""Regenerate catalogs/golden cases from the pinned offline Python sources.

No network, ComfyUI, model execution or dependencies beyond Python stdlib.
See docs/designer-compatibility.md before changing the pin or snapshots.
"""
from pathlib import Path
import ast
import hashlib
import importlib
import json
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
UPSTREAM = HERE / 'upstream'
sys.dont_write_bytecode = True
sys.path[:0] = [str(UPSTREAM / name) for name in ('H3-Character-Sheet-Designer', 'Qwen-Image-2.1-Character-Sheet-Designer')]
h3 = importlib.import_module('h3_character_sheet.compiler')
ref = importlib.import_module('h3_character_sheet.reference_compiler')
off = importlib.import_module('h3_character_sheet.off_compiler')
qwen = importlib.import_module('qwen_image21_character_sheet.compiler')


def catalogs():
    data = {'PART_RULES': h3.PART_RULES, 'H3_VIEWS': h3.VIEW_DETAILS,
            'QWEN_VIEWS': qwen.VIEW_DETAILS, 'GUIDED_VIEWS': qwen.GUIDED_VIEW_DETAILS,
            'REF_VIEWS': ref.VIEW_INSTRUCTIONS, 'OFF_VIEWS': off.OFF_VIEW_DETAILS,
            'STYLE_PROMPTS': ref.STYLE_PROMPTS}
    assert ref.STYLE_PROMPTS == qwen.STYLE_PROMPTS
    assert h3.PART_RULES == qwen.PART_RULES
    # Long invariant scaffold passages are copied verbatim, never reworded.
    tree = ast.parse(Path(h3.__file__).read_text())
    function = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'compile_prompt')
    passages = {}
    for n in ast.walk(function):
        if isinstance(n, ast.Assign) and len(n.targets) == 1 and isinstance(n.targets[0], ast.Name) and isinstance(n.value, ast.Constant) and isinstance(n.value.value, str):
            passages.setdefault(n.targets[0].id, []).append(n.value.value)
    data['H3_PASSAGES'] = passages
    return '\n'.join('  const ' + name + ' = ' + json.dumps(value, ensure_ascii=True, indent=2) + ';' for name, value in data.items())


def state(views, version=1, mode='auto', parts=None, body_height=1120, width=2240, height=1280):
    value = {'schema_version': version, 'views': list(views), 'size': {'mode': mode, 'body_height': body_height, 'manual_width': width, 'manual_height': height}}
    if version == 2:
        value['part_prompts'] = {} if parts is None else parts
    return value


def fixture(name, kind, state_value, use_layout_image=False, style='none', node=None):
    raw = json.dumps(state_value, ensure_ascii=True, separators=(',', ':'))
    if kind == 'h3':
        result = h3.compile_state(raw)
    elif kind == 'reference':
        result = ref.compile_reference_state(raw, use_layout_image=use_layout_image, style=style)
    else:
        result = qwen.compile_state(raw, use_layout_image=use_layout_image, style=style)
    type_name = {'h3': 'H3CharacterSheetDesigner', 'reference': 'H3CharacterSheetDesignerReference', 'qwen': 'QwenImage21CharacterSheetDesigner'}[kind]
    node = node or {'class_type': type_name, 'inputs': {'state_json': raw, **({} if kind == 'h3' else {'use_layout_image': use_layout_image, 'style': style})}}
    return {'name': name, 'kind': kind, 'node': node, 'expected': {key: result[key] for key in ('prompt', 'width', 'height', 'state_json')}}


def cases(exhaustive=False):
    result = []
    for repo, filename, kind in [('H3-Character-Sheet-Designer', 'H3_Character_Sheet_Designer_wf.json', 'reference'), ('Qwen-Image-2.1-Character-Sheet-Designer', 'QwenImage21_Character_Sheet_Designer_wf.json', 'qwen')]:
        workflow = json.loads((UPSTREAM / repo / 'workflows' / filename).read_text())
        node = next(node for node in workflow['nodes'] if 'Designer' in node['type'])
        widgets = node['widgets_values']
        result.append(fixture('official-' + kind, kind, json.loads(widgets[0]), widgets[1], widgets[2], node))
    parts = {part: '  Test ' + part + ' 日本語 café 😀\n"literal" <tag> \\ end  ' for part in h3.PART_IDS}
    selections = [h3.PRESETS['five'], h3.PRESETS['detail'], ('hands', 'feet'), ('face_left', 'feet'), ('body_front',), ('face_front', 'face_left')]
    for i, views in enumerate(selections):
        for kind in ('h3', 'reference', 'qwen'):
            result.append(fixture(f'{kind}-selection-{i}', kind, state(views, 2 if i % 2 else 1, 'manual' if i % 3 == 1 else 'auto', parts), bool(i % 2), 'watercolor' if i % 2 else 'none'))
    for kind in ('h3', 'reference', 'qwen'):
        result.append(fixture(kind + '-all-parts', kind, state(h3.VIEW_IDS, 2, parts=parts), kind != 'h3', 'anime' if kind != 'h3' else 'none'))
        result.append(fixture(kind + '-off-parts', kind, state(h3.PRESETS['five'], 2, parts=parts), False, 'oil_painting' if kind != 'h3' else 'none'))
        result.append(fixture(kind + '-normalization', kind, state(['feet', 'body_back', 'feet', 'face_front'], 2, parts={'face': '\ufeff \t', 'footwear': '靴'})))
    if exhaustive:
        for bits in range(1, 128):
            views = [view for index, view in enumerate(h3.VIEW_IDS) if bits & (1 << index)]
            for mode in ('auto', 'manual'):
                for kind in ('h3', 'reference', 'qwen'):
                    for use_layout in ((False,) if kind == 'h3' else (False, True)):
                        result.append(fixture(f'exhaustive-{bits}-{mode}-{kind}-{use_layout}', kind, state(views, 2, mode, parts, body_height=32 * (bits % 20 + 1), width=32 * (bits % 9 + 1), height=32 * (bits % 11 + 1)), use_layout, 'photo' if kind != 'h3' else 'none'))
        for style in ref.STYLE_PROMPTS:
            for kind in ('reference', 'qwen'):
                for use_layout in (False, True):
                    result.append(fixture(f'style-{kind}-{style}-{use_layout}', kind, state(h3.VIEW_IDS, 2, parts=parts), use_layout, style))
    return result


if __name__ == '__main__':
    if '--exhaustive' in sys.argv:
        print(json.dumps(cases(True), ensure_ascii=True, separators=(',', ':')))
    else:
        js = ROOT / 'designer_adapters.js'
        content = js.read_text()
        start, rest = content.split('  // BEGIN GENERATED CATALOGS\n', 1)
        _, end = rest.split('  // END GENERATED CATALOGS', 1)
        js.write_text(start + '  // BEGIN GENERATED CATALOGS\n' + catalogs() + '\n  // END GENERATED CATALOGS' + end)
        (HERE / 'golden.json').write_text(json.dumps(cases(), ensure_ascii=True, indent=2) + '\n')
        manifest = {'verified_utc': '2026-10-06', 'repositories': {
            'H3-Character-Sheet-Designer': '652abf0cd185026e986e649086b6189953e8952a',
            'Qwen-Image-2.1-Character-Sheet-Designer': '277da76a9de9f4b31b8d23d92b2db3694c581bd7'},
            'files': {str(p.relative_to(UPSTREAM)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(UPSTREAM.rglob('*')) if p.is_file()}}
        (HERE / 'sources.json').write_text(json.dumps(manifest, indent=2) + '\n')
