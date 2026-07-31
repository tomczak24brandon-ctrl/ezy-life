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

  var diagCats = JSON.stringify(_finCategories);

  // 3. Persist
  saveData();

  // 4. Ensure fin-dashboard page is active
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  var dashPage = document.getElementById('page-fin-dashboard');
  if (dashPage) dashPage.classList.add('active');
  _currentPage = 'fin-dashboard';

  // 5. Directly re-render
  renderFinDashboard();
  renderSidebar();

  var finDashEl = document.getElementById('fin-dash-content');
  var diagMsg = [
    'DIAG saveFinCategory:',
    '_finCategories after push: ' + diagCats,
    'page-fin-dashboard.active: ' + (dashPage ? dashPage.classList.contains('active') : 'NO ELEMENT'),
    'fin-dash-content exists: ' + !!finDashEl,
    'fin-dash-content innerHTML length: ' + (finDashEl ? finDashEl.innerHTML.length : 'N/A'),
    'fin-dash-content first 200 chars: ' + (finDashEl ? finDashEl.innerHTML.substring(0,200) : 'N/A')
  ].join('\n');

  alert(diagMsg);
}
