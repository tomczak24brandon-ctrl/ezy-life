const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');
const lines = txt.split('\n');

// Replace autoToggleAMPM (lines 1982-2025, 0-indexed 1981-2024)
// Verified start: line 1982 "function autoToggleAMPM(which, changedEl) {"
// Verified end:   line 2025 "}" (closing brace, next line 2026 is addEventListener)

const startLine = 1981;
const endLine   = 2025; // exclusive

// Verify boundaries
if (!lines[startLine].includes('function autoToggleAMPM')) {
  console.error('Start line mismatch:', lines[startLine]); process.exit(1);
}
if (!lines[endLine].includes("addEventListener('keydown'")) {
  console.error('End line mismatch:', lines[endLine]); process.exit(1);
}

// New implementation: use data-prev to detect direction, then apply
// 12-hour clock AM/PM crossing rules cleanly.
//
// 12-hour AM/PM crossing rules:
//   Going UP:   11 AM -> 12 PM (flip AM->PM)
//               12 PM -> 1 PM  (no flip, stay PM — same half-day continues)
//               Wait — that's wrong. 12-hour: 12AM,1AM,...11AM,12PM,1PM,...11PM,12AM
//               So: 11 AM +1 = 12 PM (flip)
//                   12 PM +1 = 1 PM  (no flip)
//                   11 PM +1 = 12 AM (flip)
//                   12 AM +1 = 1 AM  (no flip)
//   Going DOWN: 12 PM -1 = 11 AM (flip)
//               1 PM  -1 = 12 PM (no flip)  ← THIS is the bug — no flip needed here!
//               12 AM -1 = 11 PM (flip)
//               1 AM  -1 = 12 AM (no flip)
//
// So the ONLY crossing points are: 11->12 (up) and 12->11 (down), in any period.

const newFnLines = [
`function autoToggleAMPM(which, changedEl) {`,
`  var isEnd = which === 'end';`,
`  var hrId  = isEnd ? 't-ehr' : 't-hr';`,
`  var mnId  = isEnd ? 't-emin' : 't-min';`,
`  var hrEl  = document.getElementById(hrId);`,
`  var mnEl  = document.getElementById(mnId);`,
`  var hr = parseInt(hrEl.value, 10);`,
`  var mn = parseInt(mnEl.value, 10);`,
`  if (isNaN(hr)) hr = 12;`,
`  if (isNaN(mn)) mn = 0;`,
`  var prevHr = parseInt(hrEl.getAttribute('data-prev') || String(hr), 10);`,
`  var prevMn = parseInt(mnEl.getAttribute('data-prev') || String(mn), 10);`,
`  if (isNaN(prevHr)) prevHr = hr;`,
`  if (isNaN(prevMn)) prevMn = mn;`,
``,
`  var goingUp = (hr > prevHr) || (mn > prevMn && hr === prevHr);`,
`  var goingDown = !goingUp;`,
``,
`  // Minute rollover: carry into hours`,
`  if (mn > 59) { mn = 0; mnEl.value = '0'; hr += 1; hrEl.value = String(hr); goingUp = true; goingDown = false; }`,
`  if (mn < 0)  { mn = 59; mnEl.value = '59'; hr -= 1; hrEl.value = String(hr); goingDown = true; goingUp = false; }`,
``,
`  // Hour wrap: 13->1, 0->12 (no period change on wrap — period only flips at 11<->12 boundary)`,
`  if (hr > 12) { hr = 1; hrEl.value = '1'; }`,
`  if (hr < 1)  { hr = 12; hrEl.value = '12'; }`,
``,
`  // AM/PM flip ONLY at the 11<->12 boundary`,
`  // Going UP:   prevHr=11 and hr=12 -> flip period`,
`  // Going DOWN: prevHr=12 and hr=11 -> flip period`,
`  var flip = false;`,
`  if (goingUp   && prevHr === 11 && hr === 12) flip = true;`,
`  if (goingDown && prevHr === 12 && hr === 11) flip = true;`,
`  // Also catch wrap-around: going up from 12 wraps to 1 (prev=12, hr=1) — cross occurred, flip`,
`  if (goingUp   && prevHr === 12 && hr === 1)  flip = true;`,
`  // Going down from 1 wraps to 12 (prev=1, hr=12) — cross occurred, flip`,
`  if (goingDown && prevHr === 1  && hr === 12) flip = true;`,
``,
`  if (flip) {`,
`    var isPM = isEnd ? _isEndPM : _isPM;`,
`    isPM = !isPM;`,
`    if (isEnd) setEndAMPM(isPM ? 'PM' : 'AM');`,
`    else       setAMPM(isPM ? 'PM' : 'AM');`,
`  }`,
``,
`  // Store for next event`,
`  hrEl.setAttribute('data-prev', String(hr));`,
`  mnEl.setAttribute('data-prev', String(mn));`,
`}`
];

const spliced = [...lines.slice(0, startLine), ...newFnLines, ...lines.slice(endLine)];
txt = spliced.join('\n');

// Verify
const qq = (txt.match(/\?\?/g)||[]).length;
console.log('?? count:', qq);
console.log('New fn present:', txt.includes('goingUp') && txt.includes('goingDown'));
console.log('Only 11<->12 flips:', txt.includes('prevHr === 11 && hr === 12'));
console.log('Has arrow back:', txt.includes('\u2190 Back'));
console.log('Has target emoji:', txt.includes('\uD83C\uDFAF'));
console.log('Size:', Buffer.byteLength(txt,'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, {encoding:'utf8'});
console.log('Saved.');
