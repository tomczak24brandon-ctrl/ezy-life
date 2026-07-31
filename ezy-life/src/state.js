
function saveData() {
  if (!window._dataLoaded) {
    // Buffer the save and retry once data is loaded instead of silently dropping it
    console.warn('saveData: data not yet loaded, buffering save for retry');
    setTimeout(function(){ if(window._dataLoaded) saveData(); }, 1500);
    return;
  }
  // Always save sidebar to localStorage (UI prefs only)
  try { saveSidebarToStorage(); } catch(e) {}
  try { localStorage.setItem('ezy_app_version', localStorage.getItem('ezy_app_version') || ''); } catch(e) {}

  if (!window._fbUid) {
    // Fallback to localStorage if not authenticated
    try {
      localStorage.setItem('ezy_goals_v2', JSON.stringify(goals));
      // Notes sourced from Google Tasks; skip localStorage write for notes
      localStorage.setItem('ezy_categories_v2', JSON.stringify(categories));
      localStorage.setItem('ezy_next_cat_id', String(_nextCatId));
      // Time-blocking tasks sourced from Google Calendar; skip localStorage write for _tasks
      localStorage.setItem('ezy_next_task_id', String(_nextTaskId));
      localStorage.setItem('ezy_sub_id_ctr', String(_subIdCtr));
      localStorage.setItem('ezy_vehicles_v1', JSON.stringify(_vehicles));
      localStorage.setItem('ezy_bizdata_v1', JSON.stringify(_bizData));
      localStorage.setItem('ezy_budgets_v1', JSON.stringify(_budgets));
      localStorage.setItem('ezy_checkbooks_v1', JSON.stringify(_checkbooks));
      localStorage.setItem('ezy_finaccounts_v1', JSON.stringify(_finAccounts));
    } catch(e) {}
    return;
  }

  // Write to Firestore under users/{uid}/data/main
  // Notes and tasks are now managed by Google Tasks/Calendar APIs; excluded from Firestore save
  var userRef = window._fbDb.collection('users').doc(window._fbUid);
  userRef.collection('data').doc('main').set({
    goals: goals,
    categories: categories,
    nextCatId: _nextCatId,
    nextTaskId: _nextTaskId,
    subIdCtr: _subIdCtr,
    vehicles: _vehicles,
    bizData: _bizData,
    budgets: _budgets,
    checkbooks: _checkbooks,
    finAccounts: _finAccounts,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function(e) {
    console.error('saveData Firestore error:', e);
  });
}

function loadData() {
  try { loadSidebarFromStorage(); } catch(e) {}

  if (!window._fbUid) {
    // Fallback: load from localStorage (notes/tasks now come from Google APIs)
    try {
      var g = localStorage.getItem('ezy_goals_v2'); if (g) goals = JSON.parse(g);
      var cv = localStorage.getItem('ezy_categories_v2'); if (cv) categories = JSON.parse(cv);
      var nc = localStorage.getItem('ezy_next_cat_id'); if (nc) _nextCatId = parseInt(nc,10) || _nextCatId;
      categories.forEach(function(x){ if(x.id >= _nextCatId) _nextCatId = x.id + 1; });
      var nt = localStorage.getItem('ezy_next_task_id'); if (nt) _nextTaskId = parseInt(nt,10) || 1;
      var sc = localStorage.getItem('ezy_sub_id_ctr'); if (sc) _subIdCtr = parseInt(sc,10) || 1;
      var veh = localStorage.getItem('ezy_vehicles_v1'); if (veh) _vehicles = JSON.parse(veh);
      var bd = localStorage.getItem('ezy_bizdata_v1'); if (bd) _bizData = JSON.parse(bd);
      var bgt = localStorage.getItem('ezy_budgets_v1'); if (bgt) _budgets = JSON.parse(bgt);
      var cbk = localStorage.getItem('ezy_checkbooks_v1'); if (cbk) _checkbooks = JSON.parse(cbk);
      var fin = localStorage.getItem('ezy_finaccounts_v1'); if (fin) _finAccounts = JSON.parse(fin);
      // Notes and _tasks are loaded from Google APIs after auth; skip localStorage restore
    } catch(e) {}
    window._dataLoaded = true;
    return Promise.resolve();
  }

  // Load from Firestore (notes and tasks now sourced from Google APIs; not loaded from Firestore)
  return window._fbDb.collection('users').doc(window._fbUid)
    .collection('data').doc('main').get()
    .then(function(doc) {
      if (doc.exists) {
        var d = doc.data();
        if (d.goals)        goals       = d.goals;
        if (d.categories)   categories  = d.categories;
        if (d.nextCatId)    _nextCatId  = d.nextCatId;
        if (d.nextTaskId)   _nextTaskId = d.nextTaskId;
        if (d.subIdCtr)     _subIdCtr   = d.subIdCtr;
        if (d.vehicles)     _vehicles   = d.vehicles;
        if (d.bizData)      _bizData    = d.bizData;
        if (d.budgets)      _budgets    = d.budgets;
        if (d.checkbooks)   _checkbooks = d.checkbooks;
        if (d.finAccounts)  _finAccounts = d.finAccounts;
        // notes and _tasks intentionally excluded � fetched from Google Calendar/Tasks APIs
        categories.forEach(function(x){ if(x.id >= _nextCatId) _nextCatId = x.id + 1; });
        window._dataLoaded = true;
        console.log('Loaded data from Firestore for uid:', window._fbUid);
      } else {
        window._dataLoaded = true;
        console.log('No Firestore data found - fresh user');
      }
    })
    .catch(function(e) {
      console.error('loadData Firestore error:', e);
    });
}

// ============================================================

// ===== VEHICLE MAINTENANCE =====

// ============================================================

var _vehicles = [];

var _maintVehicleId = null;

function appInit() {

  _gcalAnchor = new Date();

  _calDate = new Date();

  // Version gate: track app version for future migrations (no longer resets sidebar)

  var APP_VERSION = '2026-07-20-v5';

  localStorage.setItem('ezy_app_version', APP_VERSION);

  // Always restore sidebar state  drag order, renames, icons all persist

  loadSidebarFromStorage();

  // loadData() now called before appInit() via onAuthStateChanged

  rescheduleAllReminders();

  qlLoad();

  hbLoadOrder();

  hieLoad();

  renderSidebar();


  renderHomeBlocks();

  renderQuickLinks();

  _currentPage = 'home';

  _showPageInternal('home');

  highlightNav('home');

  document.getElementById('page-title').textContent = '🏠 EZY Life';

  document.getElementById('page-sub').textContent = 'Welcome back';

  updateNavButtons();

}

// Update time indicator every minute

setInterval(function(){

  if(document.getElementById('page-timeblocking').classList.contains('active') && _gcalView !== 'month') {

    var lines = document.querySelectorAll('.gcal-now-wrap');

    if (lines.length) {

      var now = new Date();

      var top = now.getHours()*60+now.getMinutes();

      lines.forEach(function(el){ el.style.top = top+'px'; });

    }

  }

}, 60000);

// ===== GLOBAL SEARCH =====

var _gsearchTimer = null;



'use strict';

// ===== CREDENTIALS =====

// Auth handled by Firebase - CREDS removed

// ===== CAPTCHA =====

// ===== REMEMBER ME =====


// --- window exports ---
window.saveData  = saveData;
window.loadData  = loadData;
window.appInit   = appInit;
