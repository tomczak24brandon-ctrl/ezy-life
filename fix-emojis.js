const fs = require('fs');
const buf = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html');
let txt = buf.toString('utf8');

// ── STEP 1: DAILY REVIEW REMOVAL ─────────────────────────────────────────────

// Remove CSS block
txt = txt.replace(/\/\* ===== DAILY REVIEW MODAL ===== \*\/[\s\S]*?#dr-start-btn:disabled\s*\{[^}]*\}\s*/m, '');

// Remove page-goals-main HTML block
txt = txt.replace(/\s*<!-- GOALS MAIN CHECK-IN -->[\s\S]*?<\/div><!-- \/goals-main -->/m, '');

// Remove routing reference
txt = txt.replace(/\s*if \(id === 'goals-main'\) \{ renderGoalsMain\(\); \}/g, '');

// Remove page map entry for goals-main
txt = txt.replace(/\s*'goals-main':\s*\[.*?\],?\s*\n/g, '\n');

// Remove Daily Review JS block (drOpen through legacy stubs)
txt = txt.replace(/\/\/ ===== DAILY GOALS CHECK-IN =====[\s\S]*?function completeDailyCheckin\(\) \{ drClose\(\); \}\s*/m, '');

// Remove checkDailyCheckin() call in init
txt = txt.replace(/\s*checkDailyCheckin\(\);/g, '');

// Remove orphaned modal-daily-review HTML
txt = txt.replace(/\s*<div[^>]*id="modal-daily-review"[\s\S]*?<\/div>\s*(?=<\/body>|<div|$)/m, '\n');

// Also remove any leftover fragment with dr-task-list
txt = txt.replace(/<div[^>]*style="font-size:13px;color:var\(--text3\);margin-bottom:22px;">\s*Check off each[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/m, '');

// ── STEP 2: EMOJI RESTORATION ─────────────────────────────────────────────────

function rep(search, replace) {
  if (txt.includes(search)) {
    txt = txt.split(search).join(replace);
    return true;
  }
  return false;
}

// Nav icons JS objects
rep("{ id:'home', icon:'??', label:'Home' }",            "{ id:'home', icon:'🏠', label:'Home' }");
rep("{ id:'dashboard',  icon:'??', label:'Dashboard' }", "{ id:'dashboard',  icon:'📊', label:'Dashboard' }");
rep("{ id:'journal',    icon:'??', label:'Journal' }",   "{ id:'journal',    icon:'📓', label:'Journal' }");
rep("{ id:'positions',  icon:'??', label:'Open Positions', badge:'5' }", "{ id:'positions',  icon:'📈', label:'Open Positions', badge:'5' }");
rep("{ id:'tax',        icon:'??', label:'Tax Summary', badge:'!', badgeRed:true }", "{ id:'tax',        icon:'🧾', label:'Tax Summary', badge:'!', badgeRed:true }");
rep("{ id:'goals',        icon:'??', label:'Goals' }",   "{ id:'goals',        icon:'🎯', label:'Goals' }");
rep("{ id:'calendar',     icon:'??', label:'Calendar' }","{ id:'calendar',     icon:'📅', label:'Calendar' }");
rep("{ id:'notes',        icon:'??', label:'Notes' }",   "{ id:'notes',        icon:'📝', label:'Notes' }");
rep("{ id:'reports',  icon:'??', label:'Reports' }",     "{ id:'reports',  icon:'📊', label:'Reports' }");
rep("{ id:'settings', icon:'??', label:'Settings' }",    "{ id:'settings', icon:'⚙️', label:'Settings' }");
rep("{ id:'vehicles', icon:'??', label:'My Vehicles' }", "{ id:'vehicles', icon:'🚗', label:'My Vehicles' }");
rep("{ id:'biz-bn1',     icon:'??', label:'B&N Properties #1' }", "{ id:'biz-bn1',     icon:'🏢', label:'B&N Properties #1' }");
rep("{ id:'biz-bn2',     icon:'??', label:'B&N Properties #2' }", "{ id:'biz-bn2',     icon:'🏢', label:'B&N Properties #2' }");
rep("{ id:'biz-ietc',    icon:'??', label:'Iron Eagle Truck Center' }", "{ id:'biz-ietc',    icon:'🦅', label:'Iron Eagle Truck Center' }");
rep("{ id:'biz-ietl',    icon:'??', label:'Iron Eagle Truck Lines' }",  "{ id:'biz-ietl',    icon:'🦅', label:'Iron Eagle Truck Lines' }");
rep("{ id:'fin-budgets', icon:'??', label:'Financials' }","{ id:'fin-budgets', icon:'💰', label:'Financials' }");
rep("{ id:'hobbies', icon:'??', label:'My Hobbies' }",   "{ id:'hobbies', icon:'🎮', label:'My Hobbies' }");

// Default categories
rep("{ id:1, name:'Health',   emoji:'??' }",  "{ id:1, name:'Health',   emoji:'❤️' }");
rep("{ id:2, name:'Finance',  emoji:'??' }",  "{ id:2, name:'Finance',  emoji:'💰' }");
rep("{ id:3, name:'Business', emoji:'??' }",  "{ id:3, name:'Business', emoji:'💼' }");
rep("{ id:4, name:'Personal', emoji:'??' }",  "{ id:4, name:'Personal', emoji:'⭐' }");

// Page title map
rep("home:         ['?? EZY Life','Welcome back']",        "home:         ['🏠 EZY Life','Welcome back']");
rep("vehicles:     ['?? Vehicle Maintenance','Track service history']", "vehicles:     ['🚗 Vehicle Maintenance','Track service history']");
rep("'biz-bn1':    ['?? B&N Properties #1','Business financials']",    "'biz-bn1':    ['🏢 B&N Properties #1','Business financials']");
rep("'biz-bn2':    ['?? B&N Properties #2','Business financials']",    "'biz-bn2':    ['🏢 B&N Properties #2','Business financials']");
rep("'biz-ietc':   ['?? Iron Eagle Truck Center','Business financials']","'biz-ietc':   ['🦅 Iron Eagle Truck Center','Business financials']");
rep("'biz-ietl':   ['?? Iron Eagle Truck Lines','Business financials']", "'biz-ietl':   ['🦅 Iron Eagle Truck Lines','Business financials']");
rep("'fin-budgets':['?? Financials','Budgets, checkbooks & ledgers']",  "'fin-budgets':['💰 Financials','Budgets, checkbooks & ledgers']");
rep("hobbies:      ['?? Hobbies','']",                     "hobbies:      ['🎮 Hobbies','']");

// Business page configs
rep("'biz-bn1':  { name: \"B&N Properties #1\",     icon: '??'", "'biz-bn1':  { name: \"B&N Properties #1\",     icon: '🏢'");
rep("'biz-bn2':  { name: \"B&N Properties #2\",     icon: '??'", "'biz-bn2':  { name: \"B&N Properties #2\",     icon: '🏢'");
rep("'biz-ietc': { name: \"Iron Eagle Truck Center\", icon: '??'","'biz-ietc': { name: \"Iron Eagle Truck Center\", icon: '🦅'");
rep("'biz-ietl': { name: \"Iron Eagle Truck Lines\",  icon: '??'","'biz-ietl': { name: \"Iron Eagle Truck Lines\",  icon: '🦅'");

// Fin/home icons
rep("var icons = { checkbook:'??', credit:'??', budget:'??' }", "var icons = { checkbook:'📒', credit:'💳', budget:'📊' }");
rep("var icons = { trading:'??', life:'??', tools:'???' }",     "var icons = { trading:'📈', life:'🌿', tools:'🔧' }");
rep("|| { emoji: '??', name: 'General' }",  "|| { emoji: '⭐', name: 'General' }");
rep("|| {emoji:'??',name:'General'}",        "|| {emoji:'⭐',name:'General'}");
rep("(item.icon||'??')",                     "(item.icon||'⭐')");
rep("(a.icon||'??')",                        "(a.icon||'💰')");
rep("(v.emoji||'??')",                       "(v.emoji||'🚗')");
rep("icon: icons[type]||'??'",              "icon: icons[type]||'💰'");

// HTML UI elements
rep("<span class=\"gsearch-icon\">??</span>",            "<span class=\"gsearch-icon\">🔍</span>");
rep("<div class=\"tax-banner-title\">?? Estimated Tax", "<div class=\"tax-banner-title\">🧾 Estimated Tax");
rep("onclick=\"goalsGoTab(0)\">?? Active Goals",         "onclick=\"goalsGoTab(0)\">🎯 Active Goals");
rep("onclick=\"goalsGoTab(1)\">?? All Categories",       "onclick=\"goalsGoTab(1)\">📋 All Categories");
rep("onclick=\"goalsGoTab(2)\">?? Complete",             "onclick=\"goalsGoTab(2)\">✅ Complete");
rep("<div class=\"goals-year-title\">??? Archive</div>", "<div class=\"goals-year-title\">🗂️ Archive</div>");
rep("placeholder=\"?? Search notes...\"",                "placeholder=\"🔍 Search notes...\"");
rep("<div class=\"notes-section-label\">?? Pinned</div>","<div class=\"notes-section-label\">📌 Pinned</div>");
rep("<div class=\"empty-notes-icon\">??</div>",          "<div class=\"empty-notes-icon\">📝</div>");
rep(">?? Google Calendar Sync</div>",                    ">📅 Google Calendar Sync</div>");
rep(">?? Connect Google Calendar</button>",              ">🔗 Connect Google Calendar</button>");
rep(">?? Vehicle Maintenance</div>",                     ">🚗 Vehicle Maintenance</div>");
rep(">?? Financials</div>",                              ">💰 Financials</div>");
rep(">?? Hobbies</div>",                                 ">🎮 Hobbies</div>");
rep("\"empty-icon\">??</div><div class=\"empty-text\">No hobbies", "\"empty-icon\">🎮</div><div class=\"empty-text\">No hobbies");
rep("onclick=\"printPage()\">??</button>",               "onclick=\"printPage()\">🖨️</button>");
rep("onclick=\"hieTab('emoji')\">?? Choose Emoji",       "onclick=\"hieTab('emoji')\">😊 Choose Emoji");
rep("onclick=\"hieTab('image')\">??? Upload Image",      "onclick=\"hieTab('image')\">🖼️ Upload Image");
rep("<div style=\"font-size:28px;margin-bottom:6px\">??</div>", "<div style=\"font-size:28px;margin-bottom:6px\">😊</div>");
rep("<div class=\"modal-title\">?? Forgot Password</div>","<div class=\"modal-title\">🔑 Forgot Password</div>");
rep("<div class=\"modal-title\">?? Forgot Username</div>","<div class=\"modal-title\">👤 Forgot Username</div>");
rep("<div class=\"modal-title\">?? Log a Buy</div>",     "<div class=\"modal-title\">📈 Log a Buy</div>");
rep(">?? Thesis</label>",   ">💡 Thesis</label>");
rep(">?? Valuation Notes</label>", ">📋 Valuation Notes</label>");
rep("<div class=\"modal-title\">?? Log a Sell</div>",    "<div class=\"modal-title\">📉 Log a Sell</div>");
rep(">?? Why did you sell?</label>", ">💬 Why did you sell?</label>");
rep("<div class=\"modal-title\">?? Add Goal</div>",      "<div class=\"modal-title\">🎯 Add Goal</div>");
rep("<div class=\"modal-title\">?? Goal Detail</div>",   "<div class=\"modal-title\">🎯 Goal Detail</div>");
rep("<div class=\"modal-title\">?? Goal Categories</div>","<div class=\"modal-title\">📂 Goal Categories</div>");
rep("id=\"note-modal-ttl\">?? Note</div>",               "id=\"note-modal-ttl\">📝 Note</div>");
rep("id=\"nm-pin-btn\" onclick=\"nmTogglePin()\">?? Pin</button>", "id=\"nm-pin-btn\" onclick=\"nmTogglePin()\">📌 Pin</button>");
rep("<div class=\"modal-title\">?? Reassign Sub-Task</div>","<div class=\"modal-title\">🔄 Reassign Sub-Task</div>");
rep("<div class=\"modal-title\">?? Add Vehicle</div>",   "<div class=\"modal-title\">🚗 Add Vehicle</div>");
rep("<div class=\"modal-title\">?? Add Maintenance Record</div>","<div class=\"modal-title\">🔧 Add Maintenance Record</div>");
rep("<div class=\"modal-title\">?? Add Income / Expense</div>","<div class=\"modal-title\">💰 Add Income / Expense</div>");
rep("<div class=\"modal-title\">?? Create Work Order</div>","<div class=\"modal-title\">📋 Create Work Order</div>");
rep("<div class=\"modal-title\">?? Add Inventory Item</div>","<div class=\"modal-title\">📦 Add Inventory Item</div>");
rep("<div class=\"modal-title\">??? Log Mileage</div>",  "<div class=\"modal-title\">🚙 Log Mileage</div>");

// JS strings
rep("textContent = '?? EZY Life';",                 "textContent = '🏠 EZY Life';");
rep("textContent = '?? Edit Note';",                "textContent = '📝 Edit Note';");
rep("textContent = '?? New Note';",                 "textContent = '📝 New Note';");
rep("_nmPinned ? '?? Unpin' : '?? Pin';",           "_nmPinned ? '📌 Unpin' : '📌 Pin';");
rep("_nmPinned ? '?? Unpin' : '?? Pin')",           "_nmPinned ? '📌 Unpin' : '📌 Pin')");
rep("\"note-pinned-icon\">?? Pinned</span>'",        "\"note-pinned-icon\">📌 Pinned</span>'");
rep("'?? Unpin':'?? Pin'",   "'📌 Unpin':'📌 Pin'");
rep("?? All goals complete!","✅ All goals complete!");
rep("?? Receipt",            "🧾 Receipt");
rep("prependBtn('<button class=\"btn btn-outline btn-sm\" onclick=\"printPage()\">?? Print</button>');", "prependBtn('<button class=\"btn btn-outline btn-sm\" onclick=\"printPage()\">🖨️ Print</button>');");
rep("prompt('Emoji for new page (e.g. ??)", "prompt('Emoji for new page (e.g. 😊)");
rep("var _newCatEmoji = '???';",  "var _newCatEmoji = '😊';");
rep("_newCatEmoji='???';",        "_newCatEmoji='😊';");
rep("cat-emoji-btn\" id=\"new-cat-emoji\" onclick=\"toggleEP('new')\">???</button>","cat-emoji-btn\" id=\"new-cat-emoji\" onclick=\"toggleEP('new')\">😊</button>");
rep(".textContent='???';",   ".textContent='😊';");
rep("document.getElementById('v-emoji').value = '??';", "document.getElementById('v-emoji').value = '🚗';");
rep("emoji: document.getElementById('v-emoji').value.trim() || '??',","emoji: document.getElementById('v-emoji').value.trim() || '🚗',");
rep("placeholder=\"e.g. ??\"", "placeholder=\"e.g. 🚗\"");
rep("'<div class=\"empty-icon\" style=\"font-size:32px\">??</div>","'<div class=\"empty-icon\" style=\"font-size:32px\">📂</div>");
rep("font-size:24px;text-align:center;margin-bottom:6px\">??</div>'","font-size:24px;text-align:center;margin-bottom:6px\">💰</div>'");
rep("font-size:16px;font-weight:700\">??? Mileage Log</div>'","font-size:16px;font-weight:700\">🚙 Mileage Log</div>'");
rep("\"empty-icon\">??</div><div class=\"empty-text\">No vehicles yet.","\"empty-icon\">🚗</div><div class=\"empty-text\">No vehicles yet.");
rep("html += '<div class=\"empty-state\"><div class=\"empty-icon\">??</div><div class=\"empty-text\">No categories yet","html += '<div class=\"empty-state\"><div class=\"empty-icon\">📂</div><div class=\"empty-text\">No categories yet");
rep("style=\"color:var(--red)\">??</button>'\n","style=\"color:var(--red)\">🗑️</button>'\n");
rep("style=\"color:var(--red)\">??</button>\"","style=\"color:var(--red)\">🗑️</button>\"");
rep(">??</button>",   ">✏️</button>");
rep("rawIcon = _homeIcons[g.id] || icons[g.id] || '??';","rawIcon = _homeIcons[g.id] || icons[g.id] || '⭐';");
rep("'<div class=\"home-block-icon\">??</div>'","'<div class=\"home-block-icon\">⭐</div>'");
rep("var icon=document.getElementById('ql-selected-icon').value||'??';","var icon=document.getElementById('ql-selected-icon').value||'⭐';");

// Submenu card icon fallback
rep("(item.icon||'??')", "(item.icon||'⭐')");

// Large emoji arrays — replace entire variable lines
txt = txt.replace(/var _SGITEM_EMOJIS = \[[\s\S]*?\];/, "var _SGITEM_EMOJIS = ['⭐','🎯','📌','💡','🏆','✅','🔥','💪','🌟','📈','🎓','🛠️','💰','🏠','🚗','🏋️','🎵','📚','✈️','🌿'];");
txt = txt.replace(/var _HIE_EMOJIS = \[[\s\S]*?\];/, "var _HIE_EMOJIS = ['🏠','⭐','🎯','📌','💡','🏆','✅','🔥','💪','🌟','📈','🎓','🛠️','💰','🚗','🏋️','🎵','📚','✈️','🌿','🎮','🐾','🍕','🌍','💼','🎨','🔑','📊','🧘','🏖️'];");

// Emoji picker category rows — replace full lines
txt = txt.replace(/\{ icon:'[?]+', label:'Smileys', emojis:\[[\s\S]*?\]\}/m,   "{ icon:'😊', label:'Smileys', emojis:['😊','😂','🥰','😎','🤔','😅','🤣','😍','🥳','😤','😢','😡','🤯','😴','🤗','😇','🤩','🥺','😬','😏'] }");
txt = txt.replace(/\{ icon:'[?]+', label:'People', emojis:\[[\s\S]*?\]\}/m,    "{ icon:'👤', label:'People', emojis:['👤','👥','🧑','👩','👨','🧒','👧','👦','🧓','👴','👵','🧑‍💼','👩‍💼','👨‍💼','🧑‍🎓','👩‍🎓','👨‍🎓','🧑‍🔧','👩‍🔧','👨‍🔧'] }");
txt = txt.replace(/\{ icon:'[?]+', label:'Animals', emojis:\[[\s\S]*?\]\}/m,   "{ icon:'🐾', label:'Animals', emojis:['🐾','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦆'] }");
txt = txt.replace(/\{ icon:'[?]+', label:'Food', emojis:\[[\s\S]*?\]\}/m,      "{ icon:'🍕', label:'Food', emojis:['🍕','🍔','🌮','🍜','🍣','🍦','🎂','🍎','🍊','🍋','🍇','🍓','🥑','🥦','🥕','🌽','🍞','🧀','🥚','🍳'] }");
txt = txt.replace(/\{ icon:'[?]+', label:'Travel', emojis:\[[\s\S]*?\]\}/m,    "{ icon:'✈️', label:'Travel', emojis:['✈️','🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🚲','🛴','🛺'] }");
txt = txt.replace(/\{ icon:'[?]', label:'Sports', emojis:\[[\s\S]*?\]\}/m,     "{ icon:'⚽', label:'Sports', emojis:['⚽','🏀','🏈','⚾','🥎','🏐','🏉','🎾','🏸','🏒','🏑','🥍','🏓','🥊','🥋','🎽','🛹','🛼','⛷️','🏄'] }");
txt = txt.replace(/\{ icon:'[?]+', label:'Objects', emojis:\[[\s\S]*?\]\}/m,   "{ icon:'🛠️', label:'Objects', emojis:['🛠️','💡','🔑','🔒','💻','📱','⌨️','🖥️','🖨️','📷','📸','📹','🎥','📺','📻','🎵','🎶','🎸','🎹','🎺'] }");
txt = txt.replace(/\{ icon:'[?]+', label:'Symbols', emojis:\[[\s\S]*?\]\}/m,   "{ icon:'✅', label:'Symbols', emojis:['✅','❌','⭐','🔥','💯','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💝'] }");

// Final check
const remaining = (txt.match(/\?\?/g)||[]).length;
console.log('Remaining ?? count:', remaining);
console.log('Has Daily Review:', txt.includes('Daily Review'));
console.log('Has checkDailyCheckin:', txt.includes('checkDailyCheckin'));
console.log('Has drOpen:', txt.includes('function drOpen'));
console.log('Has 🎯:', txt.includes('🎯'));
console.log('Has 🏠:', txt.includes('🏠'));
console.log('Has ✅:', txt.includes('✅'));

// Save strict UTF-8, no BOM
fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', txt, {encoding:'utf8'});
console.log('Saved:', Buffer.byteLength(txt,'utf8'), 'bytes');
