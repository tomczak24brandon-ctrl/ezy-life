const fs = require('fs');
const f = 'C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html';
let t = fs.readFileSync(f, 'utf8');

const rep = (a, b) => { const c = t.split(a).join(b); if (c === t) console.warn('NO MATCH:', a.substring(0, 60)); t = c; };

// note modal JS
rep(".textContent = '?? Edit Note';", ".textContent = '📝 Edit Note';");
rep(".textContent = '?? New Note';", ".textContent = '📝 New Note';");

// pin button
rep("'?? Unpin' : '?? Pin'", "'📌 Unpin' : '📌 Pin'");

// group icons - home blocks
rep("var icons = { trading:'??', life:'??', tools:'??' }", "var icons = { trading:'📈', life:'🌱', tools:'🛠️' }");

// hb-edit-btn
rep(`'\')">??</button>' +`, `'\')">✏️</button>' +`);

// _HIE_EMOJIS
rep(`var _HIE_EMOJIS = ['??','?','??','??','??','??','?','??','??','??','??','??','???','??','??','???','??','??','??','??','??','??','??','??','??','??','??','??','??','???'];`,
    `var _HIE_EMOJIS = ['🏠','🎯','📅','📝','📈','🚗','🏢','🦅','🚛','🗂️','📋','💳','📓','⚙️','🖨️','❤️','💼','🎨','⭐','💰','📌','🔧','🌱','📊','📁','🔑','🔒','👤','💡','⏳'];`);

// openCatModal lines (two separate lines in function body)
rep("  _newCatEmoji='??';", "  _newCatEmoji='⭐';");
rep("  document.getElementById('new-cat-emoji').textContent='??';", "  document.getElementById('new-cat-emoji').textContent='⭐';");
// addCat inline reset
rep("_newCatEmoji='??'; document.getElementById('new-cat-emoji').textContent='??';", "_newCatEmoji='⭐'; document.getElementById('new-cat-emoji').textContent='⭐';");

// vehicle emoji
rep("document.getElementById('v-emoji').value = '??';", "document.getElementById('v-emoji').value = '🚗';");
rep("emoji: document.getElementById('v-emoji').value.trim() || '??'", "emoji: document.getElementById('v-emoji').value.trim() || '🚗'");

// vehicles empty state
rep(`innerHTML = '<div class="empty-state"><div class="empty-icon">??</div><div class="empty-text">No vehicles yet.`, `innerHTML = '<div class="empty-state"><div class="empty-icon">🚗</div><div class="empty-text">No vehicles yet.`);

// receipt tags
rep("'>?? Receipt</span>'", "'>🧾 Receipt</span>'");
rep(">??</span>':'') + '</td></tr>'", ">🧾</span>':'') + '</td></tr>'");

// vehicle card default emoji
rep("(v.emoji||'??')", "(v.emoji||'🚗')");

// biz page icons map (exact strings)
rep(`'biz-bn1':  { name: "B&N Properties #1",     icon: '??', showInventory: false, showMileage: false },`, `'biz-bn1':  { name: "B&N Properties #1",     icon: '🏢', showInventory: false, showMileage: false },`);
rep(`'biz-bn2':  { name: "B&N Properties #2",     icon: '??', showInventory: false, showMileage: false },`, `'biz-bn2':  { name: "B&N Properties #2",     icon: '🏢', showInventory: false, showMileage: false },`);
rep(`'biz-ietc': { name: "Iron Eagle Truck Center", icon: '??', showInventory: true,  showMileage: true  },`, `'biz-ietc': { name: "Iron Eagle Truck Center", icon: '🦅', showInventory: true,  showMileage: true  },`);
rep(`'biz-ietl': { name: "Iron Eagle Truck Lines",  icon: '??', showInventory: false, showMileage: true  }`, `'biz-ietl': { name: "Iron Eagle Truck Lines",  icon: '🚛', showInventory: false, showMileage: true  }`);

// balance sheet empty state
rep(`style="font-size:32px">??</div><div class="empty-text">Full balance sheet`, `style="font-size:32px">📊</div><div class="empty-text">Full balance sheet`);

// fin coming soon
rep(`'<div style="font-size:24px;text-align:center;margin-bottom:6px">??</div>' +`, `'<div style="font-size:24px;text-align:center;margin-bottom:6px">📊</div>' +`);

// receipts empty
rep(`style="font-size:32px">??</div><div class="empty-text">No receipts stored yet.`, `style="font-size:32px">🧾</div><div class="empty-text">No receipts stored yet.`);

// mileage log header
rep(`'<div style="font-size:16px;font-weight:700">?? Mileage Log</div>' +`, `'<div style="font-size:16px;font-weight:700">🚗 Mileage Log</div>' +`);

// mileage print report button
rep(`onclick="printMileageReport()">??? Print Report</button>`, `onclick="printMileageReport()">🖨️ Print Report</button>`);

// fin account icon default
rep("(a.icon||'??')", "(a.icon||'💳')");

// budget empty state
rep(`'<div class="empty-state"><div class="empty-icon">??</div><div class="empty-text">No categories yet`, `'<div class="empty-state"><div class="empty-icon">📊</div><div class="empty-text">No categories yet`);

// budget edit button
rep(`onclick="editBudgetItem(' + i + ')">??</button>' +`, `onclick="editBudgetItem(' + i + ')">✏️</button>' +`);

// fin icons map
rep("var icons = { checkbook:'??', credit:'??', budget:'??' };", "var icons = { checkbook:'📒', credit:'💳', budget:'📊' };");
rep("icon: icons[type]||'??'", "icon: icons[type]||'💳'");

// login page title
rep("textContent = '?? EZY Life';", "textContent = '🏠 EZY Life';");

// goals tab defaults array
rep("var _goalsTabDefaults = ['?? Active Goals', '?? All Goals', '? Complete goals'];", "var _goalsTabDefaults = ['🎯 Active Goals', '📋 All Goals', '✅ Complete goals'];");

// inline modal titles
rep('<div class="modal-title">?? Add Vehicle</div>', '<div class="modal-title">🚗 Add Vehicle</div>');
rep('<div class="modal-title">?? Add Maintenance Record</div>', '<div class="modal-title">🔧 Add Maintenance Record</div>');
rep('<div class="modal-title">?? Add Income / Expense</div>', '<div class="modal-title">💰 Add Income / Expense</div>');
rep('<div class="modal-title">?? Create Work Order</div>', '<div class="modal-title">📋 Create Work Order</div>');
rep('<div class="modal-title">?? Add Inventory Item</div>', '<div class="modal-title">📦 Add Inventory Item</div>');
rep('<div class="modal-title">?? Log Mileage</div>', '<div class="modal-title">🚗 Log Mileage</div>');

// v-emoji placeholder
rep('placeholder="??" autocomplete="off" style="font-size:20px"', 'placeholder="🚗" autocomplete="off" style="font-size:20px"');

fs.writeFileSync(f, t, 'utf8');
const remaining = (t.match(/\?\?/g)||[]).length;
console.log('Remaining ?? count:', remaining);
