
function setFinTab(tab) {

  _currentFinTab = tab;

  _currentFinAccountId = null;

  ['personal','ietc','bn1','bn2'].forEach(function(t) {

    var el = document.getElementById('fin-tab-' + t);

    if (el) el.classList.toggle('active', t === tab);

  });

  renderFinPage();

}

function renderFinPage() {

  var wrap = document.getElementById('fin-content');

  if (!wrap) return;

  var accounts = _finAccounts[_currentFinTab] || [];

  // If viewing a specific account

  if (_currentFinAccountId) {

    var acct = accounts.find(function(a){ return a.id === _currentFinAccountId; });

    if (acct) { renderFinAccount(acct); return; }

  }

  // Show account cards grid

  var html = '<div class="fin-accounts-grid">';

  accounts.forEach(function(a) {

    var bal = getAccountBalance(a);

    var balColor = bal >= 0 ? 'var(--green)' : 'var(--red)';

    var typeLabel = { checkbook: 'Checkbook', credit: 'Credit Card Ledger', budget: 'Budget' }[a.type] || a.type;

    html += '<div class="fin-account-card" onclick="openFinAccount(\'' + a.id + '\')">' +

      '<div class="fin-account-icon">' + (a.icon||'💳') + '</div>' +

      '<div class="fin-account-name">' + esc(a.name) + '</div>' +

      '<div class="fin-account-type">' + typeLabel + '</div>' +

      '<div class="fin-account-balance" style="color:' + balColor + '">$' + Math.abs(bal).toFixed(2) + (bal < 0 ? ' <span style="font-size:12px;color:var(--red)">overdue</span>' : '') + '</div>' +

      '</div>';

  });

  html += '<div class="fin-add-card" onclick="openAddFinAccountModal()"><div style="font-size:28px;margin-bottom:8px">+</div><div style="font-size:13px;font-weight:600">Add Account</div></div>';

  html += '</div>';

  wrap.innerHTML = html;

}

function getAccountBalance(acct) {

  if (acct.type === 'budget') return 0;

  var bal = parseFloat(acct.openingBalance || 0);

  (acct.transactions || []).forEach(function(t) {

    var amt = parseFloat(t.amount || 0);

    if (acct.type === 'credit') {

      // credit card: charges increase balance (what you owe), payments decrease

      if (t.type === 'debit') bal += amt; else bal -= amt;

    } else {

      if (t.type === 'credit') bal += amt; else bal -= amt;

    }

  });

  return bal;

}

function openFinAccount(id) {

  _currentFinAccountId = id;

  var accounts = _finAccounts[_currentFinTab] || [];

  var acct = accounts.find(function(a){ return a.id === id; });

  if (!acct) return;

  if (acct.type === 'budget') {

    _currentBudgetMonth = _currentBudgetMonth || getCurrentMonthKey();

  }

  renderFinAccount(acct);

}

function getCurrentMonthKey() {

  var d = new Date();

  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');

}

function getMonthLabel(key) {

  var parts = key.split('-');

  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return months[parseInt(parts[1])-1] + ' ' + parts[0];

}

function renderFinAccount(acct) {

  var wrap = document.getElementById('fin-content');

  if (!wrap) return;

  var backBtn = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">' +

    '<button class="btn btn-outline btn-sm" onclick="_currentFinAccountId=null;renderFinPage()">? Back</button>' +

    '<div style="font-size:18px;font-weight:800">' + (acct.icon||'') + ' ' + esc(acct.name) + '</div>' +

    '<button class="btn btn-outline btn-sm" style="margin-left:auto;color:var(--red)" onclick="deleteFinAccount(\'' + acct.id + '\')">Delete</button>' +

    '</div>';

  if (acct.type === 'budget') {

    renderBudgetAccount(acct, wrap, backBtn);

  } else {

    renderLedgerAccount(acct, wrap, backBtn);

  }

}

