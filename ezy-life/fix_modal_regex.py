import re, time, sys

src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
with open(src, 'r', encoding='utf-8') as f:
    c = f.read()

# Normalize line endings: collapse any \r and multiple blank lines
c = re.sub(r'\r', '', c)
c = re.sub(r'\n{3,}', '\n\n', c)

ok = True
misses = []
def patch(label, old, new):
    global c, ok
    if old in c:
        c = c.replace(old, new, 1)
        sys.stdout.buffer.write(("OK: " + label + "\n").encode('utf-8'))
    else:
        sys.stdout.buffer.write(("MISS: " + label + "\n").encode('utf-8'))
        misses.append(label)
        ok = False

def rpatch(label, pattern, new, flags=0):
    global c, ok
    m = re.search(pattern, c, flags)
    if m:
        c = c[:m.start()] + new + c[m.end():]
        sys.stdout.buffer.write(("OK: " + label + "\n").encode('utf-8'))
    else:
        sys.stdout.buffer.write(("MISS (regex): " + label + "\n").encode('utf-8'))
        misses.append(label)
        ok = False

# ── 1. Replace the stripped modal body using regex ────────────────────────────
# Match everything from <div class="form-group" ...Title... through the footer </div>
BODY_PATTERN = (
    r'    <div class="form-group" style="margin-bottom:12px">\s*'
    r'<label class="form-label">Title</label>\s*'
    r'<input class="form-input" id="td-title-input" placeholder="Task title">\s*'
    r'</div>\s*'
    r'<div id="td-subs-section"[^>]*></div>\s*'
    r'<div class="modal-footer">\s*'
    r'<button[^>]*tdDelete[^>]*>\?\?\? Delete</button>\s*'
    r'<button[^>]*closeModal\(\'taskdetail\'\)[^>]*>Close</button>\s*'
    r'<button[^>]*tdSave[^>]*>&#10003; Save</button>\s*'
    r'</div>'
)

NEW_BODY = (
    '    <div class="form-grid">\n'
    '      <div class="form-group form-full"><label class="form-label">Task Title</label>'
    '<input class="form-input" id="td-title-input" placeholder="Task title"></div>\n'
    '      <div class="form-group form-full">\n'
    '        <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;'
    'letter-spacing:.5px;margin-bottom:8px">Sub-Tasks '
    '<span style="font-weight:400;text-transform:none">(optional)</span></div>\n'
    '        <div id="td-sub-list" style="margin-bottom:8px"></div>\n'
    '        <div style="display:flex;gap:8px">\n'
    '          <input class="form-input" id="td-sub-input" placeholder="Add a sub-task..." '
    'style="flex:1" onkeydown="if(event.key===\'Enter\'){event.preventDefault();tdAddSub()}">\n'
    '          <button class="btn btn-outline btn-sm" onclick="tdAddSub()">+ Add</button>\n'
    '        </div>\n'
    '      </div>\n'
    '      <div class="form-group form-full">\n'
    '        <label class="form-label">Start Time</label>\n'
    '        <div class="time-picker-row">\n'
    '          <input type="number" id="td-hr" class="time-unit" value="9" placeholder="9" '
    'data-prev="9" oninput="autoToggleAMPM_td(\'start\',this)">\n'
    '          <span class="time-sep">:</span>\n'
    '          <input type="number" id="td-min" class="time-unit" value="0" placeholder="00" '
    'data-prev="0" oninput="autoToggleAMPM_td(\'start\',this)">\n'
    '          <div class="ampm-group">\n'
    '            <button type="button" class="ampm-btn active" id="td-am-btn" '
    'onclick="setAMPM_td(\'AM\')">AM</button>\n'
    '            <button type="button" class="ampm-btn" id="td-pm-btn" '
    'onclick="setAMPM_td(\'PM\')">PM</button>\n'
    '          </div>\n'
    '        </div>\n'
    '      </div>\n'
    '      <div class="form-group form-full">\n'
    '        <label class="form-label">End Time</label>\n'
    '        <div class="time-picker-row">\n'
    '          <input type="number" id="td-ehr" class="time-unit" value="10" placeholder="10" '
    'data-prev="10" oninput="autoToggleAMPM_td(\'end\',this)">\n'
    '          <span class="time-sep">:</span>\n'
    '          <input type="number" id="td-emin" class="time-unit" value="0" placeholder="00" '
    'data-prev="0" oninput="autoToggleAMPM_td(\'end\',this)">\n'
    '          <div class="ampm-group">\n'
    '            <button type="button" class="ampm-btn active" id="td-eam-btn" '
    'onclick="setEndAMPM_td(\'AM\')">AM</button>\n'
    '            <button type="button" class="ampm-btn" id="td-epm-btn" '
    'onclick="setEndAMPM_td(\'PM\')">PM</button>\n'
    '          </div>\n'
    '        </div>\n'
    '      </div>\n'
    '      <div class="form-group form-full">\n'
    '        <label class="form-label">Event Color</label>\n'
    '        <div class="color-picker-row" id="td-color-picker"></div>\n'
    '      </div>\n'
    '      <div class="form-group form-full">\n'
    '        <label class="form-label">&#128276; Reminder</label>\n'
    '        <select class="form-input" id="td-reminder" style="cursor:pointer">\n'
    '          <option value="">No reminder</option>\n'
    '          <option value="0">At time of event</option>\n'
    '          <option value="5">5 minutes before</option>\n'
    '          <option value="10" selected>10 minutes before</option>\n'
    '          <option value="15">15 minutes before</option>\n'
    '          <option value="30">30 minutes before</option>\n'
    '          <option value="60">1 hour before</option>\n'
    '          <option value="120">2 hours before</option>\n'
    '        </select>\n'
    '      </div>\n'
    '    </div>\n'
    '    <div class="modal-footer">\n'
    '      <button class="btn btn-outline btn-sm" onclick="tdDelete()" '
    'style="color:var(--red);border-color:rgba(248,81,73,.3);margin-right:auto">&#10005; Delete</button>\n'
    '      <button class="btn btn-outline" onclick="closeModal(\'taskdetail\')">Cancel</button>\n'
    '      <button class="btn btn-primary" onclick="tdSave()">&#10003; Save</button>\n'
    '    </div>'
)

rpatch("taskdetail modal body: full replacement", BODY_PATTERN, NEW_BODY, re.DOTALL)

# ── 2. Fix reassign modal title ───────────────────────────────────────────────
rpatch("fix reassign modal title",
    r'<div class="modal-title">\?\? Reassign Sub-Task</div>',
    '<div class="modal-title">&#128197; Reassign Sub-Task</div>')

# ── 3. Fix add task modal title ───────────────────────────────────────────────
rpatch("fix add task modal title",
    r'<div class="modal-title">\? Add Task</div>',
    '<div class="modal-title">&#43; Add Task</div>')

# ── 4. Bump version ───────────────────────────────────────────────────────────
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', '<!-- v' + str(ts) + ' -->', c)
with open(src, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)
sys.stdout.buffer.write(("Version: v" + str(ts) + ". Length: " + str(len(c)) + "\n").encode('utf-8'))
if misses:
    sys.stdout.buffer.write(("MISSED: " + str(misses) + "\n").encode('utf-8'))
    sys.exit(1)
sys.stdout.buffer.write(b"All OK\n")
