const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');
const lines = txt.split('\n');

// ── 1. Remove min/max from hour inputs; switch onchange → oninput; add data-prev
const htmlFixes = [
  [
    `<input type="number" id="t-hr" class="time-unit" min="1" max="12" value="9" placeholder="9" onchange="autoToggleAMPM('start')">`,
    `<input type="number" id="t-hr" class="time-unit" value="9" placeholder="9" data-prev="9" oninput="autoToggleAMPM('start',this)">`
  ],
  [
    `<input type="number" id="t-min" class="time-unit" min="0" max="59" value="0" placeholder="00" onchange="autoToggleAMPM('start')">`,
    `<input type="number" id="t-min" class="time-unit" value="0" placeholder="00" data-prev="0" oninput="autoToggleAMPM('start',this)">`
  ],
  [
    `<input type="number" id="t-ehr" class="time-unit" min="1" max="12" value="10" placeholder="10" onchange="autoToggleAMPM('end')">`,
    `<input type="number" id="t-ehr" class="time-unit" value="10" placeholder="10" data-prev="10" oninput="autoToggleAMPM('end',this)">`
  ],
  [
    `<input type="number" id="t-emin" class="time-unit" min="0" max="59" value="0" placeholder="00" onchange="autoToggleAMPM('end')">`,
    `<input type="number" id="t-emin" class="time-unit" value="0" placeholder="00" data-prev="0" oninput="autoToggleAMPM('end',this)">`
  ]
];

htmlFixes.forEach(([oldStr, newStr]) => {
  if (!txt.includes(oldStr)) { console.error('NOT FOUND:', oldStr.substring(0,60)); process.exit(1); }
  txt = txt.replace(oldStr, newStr);
});

// ── 2. Replace autoToggleAMPM via line-number splice (lines 1982–2022, 0-indexed 1981–2021)
const startLine = 1981; // 0-indexed, "function autoToggleAMPM(which) {"
const endLine   = 2022; // 0-indexed, the closing "}" line (exclusive)

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
`  if (isNaN(prevHr)) prevHr = hr;`,
`  // Minute rollover`,
`  if (mn > 59) { mn = 0; mnEl.value = '0'; hr += 1; hrEl.value = String(hr); }`,
`  if (mn < 0)  { mn = 59; mnEl.value = '59'; hr -= 1; hrEl.value = String(hr); }`,
`  // Hour rollover + AM/PM crossing`,
`  var isPM = isEnd ? _isEndPM : _isPM;`,
`  if (hr > 12) {`,
`    // Went past 12 going up: cross into next period`,
`    hr = 1; hrEl.value = '1';`,
`    isPM = !isPM;`,
`    if (isEnd) setEndAMPM(isPM ? 'PM' : 'AM'); else setAMPM(isPM ? 'PM' : 'AM');`,
`  } else if (hr < 1) {`,
`    // Went below 1 going down: cross into previous period`,
`    hr = 12; hrEl.value = '12';`,
`    isPM = !isPM;`,
`    if (isEnd) setEndAMPM(isPM ? 'PM' : 'AM'); else setAMPM(isPM ? 'PM' : 'AM');`,
`  } else if (hr === 12 && prevHr === 11 && !isPM) {`,
`    // 11 AM -> 12 PM: flip to PM`,
`    if (isEnd) setEndAMPM('PM'); else setAMPM('PM');`,
`  } else if (hr === 12 && prevHr === 1 && isPM) {`,
`    // 1 PM -> 12 AM (decrement): flip to AM`,
`    if (isEnd) setEndAMPM('AM'); else setAMPM('AM');`,
`  } else if (hr === 11 && prevHr === 12 && isPM) {`,
`    // 12 PM -> 11 AM (decrement): flip to AM`,
`    if (isEnd) setEndAMPM('AM'); else setAMPM('AM');`,
`  } else if (hr === 1 && prevHr === 12 && !isPM) {`,
`    // 12 AM -> 1 PM (increment): flip to PM`,
`    if (isEnd) setEndAMPM('PM'); else setAMPM('PM');`,
`  }`,
`  // Store current as previous for next event`,
`  hrEl.setAttribute('data-prev', String(hr));`,
`  mnEl.setAttribute('data-prev', String(mn));`,
`}`
];

// Verify line boundaries before splicing
const linesBefore = txt.split('\n');
console.log('Line 1982 (0-idx 1981):', JSON.stringify(linesBefore[1981]));
console.log('Line 2023 (0-idx 2022):', JSON.stringify(linesBefore[2022]));

const spliced = [...linesBefore.slice(0, startLine), ...newFnLines, ...linesBefore.slice(endLine)];
txt = spliced.join('\n');

// ── Verify ────────────────────────────────────────────────────────────────────
const qq = (txt.match(/\?\?/g)||[]).length;
console.log('?? count:', qq);
console.log('New autoToggle present:', txt.includes('data-prev'));
console.log('Direction-aware logic:', txt.includes('prevHr === 11'));
console.log('No min= on t-hr:', !txt.includes('id="t-hr" class="time-unit" min='));
console.log('Has arrow back:', txt.includes('\u2190 Back'));
console.log('Has target emoji:', txt.includes('\uD83C\uDFAF'));
console.log('Size:', Buffer.byteLength(txt,'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, {encoding:'utf8'});
console.log('Saved.');
