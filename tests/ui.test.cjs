'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { fresh, deferred, flush, response } = require('./helpers/ui-harness.cjs');

for (const next of ['Clear', 'new file']) {
  test(`UI: pending Civitai lookup cannot overwrite ${next}`, async () => {
    const h = fresh();
    await h.api.loadSingleFile(h.file('A.png', { settings: 'Model hash: aaaaaaaa' }));
    const job = h.api.lookupCivitaiResources();
    if (next === 'Clear') h.api.clearAll();
    else await h.api.loadSingleFile(h.file('B.png', { settings: 'Model hash: bbbbbbbb' }));
    assert.equal(h.nodes.get('civitaiLookup').disabled, false, 'new selection must release lookup controls');
    assert.equal(h.stats.fetches[0].options?.signal?.aborted, true, 'obsolete network requests must be aborted');
    h.fetchPending[0].resolve(response()); await job;
    assert.doesNotMatch(h.nodes.get('civitaiResources').innerHTML, /OLD A|aaaaaaaa/);
    if (next === 'new file') assert.match(h.nodes.get('civitaiResources').innerHTML, /bbbbbbbb/);
  });
}

test('UI: old Civitai completion timer cannot relabel a new lookup', async () => {
  const h = fresh(); await h.api.loadSingleFile(h.file('A.png', { settings: 'Model hash: aaaaaaaa' }));
  const first = h.api.lookupCivitaiResources(); h.fetchPending[0].resolve(response()); await first;
  const oldReset = [...h.timeouts.values()].find(t => t.ms === 1200)?.fn;
  assert.ok(oldReset); const second = h.api.lookupCivitaiResources();
  const running = h.nodes.get('civitaiLookup').textContent; oldReset();
  assert.equal(h.nodes.get('civitaiLookup').textContent, running);
  h.fetchPending[1].resolve(response('NEW')); await second;
  assert.equal(h.nodes.get('civitaiLookup').disabled, false);
});

test('UI: Civitai network failure recovers controls', async () => {
  const h = fresh(); await h.api.loadSingleFile(h.file('A.png', { settings: 'Model hash: aaaaaaaa' }));
  const job = h.api.lookupCivitaiResources(); h.fetchPending[0].reject(new Error('offline')); await job;
  assert.equal(h.nodes.get('civitaiLookup').disabled, false);
  assert.match(h.nodes.get('civitaiResources').innerHTML, /failed/i);
});

test('UI: Civitai timeout recovers a hanging request', async () => {
  const h = fresh(); await h.api.loadSingleFile(h.file('A.png', { settings: 'Model hash: aaaaaaaa' }));
  const job = h.api.lookupCivitaiResources();
  const deadline = [...h.timeouts].find(([, t]) => t.ms >= 5000 && t.ms <= 60000);
  assert.ok(deadline, 'lookup requires a finite request deadline');
  h.runTimeout(deadline[0]); await job;
  assert.equal(h.nodes.get('civitaiLookup').disabled, false);
  assert.equal(h.stats.fetches[0].options.signal.aborted, true);
  assert.match(h.nodes.get('civitaiResources').innerHTML, /failed/i);
});

for (const next of ['Clear', 'new file', 'new drop', 'new folder']) {
  test(`UI: delayed drop cannot supersede ${next}`, async () => {
    const h = fresh(); let deliver;
    const oldDrop = h.dropEntry({ isFile: true, file: ok => { deliver = ok; } });
    if (next === 'Clear') h.api.clearAll();
    if (next === 'new file') await h.api.loadSingleFile(h.file('NEW.png'));
    if (next === 'new drop') await h.dropEntry({ isFile: true, file: ok => ok(h.file('NEW.png')) });
    if (next === 'new folder') { h.api.loadFolderFiles([h.file('NEW.png')]); await h.api.loadFolderIndex(0); await flush(); }
    deliver(h.file('OLD-DROP.png')); await oldDrop;
    assert.equal(h.api.state().lastFile, next === 'Clear' ? undefined : 'NEW.png');
    assert.ok(!h.stats.reads.includes('OLD-DROP.png'));
  });
}

test('UI: stale directory traversal stops before reading more entries', async () => {
  const h = fresh(); let deliver; let batches = 0;
  const job = h.dropEntry({ isDirectory: true, createReader: () => ({ readEntries: ok => { batches++; if (batches === 1) deliver = ok; else ok([]); } }) });
  h.api.clearAll(); deliver([{ isFile: true, file: ok => ok(h.file('OLD.png')) }]);
  await job; assert.equal(batches, 1); assert.deepEqual(h.stats.reads, []);
});

