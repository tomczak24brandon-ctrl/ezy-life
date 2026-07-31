
function openAddVehicleModal() {

  ['v-year','v-make','v-model','v-color','v-plate','v-vin','v-mileage'].forEach(function(id){

    var el = document.getElementById(id); if(el) el.value='';

  });

  document.getElementById('v-emoji').value = '🚗';

  showModal('addvehicle');

}

function saveVehicle() {

  var year = document.getElementById('v-year').value.trim();

  var make = document.getElementById('v-make').value.trim();

  var model = document.getElementById('v-model').value.trim();

  if (!make || !model) { alert('Please enter make and model.'); return; }

  var v = {

    id: Date.now(),

    year: year, make: make, model: model,

    color: document.getElementById('v-color').value.trim(),

    plate: document.getElementById('v-plate').value.trim(),

    vin: document.getElementById('v-vin').value.trim(),

    mileage: parseInt(document.getElementById('v-mileage').value)||0,

    emoji: document.getElementById('v-emoji').value.trim() || '🚗',

    maintenance: []

  };

  _vehicles.push(v);

  saveData();

  closeModal('addvehicle');

  renderVehicles();

}

function openAddMaintModal(vehicleId) {

  _maintVehicleId = vehicleId;

  var v = _vehicles.find(function(x){ return x.id===vehicleId; });

  if (v) document.getElementById('maint-vehicle-sub').textContent = v.year + ' ' + v.make + ' ' + v.model;

  ['m-custom','m-shop','m-notes','m-cost'].forEach(function(id){

    var el=document.getElementById(id); if(el) el.value='';

  });

  document.getElementById('m-mileage-done').value = v ? v.mileage : '';

  document.getElementById('m-next-mileage').value = '';

  document.getElementById('m-date').value = new Date().toISOString().slice(0,10);

  document.getElementById('m-next-date').value = '';

  document.getElementById('m-receipt').value = '';

  showModal('addmaint');

}

function saveMaint() {

  var v = _vehicles.find(function(x){ return x.id===_maintVehicleId; });

  if (!v) return;

  var typeEl = document.getElementById('m-type');

  var type = typeEl.value === 'Other' ? (document.getElementById('m-custom').value||'Other') : typeEl.value;

  var receiptFile = document.getElementById('m-receipt').files[0];

  var rec = {

    id: Date.now(),

    type: type,

    dateDone: document.getElementById('m-date').value,

    mileageDone: parseInt(document.getElementById('m-mileage-done').value)||0,

    nextDate: document.getElementById('m-next-date').value,

    nextMileage: parseInt(document.getElementById('m-next-mileage').value)||0,

    cost: document.getElementById('m-cost').value,

    shop: document.getElementById('m-shop').value,

    notes: document.getElementById('m-notes').value,

    receiptName: receiptFile ? receiptFile.name : null,

    receiptData: null

  };

  if (receiptFile) {

    var reader = new FileReader();

    reader.onload = function(e) {

      rec.receiptData = e.target.result;

      v.maintenance.push(rec);

      saveData(); renderVehicles();

    };

    reader.readAsDataURL(receiptFile);

  } else {

    v.maintenance.push(rec);

    saveData(); renderVehicles();

  }

  closeModal('addmaint');

}

function viewReceipt(vehicleId, maintId) {

  var v = _vehicles.find(function(x){ return x.id===vehicleId; });

  if (!v) return;

  var m = v.maintenance.find(function(x){ return x.id===maintId; });

  if (!m || !m.receiptData) { alert('No receipt stored.'); return; }

  var win = window.open();

  if (m.receiptData.startsWith('data:image')) {

    win.document.write('<img src="' + m.receiptData + '" style="max-width:100%">');

  } else {

    win.location = m.receiptData;

  }

}

