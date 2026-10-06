'use strict';
// Execute the current inline application script, never a copy of its UI functions.
// This models DOM/events/async control flow, not browser layout, image decoding or I/O speed.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sourcePath = path.join(__dirname, '../../avif_prompt_viewer.html');
const source = fs.readFileSync(sourcePath, 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
function deferred() {
  let resolve, reject;
  const promise = new Promise((r, j) => { resolve = r; reject = j; });
  return { promise, resolve, reject };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
function fresh() {
  const nodes = new Map(), windowEvents = new Map(), intervals = new Map(), timeouts = new Map();
  const stats = { urlsCreated: [], urlsRevoked: [], activeToggles: 0, reads: [], parses: [], renders: [], fetches: [] };
  let nextUrl = 0, nextTimer = 0;
  class Element {
    constructor(id = '') {
      this.id = id; this.dataset = {}; this.attrs = {}; this.listeners = new Map();
      this._html = ''; this._text = ''; this.value = ''; this.hidden = false; this.disabled = false;
      this.checked = false; this.children = []; this.buttons = []; this.parentElement = null;
      this.style = { setProperty() {} };
      const values = new Set();
      const count = v => { if (v === 'active') stats.activeToggles++; };
      this.classList = {
        add(...v) { v.forEach(x => { count(x); values.add(x); }); },
        remove(...v) { v.forEach(x => { count(x); values.delete(x); }); },
        contains: v => values.has(v),
        toggle(v, force) { count(v); if (force ?? !values.has(v)) { values.add(v); return true; } values.delete(v); return false; },
      };
    }
    addEventListener(event, fn) { if (!this.listeners.has(event)) this.listeners.set(event, []); this.listeners.get(event).push(fn); }
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'src') this.src = v; }
    getAttribute(k) { return this.attrs[k] ?? null; }
    removeAttribute(k) { delete this.attrs[k]; if (k === 'src') delete this.src; }
    set textContent(v) { this._text = String(v); this._html = ''; this.children = []; this.buttons = []; }
    get textContent() { return this._text; }
    set innerHTML(v) {
      this._html = v; this._text = ''; this.children = [];
      if (this.id === 'folderList') {
        this.buttons = [...v.matchAll(/data-folder-index="(\d+)"/g)].map(m => {
          const e = new Element(); e.dataset.folderIndex = m[1]; e.parentElement = this; e.classList.add('folder-thumb');
          const img = new Element(); img.parentElement = e; e.children.push(img); return e;
        });
        this.children = this.buttons;
      }
    }
    get innerHTML() { return this._html; }
    querySelectorAll(sel) { return this.id === 'folderList' ? this.buttons : []; }
    querySelector(sel) {
      const index = sel.match(/data-folder-index=["']?(\d+)/)?.[1];
      return this.buttons.find(b => index !== undefined ? b.dataset.folderIndex === index : b.classList.contains('active')) || null;
    }
    closest(sel) { if (sel.includes('data-folder-index') && this.dataset.folderIndex !== undefined) return this; return this.parentElement?.closest(sel) || null; }
    contains(node) { return node === this || this.children.some(child => child.contains(node)); }
    appendChild(c) { c.parentElement = this; this.children.push(c); }
    remove() {} focus() {}
    dispatch(event, props = {}) {
      const e = { target: this, preventDefault() {}, stopPropagation() {}, ...props };
      const promises = []; for (let node = this; node; node = node.parentElement) for (const fn of node.listeners.get(event) || []) promises.push(fn(e));
      return Promise.all(promises);
    }
    click() { return this.dispatch('click'); }
  }
  const get = id => { if (!nodes.has(id)) nodes.set(id, new Element(id)); return nodes.get(id); };
  get('thumbnailSize').min = '56'; get('thumbnailSize').max = '180'; get('slideshowInterval').value = '1';
  get('removeDuplicates').checked = true; get('removeUnderscores').checked = true;
  const document = { getElementById: get, querySelectorAll: () => [], body: new Element('body'), documentElement: new Element('root'), createElement: () => new Element() };
  const window = {
    addEventListener(e, fn) { if (!windowEvents.has(e)) windowEvents.set(e, []); windowEvents.get(e).push(fn); },
    setInterval(fn, ms) { const id = ++nextTimer; intervals.set(id, { fn, ms }); return id; },
    clearInterval: id => intervals.delete(id),
  };
  const fetchPending = [], storage = new Map();
  const sandbox = {
    document, window, navigator: { language: 'en' },
    localStorage: { getItem: k => storage.get(k) || null, setItem: (k, v) => storage.set(k, v) },
    TextDecoder, TextEncoder, Uint8Array, Blob, AbortController,
    URL: {
      createObjectURL(f) { const url = `blob:mock/${++nextUrl}`; stats.urlsCreated.push({ url, file: f.name }); return url; },
      revokeObjectURL: u => stats.urlsRevoked.push(u),
    },
    setTimeout(fn, ms) { const id = ++nextTimer; timeouts.set(id, { fn, ms }); return id; },
    clearTimeout: id => timeouts.delete(id),
    // Deliberately ignore abort here: even an already-resolving response must be generation guarded.
    fetch(url, options) { stats.fetches.push({ url, options }); const d = deferred(); fetchPending.push(d); return d.promise; },
    console,
  };
  const context = vm.createContext(sandbox);
  vm.runInContext(source + `\n;globalThis.api = {
    loadSingleFile, loadFolderFiles, loadFolderIndex, startSlideshow, stopSlideshow, clearAll,
    lookupCivitaiResources, openLightbox, closeLightbox, setLanguage, setTheme,
    state: () => ({ lastFile: lastFile?.name, folderIndex, loadGeneration, previewObjectUrl,
      retainedBytes: typeof lastBytes === 'undefined' ? null : lastBytes,
      cacheSize: typeof parsedFileCache === 'undefined' ? 0 : parsedFileCache.size,
      cacheLimit: typeof PARSED_FILE_CACHE_LIMIT === 'undefined' ? 0 : PARSED_FILE_CACHE_LIMIT,
      lightboxSrc: els.lightboxImage.src, previewSrc: els.preview.src }),
  };`, context, { filename: sourcePath });
  context.__stats = stats;
  vm.runInContext(`parseMetadata = (bytes, file) => {
    __stats.parses.push(file.name);
    return { positive: file.positive ?? file.name, negative: file.negative || '', settings: file.settings || '', records: [], detected: [] };
  };
  const originalRender = render;
  render = (...args) => { __stats.renders.push(args[1].name); return originalRender(...args); };`, context);
  function file(name, options = {}) {
    return { name, type: 'image/png', size: 8, ...options, arrayBuffer() {
      stats.reads.push(name); return options.pending?.promise || Promise.resolve(new Uint8Array(8).buffer);
    } };
  }
  function dropEntry(entry) {
    const event = { preventDefault() {}, stopPropagation() {}, dataTransfer: { items: [{ webkitGetAsEntry: () => entry }] } };
    return Promise.all(windowEvents.get('drop').map(fn => fn(event)));
  }
  function runTimeout(id) { const timer = timeouts.get(id); timeouts.delete(id); return timer?.fn(); }
  return { api: context.api, context, nodes, document, stats, windowEvents, intervals, timeouts, fetchPending, file, dropEntry, runTimeout, storage };
}
function response(name = 'OLD A') { return { ok: true, json: async () => ({ model: { id: 1, name }, id: 1 }) }; }
module.exports = { fresh, deferred, flush, response };
