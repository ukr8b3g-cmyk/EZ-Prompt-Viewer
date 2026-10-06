const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function parserContext(overrides = {}) {
  const root = path.resolve(__dirname, '../..');
  const html = fs.readFileSync(path.join(root, 'avif_prompt_viewer.html'), 'utf8');
  const start = html.indexOf('    function parseMetadata(bytes, file) {');
  const end = html.indexOf('    if (localStorage.getItem("avifPromptViewerThemeDefaultVersion")', start);
  if (start < 0 || end < start) throw new Error('Parser source boundary not found');
  const context = vm.createContext({ TextDecoder, console, ...overrides });
  for (const file of ['designer_adapters.js', 'workflow_adapter.js']) {
    if (fs.existsSync(path.join(root, file))) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  }
  vm.runInContext(`const decoder = new TextDecoder('utf-8'); const latin1Decoder = new TextDecoder('latin1'); const utf16leDecoder = new TextDecoder('utf-16le'); const utf16beDecoder = new TextDecoder('utf-16be');\n` + html.slice(start, end), context, { filename: 'viewer-parser.js' });
  return context;
}
function graph(text, steps = 20) { return { '1': { class_type: 'CLIPTextEncode', inputs: { text } }, '2': { class_type: 'KSampler', inputs: { positive: ['1', 0], steps } } }; }
module.exports = { parserContext, graph };
