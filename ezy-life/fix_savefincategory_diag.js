function saveFinCategory() {
  var nameEl = document.getElementById('fin-cat-name');
  var iconEl = document.getElementById('fin-cat-icon');
  var name = (nameEl ? nameEl.value.trim() : '');
  var icon = (iconEl ? iconEl.value.trim() : '') || '💰';
  if (!name) { alert('Enter a category name.'); return; }

  // 1. Close modal
  var modalEl = document.getElementById('modal-addfincat');
  if (modalEl) { modalEl.style.display = 'none'; modalEl.style.visibility = 'hidden'; }

  // 2. Update state
  if (!Array.isArray(_finCategories)) _finCategories = [];
  if (_finCatEditId) {
    var cat = _finCategories.find(function(c){ return c.id === _finCatEditId; });
    if (cat) { cat.name = name; cat.icon = icon; }
    _finCatEditId = null;
  } else {
    _finCategories.push({ id: 'cat-' + Date.now(), name: name, icon: icon, color: 'var(--accent)' });
  }

  // DIAGNOSTIC: What do we have in state?
  var diagInfo = [
    'DIAG: _finCategories.length = ' + _finCategories.length,
    'DIAG: _currentPage before render = ' + _currentPage,
    'DIAG: fin-dash-content exists = ' + !!document.getElementById('fin-dash-content'),
    'DIAG: page-fin-dashboard exists = ' + !!document.getElementById('page-fin-dashboard'),
    'DIAG: page-fin-dashboard.active BEFORE = ' + (document.getElementById('page-fin-dashboard') ? document.getElementById('page-fin-dashboard').classList.contains('active') : 'N/A')
  ].join('\n');

  // 3. Persist
  saveData();

  // 4. Ensure fin-dashboard page is active
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  var dashPage = document.getElementById('page-fin-dashboard');
  if (dashPage) dashPage.classList.add('active');
  _currentPage = 'fin-dashboard';

  diagInfo += '\nDIAG: page-fin-dashboard.active AFTER = ' + (dashPage ? dashPage.classList.contains('active') : 'N/A');

  // 5. Directly re-render
  renderFinDashboard();
  renderSidebar();

  var finDashContent = document.getElementById('fin-dash-content');
  diagInfo += '\nDIAG: fin-dash-content.innerHTML length AFTER render = ' + (finDashContent ? finDashContent.innerHTML.length : 'NULL');

  alert(diagInfo);
}
