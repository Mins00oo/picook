const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function loadModule(tsPath) {
  const source = fs.readFileSync(tsPath, 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;

  const module = { exports: {} };
  const dirname = path.dirname(tsPath);
  const localRequire = (request) => require(require.resolve(request, { paths: [dirname, process.cwd()] }));
  new Function('require', 'module', 'exports', js)(localRequire, module, module.exports);
  return module.exports;
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

const { getCategorySearchStatusText } = loadModule(
  path.join(process.cwd(), 'src/utils/categorySearchStatus.ts'),
);

assertEqual(
  getCategorySearchStatusText({ query: '', count: 12, isFetching: false }),
  null,
  'empty query should not show search status',
);

assertEqual(
  getCategorySearchStatusText({ query: '김치', count: 3, isFetching: false }),
  '3개 찾았어요',
  'settled search should show result count',
);

assertEqual(
  getCategorySearchStatusText({ query: '김치', count: 3, isFetching: true }),
  null,
  'fetching search should not flash broadening/loading copy',
);

console.log('category search status tests passed');