function renderLedgerAccount(acct, wrap, backBtn) {

  var txns = acct.transactions || [];

  var bal = parseFloat(acct.openingBalance || 0);

  var isCredit = acct.type === 'credit';

  var rows = txns.map(function(t) {

    var amt = parseFloat(t.amount || 0);

    if (isCredit) {

      if (t.type === 'debit') bal += amt; else bal -= amt;

    } else {

      if (t.type === 'credit') bal += amt; else bal -= amt;

    }

    return { t: t, bal: bal };

  });

  var currentBal = bal;

  var totalCredits = txns.filter(function(t){return t.type==='credit';}).reduce(function(s,t){return s+parseFloat(t.amount||0);},0);

  var totalDebits = txns.filter(function(t){return t.type==='debit';}).reduce(function(s,t){return s+parseFloat(t.amount||0);},0);

  var balLabel = isCredit ? 'Balance Owed' : 'Current Balance';

  var creditLabel = isCredit ? 'Payments' : 'Deposits';

  var debitLabel = isCredit ? 'Charges' : 'Payments';

  var html = backBtn +

    '<div class="fin-stat-row" style="margin-bottom:16px">' +

    '<div class="fin-stat"><div class="fin-stat-label">' + balLabel + '</div><div class="fin-stat-value ' + (currentBal >= 0 ? (isCredit ? 'red' : 'green') : (isCredit ? 'green' : 'red')) + '">' + (currentBal < 0 ? '-' : '') + '$' + Math.abs(currentBal).toFixed(2) + '</div></div>' +

    '<div class="fin-stat"><div class="fin-stat-label">' + creditLabel + '</div><div class="fin-stat-value green">$' + totalCredits.toFixed(2) + '</div></div>' +

    '<div class="fin-stat"><div class="fin-stat-label">' + debitLabel + '</div><div class="fin-stat-value red">$' + totalDebits.toFixed(2) + '</div></div>' +

    '</div>' +

    '<div style="display:flex;gap:10px;align-items:center;margin-bottom:14px">' +

    '<div style="display:flex;align-items:center;gap:8px"><label style="font-size:13px;color:var(--text2)">Opening Balance:</label><input class="form-input" type="number" value="' + parseFloat(acct.openingBalance||0).toFixed(2) + '" style="width:120px" onchange="setFinOpeningBal(\'' + acct.id + '\',this.value)"></div>' +

    '<button class="btn btn-primary" style="margin-left:auto" onclick="openLedgerModal()">+ Add Transaction</button>' +

    '</div>' +

    '<div class="table-wrap"><div class="ledger-row ledger-hdr"><span>Date</span><span>Description</span><span>Category</span><span>' + creditLabel + '</span><span>' + debitLabel + '</span><span>Check #</span><span>Balance</span></div>';

  if (!rows.length) {

    html += '<div style="text-align:center;color:var(--text3);padding:20px">No transactions yet.</div>';

  } else {

    html += rows.slice().reverse().map(function(row) {

      var t = row.t, b = row.bal;

      var isC = t.type === 'credit';

      return '<div class="ledger-row"><span>' + esc(t.date||'') + '</span><span>' + esc(t.desc||'') + '</span>' +

        '<span style="font-size:11px;color:var(--text3)">' + esc(t.cat||'') + '</span>' +

        '<span class="ledger-credit">' + (isC ? '$' + parseFloat(t.amount).toFixed(2) : '') + '</span>' +

        '<span class="ledger-debit">' + (!isC ? '$' + parseFloat(t.amount).toFixed(2) : '') + '</span>' +

        '<span style="font-size:12px;color:var(--text3)">' + esc(t.checknum||'') + '</span>' +

        '<span class="ledger-balance" style="color:' + (b >= 0 ? (isCredit ? 'var(--red)' : 'var(--green)') : (isCredit ? 'var(--green)' : 'var(--red)')) + '">$' + b.toFixed(2) + '</span></div>';

    }).join('');

  }

  html += '</div>';

  wrap.innerHTML = html;

}

