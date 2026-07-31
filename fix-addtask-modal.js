const fs = require('fs');
let txt = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');

// ── 1. Fix modal title: ? Add Task → ➕ Add Task ─────────────────────────────
txt = txt.replace(
  '<div class="modal-title">? Add Task</div>',
  '<div class="modal-title">\u2795 Add Task</div>'
);

// ── 2. Fix submit button: Add Task ? → Add Task ➕ ──────────────────────────
txt = txt.replace(
  '<button class="btn btn-primary" onclick="saveTask()">Add Task ?</button>',
  '<button class="btn btn-primary" onclick="saveTask()">\u2795 Add Task</button>'
);

// ── 3. Remove helper text (A = AM … P = PM) from Start Time label ─────────
// The label contains a corrupted span — match generously
const oldStartLabel = txt.match(/<label class="form-label">Start Time[^<]*<span[^>]*>[^<]*<\/span><\/label>/);
if (oldStartLabel) {
  txt = txt.replace(oldStartLabel[0], '<label class="form-label">Start Time</label>');
} else {
  // Fallback: replace the exact line
  txt = txt.replace(
    /(<label class="form-label">Start Time[^<]*(?:<span[^>]*>[^<]*<\/span>)?)<\/label>/,
    '<label class="form-label">Start Time</label>'
  );
}

// ── 4. Add onchange auto-toggle to start hour input ──────────────────────────
txt = txt.replace(
  '<input type="number" id="t-hr" class="time-unit" min="1" max="12" value="9" placeholder="9">',
  '<input type="number" id="t-hr" class="time-unit" min="1" max="12" value="9" placeholder="9" onchange="autoToggleAMPM(\'start\')">'
);

// ── 5. Add onchange auto-toggle to start minute input ────────────────────────
txt = txt.replace(
  '<input type="number" id="t-min" class="time-unit" min="0" max="59" value="0" placeholder="00">',
  '<input type="number" id="t-min" class="time-unit" min="0" max="59" value="0" placeholder="00" onchange="autoToggleAMPM(\'start\')">'
);

// ── 6. Add onchange auto-toggle to end hour input ────────────────────────────
txt = txt.replace(
  '<input type="number" id="t-ehr" class="time-unit" min="1" max="12" value="10" placeholder="10">',
  '<input type="number" id="t-ehr" class="time-unit" min="1" max="12" value="10" placeholder="10" onchange="autoToggleAMPM(\'end\')">'
);

// ── 7. Add onchange auto-toggle to end minute input ──────────────────────────
txt = txt.replace(
  '<input type="number" id="t-emin" class="time-unit" min="0" max="59" value="0" placeholder="00">',
  '<input type="number" id="t-emin" class="time-unit" min="0" max="59" value="0" placeholder="00" onchange="autoToggleAMPM(\'end\')">'
);

// ── 8. Inject autoToggleAMPM helper after setEndAMPM ─────────────────────────
const oldSetEnd = `function setEndAMPM(ampm) {
  _isEndPM = (ampm === 'PM');
  document.getElementById('t-eam-btn').classList.toggle('active', !_isEndPM);
  document.getElementById('t-epm-btn').classList.toggle('active', _isEndPM);
}`;

const newSetEnd = `function setEndAMPM(ampm) {
  _isEndPM = (ampm === 'PM');
  document.getElementById('t-eam-btn').classList.toggle('active', !_isEndPM);
  document.getElementById('t-epm-btn').classList.toggle('active', _isEndPM);
}
function autoToggleAMPM(which) {
  // Clamp values
  var isEnd = which === 'end';
  var hrId  = isEnd ? 't-ehr' : 't-hr';
  var mnId  = isEnd ? 't-emin' : 't-min';
  var hrEl  = document.getElementById(hrId);
  var mnEl  = document.getElementById(mnId);
  var hr = parseInt(hrEl.value || '12', 10);
  var mn = parseInt(mnEl.value || '0', 10);
  // Wrap minutes: 60 → 0, -1 → 59
  if (mn >= 60) { mn = 0; hr += 1; mnEl.value = '0'; }
  if (mn < 0)   { mn = 59; hr -= 1; mnEl.value = '59'; }
  // Wrap hours 12-hour clock: 13 → 1, 0 → 12
  if (hr > 12) { hr = 1; hrEl.value = '1'; }
  if (hr < 1)  { hr = 12; hrEl.value = '12'; }
  // Auto-toggle AM/PM when crossing 11→12 or 12→11
  // We detect this by looking at whether hr just became 12 (going PM) or 11 (going AM)
  // Strategy: if user typed hour=12 and was AM → switch to PM; if hour=11 and was PM → switch to AM
  if (isEnd) {
    if (hr === 12 && !_isEndPM) { setEndAMPM('PM'); }
    else if (hr === 11 && _isEndPM) { setEndAMPM('AM'); }
  } else {
    if (hr === 12 && !_isPM) { setAMPM('PM'); }
    else if (hr === 11 && _isPM) { setAMPM('AM'); }
  }
}`;

if (!txt.includes(oldSetEnd)) {
  console.error('oldSetEnd not found!');
  process.exit(1);
}
txt = txt.replace(oldSetEnd, newSetEnd);

// ── Verify ────────────────────────────────────────────────────────────────────
const qq = (txt.match(/\?\?/g)||[]).length;
console.log('?? count:', qq);
console.log('Title fixed:', txt.includes('\u2795 Add Task</div>'));
console.log('Button fixed:', txt.includes('\u2795 Add Task</button>'));
console.log('Helper text gone:', !txt.includes('A = AM'));
console.log('autoToggleAMPM present:', txt.includes('function autoToggleAMPM'));
console.log('onchange on t-hr:', txt.includes('id="t-hr"') && txt.includes("autoToggleAMPM('start')"));
console.log('Has \uD83C\uDFAF:', txt.includes('\uD83C\uDFAF'));
console.log('Has \u2190 Back:', txt.includes('\u2190 Back'));
console.log('Size:', Buffer.byteLength(txt,'utf8'), 'bytes');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, {encoding:'utf8'});
console.log('Saved.');