test('UI: manual text survives localization, including intentionally empty fields', async () => {
  const h = fresh(); await h.api.loadSingleFile(h.file('ORIGINAL.png'));
  await h.nodes.get('editText').click();
  h.nodes.get('positiveText').textContent = 'MY POSITIVE';
  h.nodes.get('negativeText').textContent = '';
  h.nodes.get('settingsText').textContent = 'MY SETTINGS';
  h.api.setLanguage('ja'); h.api.setLanguage('de');
  assert.equal(h.nodes.get('positiveText').textContent, 'MY POSITIVE');
  assert.equal(h.nodes.get('negativeText').textContent, '');
  assert.equal(h.nodes.get('settingsText').textContent, 'MY SETTINGS');
  assert.equal(h.nodes.get('positiveText').getAttribute('contenteditable'), 'true');
});

test('UI: Format and option toggles use current manual text without changing settings', async () => {
  const h = fresh(); await h.api.loadSingleFile(h.file('ORIGINAL.png'));
  await h.nodes.get('editText').click();
  h.nodes.get('positiveText').textContent = 'my_new, my_new, manual_edit';
  h.nodes.get('negativeText').textContent = 'bad_hand,bad_hand';
  h.nodes.get('settingsText').textContent = 'MY SETTINGS';
  await h.nodes.get('formatPrompt').click();
  assert.equal(h.nodes.get('positiveText').textContent, 'my new, manual edit');
  assert.equal(h.nodes.get('negativeText').textContent, 'bad hand');
  h.nodes.get('positiveText').textContent = 'latest_edit, latest_edit';
  await h.nodes.get('removeDuplicates').dispatch('change');
  assert.equal(h.nodes.get('positiveText').textContent, 'latest edit');
  assert.equal(h.nodes.get('settingsText').textContent, 'MY SETTINGS');
});

test('UI: slow slideshow is single-flight and commits frames before advancing', async () => {
  const h = fresh(); const a = deferred(), b = deferred();
  h.api.loadFolderFiles([h.file('A.png', { pending: a }), h.file('B.png', { pending: b })]);
  const initial = h.api.loadFolderIndex(0);
  assert.equal(typeof initial?.then, 'function', 'folder load returns its promise');
  h.api.startSlideshow(); const tick = [...h.intervals.values()][0].fn;
  for (let i = 0; i < 4; i++) tick();
  assert.deepEqual(h.stats.reads, ['A.png']);
  assert.equal(h.api.state().folderIndex, -1, 'navigation describes the committed frame');
  a.resolve(new Uint8Array(8).buffer); await initial;
  assert.deepEqual(h.stats.renders, ['A.png']); assert.equal(h.api.state().folderIndex, 0);
  tick(); tick(); assert.deepEqual(h.stats.reads, ['A.png', 'B.png']);
  assert.equal(h.api.state().folderIndex, 0);
  b.resolve(new Uint8Array(8).buffer); await flush();
  assert.deepEqual(h.stats.renders, ['A.png', 'B.png']); assert.equal(h.api.state().folderIndex, 1);
  h.api.stopSlideshow(); assert.equal(h.intervals.size, 0);
});

test('UI: manual folder selection can supersede a slow slideshow load', async () => {
  const h = fresh(); const slow = deferred();
  h.api.loadFolderFiles([h.file('A.png'), h.file('B.png', { pending: slow }), h.file('C.png')]);
  await h.api.loadFolderIndex(0); await flush(); h.api.startSlideshow();
  [...h.intervals.values()][0].fn();
  await h.api.loadFolderIndex(2); await flush(); slow.resolve(new Uint8Array(8).buffer); await flush();
  assert.equal(h.api.state().lastFile, 'C.png'); assert.equal(h.api.state().folderIndex, 2);
});

test('UI: open lightbox follows the selected preview and Close releases its source', async () => {
  const h = fresh(); await h.api.loadSingleFile(h.file('A.png')); h.api.openLightbox();
  await h.api.loadSingleFile(h.file('B.png'));
  assert.equal(h.nodes.get('lightbox').classList.contains('open'), true);
  assert.equal(h.api.state().lightboxSrc, h.api.state().previewSrc);
  h.api.closeLightbox(); assert.ok(!h.api.state().lightboxSrc);
  assert.equal(h.nodes.get('lightbox').getAttribute('aria-hidden'), 'true');
});