function renderBudgetAccount(acct, wrap, backBtn) {

  if (!acct.budgetData) acct.budgetData = {};

  var month = _currentBudgetMonth || getCurrentMonthKey();

  if (!acct.budgetData[month]) acct.budgetData[month] = [];

  var items = acct.budgetData[month];

  // Build month tabs (last 6 + next 3 months)

  var now = new Date();

  var monthKeys = [];

  for (var i = -5; i <= 3; i++) {

    var d = new Date(now.getFullYear(), now.getMonth() + i, 1);

    monthKeys.push(d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'));

  }

  var monthTabsHtml = '<div class="month-tabs">' + monthKeys.map(function(mk) {

    return '<div class="month-tab' + (mk === month ? ' active' : '') + '" onclick="setFinBudgetMonth(\'' + acct.id + '\',\'' + mk + '\')">' + getMonthLabel(mk) + '</div>';

  }).join('') + '</div>';

  var totalBudgeted = items.reduce(function(s,x){return s+parseFloat(x.budgeted||0);},0);

  var totalActual = items.reduce(function(s,x){return s+parseFloat(x.actual||0);},0);

  var html = backBtn + monthTabsHtml +

    '<div class="fin-stat-row" style="margin-bottom:16px">' +

    '<div class="fin-stat"><div class="fin-stat-label">Budgeted</div><div class="fin-stat-value blue">$' + totalBudgeted.toFixed(2) + '</div></div>' +

    '<div class="fin-stat"><div class="fin-stat-label">Spent</div><div class="fin-stat-value ' + (totalActual > totalBudgeted ? 'red' : 'green') + '">$' + totalActual.toFixed(2) + '</div></div>' +

    '<div class="fin-stat"><div class="fin-stat-label">Remaining</div><div class="fin-stat-value ' + (totalBudgeted - totalActual >= 0 ? 'green' : 'red') + '">' + (totalBudgeted-totalActual<0?'-':'') + '$' + Math.abs(totalBudgeted-totalActual).toFixed(2) + '</div></div>' +

    '</div>' +

    '<div style="display:flex;justify-content:flex-end;margin-bottom:14px"><button class="btn btn-primary" onclick="openBudgetItemModal()">+ Add Category</button></div>';

  if (!items.length) {

    html += '<div class="empty-state"><div class="empty-icon">📊</div><div class="empty-text">No categories yet for ' + getMonthLabel(month) + '.</div></div>';

  } else {

    html += items.map(function(item, i) {

      var pct = item.budgeted > 0 ? Math.min(100, Math.round(parseFloat(item.actual||0) / parseFloat(item.budgeted) * 100)) : 0;

      var barClass = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'ok';

      return '<div class="budget-category"><div class="budget-cat-hdr">' +

        '<div><div class="budget-cat-name">' + esc(item.cat) + '</div><div style="font-size:11px;color:var(--text3)">' + esc(item.period||'Monthly') + '</div></div>' +

        '<div style="display:flex;gap:8px;align-items:center"><span style="font-size:13px;font-weight:700;color:var(--text2)">$' + parseFloat(item.actual||0).toFixed(2) + ' / $' + parseFloat(item.budgeted||0).toFixed(2) + '</span>' +

        '<button class="btn btn-outline btn-sm" onclick="editBudgetItem(' + i + ')">✏️</button>' +

        '<button class="btn btn-outline btn-sm" onclick="deleteBudgetItem(' + i + ')" style="color:var(--red)">?</button></div></div>' +

        '<div class="budget-bar-wrap"><div class="budget-bar ' + barClass + '" style="width:' + pct + '%"></div></div>' +

        '<div style="font-size:11px;color:var(--text3);text-align:right">' + pct + '% used' + (item.notes ? ' &middot; ' + esc(item.notes) : '') + '</div></div>';

    }).join('');

  }

  wrap.innerHTML = html;

}

function setFinBudgetMonth(acctId, month) {

  _currentBudgetMonth = month;

  var accounts = _finAccounts[_currentFinTab] || [];

  var acct = accounts.find(function(a){ return a.id === acctId; });

  if (acct) renderBudgetAccount(acct, document.getElementById('fin-content'), '<div style="display:flex;align-items:center;gap:12px;margin-bottom:18px"><button class="btn btn-outline btn-sm" onclick="_currentFinAccountId=null;renderFinPage()">? Back</button><div style="font-size:18px;font-weight:800">' + (acct.icon||'') + ' ' + esc(acct.name) + '</div><button class="btn btn-outline btn-sm" style="margin-left:auto;color:var(--red)" onclick="deleteFinAccount(\'' + acct.id + '\')">Delete</button></div>');

}

function setFinOpeningBal(acctId, val) {

  var accounts = _finAccounts[_currentFinTab] || [];

  var acct = accounts.find(function(a){ return a.id === acctId; });

  if (acct) { acct.openingBalance = parseFloat(val)||0; saveData(); renderLedgerAccount(acct, document.getElementById('fin-content'), ''); }

}

function deleteFinAccount(id) {

  if (!confirm('Delete this account and all its data?')) return;

  _finAccounts[_currentFinTab] = (_finAccounts[_currentFinTab]||[]).filter(function(a){ return a.id !== id; });

  _currentFinAccountId = null;

  saveData(); renderFinPage();

}

// Add account modal

function openAddFinAccountModal() { showModal('addfin'); }

function saveFinAccount() {

  var name = document.getElementById('fin-acct-name').value.trim();

  var type = document.getElementById('fin-acct-type').value;

  if (!name) { alert('Enter an account name.'); return; }

  var icons = { checkbook:'📒', credit:'💳', budget:'📊' };

  var acct = { id: 'fin-' + Date.now(), name: name, type: type, icon: icons[type]||'💳', openingBalance: 0, transactions: [], budgetData: {} };

  if (!_finAccounts[_currentFinTab]) _finAccounts[_currentFinTab] = [];

  _finAccounts[_currentFinTab].push(acct);

  saveData(); closeModal('addfin'); renderFinPage();

}

// Budget items (reuse existing modal)

function openBudgetItemModal(editIdx) {

  _budgetItemEdit = editIdx !== undefined ? editIdx : null;

  var accounts = _finAccounts[_currentFinTab] || [];

  var acct = accounts.find(function(a){ return a.id === _currentFinAccountId; });

  var month = _currentBudgetMonth || getCurrentMonthKey();

  var items = (acct && acct.budgetData && acct.budgetData[month]) || [];

  var item = _budgetItemEdit !== null ? items[_budgetItemEdit] : null;

  document.getElementById('budgetitem-title').textContent = item ? 'Edit Category' : 'Add Budget Category';

  document.getElementById('bi-cat').value = item ? item.cat : '';

  document.getElementById('bi-budgeted').value = item ? item.budgeted : '';

  document.getElementById('bi-actual').value = item ? item.actual : '';

  document.getElementById('bi-notes').value = item ? item.notes : '';

  if (item && document.getElementById('bi-period')) document.getElementById('bi-period').value = item.period || 'Monthly';

  showModal('budgetitem');

}

function editBudgetItem(i) { openBudgetItemModal(i); }

function saveBudgetItem() {

  var cat = document.getElementById('bi-cat').value.trim();

  if (!cat) { alert('Enter a category name.'); return; }

  var accounts = _finAccounts[_currentFinTab] || [];

  var acct = accounts.find(function(a){ return a.id === _currentFinAccountId; });

  if (!acct) return;

  var month = _currentBudgetMonth || getCurrentMonthKey();

  if (!acct.budgetData) acct.budgetData = {};

  if (!acct.budgetData[month]) acct.budgetData[month] = [];

  var item = { cat: cat, budgeted: document.getElementById('bi-budgeted').value.replace(/[$,]/g,''), actual: document.getElementById('bi-actual').value.replace(/[$,]/g,''), period: document.getElementById('bi-period').value, notes: document.getElementById('bi-notes').value };

  if (_budgetItemEdit !== null) acct.budgetData[month][_budgetItemEdit] = item;

  else acct.budgetData[month].push(item);

  saveData(); closeModal('budgetitem'); openFinAccount(_currentFinAccountId);

}

function deleteBudgetItem(i) {

  if (!confirm('Delete this category?')) return;

  var accounts = _finAccounts[_currentFinTab] || [];

  var acct = accounts.find(function(a){ return a.id === _currentFinAccountId; });

  var month = _currentBudgetMonth || getCurrentMonthKey();

  if (acct && acct.budgetData && acct.budgetData[month]) {

    acct.budgetData[month].splice(i, 1);

    saveData(); openFinAccount(_currentFinAccountId);

  }

}

// Ledger (reuse modal, but save to new structure)

function openLedgerModal() {

  document.getElementById('lt-date').value = new Date().toISOString().slice(0,10);

  ['lt-desc','lt-amount','lt-cat','lt-checknum'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});

  document.getElementById('lt-receipt').value = '';

  showModal('ledger');

}

