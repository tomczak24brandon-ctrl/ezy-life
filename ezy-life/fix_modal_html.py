import re, time, sys

src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
with open(src, 'rb') as f:
    raw = f.read()

# Decode as UTF-8 with replacement chars visible
c = raw.decode('utf-8', errors='replace')

ok = True
misses = []
def patch(label, old, new):
    global c, ok
    if old in c:
        c = c.replace(old, new, 1)
        sys.stdout.buffer.write(f"OK: {label}\n".encode('utf-8'))
    else:
        sys.stdout.buffer.write(f"MISS: {label}\n".encode('utf-8'))
        misses.append(label)
        ok = False

# U+FFFD shows as \ufffd after decode with replace
FFFD = '\ufffd'

# ── 1. Replace the stripped taskdetail modal ──────────────────────────────────
# The ??? Delete is 3x FFFD (corrupted emoji) followed by " Delete"

patch("taskdetail modal title display remove",
    '<div class="modal-title" id="td-title-display">Task Detail</div>',
    '<div class="modal-title">&#9998; Edit Task</div>')

patch("taskdetail modal-sub time display remove",
    '<div class="modal-sub" id="td-time-display"></div>',
    '<div class="modal-sub" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">Date: <input type="date" id="td-date-input" style="border:2px solid var(--accent2);border-radius:10px;padding:8px 16px;font-size:18px;font-weight:700;color:#ffffff;background:var(--card);cursor:pointer;outline:none;min-width:180px;min-height:42px;" onclick="try{this.showPicker()}catch(e){}"></div>')

patch("taskdetail replace stripped body",
    '    <div class="form-group" style="margin-bottom:12px">\n      <label class="form-label">Title</label>\n      <input class="form-input" id="td-title-input" placeholder="Task title">\n    </div>\n    <div id="td-subs-section" style="margin-bottom:12px"></div>\n    <div class="modal-footer">\n      <button class="btn btn-outline btn-sm" onclick="tdDelete()" style="color:var(--red);border-color:rgba(248,81,73,.3);margin-right:auto">' + FFFD*3 + ' Delete</button>\n      <button class="btn btn-outline" onclick="closeModal(\'taskdetail\')">Close</button>\n      <button class="btn btn-primary" onclick="tdSave()">&#10003; Save</button>\n    </div>',
    '''    <div class="form-grid">
      <div class="form-group form-full"><label class="form-label">Task Title</label><input class="form-input" id="td-title-input" placeholder="Task title"></div>
      <div class="form-group form-full">
        <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Sub-Tasks <span style="font-weight:400;text-transform:none">(optional)</span></div>
        <div id="td-sub-list" style="margin-bottom:8px"></div>
        <div style="display:flex;gap:8px">
          <input class="form-input" id="td-sub-input" placeholder="Add a sub-task..." style="flex:1" onkeydown="if(event.key===\'Enter\'){event.preventDefault();tdAddSub()}">
          <button class="btn btn-outline btn-sm" onclick="tdAddSub()">+ Add</button>
        </div>
      </div>
      <div class="form-group form-full">
        <label class="form-label">Start Time</label>
        <div class="time-picker-row">
          <input type="number" id="td-hr" class="time-unit" value="9" placeholder="9" data-prev="9" oninput="autoToggleAMPM_td(\'start\',this)">
          <span class="time-sep">:</span>
          <input type="number" id="td-min" class="time-unit" value="0" placeholder="00" data-prev="0" oninput="autoToggleAMPM_td(\'start\',this)">
          <div class="ampm-group">
            <button type="button" class="ampm-btn active" id="td-am-btn" onclick="setAMPM_td(\'AM\')">AM</button>
            <button type="button" class="ampm-btn" id="td-pm-btn" onclick="setAMPM_td(\'PM\')">PM</button>
          </div>
        </div>
      </div>
      <div class="form-group form-full">
        <label class="form-label">End Time</label>
        <div class="time-picker-row">
          <input type="number" id="td-ehr" class="time-unit" value="10" placeholder="10" data-prev="10" oninput="autoToggleAMPM_td(\'end\',this)">
          <span class="time-sep">:</span>
          <input type="number" id="td-emin" class="time-unit" value="0" placeholder="00" data-prev="0" oninput="autoToggleAMPM_td(\'end\',this)">
          <div class="ampm-group">
            <button type="button" class="ampm-btn active" id="td-eam-btn" onclick="setEndAMPM_td(\'AM\')">AM</button>
            <button type="button" class="ampm-btn" id="td-epm-btn" onclick="setEndAMPM_td(\'PM\')">PM</button>
          </div>
        </div>
      </div>
      <div class="form-group form-full">
        <label class="form-label">Event Color</label>
        <div class="color-picker-row" id="td-color-picker"></div>
      </div>
      <div class="form-group form-full">
        <label class="form-label">&#128276; Reminder</label>
        <select class="form-input" id="td-reminder" style="cursor:pointer">
          <option value="">No reminder</option>
          <option value="0">At time of event</option>
          <option value="5">5 minutes before</option>
          <option value="10" selected>10 minutes before</option>
          <option value="15">15 minutes before</option>
          <option value="30">30 minutes before</option>
          <option value="60">1 hour before</option>
          <option value="120">2 hours before</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline btn-sm" onclick="tdDelete()" style="color:var(--red);border-color:rgba(248,81,73,.3);margin-right:auto">&#10005; Delete</button>
      <button class="btn btn-outline" onclick="closeModal(\'taskdetail\')">Cancel</button>
      <button class="btn btn-primary" onclick="tdSave()">&#10003; Save</button>
    </div>''')

# ── 2. Fix Reassign modal title (has 2x FFFD) ─────────────────────────────────
patch("fix reassign modal title",
    f'<div class="modal-title">{FFFD}{FFFD} Reassign Sub-Task</div>',
    '<div class="modal-title">&#128197; Reassign Sub-Task</div>')

# ── 3. Fix Add Task modal title (1x FFFD) ────────────────────────────────────
patch("fix add task modal title",
    f'<div class="modal-title">{FFFD} Add Task</div>',
    '<div class="modal-title">&#43; Add Task</div>')

# ── 4. Replace any remaining FFFD sequences with clean alternatives ───────────
# Count remaining FFFD
remaining = c.count(FFFD)
sys.stdout.buffer.write(f"Remaining FFFD chars: {remaining}\n".encode('utf-8'))
# Replace isolated ones in JS contexts with empty string (safe - these are in emoji/icon slots)
c = c.replace(FFFD, '')

# ── 5. Bump version ───────────────────────────────────────────────────────────
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)
with open(src, 'w', encoding='utf-8') as f:
    f.write(c)
sys.stdout.buffer.write(f"Version: v{ts}. Length: {len(c)}\n".encode('utf-8'))
if misses:
    sys.stdout.buffer.write(f"MISSED: {misses}\n".encode('utf-8'))
    sys.exit(1)
sys.stdout.buffer.write(b"All OK\n")
