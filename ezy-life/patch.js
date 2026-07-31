const fs = require('fs');
let c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');
const orig = c.length;

function rep(label, oldStr, newStr) {
  if (c.includes(oldStr)) {
    c = c.split(oldStr).join(newStr);
    console.log(label + ': OK');
  } else {
    console.log(label + ': NOT FOUND');
    // Show a snippet around expected location for debugging
    const key = oldStr.slice(0, 40);
    const idx = c.indexOf(key);
    if (idx >= 0) {
      console.log('  (partial match at idx ' + idx + '):');
      console.log('  ' + JSON.stringify(c.slice(idx, idx + 120)));
    }
  }
}

const CR = '\r\n';
const B = '\r\n\r\n';

// 1. Sidebar items
rep('1. Sidebar items',
  "      { id:'timeblocking', icon:'\u23f3', label:'Time Blocking' }," + B +
  "      { id:'calendar',     icon:'\ud83d\udcc5', label:'Calendar' }," + B +
  "      { id:'notes',        icon:'\ud83d\udcdd', label:'Notes' }",
  "      { id:'calendar', icon:'\ud83d\udcc5', label:'Calendar', externalUrl:'https://calendar.google.com', target:'_blank' }"
);

// 2. Title/subtitle map
rep('2. Title map',
  "    timeblocking: ['Time Blocking','']," + B +
  "    calendar:     ['Calendar','Monthly overview']," + B +
  "    notes:        ['Notes','Quick notes & ideas'],",
  "    calendar:     ['Calendar','Google Calendar'],"
);

// 3. Topbar action buttons
rep('3. Topbar buttons',
  "  } else if (id === 'timeblocking') {" + B +
  "    prependBtn('<button class=\"btn btn-outline btn-sm\" onclick=\"printPage()\">\ud83d\udda8\ufe0f Print</button>');" + B +
  "  } else if (id === 'notes') {" + B +
  "    prependBtn('<button class=\"btn btn-primary\" onclick=\"openNoteModal(null)\">+ Note</button>');" + B +
  "  }",
  "  }"
);

// 4. Page init calls
rep('4. Page init calls',
  "  if (id === 'calendar') { if(!_calDate)_calDate=new Date(); renderCalendar(); }" + B +
  "  if (id === 'goals') { renderKanban(); goalsGoTab(_goalsTabIdx); goalsCarouselInit(); goalsLoadTabs(); }" + B +
  "  if (id === 'notes') {" + CR +
  "    // Refresh Google Tasks notes then render" + CR +
  "    fetchGoogleNotes().then(function() { renderNotes(); });" + CR +
  "  }",
  "  if (id === 'goals') { renderKanban(); goalsGoTab(_goalsTabIdx); goalsCarouselInit(); goalsLoadTabs(); }"
);

// 5. showPage timeblocking block
rep('5. showPage TB logic',
  "  var isTimblocking = (id === 'timeblocking');" + B +
  "  var mc = document.getElementById('main-content');" + B +
  "  var tb = document.getElementById('page-timeblocking');" + B +
  "  mc.style.display = isTimblocking ? 'none' : 'block';" + B +
  "  var mainEl = document.querySelector('.main');" + B +
  "  if (mainEl) mainEl.classList.toggle('tb-mode', isTimblocking);" + B +
  "  if (isTimblocking) {" + B +
  "    tb.classList.add('active');" + B +
  "    // Refresh Google Calendar events then render" + CR +
  "    fetchGoogleEvents(_gcalAnchor || new Date()).then(function() {" + CR +
  "      renderGCal();" + CR +
  "    });" + B +
  "  } else {" + B +
  "    tb.classList.remove('active');" + B +
  "  }" + B +
  "  if (!isTimblocking) {" + B +
  "    document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });" + B +
  "    var pg = document.getElementById('page-'+id);" + B +
  "    if (pg) pg.classList.add('active');" + B +
  "  }",
  "  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });" + B +
  "  var pg = document.getElementById('page-'+id);" + B +
  "  if (pg) pg.classList.add('active');"
);

// 6. App init fetches
rep('6. App init fetches',
  "          // After app init, load Google Calendar events for today and Google Tasks notes" + CR +
  "          fetchGoogleEvents(new Date()).then(function() {" + CR +
  "            if (typeof renderGCal === 'function') renderGCal();" + CR +
  "          });" + CR +
  "          fetchGoogleNotes().then(function() {" + CR +
  "            if (typeof renderNotes === 'function') renderNotes();" + CR +
  "          });",
  "          // Google Calendar / Tasks fetches removed (views removed)"
);

console.log('Length:', orig, '->', c.length);
fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', c, 'utf8');
console.log('Written.');