function renderVehicles() {

  var wrap = document.getElementById('vehicles-list');

  if (!wrap) return;

  if (!_vehicles.length) {

    wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">🚗</div><div class="empty-text">No vehicles yet. Add one to get started.</div></div>';

    return;

  }

  wrap.innerHTML = _vehicles.map(function(v) {

    var today = new Date();

    var maintRows = v.maintenance.length ? v.maintenance.slice().sort(function(a,b){ return new Date(b.dateDone)-new Date(a.dateDone); }).map(function(m) {

      var isOverdue = m.nextDate && new Date(m.nextDate) < today;

      var isDueSoon = !isOverdue && m.nextDate && (new Date(m.nextDate) - today) < 30*24*60*60*1000;

      var dot = isOverdue ? 'overdue' : isDueSoon ? 'due' : 'ok';

      var dueLabel = isOverdue ? '<span class="overdue-label">OVERDUE</span>' : isDueSoon ? '<span class="due-label">DUE SOON</span>' : '';

      var receiptBtn = m.receiptData ? '<span class="receipt-tag" onclick="viewReceipt(' + v.id + ',' + m.id + ')">🧾 Receipt</span>' : '';

      return '<div class="maint-row"><div class="maint-dot ' + dot + '"></div><div class="maint-type">' + esc(m.type) + (m.shop ? ' &middot; ' + esc(m.shop) : '') + '<div style="font-size:11px;color:var(--text3)">' + (m.cost ? '$' + m.cost + ' &middot; ' : '') + (m.notes ? esc(m.notes) : '') + '</div>' + receiptBtn + '</div><div class="maint-dates"><div>Done: ' + (m.dateDone||'') + (m.mileageDone ? ' @ ' + m.mileageDone.toLocaleString() + ' mi' : '') + '</div><div>' + (m.nextDate ? 'Next: ' + m.nextDate + ' ' + dueLabel : '') + (m.nextMileage ? ' / ' + m.nextMileage.toLocaleString() + ' mi' : '') + '</div></div></div>';

    }).join('') : '<div style="font-size:13px;color:var(--text3);padding:8px 0">No maintenance records yet.</div>';

    return '<div class="vehicle-card"><div class="vehicle-card-hdr"><div class="vehicle-card-icon">' + (v.emoji||'🚗') + '</div><div class="vehicle-card-info"><div class="vehicle-card-name">' + esc(v.year + ' ' + v.make + ' ' + v.model) + '</div><div class="vehicle-card-sub">' + [v.color,v.plate,v.vin?'VIN: '+v.vin:''].filter(Boolean).join(' &middot; ') + (v.mileage?' &middot; '+v.mileage.toLocaleString()+' mi':'') + '</div></div><button class="btn btn-primary btn-sm" onclick="openAddMaintModal(' + v.id + ')">+ Service Record</button><button class="btn btn-outline btn-sm" onclick="deleteVehicle(' + v.id + ')">Delete</button></div><div class="vehicle-card-body">' + maintRows + '</div></div>';

  }).join('');

}

function deleteVehicle(id) {

  if (!confirm('Delete this vehicle and all its records?')) return;

  _vehicles = _vehicles.filter(function(v){ return v.id!==id; });

  saveData(); renderVehicles();

}

// ============================================================

// ===== BUSINESS =====

// ============================================================

var _bizData = {}; // keyed by bizId

var _currentBizId = null;

var _currentBizTab = 'income';

function openWorkOrderModal() {

  var biz = getBizData(_currentBizId);

  document.getElementById('wo-num').value = 'WO-' + String(biz.woCounter).padStart(4,'0');

  document.getElementById('wo-date').value = new Date().toISOString().slice(0,10);

  ['wo-customer','wo-phone','wo-desc','wo-notes','wo-est','wo-actual'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});

  showModal('workorder');

}

function saveWorkOrder() {

  var biz = getBizData(_currentBizId);

  biz.workorders.push({

    id:Date.now(), num:biz.woCounter++,

    date:document.getElementById('wo-date').value,

    customer:document.getElementById('wo-customer').value,

    phone:document.getElementById('wo-phone').value,

    desc:document.getElementById('wo-desc').value,

    status:document.getElementById('wo-status').value,

    est:document.getElementById('wo-est').value.replace(/[$,]/g,''),

    actual:document.getElementById('wo-actual').value.replace(/[$,]/g,''),

    notes:document.getElementById('wo-notes').value

  });

  saveData(); closeModal('workorder'); renderBizPage(_currentBizId);

}

function openInventoryModal() {

  ['inv-name','inv-partnum','inv-sku','inv-cat','inv-qty','inv-cost','inv-price','inv-location','inv-weight','inv-notes'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});

  showModal('inventory');

}

function saveInventoryItem() {

  var biz = getBizData(_currentBizId);

  var name = document.getElementById('inv-name').value.trim();

  if (!name){alert('Enter a part name.');return;}

  biz.inventory.push({

    id:Date.now(), name:name,

    partnum:document.getElementById('inv-partnum').value,

    sku:document.getElementById('inv-sku').value,

    category:document.getElementById('inv-cat').value,

    condition:document.getElementById('inv-condition').value,

    qty:parseInt(document.getElementById('inv-qty').value)||1,

    cost:document.getElementById('inv-cost').value.replace(/[$,]/g,''),

    price:document.getElementById('inv-price').value.replace(/[$,]/g,''),

    location:document.getElementById('inv-location').value,

    weight:document.getElementById('inv-weight').value,

    notes:document.getElementById('inv-notes').value,

    status:'in-stock'

  });

  saveData(); closeModal('inventory'); renderBizPage(_currentBizId);

}

