const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function loadTsModule(relativePath) {
  const filename = path.join(__dirname, '..', relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  const fn = new Function('require', 'module', 'exports', '__dirname', output);
  fn(require, mod, mod.exports, path.dirname(filename));
  return mod.exports;
}

const { shouldPromptCookbookReviewLeave } = loadTsModule('src/utils/cookbookReviewLeave.ts');

assert.equal(
  shouldPromptCookbookReviewLeave({
    hasDraft: true,
    hasSavedEntry: false,
    isSubmitting: false,
    isDiscarding: false,
  }),
  true,
  'draft review should prompt before leaving',
);

assert.equal(
  shouldPromptCookbookReviewLeave({
    hasDraft: true,
    hasSavedEntry: true,
    isSubmitting: false,
    isDiscarding: false,
  }),
  false,
  'saved review should not prompt even if local form values remain',
);

assert.equal(
  shouldPromptCookbookReviewLeave({
    hasDraft: true,
    hasSavedEntry: false,
    isSubmitting: false,
    isDiscarding: true,
  }),
  false,
  'confirmed discard navigation should bypass the prompt',
);

assert.equal(
  shouldPromptCookbookReviewLeave({
    hasDraft: false,
    hasSavedEntry: false,
    isSubmitting: false,
    isDiscarding: false,
  }),
  false,
  'empty review can leave without prompt',
);

console.log('cookbook review leave tests passed');
