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

const { filterRecipesByTitle } = loadTsModule('src/utils/recipeSearch.ts');

const recipes = [
  { id: 1, title: '김치찌개' },
  { id: 2, title: '된장찌개' },
  { id: 3, title: 'Tomato Pasta' },
];

assert.deepEqual(
  filterRecipesByTitle(recipes, ' 김치 ').map((recipe) => recipe.id),
  [1],
  'search should trim Korean recipe title queries',
);

assert.deepEqual(
  filterRecipesByTitle(recipes, 'pasta').map((recipe) => recipe.id),
  [3],
  'search should be case-insensitive',
);

assert.equal(
  filterRecipesByTitle(recipes, ''),
  recipes,
  'empty search should keep the original list reference',
);

console.log('recipe search tests passed');