test('UI: Clear closes the lightbox and releases preview and folder URLs exactly once', async () => {
  const h = fresh(); h.api.loadFolderFiles([h.file('A.png'), h.file('B.png')]);
  await h.api.loadFolderIndex(0); await flush(); h.api.openLightbox(); h.api.clearAll(); h.api.clearAll();
  assert.equal(h.nodes.get('lightbox').classList.contains('open'), false);
  assert.ok(!h.api.state().lightboxSrc);
  assert.equal(new Set(h.stats.urlsRevoked).size, h.stats.urlsCreated.length);
  assert.equal(h.stats.urlsRevoked.length, h.stats.urlsCreated.length);
});

test('UI control: late file read cannot replace a newer selected file', async () => {
  const h = fresh(); const a = deferred(), b = deferred();
  const pA = h.api.loadSingleFile(h.file('A.png', { pending: a }));
  const pB = h.api.loadSingleFile(h.file('B.png', { pending: b }));
  b.resolve(new Uint8Array(8).buffer); await pB; a.resolve(new Uint8Array(8).buffer); await pA;
  assert.equal(h.api.state().lastFile, 'B.png'); assert.deepEqual(h.stats.parses, ['B.png']);
  assert.equal(h.stats.urlsCreated.length, 1);
});

test('UI control: Clear cancels an already-started file read', async () => {
  const h = fresh(); const pending = deferred();
  const job = h.api.loadSingleFile(h.file('A.png', { pending })); h.api.clearAll();
  pending.resolve(new Uint8Array(8).buffer); await job;
  assert.equal(h.api.state().lastFile, undefined); assert.deepEqual(h.stats.parses, []);
  assert.equal(h.stats.urlsCreated.length, 0);
});

test('UI control: language/theme choices persist and unsupported theme falls back', () => {
  const h = fresh(); h.api.setLanguage('ja'); h.api.setTheme('candy');
  assert.equal(h.document.documentElement.lang, 'ja'); assert.equal(h.document.body.dataset.theme, 'candy');
  assert.equal(h.storage.get('avifPromptViewerLanguage'), 'ja');
  assert.equal(h.storage.get('avifPromptViewerTheme'), 'candy');
  h.api.setTheme('invalid'); assert.equal(h.document.body.dataset.theme, 'blue');
});

test('UI performance: revisiting a File uses cached parsing without retaining full bytes', async () => {
  const h = fresh(), a = h.file('A.png'), b = h.file('B.png'); h.api.loadFolderFiles([a, b]);
  for (const i of [0, 1, 0]) { await h.api.loadFolderIndex(i); await flush(); }
  assert.deepEqual(h.stats.reads, ['A.png', 'B.png']); assert.deepEqual(h.stats.parses, ['A.png', 'B.png']);
  assert.equal(h.api.state().retainedBytes, null);
  assert.equal(h.api.state().lastFile, 'A.png');
});

test('UI performance: parse cache is bounded and distinguishes File identities', async () => {
  const h = fresh(); const first = h.file('same.png');
  h.api.loadFolderFiles([first, h.file('same.png')]);
  await h.api.loadFolderIndex(0); await flush(); await h.api.loadFolderIndex(1); await flush();
  assert.equal(h.stats.parses.length, 2);
  assert.ok(h.api.state().cacheLimit > 0 && h.api.state().cacheLimit <= 128);
  const many = Array.from({ length: h.api.state().cacheLimit + 3 }, (_, i) => h.file(`${i}.png`));
  h.api.loadFolderFiles(many);
  for (let i = 0; i < many.length; i++) await h.api.loadFolderIndex(i);
  assert.ok(h.api.state().cacheSize <= h.api.state().cacheLimit);
  h.api.clearAll(); assert.equal(h.api.state().cacheSize, 0);
});

