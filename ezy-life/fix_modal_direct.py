import re, time, sys

src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
with open(src, 'r', encoding='utf-8') as f:
    c = f.read()

# Normalize: strip \r, collapse 3+ newlines to 2
c = re.sub(r'\r', '', c)
c = re.sub(r'\n{3,}', '\n\n', c)

# ── Direct targeted replace using regex with DOTALL ───────────────────────────
# Replace everything inside modal-taskdetail from after </div> (subtitle) to </div></div> (modal close)

# Strategy: find the modal block and replace it entirely
OLD_PAT = (
    r'<!-- TASK DETAIL / EDIT -->\n'
    r'<div class="modal-overlay" id="modal-taskdetail" style="display:none">\n\n'
    r'  <div class="modal">\n\n'
    r'    <button class="close-btn" onclick="closeModal\(\'taskdetail\'\)">&#10005;</button>\n\n'
    r'    <div class="modal-title">&#9998; Edit Task</div>\n\n'
    r'    <div class="modal-sub"[^>]*>.*?</div>\n\n'
    r'.*?'  # everything in the stripped body
    r'    </div>\n\n'  # modal-footer close
    r'  </div>\n\n'
    r'</div>'
)

NEW_MODAL = (
    '<!-- TASK DETAIL / EDIT (unified) -->\n'
    '<div class="modal-overlay" id="modal-taskdetail" style="display:none">\n'
    '  <div class="modal">\n'
    '    <button class="close-btn" onclick="closeModal(\'taskdetail\')">&#10005;</button>\n'
    '    <div class="modal-title">&#9998; Edit Task</div>\n'
    '    <div class="modal-sub" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">Date: '
    '<input type="date" id="td-date-input" style="border:2px solid var(--accent2);border-radius:10px;'
    'padding:8px 16px;font-size:18px;font-weight:700;color:#ffffff;background:var(--card);'
    'cursor:pointer;outline:none;min-width:180px;min-height:42px;" '
    'onclick="try{this.showPicker()}catch(e){}"></div>\n'
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
    '    </div>\n'
    '  </div>\n'
    '</div>'
)

m = re.search(OLD_PAT, c, re.DOTALL)
if m:
    c = c[:m.start()] + NEW_MODAL + c[m.end():]
    sys.stdout.buffer.write(b"OK: taskdetail modal full replacement\n")
else:
    # Fallback: replace just the stripped section between subtitle and end of modal
    # Find the start (after the modal-sub div) and end (</div></div> that closes this modal)
    MARKER_START = 'onclick="try{this.showPicker()}catch(e){}"></div>'
    MARKER_END = '</div>\n\n<!-- REASSIGN -->'
    si = c.find(MARKER_START)
    ei = c.find(MARKER_END)
    if si >= 0 and ei >= 0:
        new_mid = (
            '\n'
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
            '    </div>\n'
            '  </div>\n'
            '</div>'
        )
        # Find the actual end: the </div></div></div> block closing this modal
        # from MARKER_START end, find the next '</div>\n\n<!-- REASSIGN -->'
        replace_start = si + len(MARKER_START)
        c = c[:replace_start] + new_mid + '\n\n' + c[ei + len('</div>\n\n'):]
        sys.stdout.buffer.write(b"OK: taskdetail modal body (fallback marker splice)\n")
    else:
        sys.stdout.buffer.write(f"MISS: modal markers not found. si={si} ei={ei}\n".encode('utf-8'))

# ── Fix reassign modal ─────────────────────────────────────────────────────────
m2 = re.search(r'<div class="modal-title">\?\? Reassign Sub-Task</div>', c)
if m2:
    c = c[:m2.start()] + '<div class="modal-title">&#128197; Reassign Sub-Task</div>' + c[m2.end():]
    sys.stdout.buffer.write(b"OK: reassign title\n")
else:
    sys.stdout.buffer.write(b"MISS: reassign title\n")

# ── Fix add task modal ────────────────────────────────────────────────────────
m3 = re.search(r'<div class="modal-title">\? Add Task</div>', c)
if m3:
    c = c[:m3.start()] + '<div class="modal-title">&#43; Add Task</div>' + c[m3.end():]
    sys.stdout.buffer.write(b"OK: add task title\n")
else:
    sys.stdout.buffer.write(b"MISS: add task title\n")

# ── Verify key IDs present ────────────────────────────────────────────────────
for key in ['td-hr', 'td-am-btn', 'td-color-picker', 'td-reminder', 'td-sub-list', 'td-sub-input']:
    found = key in c
    sys.stdout.buffer.write(f"CHECK {key}: {found}\n".encode('utf-8'))

# ── Bump version ──────────────────────────────────────────────────────────────
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', '<!-- v' + str(ts) + ' -->', c)
with open(src, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)
sys.stdout.buffer.write(f"Version: v{ts}. Length: {len(c)}\n".encode('utf-8'))
sys.stdout.buffer.write(b"Done\n")