function saveLedgerTransaction() {

  var accounts = _finAccounts[_currentFinTab] || [];

  var acct = accounts.find(function(a){ return a.id === _currentFinAccountId; });

  if (!acct) return;

  if (!acct.transactions) acct.transactions = [];

  var receiptFile = document.getElementById('lt-receipt').files[0];

  var txn = {

    id: Date.now(), date: document.getElementById('lt-date').value,

    type: document.getElementById('lt-type').value,

    desc: document.getElementById('lt-desc').value,

    amount: document.getElementById('lt-amount').value.replace(/[$,]/g,''),

    cat: document.getElementById('lt-cat').value,

    checknum: document.getElementById('lt-checknum').value,

    receiptData: null

  };

  function finish() { acct.transactions.push(txn); saveData(); closeModal('ledger'); openFinAccount(_currentFinAccountId); }

  if (receiptFile) { var r=new FileReader(); r.onload=function(e){txn.receiptData=e.target.result;finish();}; r.readAsDataURL(receiptFile); }

  else finish();

}

// loadBudget / loadCheckbook stubs for compatibility

function loadBudget(key) {}

function loadCheckbook(key) { loadBudget(key); }

function renderBudget() {}

function renderCheckbook() {}


// --- window exports ---
if (typeof setFinTab !== 'undefined') window.setFinTab = setFinTab;
if (typeof renderFinPage !== 'undefined') window.renderFinPage = renderFinPage;
if (typeof openFinAccount !== 'undefined') window.openFinAccount = openFinAccount;
if (typeof renderFinAccount !== 'undefined') window.renderFinAccount = renderFinAccount;
if (typeof setFinBudgetMonth !== 'undefined') window.setFinBudgetMonth = setFinBudgetMonth;
if (typeof setFinOpeningBal !== 'undefined') window.setFinOpeningBal = setFinOpeningBal;
if (typeof deleteFinAccount !== 'undefined') window.deleteFinAccount = deleteFinAccount;
if (typeof openAddFinAccountModal !== 'undefined') window.openAddFinAccountModal = openAddFinAccountModal;
if (typeof saveFinAccount !== 'undefined') window.saveFinAccount = saveFinAccount;
if (typeof openBudgetItemModal !== 'undefined') window.openBudgetItemModal = openBudgetItemModal;
if (typeof editBudgetItem !== 'undefined') window.editBudgetItem = editBudgetItem;
if (typeof saveBudgetItem !== 'undefined') window.saveBudgetItem = saveBudgetItem;
if (typeof deleteBudgetItem !== 'undefined') window.deleteBudgetItem = deleteBudgetItem;
if (typeof openLedgerModal !== 'undefined') window.openLedgerModal = openLedgerModal;
if (typeof saveLedgerTransaction !== 'undefined') window.saveLedgerTransaction = saveLedgerTransaction;
if (typeof renderBudget !== 'undefined') window.renderBudget = renderBudget;
if (typeof renderCheckbook !== 'undefined') window.renderCheckbook = renderCheckbook;
if (typeof getCurrentMonthKey !== 'undefined') window.getCurrentMonthKey = getCurrentMonthKey;
if (typeof getMonthLabel !== 'undefined') window.getMonthLabel = getMonthLabel;
if (typeof getAccountBalance !== 'undefined') window.getAccountBalance = getAccountBalance;
