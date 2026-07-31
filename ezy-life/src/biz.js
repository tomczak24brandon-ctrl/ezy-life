
function getBizData(id) {

  if (!_bizData[id]) _bizData[id] = { income: [], workorders: [], inventory: [], mileage: [], woCounter: 1 };

  return _bizData[id];

}

var BIZ_CONFIG = {

  'biz-bn1':  { name: "B&N Properties #1",     icon: '🏢', showInventory: false, showMileage: false },

  'biz-bn2':  { name: "B&N Properties #2",     icon: '🏢', showInventory: false, showMileage: false },

  'biz-ietc': { name: "Iron Eagle Truck Center", icon: '🦅', showInventory: true,  showMileage: true  },

  'biz-ietl': { name: "Iron Eagle Truck Lines",  icon: '🚛', showInventory: false, showMileage: true  }

};

function renderBizPage(bizId) {

  _currentBizId = bizId;

  var cfg = BIZ_CONFIG[bizId];

  var data = getBizData(bizId);

  var containerId = 'biz-content-' + bizId.replace('biz-','');

  var container = document.getElementById(containerId);

  if (!container) return;

  var tabs = ['income','balance','receipts','workorders'];

  if (cfg.showInventory) tabs.push('inventory');

  if (cfg.showMileage) tabs.push('mileage');

  var tabLabels = { income:'Income Statement', balance:'Balance Sheet', receipts:'Receipts', workorders:'Work Orders', inventory:'Inventory', mileage:'Mileage Log' };

  var tabsHtml = '<div class="biz-tabs">' + tabs.map(function(t) {

    return '<div class="biz-tab' + (t===_currentBizTab?' active':'') + '" onclick="setBizTab(\'' + bizId + '\',\'' + t + '\')">' + tabLabels[t] + '</div>';

  }).join('') + '</div>';

  var income = data.income.filter(function(x){ return x.type==='income'; });

  var expenses = data.income.filter(function(x){ return x.type==='expense'; });

  var totalIncome = income.reduce(function(s,x){ return s+parseFloat(x.amount||0); },0);

  var totalExpenses = expenses.reduce(function(s,x){ return s+parseFloat(x.amount||0); },0);

  var netIncome = totalIncome - totalExpenses;

  var incomeHtml = '<div class="biz-section active" id="biz-sec-income">' +

    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +

    '<div style="font-size:16px;font-weight:700">Income Statement</div>' +

    '<button class="btn btn-primary btn-sm" onclick="openBizIncomeModal()">+ Add Entry</button></div>' +

    '<div class="fin-stat-row">' +

    '<div class="fin-stat"><div class="fin-stat-label">Total Revenue</div><div class="fin-stat-value green">$' + totalIncome.toFixed(2) + '</div></div>' +

    '<div class="fin-stat"><div class="fin-stat-label">Total Expenses</div><div class="fin-stat-value red">$' + totalExpenses.toFixed(2) + '</div></div>' +

    '<div class="fin-stat"><div class="fin-stat-label">Net Income</div><div class="fin-stat-value ' + (netIncome>=0?'green':'red') + '">' + (netIncome<0?'-':'') + '$' + Math.abs(netIncome).toFixed(2) + '</div></div>' +

    '</div>' +

    '<div class="table-wrap"><div class="table-header"><div class="table-title">Transactions</div></div>' +

    '<table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount</th><th>Receipt</th></tr></thead><tbody>' +

    (data.income.length ? data.income.slice().reverse().map(function(x) {

      var isIncome = x.type==='income';

      return '<tr><td>' + (x.date||'') + '</td><td><span class="lt-badge ' + (isIncome?'lt':'st') + '">' + (isIncome?'Income':'Expense') + '</span></td><td>' + esc(x.category||'') + '</td><td>' + esc(x.desc||'') + '</td><td class="' + (isIncome?'gain':'loss') + '">' + (isIncome?'+':'-') + '$' + parseFloat(x.amount||0).toFixed(2) + '</td><td>' + (x.receiptData?'<span class="receipt-tag" onclick="viewBizReceipt(\'' + bizId + '\',' + x.id + ')">🧾</span>':'') + '</td></tr>';

    }).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:20px">No entries yet.</td></tr>') +

    '</tbody></table></div></div>';

  var balanceHtml = '<div class="biz-section" id="biz-sec-balance">' +

    '<div style="font-size:16px;font-weight:700;margin-bottom:16px">Balance Sheet</div>' +

    '<div class="fin-stat-row">' +

    '<div class="fin-stat"><div class="fin-stat-label">Total Revenue (YTD)</div><div class="fin-stat-value green">$' + totalIncome.toFixed(2) + '</div></div>' +

    '<div class="fin-stat"><div class="fin-stat-label">Total Expenses (YTD)</div><div class="fin-stat-value red">$' + totalExpenses.toFixed(2) + '</div></div>' +

    '<div class="fin-stat"><div class="fin-stat-label">Net Position</div><div class="fin-stat-value ' + (netIncome>=0?'green':'red') + '">' + (netIncome<0?'-':'') + '$' + Math.abs(netIncome).toFixed(2) + '</div></div>' +

    '</div>' +

    '<div class="empty-state" style="padding:30px 0"><div class="empty-icon" style="font-size:32px">📊</div><div class="empty-text">Full balance sheet with assets & liabilities coming soon.</div></div>' +

    '</div>';

  var receiptsHtml = '<div class="biz-section" id="biz-sec-receipts">' +

    '<div style="font-size:16px;font-weight:700;margin-bottom:16px">Receipts</div>' +

    '<div style="display:flex;flex-wrap:wrap;gap:12px">' +

    data.income.filter(function(x){ return x.receiptData; }).map(function(x) {

      return '<div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:12px;min-width:150px;cursor:pointer" onclick="viewBizReceipt(\'' + bizId + '\',' + x.id + ')">' +

        '<div style="font-size:24px;text-align:center;margin-bottom:6px">📊</div>' +

        '<div style="font-size:12px;font-weight:600">' + esc(x.desc||x.category||'Receipt') + '</div>' +

        '<div style="font-size:11px;color:var(--text3)">' + (x.date||'') + '</div>' +

        '<div style="font-size:11px;color:var(--text3)">$' + parseFloat(x.amount||0).toFixed(2) + '</div>' +

        '</div>';

    }).join('') +

    (data.income.filter(function(x){ return x.receiptData; }).length===0?'<div class="empty-state" style="padding:20px 0;width:100%"><div class="empty-icon" style="font-size:32px">🧾</div><div class="empty-text">No receipts stored yet.</div></div>':'') +

    '</div></div>';

  var woHtml = '<div class="biz-section" id="biz-sec-workorders">' +

    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +

    '<div style="font-size:16px;font-weight:700">Work Orders</div>' +

    '<button class="btn btn-primary btn-sm" onclick="openWorkOrderModal()">+ New Work Order</button></div>' +

    '<div class="table-wrap"><table><thead><tr><th>WO #</th><th>Date</th><th>Customer</th><th>Description</th><th>Status</th><th>Est.</th><th>Actual</th></tr></thead><tbody>' +

    (data.workorders.length ? data.workorders.slice().reverse().map(function(wo) {

      var statusColor = {Open:'var(--yellow)',Done:'var(--green)','In Progress':'var(--accent2)','On Hold':'var(--text3)'}[wo.status]||'var(--text3)';

      return '<tr><td><strong>#' + wo.num + '</strong></td><td>' + (wo.date||'') + '</td><td>' + esc(wo.customer||'') + '</td><td>' + esc((wo.desc||'').slice(0,40)) + '</td><td><span style="color:' + statusColor + ';font-weight:700">' + esc(wo.status) + '</span></td><td>' + (wo.est?'$'+wo.est:'') + '</td><td>' + (wo.actual?'$'+wo.actual:'') + '</td></tr>';

    }).join('') : '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:20px">No work orders yet.</td></tr>') +

    '</tbody></table></div></div>';

  var invHtml = '';

  if (cfg.showInventory) {

    var totalInvValue = data.inventory.reduce(function(s,x){ return s+parseFloat(x.price||0)*parseInt(x.qty||0); },0);

    var totalInvCost = data.inventory.reduce(function(s,x){ return s+parseFloat(x.cost||0)*parseInt(x.qty||0); },0);

    invHtml = '<div class="biz-section" id="biz-sec-inventory">' +

      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +

      '<div><div style="font-size:16px;font-weight:700">Inventory</div><div style="font-size:12px;color:var(--text3)">' + data.inventory.length + ' items &middot; Retail Value: $' + totalInvValue.toFixed(2) + ' &middot; Cost: $' + totalInvCost.toFixed(2) + '</div></div>' +

      '<button class="btn btn-primary btn-sm" onclick="openInventoryModal()">+ Add Item</button></div>' +

      '<div class="table-wrap"><div class="inv-row inv-hdr"><span>Part / Description</span><span>Part #</span><span>Condition</span><span>Qty</span><span>Price</span><span>Location</span></div>' +

      (data.inventory.length ? data.inventory.map(function(item) {

        return '<div class="inv-row"><span><strong>' + esc(item.name) + '</strong><div style="font-size:11px;color:var(--text3)">' + (item.notes?esc(item.notes.slice(0,50)):'') + '</div></span><span>' + esc(item.partnum||'') + '</span><span>' + esc(item.condition||'') + '</span><span style="font-weight:700">' + (item.qty||0) + '</span><span style="color:var(--green);font-weight:700">$' + parseFloat(item.price||0).toFixed(2) + '</span><span>' + esc(item.location||'') + '</span></div>';

      }).join('') : '<div style="text-align:center;color:var(--text3);padding:20px">No inventory items yet.</div>') +

      '</div></div>';

  }

  var mileageHtml = '';

  if (cfg.showMileage) {

    var totalMiles = data.mileage.reduce(function(s,x){ return s+parseFloat(x.miles||0); },0);

    var mileRate = 0.70; // 2025 IRS rate

    mileageHtml = '<div class="biz-section" id="biz-sec-mileage">' +

      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +

      '<div><div style="font-size:16px;font-weight:700">🚗 Mileage Log</div>' +

      '<div style="font-size:12px;color:var(--text3)">' + totalMiles.toFixed(1) + ' total miles &middot; Est. deduction: $' + (totalMiles*mileRate).toFixed(2) + ' (@ $' + mileRate + '/mi IRS 2025)</div></div>' +

      '<div style="display:flex;gap:8px"><button class="btn btn-primary btn-sm" onclick="openMileageModal()">+ Log Miles</button><button class="btn btn-outline btn-sm" onclick="printMileageReport()">🖨️ Print Report</button></div></div>' +

      '<div class="table-wrap"><table><thead><tr><th>Date</th><th>From</th><th>To</th><th>Purpose</th><th>Miles</th><th>Deduction</th></tr></thead><tbody>' +

      (data.mileage.length ? data.mileage.slice().reverse().map(function(m) {

        var miles = parseFloat(m.miles||0);

        return '<tr><td>' + (m.date||'') + '</td><td>' + esc(m.from||'') + '</td><td>' + esc(m.to||'') + '</td><td>' + esc(m.purpose||'') + '</td><td style="font-weight:700;color:var(--accent2)">' + miles.toFixed(1) + '</td><td style="color:var(--green)">$' + (miles*mileRate).toFixed(2) + '</td></tr>';

      }).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:20px">No mileage logged yet.</td></tr>') +

      '</tbody></table></div></div>';

  }

  container.innerHTML = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px"><div style="font-size:32px">' + cfg.icon + '</div><div><div style="font-size:22px;font-weight:800">' + cfg.name + '</div></div></div>' +

    tabsHtml + incomeHtml + balanceHtml + receiptsHtml + woHtml + invHtml + mileageHtml;

  setBizTab(bizId, _currentBizTab, true);

}

function setBizTab(bizId, tab, noRender) {

  _currentBizTab = tab;

  if (!noRender) { renderBizPage(bizId); return; }

  var sections = ['income','balance','receipts','workorders','inventory','mileage'];

  sections.forEach(function(s) {

    var el = document.getElementById('biz-sec-' + s);

    if (el) el.className = 'biz-section' + (s===tab?' active':'');

  });

  var tabs2 = document.querySelectorAll('.biz-tab');

  var labels = {income:'Income Statement',balance:'Balance Sheet',receipts:'Receipts',workorders:'Work Orders',inventory:'Inventory',mileage:'Mileage Log'};

  tabs2.forEach(function(t) { t.classList.toggle('active', t.textContent.trim()===labels[tab]); });

}

function openBizIncomeModal() { showModal('addincome'); }

function saveBizTransaction() {

  var biz = getBizData(_currentBizId);

  var type = document.getElementById('ie-type').value;

  var cat = type==='income'?document.getElementById('ie-income-cat').value:document.getElementById('ie-expense-cat').value;

  var receiptFile = document.getElementById('ie-receipt').files[0];

  var entry = {

    id: Date.now(), type: type, date: document.getElementById('ie-date').value,

    category: cat, desc: document.getElementById('ie-desc').value,

    amount: document.getElementById('ie-amount').value.replace(/[$,]/g,''),

    receiptName: receiptFile?receiptFile.name:null, receiptData: null

  };

  function finish() { biz.income.push(entry); saveData(); closeModal('addincome'); renderBizPage(_currentBizId); }

  if (receiptFile) {

    var r=new FileReader(); r.onload=function(e){entry.receiptData=e.target.result;finish();}; r.readAsDataURL(receiptFile);

  } else finish();

}

function viewBizReceipt(bizId, entryId) {

  var data = getBizData(bizId);

  var entry = data.income.find(function(x){return x.id===entryId;});

  if (!entry||!entry.receiptData){alert('No receipt stored.');return;}

  var win=window.open();

  if(entry.receiptData.startsWith('data:image')) win.document.write('<img src="'+entry.receiptData+'" style="max-width:100%">');

  else win.location=entry.receiptData;

}


// --- window exports ---
if (typeof getBizData !== 'undefined') window.getBizData = getBizData;
if (typeof renderBizPage !== 'undefined') window.renderBizPage = renderBizPage;
if (typeof setBizTab !== 'undefined') window.setBizTab = setBizTab;
if (typeof openBizIncomeModal !== 'undefined') window.openBizIncomeModal = openBizIncomeModal;
if (typeof saveBizTransaction !== 'undefined') window.saveBizTransaction = saveBizTransaction;
if (typeof viewBizReceipt !== 'undefined') window.viewBizReceipt = viewBizReceipt;
