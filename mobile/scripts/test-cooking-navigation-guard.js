const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootLayout = fs.readFileSync(path.join(__dirname, '..', 'app/_layout.tsx'), 'utf8');
const cookingLayout = fs.readFileSync(path.join(__dirname, '..', 'app/cooking/_layout.tsx'), 'utf8');
const completeScreen = fs.readFileSync(path.join(__dirname, '..', 'app/cooking/complete.tsx'), 'utf8');

assert.match(
  completeScreen,
  /usePreventRemove/,
  'cookbook review screen should use usePreventRemove for native-stack leave prevention',
);

assert.doesNotMatch(
  completeScreen,
  /addListener\(['"]beforeRemove['"]/,
  'cookbook review screen should not use beforeRemove directly with native-stack',
);

assert.match(
  rootLayout,
  /<Stack\.Screen\s+name=["']cooking["'][^>]*options=\{\{[^}]*gestureEnabled:\s*false/s,
  'root cooking stack screen should disable swipe-back gestures',
);

assert.match(
  cookingLayout,
  /headerBackButtonMenuEnabled:\s*false/,
  'cooking nested stack should disable the native back-button menu when removal is prevented',
);

console.log('cooking navigation guard tests passed');
