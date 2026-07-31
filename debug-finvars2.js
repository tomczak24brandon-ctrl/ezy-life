const fs = require('fs');
const c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

// Look for where the fin variables section is in the JS
// Search for lines starting with "var _" near fin-related code
const lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
  const l = lines[i].trim();
  if (l.startsWith('var _fin') || l.startsWith('var _current') || l.includes('_currentFinTab =') && l.includes('var')) {
    console.log((i+1) + ': ' + l.substring(0,100));
  }
}

// Also check around the renderFinPage area for variable init
const renderIdx = c.indexOf('function renderFinPage');
console.log('\nArea before renderFinPage (lines ~3140-3155):');
const linesBefore = c.substring(renderIdx - 500, renderIdx);
console.log(linesBefore);