function openMileageModal() {

  document.getElementById('mi-date').value = new Date().toISOString().slice(0,10);

  ['mi-from','mi-to','mi-miles','mi-notes'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});

  showModal('mileage');

}

function saveMileage() {

  var biz = getBizData(_currentBizId);

  var miles = parseFloat(document.getElementById('mi-miles').value)||0;

  var isRT = parseInt(document.getElementById('mi-roundtrip').value)||0;

  if (isRT) miles *= 2;

  biz.mileage.push({

    id:Date.now(),

    date:document.getElementById('mi-date').value,

    purpose:document.getElementById('mi-purpose').value,

    from:document.getElementById('mi-from').value,

    to:document.getElementById('mi-to').value,

    miles:miles,

    notes:document.getElementById('mi-notes').value

  });

  saveData(); closeModal('mileage'); renderBizPage(_currentBizId);

}

function printMileageReport() {

  var biz = getBizData(_currentBizId);

  var cfg = BIZ_CONFIG[_currentBizId]||{};

  var totalMiles = biz.mileage.reduce(function(s,x){return s+parseFloat(x.miles||0);},0);

  var mileRate = 0.70;

  var sorted = biz.mileage.slice().sort(function(a,b){return (a.date||'').localeCompare(b.date||'');});

  var win = window.open('','_blank');

  var d = win.document;

  d.write('<!DOCTYPE html><html><head><title>Mileage Report</title>');

  d.write('<style>body{font-family:Arial,sans-serif;padding:30px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f0f0f0}tfoot td{font-weight:bold}</style>');

  d.write('</head><body>');

  d.write('<h2>' + esc(cfg.name||'') + ' - Mileage Log</h2>');

  d.write('<p>IRS Rate: $' + mileRate + '/mile | Total: ' + totalMiles.toFixed(1) + ' miles | Est. Deduction: $' + (totalMiles*mileRate).toFixed(2) + '</p>');

  d.write('<table><thead><tr><th>Date</th><th>From</th><th>To</th><th>Purpose</th><th>Miles</th><th>Deduction</th></tr></thead><tbody>');

  sorted.forEach(function(m) {

    var miles = parseFloat(m.miles||0);

    d.write('<tr><td>'+(m.date||'')+'</td><td>'+(m.from||'')+'</td><td>'+(m.to||'')+'</td><td>'+(m.purpose||'')+'</td><td>'+miles.toFixed(1)+'</td><td>$'+(miles*mileRate).toFixed(2)+'</td></tr>');

  });

  d.write('</tbody><tfoot><tr><td colspan="4">TOTAL</td><td>' + totalMiles.toFixed(1) + '</td><td>$' + (totalMiles*mileRate).toFixed(2) + '</td></tr></tfoot></table>');

  setTimeout(function(){win.print();},300);

}


// --- window exports ---
if (typeof openAddVehicleModal !== 'undefined') window.openAddVehicleModal = openAddVehicleModal;
if (typeof saveVehicle !== 'undefined') window.saveVehicle = saveVehicle;
if (typeof openAddMaintModal !== 'undefined') window.openAddMaintModal = openAddMaintModal;
if (typeof saveMaint !== 'undefined') window.saveMaint = saveMaint;
if (typeof viewReceipt !== 'undefined') window.viewReceipt = viewReceipt;
if (typeof renderVehicles !== 'undefined') window.renderVehicles = renderVehicles;
if (typeof deleteVehicle !== 'undefined') window.deleteVehicle = deleteVehicle;
if (typeof openWorkOrderModal !== 'undefined') window.openWorkOrderModal = openWorkOrderModal;
if (typeof saveWorkOrder !== 'undefined') window.saveWorkOrder = saveWorkOrder;
if (typeof openInventoryModal !== 'undefined') window.openInventoryModal = openInventoryModal;
if (typeof saveInventoryItem !== 'undefined') window.saveInventoryItem = saveInventoryItem;
if (typeof openMileageModal !== 'undefined') window.openMileageModal = openMileageModal;
if (typeof saveMileage !== 'undefined') window.saveMileage = saveMileage;
if (typeof printMileageReport !== 'undefined') window.printMileageReport = printMileageReport;