test('UI performance: thumbnail listeners are delegated and selection touches at most two nodes', async () => {
  const h = fresh(); h.api.loadFolderFiles(Array.from({ length: 1000 }, (_, i) => h.file(`${i}.png`)));
  const folder = h.nodes.get('folderList');
  assert.equal(folder.buttons.reduce((n, b) => n + (b.listeners.get('click')?.length || 0), 0), 0);
  assert.equal(folder.listeners.get('click')?.length, 1);
  assert.equal([...folder.innerHTML.matchAll(/loading="lazy"/g)].length, 1000);
  assert.equal([...folder.innerHTML.matchAll(/decoding="async"/g)].length, 1000);
  await h.api.loadFolderIndex(0); await flush(); const before = h.stats.activeToggles;
  await folder.buttons[5].children[0].click(); await flush();
  assert.equal(h.api.state().folderIndex, 5);
  assert.ok(h.stats.activeToggles - before <= 2);
  assert.equal(folder.buttons[0].classList.contains('active'), false);
  assert.equal(folder.buttons[5].classList.contains('active'), true);
});

test('UI: a stale lookup cannot enable controls or replace a newer lookup', async () => {
  const h = fresh(); await h.api.loadSingleFile(h.file('A.png', { settings: 'Model hash: aaaaaaaa' }));
  const old = h.api.lookupCivitaiResources();
  await h.api.loadSingleFile(h.file('B.png', { settings: 'Model hash: bbbbbbbb' }));
  const current = h.api.lookupCivitaiResources();
  h.fetchPending[0].resolve(response('OLD')); await old;
  assert.equal(h.nodes.get('civitaiLookup').disabled, true);
  h.api.setLanguage('ja');
  assert.equal(h.nodes.get('civitaiLookup').disabled, true);
  h.fetchPending[1].resolve(response('CURRENT')); await current;
  assert.match(h.nodes.get('civitaiResources').innerHTML, /CURRENT/);
  h.api.setLanguage('de'); assert.match(h.nodes.get('civitaiResources').innerHTML, /CURRENT/);
});

test('UI: missing placeholders localize while formatting options preserve an editable source', async () => {
  const h = fresh(); await h.api.loadSingleFile(h.file('A.png', { positive: '' }));
  const missing = h.nodes.get('positiveText').textContent;
  h.api.setLanguage('ja'); assert.notEqual(h.nodes.get('positiveText').textContent, missing);
  h.nodes.get('positiveText').textContent = 'my_tag,my_tag'; await h.nodes.get('formatPrompt').click();
  assert.equal(h.nodes.get('positiveText').textContent, 'my tag');
  h.nodes.get('removeUnderscores').checked = false; await h.nodes.get('removeUnderscores').dispatch('change');
  assert.equal(h.nodes.get('positiveText').textContent, 'my_tag');
  h.nodes.get('removeDuplicates').checked = false; await h.nodes.get('removeDuplicates').dispatch('change');
  assert.equal(h.nodes.get('positiveText').textContent, 'my_tag, my_tag');
});

test('UI: failed reads recover and stale read failures leave the newer view alone', async () => {
  const h = fresh(); const pending = deferred();
  const old = h.api.loadSingleFile(h.file('OLD.png', { pending }));
  await h.api.loadSingleFile(h.file('NEW.png'));
  const status = h.nodes.get('status').textContent;
  pending.reject(new Error('unreadable')); await old;
  assert.equal(h.nodes.get('status').textContent, status);
  const bad = h.file('BAD.png'); bad.arrayBuffer = async () => { throw new Error('unreadable'); };
  await h.api.loadSingleFile(bad); assert.match(h.nodes.get('status').textContent, /could not read/i);
  await h.api.loadSingleFile(h.file('RECOVERED.png')); assert.equal(h.api.state().lastFile, 'RECOVERED.png');
});

test('UI: a stopped slideshow callback cannot resume navigation', async () => {
  const h = fresh(); h.api.loadFolderFiles([h.file('A.png'), h.file('B.png')]); await h.api.loadFolderIndex(0);
  h.api.startSlideshow(); const staleTick = [...h.intervals.values()][0].fn; h.api.stopSlideshow();
  staleTick(); await flush(); assert.deepEqual(h.stats.reads, ['A.png']);
});

test('UI: a new file resets edit state without changing canonical parsed text', async () => {
  const h = fresh(); const a = h.file('A.png'), b = h.file('B.png'); h.api.loadFolderFiles([a, b]);
  await h.api.loadFolderIndex(0); await h.nodes.get('editText').click(); h.nodes.get('positiveText').textContent = 'MANUAL';
  await h.nodes.get('formatPrompt').click(); await h.api.loadFolderIndex(1); await h.api.loadFolderIndex(0);
  assert.equal(h.nodes.get('positiveText').textContent, 'A.png');
  assert.equal(h.nodes.get('positiveText').getAttribute('contenteditable'), 'false');
});
