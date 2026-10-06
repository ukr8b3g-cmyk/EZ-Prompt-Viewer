/* Offline, version-pinned Designer reconstruction. See docs/designer-compatibility.md.
 * Prompt catalogs and algorithms derived from the attributed upstream Python
 * compilers retained under tests/fixtures/designer/upstream. No Python at runtime.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DesignerAdapters = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  // BEGIN GENERATED CATALOGS
  const PART_RULES = {
  "head_hair": {
    "label": "head, hair, and headwear",
    "views": [
      "face_front",
      "face_left",
      "body_front",
      "body_left",
      "body_back"
    ],
    "scope": "Apply only to the head, hair, and headwear where visible from this panel's assigned camera angle."
  },
  "face": {
    "label": "face",
    "views": [
      "face_front",
      "face_left",
      "body_front",
      "body_left",
      "body_back"
    ],
    "scope": "Apply only to facial areas actually visible from this panel's assigned camera angle; do not turn the head or reveal the face in a rear view."
  },
  "upper_clothing": {
    "label": "upper clothing",
    "views": [
      "face_front",
      "face_left",
      "body_front",
      "body_left",
      "body_back"
    ],
    "scope": "Apply only to visible upper clothing. A back_clothing directive is more specific on the rear clothing surface."
  },
  "back_clothing": {
    "label": "rear clothing surface",
    "views": [
      "body_left",
      "body_back"
    ],
    "scope": "Apply only to the rear clothing surface: in body_left only where that rear surface is visible from the fixed left-profile camera, and in body_back. Never move this rear-surface design onto the front, side surface, or portraits; do not turn the subject to reveal it."
  },
  "lower_body": {
    "label": "lower body and lower clothing",
    "views": [
      "body_front",
      "body_left",
      "body_back"
    ],
    "scope": "Apply only to the visible lower body and lower clothing, excluding the separate footwear part."
  },
  "hands": {
    "label": "hands, gloves, and hand accessories",
    "views": [
      "body_front",
      "body_left",
      "body_back",
      "hands"
    ],
    "scope": "Apply only to hands, gloves, and hand accessories where visible from this panel's assigned camera angle."
  },
  "footwear": {
    "label": "feet and footwear",
    "views": [
      "body_front",
      "body_left",
      "body_back",
      "feet"
    ],
    "scope": "Apply only to feet and footwear wherever visible, including full-body views independently of whether a separate feet detail panel is selected."
  },
  "other": {
    "label": "other appearance details",
    "views": [
      "face_front",
      "face_left",
      "body_front",
      "body_left",
      "body_back",
      "hands",
      "feet"
    ],
    "scope": "Apply across the selected views wherever the described appearance details are anatomically visible. More specific named-part directives take precedence for their parts. Preserve the assigned views, framing, layout, single identity, and static-sheet requirements."
  }
};
  const H3_VIEWS = {
  "face_front": [
    "front portrait",
    "Show <Subject 1> directly from the front, from the face through the chest; retain the complete hairstyle and visible upper clothing."
  ],
  "face_left": [
    "anatomical left-profile portrait",
    "Show <Subject 1> in a strict left-profile portrait, camera looking directly at the subject's anatomical left side, from the complete hairstyle through the chest. Keep the face in a true side view, not a front or three-quarter portrait; retain the reference identity and visible upper clothing."
  ],
  "body_front": [
    "full-body front",
    "Show <Subject 1> directly from the front in a neutral standing pose, entirely visible from the top of the head to the soles of the footwear."
  ],
  "body_left": [
    "full-body anatomical left profile",
    "Show <Subject 1> in a strict left-profile neutral standing pose, camera looking directly at the subject's anatomical left side, entirely visible from the top of the head to the soles of the footwear."
  ],
  "body_back": [
    "full-body back",
    "Show <Subject 1> directly from behind in a neutral standing pose, entirely visible from the top of the head to the soles of the footwear."
  ],
  "hands": [
    "left and right hand details",
    "Show close details of both of <Subject 1>'s hands with their reference-consistent accessories; keep any gloves from the reference rather than replacing them with bare hands."
  ],
  "feet": [
    "dedicated feet/footwear close-up",
    "Show one dedicated close-up of both of <Subject 1>'s feet, preserving the reference's barefoot or footwear state. Use a natural three-quarter detail view and keep both complete foot or footwear silhouettes inside the panel. When footwear is visible in <Picture 1>, preserve that same footwear: its colors, materials, shape, toe areas, heels and sole edges visible from this angle, and any visible boot shafts. For closed shoes, show the outer toe boxes; do not expose bare toes through closed shoes. Keep open-toed footwear open-toed. Do not redesign footwear or invent hidden construction. If the reference is barefoot, preserve bare feet; if footwear is not visible, do not invent a specific shoe design."
  ]
};
  const QWEN_VIEWS = {
  "face_front": [
    "front portrait",
    "Front-facing head-and-shoulders bust: head and shoulders square to the camera, eyes equally visible, nose centered between the eyes. Show the complete hairstyle, head, neck, shoulders and chest only, ending at a chest-level cropped lower edge."
  ],
  "face_left": [
    "anatomical left-profile portrait",
    "Left-side head-and-shoulders bust in strict profile, with the nose pointing toward the right edge of the canvas. Show the complete hairstyle, head, neck, shoulders and chest only, ending at a chest-level cropped lower edge."
  ],
  "body_front": [
    "full-body front",
    "Full-body front view: head and torso face directly toward the camera. Stand neutrally, complete from the top of the head to the bottoms of the feet or footwear."
  ],
  "body_left": [
    "full-body anatomical left profile",
    "Full-body left-side profile: the nose, torso and toes point toward the right edge of the canvas in a true side view. Stand neutrally, complete from head to feet or footwear."
  ],
  "body_back": [
    "full-body back",
    "Full-body back view, standing neutrally, complete from head to feet or footwear. Both head and body face directly away from the camera."
  ],
  "hands": [
    "left and right hand details",
    "Hand-detail study: one isolated close-up containing the character's left hand and right hand together, cropped at the wrists. Show complete fingers, gloves and hand accessories as a pair of hands only."
  ],
  "feet": [
    "dedicated feet/footwear close-up",
    "Foot-detail study: one isolated three-quarter close-up containing the character's left foot and right foot or footwear together. Show only the complete pair of feet or footwear, including toes, heels, sole edges and any boot shafts. Preserve closed or open toe construction."
  ]
};
  const GUIDED_VIEWS = {
  "face_front": "Front bust: face directly toward the viewer, nose centered between the eyes and shoulders symmetric.",
  "face_left": "Profile bust: a strict side profile, nose pointing toward the right edge of the canvas, with only the nearer eye visible.",
  "body_front": "Full-body front: head and torso face directly toward the viewer.",
  "body_left": "Full-body profile: nose, torso and toes point toward the right edge of the canvas.",
  "body_back": "Full-body back: head and body face directly away from the viewer.",
  "hands": "Hand detail: replace both gray hands with one finished pair of the character's hands, cropped at the wrists.",
  "feet": "Foot detail: replace both gray feet with one finished pair of the character's natural feet or footwear, with completed skin or footwear materials. The gray block shapes are placeholders for finished anatomy or footwear."
};
  const REF_VIEWS = {
  "face_front": "One front-facing bust, complete hair and head through the chest. Face and chest point directly toward the camera; both eyes are visible. Crop at the chest; no waist, legs or feet in this panel.",
  "face_left": "One strict anatomical left-profile bust, complete hair and head through the chest. The nose points to the RIGHT of the sheet and only the nearer eye is visible. Crop at the chest; no waist, legs or feet in this panel.",
  "body_front": "One full-body front view, with face and torso directly toward the camera. Show the complete head and both feet or footwear in a neutral standing pose.",
  "body_left": "One full-body anatomical left-profile view. Nose, chest and toes point to the RIGHT of the sheet. Show the complete head and feet or footwear in a neutral standing pose.",
  "body_back": "One full-body direct rear view, with face and chest facing away from the camera. Show the complete head and feet or footwear in a neutral standing pose.",
  "hands": "One isolated detail of both complete hands, cropped at the wrists. Preserve the reference gloves or bare hands unless a hand directive changes them. No head, torso or full figure in this panel.",
  "feet": "One isolated detail of both complete feet or footwear, cropped above the ankles or visible boot shafts. Preserve the reference shoes or bare feet unless a footwear directive changes them. No head, torso or full figure in this panel."
};
  const OFF_VIEWS = {
  "face_front": "Show one front-facing bust of <Subject 1>, including the complete hairstyle, head, neck, shoulders and upper chest. The face and chest point directly toward the camera. The lower crop ends across the chest, above the waist.",
  "face_left": "Show one strict anatomical left-profile bust of <Subject 1>, with the camera looking directly at the subject's anatomical left side. Include the complete hairstyle, head, neck, shoulders and upper chest. Keep a true side view rather than a front or three-quarter view. The lower crop ends across the chest, above the waist.",
  "body_front": "Show one full-body front view of <Subject 1> in a neutral standing pose. Include the complete hairstyle and head through the bottoms of both feet or footwear, with clear space inside the assigned region above the head and below the soles or heels.",
  "body_left": "Show one full-body anatomical left profile of <Subject 1>, with the camera looking directly at the subject's anatomical left side, in a neutral standing pose. Include the complete hairstyle and head through the bottoms of the feet or footwear, with clear space inside the assigned region above the head and below the soles or heels.",
  "body_back": "Show one full-body direct rear view of <Subject 1> in a neutral standing pose. Include the complete hairstyle and head through the bottoms of both feet or footwear, with clear space inside the assigned region above the head and below the soles or heels.",
  "hands": "Show one separate close-up of both complete hands of <Subject 1>, cropped at the wrists. Preserve the reference's gloves, bare hands and existing accessories unless an applicable part directive changes them. Keep this detail separate from the busts and full-body figures.",
  "feet": "Show one separate close-up of both complete feet or footwear of <Subject 1> in a natural three-quarter detail view. Include toe areas, heels, sole edges and any visible boot shafts inside the assigned region. Preserve the reference's barefoot or footwear state and visible design unless an applicable part directive changes them. Show outer toe boxes for closed shoes and visible toes only for bare feet or open-toed footwear. Infer unseen surfaces conservatively without inventing a specific shoe design."
};
  const STYLE_PROMPTS = {
  "none": "",
  "anime": "Apply anime-style linework and cel shading.",
  "photo": "Apply photographic rendering with realistic surface shading.",
  "realistic_painting": "Apply realistic painted rendering.",
  "semi_realistic_anime": "Apply anime-style linework with softly modeled shading.",
  "oil_painting": "Apply oil-painted brushwork to the character rendering.",
  "watercolor": "Apply watercolor pigment shading while retaining clear character contours.",
  "gouache": "Apply opaque gouache-style color fills and brushwork.",
  "colored_pencil": "Apply colored-pencil strokes and shading.",
  "3d": "Apply three-dimensional rendered surface shading."
};
  const H3_PASSAGES = {
  "subject_definition": [
    "<Subject 1> is the person in <Picture 1>, which is the identity, appearance, clothing, accessories, and visual-style reference for every selected view.",
    "<Subject 1> is the person in <Picture 1>. Use <Picture 1> as the identity and default appearance, clothing, accessories, and visual-style reference; explicit part directives take precedence only for their applicable appearance details and selected views.",
    "<Subject 1> is the person in <Picture 1>. Use <Picture 1> for identity and default appearance, clothing and accessories; explicit part directives take precedence only for their applicable appearance details and selected views."
  ],
  "retention": [
    "<Subject 1> (appears in [Shot 1]): fully_preserved - retain the reference person's face, hair, physique, skin appearance, visual style, clothing, and accessories consistently wherever visible in the selected crops. Preserve reference gloves and footwear; do not substitute bare hands or bare feet for them. Infer any unseen surfaces conservatively, without inventing new costume elements or unsupported details.",
    "<Subject 1> (appears in [Shot 1]): selectively_modified - preserve the same person's identity throughout. Apply each explicit part directive only to its named part and eligible selected views, where anatomically visible from the assigned camera. The other directive may change appearance details across parts; more specific named-part directives take precedence, and back_clothing takes precedence over upper_clothing on the rear clothing surface. For every part or detail not explicitly changed by an applicable directive, retain the reference face, hair, physique, skin appearance, visual style, clothing, and accessories. Keep resulting colors, materials, and asymmetries consistent across views."
  ],
  "ending": [
    "Show exactly the selected views and preserve the same identity, colors, materials, and reference-consistent asymmetries throughout. Do not add unselected views or extra people. Do not add captions, labels, lettering, watermarks, panel borders, or drawn alignment lines. Keep the subject and camera still: no gestures, movement, camera motion, cuts, transitions, or temporal switching between views. The sheet is silent.",
    "Show exactly the selected views and preserve the same identity and the resulting design consistently throughout. Do not add unselected views or extra people. Do not add sheet-level captions, panel labels, watermarks, panel borders, or drawn alignment lines. Text, lettering, logos, or patterns on a subject part are allowed when explicitly requested by its applicable part directive; preserve their specified placement and do not turn them into sheet captions. Otherwise retain reference details without inventing lettering or patterns. Keep the subject and camera still: no gestures, movement, camera motion, cuts, transitions, or temporal switching between views. The sheet is silent."
  ],
  "footwear_summary": [
    " Include the dedicated feet/footwear close-up as its own visible panel, consistent with the applicable appearance directives and the other selected views."
  ]
};
  // END GENERATED CATALOGS
  const VIEW_IDS = Object.keys(H3_VIEWS);
  const PORTRAIT_IDS = ['face_front', 'face_left'];
  const BODY_IDS = ['body_front', 'body_left', 'body_back'];
  const AUXILIARY_IDS = [...PORTRAIT_IDS, 'hands', 'feet'];
  const PART_IDS = Object.keys(PART_RULES);
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const MAX_STATE_BYTES = 65536;
  const MAX_RESOLUTION = 16384;
  function fail(message, code = 'invalid_state') { const error = new Error(message); error.code = code; throw error; }
  function unicode(value) {
    for (let i = 0; i < value.length; i++) {
      const c = value.charCodeAt(i);
      if (c >= 0xd800 && c <= 0xdbff) {
        const next = value.charCodeAt(++i);
        if (!(next >= 0xdc00 && next <= 0xdfff)) fail('Unpaired Unicode surrogate.', 'invalid_utf8');
      } else if (c >= 0xdc00 && c <= 0xdfff) fail('Unpaired Unicode surrogate.', 'invalid_utf8');
    }
  }
  // JSON.parse alone accepts duplicate keys and forgets integer-vs-decimal tokens.
  // This bounded strict parser preserves the upstream rejection of both cases.
  function strictJSON(text) {
    if (typeof text !== 'string') fail('state_json must be a JSON string.', 'invalid_type');
    if (text.length > MAX_STATE_BYTES) fail('Designer state exceeds 64 KiB.', 'state_too_large');
    unicode(text);
    if (new TextEncoder().encode(text).length > MAX_STATE_BYTES) fail('Designer state exceeds 64 KiB.', 'state_too_large');
    let offset = 0;
    const decimalPaths = new Set();
    const white = () => { while (/[\t\n\r ]/.test(text[offset] || '\0')) offset++; };
    function string() {
      const start = offset++;
      let escaped = false;
      while (offset < text.length) {
        const c = text[offset++];
        if (!escaped && c === '"') {
          let result;
          try { result = JSON.parse(text.slice(start, offset)); } catch (_) { fail('Invalid JSON string.', 'invalid_json'); }
          unicode(result); return result;
        }
        if (!escaped && c === '\\') escaped = true; else escaped = false;
      }
      fail('Unterminated JSON string.', 'invalid_json');
    }
    function value(path, depth) {
      if (depth > 32) fail('Designer state is nested too deeply.', 'invalid_json');
      white();
      const c = text[offset];
      if (c === '"') return string();
      if (c === '{') {
        offset++; white(); const object = Object.create(null);
        if (text[offset] === '}') { offset++; return object; }
        while (true) {
          white(); if (text[offset] !== '"') fail('Expected JSON key.', 'invalid_json');
          const key = string(); if (own(object, key)) fail('Duplicate JSON key: ' + key, 'duplicate_key');
          white(); if (text[offset++] !== ':') fail('Expected JSON colon.', 'invalid_json');
          object[key] = value(path + '/' + key, depth + 1); white();
          const separator = text[offset++]; if (separator === '}') return object;
          if (separator !== ',') fail('Expected JSON separator.', 'invalid_json');
        }
      }
      if (c === '[') {
        offset++; white(); const array = [];
        if (text[offset] === ']') { offset++; return array; }
        while (true) {
          array.push(value(path + '/' + array.length, depth + 1)); white();
          const separator = text[offset++]; if (separator === ']') return array;
          if (separator !== ',') fail('Expected JSON separator.', 'invalid_json');
        }
      }
      for (const [token, result] of [['true', true], ['false', false], ['null', null]]) {
        if (text.startsWith(token, offset)) { offset += token.length; return result; }
      }
      const match = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(text.slice(offset));
      if (!match) fail('Invalid JSON value.', 'invalid_json');
      offset += match[0].length;
      if (/[.eE]/.test(match[0])) decimalPaths.add(path);
      const number = Number(match[0]); if (!Number.isFinite(number)) fail('Non-finite number.', 'non_finite');
      return number;
    }
    const result = value('', 0); white();
    if (offset !== text.length) fail('Trailing JSON data.', 'invalid_json');
    return { result, decimalPaths };
  }
  function exactKeys(value, keys, field) {
    if (!isObject(value)) fail(field + ' must be an object.', 'invalid_type');
    if (keys.some(key => !own(value, key))) fail(field + ' is missing a required key.', 'missing_key');
    if (Object.keys(value).some(key => !keys.includes(key))) fail(field + ' contains unknown keys.', 'unknown_key');
  }
  function sizeValue(value, field) {
    if (!Number.isSafeInteger(value)) fail(field + ' must be an integer.', 'invalid_integer');
    if (value < 32 || value % 32) fail(field + ' must be a positive multiple of 32.', 'invalid_size');
    if (value > MAX_RESOLUTION) fail(field + ' exceeds the pinned standalone size limit.', 'size_limit');
    return value;
  }
  function parseState(text) {
    const { result: raw, decimalPaths } = strictJSON(text);
    if (!isObject(raw)) fail('Designer state must be an object.', 'invalid_type');
    if (!own(raw, 'schema_version')) fail('Missing schema_version.', 'missing_key');
    if (![1, 2].includes(raw.schema_version) || decimalPaths.has('/schema_version')) fail('Unsupported Designer schema version; expected integer 1 or 2.', 'unsupported_schema');
    exactKeys(raw, ['schema_version', 'views', 'size', ...(raw.schema_version === 2 ? ['part_prompts'] : [])], 'state');
    if (!Array.isArray(raw.views) || raw.views.some(view => typeof view !== 'string')) fail('views must be an array of strings.', 'invalid_type');
    if (!raw.views.length) fail('Select at least one view.', 'empty_views');
    if (raw.views.some(view => !VIEW_IDS.includes(view))) fail('Unknown Designer view.', 'unknown_view');
    exactKeys(raw.size, ['mode', 'body_height', 'manual_width', 'manual_height'], 'size');
    if (!['auto', 'manual'].includes(raw.size.mode)) fail('Unknown size mode.', 'invalid_mode');
    const size = { mode: raw.size.mode };
    for (const key of ['body_height', 'manual_width', 'manual_height']) {
      if (decimalPaths.has('/size/' + key)) fail('Size must use an integer JSON token.', 'invalid_integer');
      size[key] = sizeValue(raw.size[key], 'size.' + key);
    }
    const state = { schema_version: raw.schema_version, views: VIEW_IDS.filter(view => raw.views.includes(view)), size };
    if (raw.schema_version === 2) {
      if (!isObject(raw.part_prompts)) fail('part_prompts must be an object.', 'invalid_type');
      if (Object.keys(raw.part_prompts).some(key => !PART_IDS.includes(key))) fail('Unknown part directive.', 'unknown_part');
      state.part_prompts = {};
      for (const part of PART_IDS) {
        if (!own(raw.part_prompts, part)) continue;
        const text = raw.part_prompts[part];
        if (typeof text !== 'string') fail('Part directive must be a string.', 'invalid_type');
        if (text.length > 1000) fail('Part directive exceeds 1,000 UTF-16 units.', 'part_prompt_too_long');
        if (text.trim()) state.part_prompts[part] = text;
      }
    }
    return state;
  }
  function activeParts(state, view) {
    const selected = view === undefined ? state.views : [view];
    return Object.fromEntries(PART_IDS.filter(part => own(state.part_prompts || {}, part) && selected.some(id => PART_RULES[part].views.includes(id))).map(part => [part, state.part_prompts[part]]));
  }
  const modified = (parts, part) => own(parts, part) || own(parts, 'other');
  const asciiJSON = value => JSON.stringify(value).replace(/[\u007f-\uffff]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));

  // Exact rational arithmetic prevents a floating-point half-boundary from
  // changing any normalized coordinate or 32-pixel auto-size decision.
  function fraction(n, d = 1n) {
    n = BigInt(n); d = BigInt(d); if (d < 0n) { n = -n; d = -d; }
    let a = n < 0n ? -n : n, b = d;
    while (b) { const r = a % b; a = b; b = r; }
    return [n / a, d / a];
  }
  const add = (a, b) => fraction(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const sub = (a, b) => fraction(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
  const mul = (a, b) => fraction(a[0] * b[0], a[1] * b[1]);
  const div = (a, b) => fraction(a[0] * b[1], a[1] * b[0]);
  const times = (a, n, d = 1) => mul(a, fraction(n, d));
  const ceil32 = a => Number((a[0] + 32n * a[1] - 1n) / (32n * a[1]) * 32n);
  const roundCoordinate = a => Number((2n * a[0] * 1000000n + a[1]) / (2n * a[1])) / 1000000;
  function geometry(state) {
    const h = fraction(state.size.body_height), margin = times(h, 1, 14), gap = times(h, 1, 25), bodyWidth = times(h, 2, 5), auxWidth = times(h, 1, 2);
    const aux = AUXILIARY_IDS.filter(id => state.views.includes(id)), portraits = PORTRAIT_IDS.filter(id => state.views.includes(id)), details = ['hands', 'feet'].filter(id => state.views.includes(id)), bodies = BODY_IDS.filter(id => state.views.includes(id));
    const auxColumns = portraits.length || Number(!!details.length), columns = bodies.length + auxColumns;
    const idealWidth = add(add(times(bodyWidth, bodies.length), times(auxWidth, auxColumns)), add(times(gap, columns - 1), times(margin, 2)));
    const idealHeight = add(h, times(margin, 2)), rectangles = {};
    let x = margin, y = margin;
    if (aux.length) {
      const groupWidth = add(times(auxWidth, auxColumns), times(gap, auxColumns - 1));
      if (portraits.length) {
        const portraitHeight = details.length ? times(h, 31, 50) : h;
        portraits.forEach((id, i) => { rectangles[id] = [add(x, times(add(auxWidth, gap), i)), y, auxWidth, portraitHeight]; });
        const detailY = add(add(y, portraitHeight), gap), detailHeight = sub(sub(h, portraitHeight), gap);
        const detailWidth = details.length === 2 ? times(sub(groupWidth, gap), 1, 2) : groupWidth;
        details.forEach((id, i) => { rectangles[id] = [add(x, times(add(detailWidth, gap), i)), detailY, detailWidth, detailHeight]; });
      } else if (aux.length === 2) {
        const detailHeight = times(sub(h, gap), 1, 2);
        aux.forEach((id, i) => { rectangles[id] = [x, add(y, times(add(detailHeight, gap), i)), auxWidth, detailHeight]; });
      } else rectangles[aux[0]] = [x, y, auxWidth, h];
      x = add(x, add(groupWidth, gap));
    }
    for (const id of bodies) { rectangles[id] = [x, y, bodyWidth, h]; x = add(x, add(bodyWidth, gap)); }
    const width = state.size.mode === 'auto' ? ceil32(idealWidth) : state.size.manual_width;
    const height = state.size.mode === 'auto' ? ceil32(idealHeight) : state.size.manual_height;
    sizeValue(width, 'output width'); sizeValue(height, 'output height');
    const sx = div(fraction(width), idealWidth), sy = div(fraction(height), idealHeight);
    const scale = state.size.mode === 'auto' ? fraction(1) : (sx[0] * sy[1] < sy[0] * sx[1] ? sx : sy);
    const ox = times(sub(fraction(width), mul(idealWidth, scale)), 1, 2), oy = times(sub(fraction(height), mul(idealHeight, scale)), 1, 2);
    const panels = state.views.map(id => {
      const [left, top, pw, ph] = rectangles[id];
      return { id, rect: [div(add(mul(left, scale), ox), fraction(width)), div(add(mul(top, scale), oy), fraction(height)), div(mul(pw, scale), fraction(width)), div(mul(ph, scale), fraction(height))].map(roundCoordinate) };
    });
    return { canvas: [width, height], panels, feet_y: bodies.length ? roundCoordinate(div(add(mul(add(margin, h), scale), oy), fraction(height))) : null };
  }
  function h3PanelContent(state, view) {
    let content = H3_VIEWS[view][1];
    const parts = activeParts(state, view);
    if (!Object.keys(parts).length) return content;
    if (view === 'face_front') content = "Show <Subject 1> directly from the front, from the complete head through the chest. Keep the head-through-chest crop and the same person's identity.";
    else if (view === 'face_left') content = "Show <Subject 1> in a strict left-profile portrait, camera looking directly at the subject's anatomical left side, from the complete head through the chest. Keep the face in a true side view, not a front or three-quarter portrait, and retain the same person's identity.";
    else if (BODY_IDS.includes(view) && modified(parts, 'footwear')) content = content.replace('soles of the footwear', 'bottoms of the feet or footwear');
    else if (view === 'hands') content = "Show close details of both of <Subject 1>'s hands, with gloves, bare hands, and hand accessories as specified by the applicable part directives. Keep both complete hands inside the panel.";
    else if (view === 'feet') content = "Show one dedicated close-up of both of <Subject 1>'s feet or footwear as specified by the applicable part directives. Use a natural three-quarter detail view and keep both complete foot or footwear silhouettes inside the panel, including toe areas, heels, sole edges, and any boot shafts visible from this angle. For the resulting design, show the outer toe boxes of closed shoes; do not expose bare toes through closed shoes. Keep open-toed footwear open-toed.";
    const lines = [content, 'Preserve reference appearance for every part and detail not changed by an applicable explicit directive.'];
    for (const [part, text] of Object.entries(parts)) {
      const rule = PART_RULES[part];
      lines.push(`Part directive ${part} (${rule.label}): ${rule.scope} Explicit appearance instruction (verbatim):\n${text}`);
    }
    return lines.join('\n');
  }
  const coordinateText = value => value.toFixed(6);
  function layoutJSON(layout) {
    const panels = layout.panels.map(panel => '{"id":' + asciiJSON(panel.id) + ',"rect":[' + panel.rect.map(coordinateText).join(',') + '],"view":' + asciiJSON(panel.view) + ',"content":' + asciiJSON(panel.content) + '}');
    return '{"canvas":[' + layout.canvas.join(',') + '],"panels":[' + panels.join(',') + '],"feet_y":' + (layout.feet_y === null ? 'null' : coordinateText(layout.feet_y)) + '}';
  }
  function h3LayoutProse(state, layout) {
    const views = state.views, aux = AUXILIARY_IDS.filter(view => views.includes(view)), portraits = PORTRAIT_IDS.filter(view => views.includes(view)), details = ['hands', 'feet'].filter(view => views.includes(view)), bodies = BODY_IDS.filter(view => views.includes(view));
    const lines = [];
    if (aux.length) {
      lines.push('Place the selected portrait and/or detail views in the leftmost auxiliary ' + (portraits.length === 2 ? 'columns.' : 'column.'));
      if (portraits.length === 2) lines.push('Place the front portrait on the left and the anatomical left-profile portrait beside it on the right, at the same scale and with matching top and bottom limits.');
      if (portraits.length && details.length) {
        const label = portraits.length === 2 ? 'portraits' : H3_VIEWS[portraits[0]][0];
        lines.push(`Place the ${label} above the detail band, with clear empty space between them.`);
        if (aux.includes('hands') && aux.includes('feet')) lines.push('In that lower detail band, place the hands on the left and the feet/footwear on the right, separated by empty space.');
      } else if (!portraits.length && details.length === 2) lines.push('Stack the hand details above the feet/footwear details, with clear empty space between them.');
      else if (aux.length === 1) lines.push('The single selected auxiliary view uses the full height of its column.');
    }
    if (bodies.length) {
      const ordered = bodies.map(view => H3_VIEWS[view][0]).join(', then ');
      lines.push(`Arrange the full-body columns from left to right as ${ordered}` + (aux.length ? ', to the right of the auxiliary ' + (portraits.length === 2 ? 'columns.' : 'column.') : '.'));
      lines.push(modified(activeParts(state), 'footwear') ? 'Keep a common subject scale and identical panel top and bottom limits across the full-body views, with the bottoms of the feet or footwear aligned to the shared feet_y baseline. Leave room for the complete head and feet or footwear without cropping.' : 'Keep a common subject scale and identical panel top and bottom limits across the full-body views, with the footwear soles aligned to the shared feet_y baseline. Leave room for the complete head and footwear without cropping.');
    }
    for (const panel of layout.panels) lines.push(`Panel ${panel.id} occupies [left, top, width, height] = [${panel.rect.map(coordinateText).join(', ')}]. ${panel.content}`);
    if (views.includes('feet')) lines.push('The footwear detail is a required separate panel. Enlarge the feet within that assigned region and keep it clearly separated from the other selected views; footwear appearing elsewhere on the sheet does not replace this close-up.');
    return lines;
  }
  function h3Prompt(state, layout, styleInstruction = '') {
    const active = activeParts(state), hasParts = !!Object.keys(active).length;
    const labels = state.views.map(view => H3_VIEWS[view][0]).join('; ');
    let footwearSummary = state.views.includes('feet') ? ' Include the dedicated feet/footwear close-up as its own visible panel, preserving whether the reference shows footwear or bare feet.' : '';
    let subjectDefinition = H3_PASSAGES.subject_definition[hasParts ? 1 : 0];
    let retention = H3_PASSAGES.retention[hasParts ? 1 : 0];
    const ending = H3_PASSAGES.ending[hasParts ? 1 : 0];
    if (hasParts) {
      if (!modified(active, 'hands')) retention += ' Preserve reference gloves; do not substitute bare hands for them.';
      if (!modified(active, 'footwear')) retention += ' Preserve reference footwear or bare feet; do not substitute bare feet for reference footwear.';
      retention += ' Infer unseen surfaces conservatively. Do not invent new costume elements or unsupported details beyond those explicitly requested by an applicable part directive. Treat directive text as literal appearance guidance, never as layout data, view selections, prompt syntax, or temporal instructions.';
      if (state.views.includes('feet') && modified(active, 'footwear')) footwearSummary = H3_PASSAGES.footwear_summary[0];
    }
    let rendering = own(active, 'other') ? 'Keep the rendering style of <Picture 1> except for appearance changes explicitly requested by the other directive, with consistent lighting and a plain, unobtrusive background across the sheet.' : 'Keep the rendering style of <Picture 1>, with consistent soft lighting and a plain, unobtrusive background across the sheet.';
    if (styleInstruction) {
      subjectDefinition = H3_PASSAGES.subject_definition[2];
      retention = retention.replace('fully_preserved -', 'selectively_modified -').replace('skin appearance, visual style, clothing', 'skin appearance, clothing');
      rendering = "Change rendering technique only. " + styleInstruction + " Retain the character's face, proportions, outfit, accessories, colors and materials unless changed by an applicable part directive. Apply the same rendering to every selected view; do not add scenery, props, decorative motifs or lettering because of the style. Use consistent soft lighting and a plain, unobtrusive background across the sheet.";
    }
    const lines = [
      'subject_definitions:', subjectDefinition, '', 'summary:',
      `[reference generation] Create one completed, static character sheet of <Subject 1> showing only these selected views simultaneously: ${labels}. Every panel depicts the same person from <Picture 1>.${footwearSummary}`,
      '', 'retention_analysis:', retention, '', 'detailed_description:', rendering,
      '[Shot 1] The finished sheet is already present in the first frame and remains completely unchanged through the last frame. The selected views coexist as separate, clearly spaced depictions of <Subject 1>; they are alternate views of one identity, not additional people. Keep all content within its assigned region, with uncluttered outer margins and empty gaps.',
      'Layout specification (semantic guidance, not visible text): ' + layoutJSON(layout),
      'Read rect coordinates as normalized [left, top, width, height], measured from the upper-left corner of the canvas. The canvas dimensions are in pixels. Use the specified placement and proportions without drawing the layout data into the image.',
      ...h3LayoutProse(state, layout), ending, '', 'overall_soundscape:',
      'None. No speech, vocalization, ambience, or sound effects.', '', 'non_diegetic_music:', 'None.'
    ];
    return lines.join('\n') + '\n';
  }
function qwenLayoutProse(state, layout) {
  const views = state.views;
  const portraits = PORTRAIT_IDS.filter(view => views.includes(view));
  const details = ["hands", "feet"].filter(view => views.includes(view));
  const bodies = BODY_IDS.filter(view => views.includes(view));
  const aux = portraits.length > 0 || details.length > 0;
  const lines = [];
  if (aux) {
    const studies = portraits.length && details.length ? "bust and detail" : portraits.length ? "bust" : "detail";
    lines.push(`Place the selected ${studies} studies in the leftmost region.`);
    if (portraits.length === 2) {
      lines.push("Place one front-facing bust on the left and one right-facing profile bust beside it, with equally enlarged heads and chest-level cropped lower edges.");
    }
    if (portraits.length && details.length) {
      const busts = portraits.length === 1 ? "bust" : "busts";
      const crops = details.length === 1 ? "detail study" : "detail studies";
      const below = portraits.length === 1 ? "it" : "them";
      lines.push(`Place the ${busts} in the upper portion and the isolated ${crops} below ${below}, separated by clear white space.`);
      if (details.length === 2) {
        lines.push("In that lower band, place the hand details on the left and the feet/footwear details on the right.");
      }
    } else if (!portraits.length && details.length === 2) {
      lines.push("Stack the hand details above the feet/footwear details, separated by clear empty space.");
    }
  }
  if (bodies.length) {
    const directions = { body_front: "front-facing", body_left: "right-facing side", body_back: "rear-facing" };
    const labels = bodies.map(view => directions[view]).join(", then ");
    const placement = bodies.length === 1 ? `Place the single ${labels} full-body figure` : `Arrange the full-body columns from left to right as ${labels}`;
    lines.push(placement + (aux ? ", to the right of the auxiliary region." : "."));
    if (bodies.length > 1) {
      lines.push("Keep the full-body views at the same scale, with matching head heights and the bottoms of the feet or footwear aligned.");
    }
  }
  return lines;
}

function qwenPrompt(state, layout, useLayoutImage = false, style = "none") {
  const active = activeParts(state);
  const activeEntries = Object.entries(active);
  const views = state.views;
  const portraits = PORTRAIT_IDS.filter(view => views.includes(view));
  const bodies = BODY_IDS.filter(view => views.includes(view));
  const details = ["hands", "feet"].filter(view => views.includes(view));
  let lines;
  if (useLayoutImage) {
    lines = [
      "Edit <image1> in place: replace every gray study with a finished rendering of the character from <image2>, one rendering for each existing framed panel.",
      "Preserve all black rectangular frames exactly as drawn, in their original positions and sizes, as solid black lines in the finished sheet.",
      "Keep the white canvas and each mannequin's location, visible size, viewing direction and crop fixed.",
      "Use <image1> only for arrangement, occupied size, pose and crop; use <image2> for identity, hairstyle, clothing, visible accessories, colors" + (style === "none" ? " and rendering medium" : "") + ". Replace every gray surface with finished skin, hair, clothing or footwear."
    ];
  } else {
    lines = [
      "Create a character design reference sheet from the character in the provided reference image.",
      "Preserve the character's identity, outfit, accessories" + (style === "none" ? " and rendering medium" : "") + " while redrawing the selected camera views and isolated anatomical detail crops."
    ];
  }
  if (style !== "none") {
    const reference = useLayoutImage ? "<image2>" : "the provided character reference image";
    lines.push(
      "Change only the character's rendering style, consistently across every selected panel. " + STYLE_PROMPTS[style],
      `Preserve the character's identity, facial and body proportions, expression, hairstyle, outfit design, existing accessories, colors and patterns from ${reference}, except for explicit part directives below. Keep each panel's specified contents, viewing direction, pose and crop. Use the reference only for the character and retain the sheet's plain white background.`
    );
  }
  const groups = [];
  if (portraits.length) {
    groups.push(`${portraits.length} enlarged head-and-shoulders bust ` + (portraits.length === 1 ? "study" : "studies"));
  }
  if (bodies.length) {
    groups.push(`${bodies.length} complete standing full-body ` + (bodies.length === 1 ? "figure" : "figures"));
  }
  if (details.length) {
    groups.push(`${details.length} isolated anatomical detail ` + (details.length === 1 ? "study" : "studies"));
  }
  const action = useLayoutImage ? "Fill" : "Compose";
  const panels = useLayoutImage ? "existing black-framed panels" : "distinct, unlabelled view panels";
  lines.push(`${action} exactly ${views.length} ${panels}: ` + groups.join("; ") + ".");
  if (useLayoutImage) {
    if (portraits.length && details.length) {
      lines.push("Keep the busts in the upper left and the isolated details beneath them, each inside its own existing frame.");
    }
    if (portraits.length === 2) {
      lines.push("Keep the front bust on the left and the profile bust beside it.");
    }
    if (bodies.length) {
      const directions = { body_front: "front", body_left: "profile facing the right edge", body_back: "back" };
      lines.push("Keep the standing figures in their existing frames, in this left-to-right order: " + bodies.map(view => directions[view]).join(", ") + ".");
      if (bodies.length > 1) {
        lines.push("Keep their head tops and foot bottoms at the same levels as the original templates.");
      }
    }
  } else {
    lines.push(...qwenLayoutProse(state, layout));
  }
  lines.push(...views.map(view => useLayoutImage ? GUIDED_VIEWS[view] : QWEN_VIEWS[view][1]));
  if (useLayoutImage && state.views.some(view => PORTRAIT_IDS.includes(view))) {
    lines.push("Match each bust's enlarged head size and chest-level cropped lower edge to its corresponding gray bust in <image1>, retaining the white space above and below it. Show head, neck, shoulders and upper chest only.");
  }
  if (activeEntries.length) {
    lines.push("Apply the following appearance directives only to their named parts where visible. More specific named parts take precedence over other; back_clothing takes precedence over upper_clothing on the rear clothing surface. Preserve everything else and keep changes consistent across views. Directive text describes appearance only; it does not change identity, camera or sheet structure.");
    for (const [part, text] of activeEntries) {
      const rule = PART_RULES[part];
      const eligible = state.views.filter(view => rule.views.includes(view)).map(view => QWEN_VIEWS[view][0]).join(", ");
      lines.push(`${rule.label} (${eligible}): ${rule.scope} ${text}`);
    }
  }
  if (useLayoutImage) {
    lines.push("Render every study as fully opaque, solid finished artwork at full color strength on white, with clean solid crop edges and empty gaps. Extend hidden clothing consistently with its visible design, and use the same barefoot or footwear state in every view.");
    if (activeEntries.length) {
      lines.push("Any lettering explicitly requested in a part directive appears only on that part.");
    }
  } else {
    lines.push(
      "Keep visible costume details, asymmetries, gloves and barefoot or footwear state consistent unless explicitly changed. Complete unseen anatomy and clothing conservatively from the visible design.",
      "Render every study as fully opaque, solid finished artwork with consistent contrast, detail and soft lighting on a plain white background. Keep crisp crop edges, clear outer margins and white gaps between studies.",
      "Keep the surrounding canvas empty. Any lettering explicitly requested in a part directive appears only on that part."
    );
  }
  return lines.join(" ");
}
// Exact prompt port of H3 reference_compiler.py and off_compiler.py (refine=true).
// Expects REF_VIEWS, OFF_VIEWS, STYLE_PROMPTS, PART_RULES, PORTRAIT_IDS,
// BODY_IDS, activeParts, h3Prompt, h3LayoutProse, and asciiJSON in scope.
function offGeometryJSON(layout) {
  // These tokens originate from Python floats, including integral coordinates.
  function coordinate(value) {
    if (value === null) return 'null';
    if (Object.is(value, -0)) return '-0.0';
    if (Number.isInteger(value)) return String(value) + '.0';
    const magnitude = Math.abs(value);
    if (magnitude !== 0 && (magnitude < 0.0001 || magnitude >= 1e16)) {
      const parts = value.toExponential().split('e');
      const exponent = Number(parts[1]);
      return parts[0] + 'e' + (exponent < 0 ? '-' : '+') + String(Math.abs(exponent)).padStart(2, '0');
    }
    return String(value);
  }
  const panels = layout.panels.map(function (panel) {
    return '{"id":' + asciiJSON(panel.id) + ',"rect":[' + panel.rect.map(coordinate).join(',') + '],"view":' + asciiJSON(panel.view) + '}';
  });
  return '{"canvas":' + asciiJSON(layout.canvas) + ',"panels":[' + panels.join(',') + '],"feet_y":' + coordinate(layout.feet_y) + '}';
}

function h3OffPrompt(state, layout, styleInstruction = '') {
  const scaffoldLayout = Object.assign({}, layout, {
    panels: layout.panels.map(function (panel) { return Object.assign({}, panel, { content: '' }); })
  });
  const scaffold = h3Prompt(state, scaffoldLayout, styleInstruction);
  const descriptionMarker = 'detailed_description:\n';
  const descriptionAt = scaffold.indexOf(descriptionMarker);
  let header = scaffold.slice(0, descriptionAt);
  const description = scaffold.slice(descriptionAt + descriptionMarker.length);
  const soundMarker = '\noverall_soundscape:\n';
  const soundAt = description.lastIndexOf(soundMarker);
  const visuals = description.slice(0, soundAt);
  const sound = description.slice(soundAt + soundMarker.length);
  const layoutMarker = '\nLayout specification (semantic guidance, not visible text):';
  const layoutAt = visuals.indexOf(layoutMarker);
  let opening = layoutAt < 0 ? visuals : visuals.slice(0, layoutAt);
  const ending = visuals.trimEnd().split(/\r\n|[\n\r\v\f\x1c-\x1e\x85\u2028\u2029]/).pop();
  const active = activeParts(state);
  const views = state.views;
  function replaceAll(text, search, replacement) { return text.split(search).join(replacement); }
  header = replaceAll(header, 'selectively_modified -', 'partially_preserved -');
  if (!Object.prototype.hasOwnProperty.call(active, 'hands') && !Object.prototype.hasOwnProperty.call(active, 'other')) {
    header = replaceAll(header,
      'Preserve reference gloves; do not substitute bare hands for them.',
      "Preserve the reference's gloved or bare-hand state consistently across views.");
  }
  if (!Object.prototype.hasOwnProperty.call(active, 'footwear') && !Object.prototype.hasOwnProperty.call(active, 'other')) {
    header = replaceAll(header,
      'Preserve reference gloves and footwear; do not substitute bare hands or bare feet for them.',
      "Preserve the reference's gloved or bare-hand state and barefoot or footwear state consistently across views.");
    header = replaceAll(header,
      'Preserve reference footwear or bare feet; do not substitute bare feet for reference footwear.',
      "Preserve the reference's barefoot or footwear state consistently across views.");
  }
  const counts = [];
  for (const pair of [[PORTRAIT_IDS, 'bust portraits'], [BODY_IDS, 'full-body views'], [['hands', 'feet'], 'isolated detail views']]) {
    const count = views.filter(function (view) { return pair[0].includes(view); }).length;
    if (count) counts.push(count + ' ' + pair[1]);
  }
  opening += '\nShow exactly ' + views.length + ' selected depictions: ' + counts.join(', ') + '. Each selected view appears once.';
  const lines = [header + 'detailed_description:', opening,
    'Layout specification (semantic guidance, not visible text): ' + offGeometryJSON(layout),
    'Read rect coordinates as normalized [left, top, width, height], measured from the upper-left corner of the canvas. The canvas dimensions are in pixels. Use the specified placement and proportions without drawing the layout data into the image.'
  ];
  for (let line of h3LayoutProse(state, scaffoldLayout)) {
    if (line.startsWith('Panel ')) continue;
    if (line.startsWith('Keep a common subject scale')) {
      if (views.filter(function (view) { return BODY_IDS.includes(view); }).length < 2) continue;
      line = 'Keep a common subject scale and matching head heights across the full-body views. Align the bottoms of the feet or footwear to the shared feet_y baseline, retaining clear empty space beneath every sole and heel.';
    }
    lines.push(line);
  }
  for (const panel of layout.panels) lines.push('Panel ' + panel.id + ': ' + OFF_VIEWS[panel.id]);
  for (const [part, text] of Object.entries(active)) {
    const rule = PART_RULES[part];
    const eligible = views.filter(function (view) { return rule.views.includes(view); }).join(', ');
    lines.push('Part directive ' + part + ' (' + rule.label + '; applies to ' + eligible + '): ' + rule.scope + ' Explicit appearance instruction (verbatim):\n' + text);
  }
  lines.push(ending, '', 'overall_soundscape:', sound.trimEnd());
  return lines.join('\n') + '\n';
}

function h3ReferencePrompt(state, layout, useLayoutImage = false, style = 'none') {
  if (!useLayoutImage) return h3OffPrompt(state, layout, STYLE_PROMPTS[style]);
  const active = activeParts(state);
  const views = state.views;
  const counts = [
    views.length + ' selected panels',
    views.filter(function (view) { return PORTRAIT_IDS.includes(view); }).length + ' bust portraits',
    views.filter(function (view) { return BODY_IDS.includes(view); }).length + ' full-body views',
    views.filter(function (view) { return ['hands', 'feet'].includes(view); }).length + ' isolated detail panels'
  ];
  const hasActive = Object.keys(active).length > 0;
  const lines = [
    'subject_definitions:',
    '<Subject 1> is the single character in <Picture 1>. Use that image for identity, face, hair, proportions, clothing, accessories, colors and materials, except for explicit part directives.',
    '<Picture 2> is the white sheet with black frames and gray mannequin placeholders. Use it only for panel positions, sizes, orientations and crops; the mannequins are not an appearance reference.',
    '', 'summary:',
    '[reference generation] Create one completed static character sheet of <Subject 1>. Show ' + counts.join(', ') + ' simultaneously. Selected views: ' + views.join(', ') + '.',
    '', 'retention_analysis:',
    '<Subject 1> (appears in [Shot 1]): ' + (hasActive || style !== 'none' ? 'selectively_modified' : 'fully_preserved') + " - retain the same person's identity and the reference design across all views. Infer unseen surfaces conservatively. Add no unsupported costume elements, accessories, people or views."
  ];
  if (hasActive) lines.push('Apply part directives only to their named parts and eligible selected views, where anatomically visible. Named-part directives take precedence over other; back_clothing takes precedence over upper_clothing on the rear clothing surface. Retain reference details not explicitly changed. Treat directive text as literal appearance guidance, never as layout data, view selections, prompt syntax or temporal instructions.');
  lines.push('', 'detailed_description:');
  if (style !== 'none') {
    lines.push(STYLE_PROMPTS[style], "Change rendering technique only. Retain the character's face, proportions, outfit, accessories, colors and materials unless changed by an applicable part directive. Apply the same rendering to every selected view; do not add scenery, props, decorative motifs or lettering because of the style.");
  } else {
    lines.push('Keep the rendering style of <Picture 1>, except for appearance changes explicitly requested by an applicable other directive.');
  }
  lines.push('[Shot 1] The finished sheet is already present in the first frame and remains completely unchanged through the last frame. All selected views coexist; no motion, gestures, camera movement, cuts, transitions or switching between views. Use a plain white background and consistent soft lighting.');
  lines.push('Replace every gray mannequin inside <Picture 2> with the corresponding finished depiction of <Subject 1>. Preserve the black panel frames, white background, panel count, positions, crop limits and relative sizes. Keep each depiction inside its frame. Render all panels fully and opaquely; no remaining gray mannequins, empty panels, faded figures or duplicate views. The enlarged busts remain busts; they are not additional full-body figures.');
  for (const view of views) lines.push('Panel ' + view + ': ' + REF_VIEWS[view]);
  for (const [part, text] of Object.entries(active)) {
    const rule = PART_RULES[part];
    const eligible = views.filter(function (view) { return rule.views.includes(view); }).join(', ');
    lines.push('Part directive ' + part + ' (' + rule.label + '; applies to ' + eligible + '): ' + rule.scope + ' Explicit appearance instruction (verbatim):\n' + text);
  }
  lines.push('Do not add sheet captions, panel labels or watermarks. Preserve existing subject lettering; additional subject lettering or patterns are allowed only when explicitly requested by an applicable part directive.');
  lines.push('', 'overall_soundscape:', 'None. No speech, vocalization, ambience or sound effects.', '', 'non_diegetic_music:', 'None.');
  return lines.join('\n') + '\n';
}

  const COMPILERS = Object.freeze({
    H3CharacterSheetDesigner: { family: 'h3', repository: 'ukr8b3g-cmyk/H3-Character-Sheet-Designer', commit: '652abf0cd185026e986e649086b6189953e8952a', path: 'h3_character_sheet/compiler.py', outputs: ['prompt', 'width', 'height'] },
    H3CharacterSheetDesignerReference: { family: 'reference', repository: 'ukr8b3g-cmyk/H3-Character-Sheet-Designer', commit: '652abf0cd185026e986e649086b6189953e8952a', path: 'h3_character_sheet/reference_compiler.py', outputs: ['prompt', 'width', 'height', 'layout_image'] },
    QwenImage21CharacterSheetDesigner: { family: 'qwen', repository: 'ukr8b3g-cmyk/Qwen-Image-2.1-Character-Sheet-Designer', commit: '277da76a9de9f4b31b8d23d92b2db3694c581bd7', path: 'qwen_image21_character_sheet/compiler.py', outputs: ['prompt', 'width', 'height', 'layout_image'] }
  });
  function parameters(node, spec) {
    const keys = ['state_json', ...(spec.family === 'h3' ? [] : ['use_layout_image', 'style'])];
    const inputs = isObject(node.inputs) ? node.inputs : null;
    const named = isObject(node.widgets_values_named) ? node.widgets_values_named : null;
    const widgets = Array.isArray(node.widgets_values) ? node.widgets_values : null;
    const result = {};
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (inputs && own(inputs, key)) result[key] = inputs[key];
      else {
        const descriptor = Array.isArray(node.inputs) && node.inputs.find(input => input && input.name === key);
        if (descriptor && descriptor.link !== null && descriptor.link !== undefined) fail('Linked Designer input ' + key + ' must be resolved by the active graph first.', 'linked_input');
        if (named && own(named, key)) {
          if (widgets && i < widgets.length && named[key] !== widgets[i]) fail('Conflicting named and positional Designer widget values.', 'conflicting_state');
          result[key] = named[key];
        } else if (widgets && i < widgets.length) result[key] = widgets[i];
      }
    }
    if (!own(result, 'state_json')) fail('Designer state_json is absent; a preview widget cannot replace it.', 'missing_state');
    if (Array.isArray(result.state_json)) fail('Linked Designer state_json is unresolved.', 'linked_input');
    if (spec.family !== 'h3') {
      if (!own(result, 'use_layout_image')) result.use_layout_image = false;
      if (!own(result, 'style')) result.style = 'none';
      if (typeof result.use_layout_image !== 'boolean') fail('use_layout_image must be a resolved boolean.', 'invalid_type');
      if (typeof result.style !== 'string' || !own(STYLE_PROMPTS, result.style)) fail('Unknown or unresolved Designer style.', 'unknown_style');
    }
    return result;
  }
  function resolve(node, outputSlot = 0) {
    const warnings = [];
    let spec, nodeType;
    try {
      if (!isObject(node)) fail('Expected a Designer node.', 'unsupported_node');
      nodeType = node.class_type || node.type;
      if (!own(COMPILERS, nodeType)) fail('Unrecognized Designer node type.', 'unsupported_node');
      spec = COMPILERS[nodeType];
      if (node.class_type && node.type && node.class_type !== node.type) fail('Conflicting Designer type identifiers.', 'conflicting_type');
      if (!Number.isInteger(outputSlot) || outputSlot < 0 || outputSlot >= spec.outputs.length) fail('Unsupported Designer output slot.', 'unsupported_output');
      if (outputSlot === 3) fail('layout_image is an IMAGE output, not prompt text.', 'non_text_output');
      if (Array.isArray(node.outputs) && (node.outputs.length !== spec.outputs.length || node.outputs.some((output, index) => output && output.name && output.name !== spec.outputs[index]))) fail('Designer output signature differs from the pinned compiler.', 'unsupported_signature');
      const input = parameters(node, spec);
      const state = parseState(input.state_json), layout = geometry(state);
      layout.panels = layout.panels.map(panel => ({ ...panel, view: H3_VIEWS[panel.id][0], content: h3PanelContent(state, panel.id) }));
      let value;
      if (outputSlot === 1 || outputSlot === 2) value = layout.canvas[outputSlot - 1];
      else if (spec.family === 'h3') value = h3Prompt(state, layout);
      else if (spec.family === 'reference') value = h3ReferencePrompt(state, layout, input.use_layout_image, input.style);
      else value = qwenPrompt(state, layout, input.use_layout_image, input.style);
      const declaredVersion = node.properties && node.properties.ver;
      warnings.push('Reconstructed from saved Designer state with a pinned compiler; this is not a saved execution-output snapshot.');
      if (declaredVersion && declaredVersion !== spec.commit) warnings.push('Workflow declares Designer version ' + String(declaredVersion) + '; reconstruction uses ' + spec.commit + '.');
      const provenance = {
        kind: 'reconstructed', nodeType, nodeId: node.id === undefined ? null : node.id,
        outputSlot, outputName: spec.outputs[outputSlot], compilerRepository: spec.repository,
        compilerVersion: spec.commit, compilerSource: 'https://github.com/' + spec.repository + '/blob/' + spec.commit + '/' + spec.path,
        declaredVersion: declaredVersion || null, schemaVersion: state.schema_version,
        state_json: asciiJSON(state), exactSnapshot: false, runtimeLimitVerified: false,
        standaloneMaxResolution: MAX_RESOLUTION
      };
      return { resolved: true, text: String(value), value, provenance, warnings };
    } catch (error) {
      return { resolved: false, text: '', provenance: null, warnings: [error.message || 'Designer reconstruction failed.'], code: error.code || 'reconstruction_error' };
    }
  }
  const supports = node => isObject(node) && own(COMPILERS, node.class_type || node.type);
  return Object.freeze({ resolve, supports, supportedTypes: Object.freeze(Object.keys(COMPILERS)) });
});
