import re

with open(r'C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html', 'r', encoding='utf-8') as f:
    c = f.read()

original_len = len(c)

# 1. Sidebar: remove timeblocking + notes items, convert calendar to external link
old = "      { id:'timeblocking', icon:'\u23f3', label:'Time Blocking' },\r\n\r\n      { id:'calendar',     icon:'\U0001f4c5', label:'Calendar' },\r\n\r\n      { id:'notes',        icon:'\U0001f4dd', label:'Notes' }"
new = "      { id:'calendar', icon:'\U0001f4c5', label:'Calendar', externalUrl:'https://calendar.google.com', target:'_blank' }"
if old in c:
    c = c.replace(old, new)
    print('1. Sidebar items: OK')
else:
    print('1. Sidebar items: NOT FOUND')

# 2. Remove the timeblocking + notes entries from the title/subtitle map
old2 = "    timeblocking: ['Time Blocking',''],\r\n\r\n    calendar:     ['Calendar','Monthly overview'],\r\n\r\n    notes:        ['Notes','Quick notes & ideas'],"
new2 = "    calendar:     ['Calendar','Google Calendar'],"
if old2 in c:
    c = c.replace(old2, new2)
    print('2. Title map: OK')
else:
    print('2. Title map: NOT FOUND')

# 3. Remove topbar action buttons for timeblocking and notes
old3 = "  } else if (id === 'timeblocking') {\r\n\r\n    prependBtn('<button class=\"btn btn-outline btn-sm\" onclick=\"printPage()\">\U0001f5a8\ufe0f Print</button>');\r\n\r\n  } else if (id === 'notes') {\r\n\r\n    prependBtn('<button class=\"btn btn-primary\" onclick=\"openNoteModal(null)\">+ Note</button>');\r\n\r\n  }"
new3 = '  }'
if old3 in c:
    c = c.replace(old3, new3)
    print('3. Topbar buttons: OK')
else:
    print('3. Topbar buttons: NOT FOUND')

# 4. Remove if calendar renderCalendar() call and if notes fetchGoogleNotes block
old4 = "  if (id === 'calendar') { if(!_calDate)_calDate=new Date(); renderCalendar(); }\r\n\r\n  if (id === 'goals') { renderKanban(); goalsGoTab(_goalsTabIdx); goalsCarouselInit(); goalsLoadTabs(); }\r\n\r\n  if (id === 'notes') {\r\n    // Refresh Google Tasks notes then render\r\n    fetchGoogleNotes().then(function() { renderNotes(); });\r\n  }"
new4 = "  if (id === 'goals') { renderKanban(); goalsGoTab(_goalsTabIdx); goalsCarouselInit(); goalsLoadTabs(); }"
if old4 in c:
    c = c.replace(old4, new4)
    print('4. Page init calls: OK')
else:
    print('4. Page init calls: NOT FOUND')

# 5. Replace isTimblocking showPage block with simple page activation
old5 = "  var isTimblocking = (id === 'timeblocking');\r\n\r\n  var mc = document.getElementById('main-content');\r\n\r\n  var tb = document.getElementById('page-timeblocking');\r\n\r\n  mc.style.display = isTimblocking ? 'none' : 'block';\r\n\r\n  var mainEl = document.querySelector('.main');\r\n\r\n  if (mainEl) mainEl.classList.toggle('tb-mode', isTimblocking);\r\n\r\n  if (isTimblocking) {\r\n\r\n    tb.classList.add('active');\r\n\r\n    // Refresh Google Calendar events then render\r\n    fetchGoogleEvents(_gcalAnchor || new Date()).then(function() {\r\n      renderGCal();\r\n    });\r\n\r\n  } else {\r\n\r\n    tb.classList.remove('active');\r\n\r\n  }\r\n\r\n  if (!isTimblocking) {\r\n\r\n    document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });\r\n\r\n    var pg = document.getElementById('page-'+id);\r\n\r\n    if (pg) pg.classList.add('active');\r\n\r\n  }"
new5 = "  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });\r\n\r\n  var pg = document.getElementById('page-'+id);\r\n\r\n  if (pg) pg.classList.add('active');"
if old5 in c:
    c = c.replace(old5, new5)
    print('5. showPage TB logic: OK')
else:
    print('5. showPage TB logic: NOT FOUND')

# 6. Remove fetchGoogleEvents/fetchGoogleNotes calls at app init
old6 = "          // After app init, load Google Calendar events for today and Google Tasks notes\r\n          fetchGoogleEvents(new Date()).then(function() {\r\n            if (typeof renderGCal === 'function') renderGCal();\r\n          });\r\n          fetchGoogleNotes().then(function() {\r\n            if (typeof renderNotes === 'function') renderNotes();\r\n          });"
new6 = '          // Google Calendar / Tasks fetches removed (views removed)'
if old6 in c:
    c = c.replace(old6, new6)
    print('6. App init fetches: OK')
else:
    print('6. App init fetches: NOT FOUND')

print(f'Length: {original_len} -> {len(c)}')

with open(r'C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html', 'w', encoding='utf-8') as f:
    f.write(c)
print('Written.')
