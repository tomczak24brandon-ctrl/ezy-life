const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// ── 1. Add a CSS class .tb-active on .main that hides main-content ────────────
// Insert after the existing page-timeblocking CSS rules
const cssAnchor = '#page-timeblocking { flex:1; overflow:hidden; display:none; flex-direction:column; }\n#page-timeblocking.active { display:flex; }';
if (!txt.includes(cssAnchor)) {
  console.error('CSS anchor not found'); process.exit(1);
}
const newCSS = cssAnchor + '\n/* When timeblocking is active, hide main-content via class for reliability */\n.main.tb-mode > #main-content { display:none !important; }\n.main.tb-mode > #page-timeblocking { display:flex !important; }';
txt = txt.replace(cssAnchor, newCSS);

// ── 2. Add .tb-mode class to .main in showPage and _showPageInternal ─────────
// In showPage: after mc.style.display line
txt = txt.replace(
  'mc.style.display = isTimblocking ? \'none\' : \'block\';\n  if (isTimblocking) {\n    tb.classList.add(\'active\');\n    renderGCal();\n  } else {\n    tb.classList.remove(\'active\');\n  }',
  'mc.style.display = isTimblocking ? \'none\' : \'block\';\n  var mainEl = document.querySelector(\'.main\');\n  if (mainEl) mainEl.classList.toggle(\'tb-mode\', isTimblocking);\n  if (isTimblocking) {\n    tb.classList.add(\'active\');\n    renderGCal();\n  } else {\n    tb.classList.remove(\'active\');\n  }'
);

// In _showPageInternal: after mc.style.display line
txt = txt.replace(
  'if (mc) mc.style.display = isGCal ? \'none\' : \'block\';\n  if (isGCal) {\n    if (tb) tb.classList.add(\'active\');\n    renderGCal();\n  } else {\n    if (tb) tb.classList.remove(\'active\');',
  'if (mc) mc.style.display = isGCal ? \'none\' : \'block\';\n  var mainEl2 = document.querySelector(\'.main\');\n  if (mainEl2) mainEl2.classList.toggle(\'tb-mode\', isGCal);\n  if (isGCal) {\n    if (tb) tb.classList.add(\'active\');\n    renderGCal();\n  } else {\n    if (tb) tb.classList.remove(\'active\');'
);

// ── Verify ────────────────────────────────────────────────────────────────────
const qq = (txt.match(/\?\?/g)||[]).length;
console.log('?? count:', qq);
console.log('CSS tb-mode added:', txt.includes('.main.tb-mode > #main-content'));
console.log('showPage tb-mode toggle:', txt.includes("classList.toggle('tb-mode', isTimblocking)"));
console.log('_showPageInternal tb-mode toggle:', txt.includes("classList.toggle('tb-mode', isGCal)"));
console.log('Has emoji:', txt.includes('\uD83C\uDFAF'));
console.log('Has back arrow:', txt.includes('\u2190 Back'));
console.log('Size:', Buffer.byteLength(txt,'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, {encoding:'utf8'});
console.log('Saved.');
