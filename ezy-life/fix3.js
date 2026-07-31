const fs = require('fs');
const f = 'C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html';
let t = fs.readFileSync(f, 'utf8');

const rep = (a, b) => {
  const c = t.split(a).join(b);
  if (c === t) console.warn('NO MATCH:', JSON.stringify(a.substring(0, 60)));
  t = c;
};

rep(
  `'<button class="hb-edit-btn" title="Edit icon" ondragstart="event.stopPropagation();event.preventDefault();" onclick="hieOpenModal(event,\\'' + gid2 + '\\')">??</button>' +`,
  `'<button class="hb-edit-btn" title="Edit icon" ondragstart="event.stopPropagation();event.preventDefault();" onclick="hieOpenModal(event,\\'' + gid2 + '\\')">✏️</button>' +`
);

rep(
  `var receiptBtn = m.receiptData ? '<span class="receipt-tag" onclick="viewReceipt(' + v.id + ',' + m.id + ')">?? Receipt</span>' : '';`,
  `var receiptBtn = m.receiptData ? '<span class="receipt-tag" onclick="viewReceipt(' + v.id + ',' + m.id + ')">🧾 Receipt</span>' : '';`
);

rep(
  `'<div><div style="font-size:16px;font-weight:700">?? Mileage Log</div>' +`,
  `'<div><div style="font-size:16px;font-weight:700">🚗 Mileage Log</div>' +`
);

fs.writeFileSync(f, t, 'utf8');

// Count remaining non-picker ?? instances
const lines = t.split('\n');
const remaining = lines.filter(l => l.includes('??') && !l.includes('emojis:'));
console.log('Non-picker ?? remaining:', remaining.length);
remaining.forEach((l, i) => {
  if (i < 10) console.log('  ' + JSON.stringify(l.trim().substring(0, 150)));
});

// Total count
const total = (t.match(/\?\?/g)||[]).length;
console.log('Total ?? in file:', total, '(rest are emoji picker data arrays)');
