const fs = require('fs');
const app = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/src/_app_raw.js', 'utf8');

// Find all top-level var declarations
const matches = [...app.matchAll(/\nvar ([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g)];

// Extract each var declaration (from \nvar ... to the next semicolon at depth 0)
const varNames = [];
const varDecls = [];

for (let i = 0; i < matches.length; i++) {
  const m = matches[i];
  const name = m[1];
  const start = m.index + 1; // skip leading \n
  // Find end of declaration: scan for ; at depth 0
  let depth = 0;
  let end = start;
  for (let j = start; j < app.length; j++) {
    const c = app[j];
    if (c === '{' || c === '[' || c === '(') depth++;
    else if (c === '}' || c === ']' || c === ')') depth--;
    else if (c === ';' && depth === 0) { end = j + 1; break; }
    else if (c === '\n' && depth === 0 && j > start + 3) {
      // var with no semicolon (just newline) — take up to newline
      end = j; break;
    }
  }
  const decl = app.substring(start, end).trim();
  varNames.push(name);
  varDecls.push(decl);
}

console.log('Extracted', varDecls.length, 'global var declarations');

// Build globals.js - declare all vars and also put on window
let output = '// Auto-generated global state - shared across all modules\n\n';
varDecls.forEach((decl, i) => {
  // Convert "var name = value" to "window.name = value"  
  // Keep original declaration too for local reference
  output += decl + '\n';
  output += 'window.' + varNames[i] + ' = ' + varNames[i] + ';\n\n';
});

// Also add window export block at bottom
output += '\n// Make all globals accessible cross-module via window\n';
output += 'Object.defineProperty(window, "_globalsReady", { value: true });\n';

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/src/globals.js', output, 'utf8');
console.log('globals.js written:', output.length, 'chars');
