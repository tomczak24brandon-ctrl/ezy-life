
function renderSidebar() {

  var container = document.getElementById('sidebar-groups');

  var html = '';

  // DEBUG: log group names

  console.log('SIDEBAR GROUPS:', sidebarGroups.map(function(g){return g.id+':'+g.items.length;}));

  sidebarGroups.forEach(function(grp, gi) {

    var isHome = grp.id === 'home-group';

    var collapsed = isHome ? false : !!_sgCollapsed[gi]; // Home never collapses

    // Group container (draggable for group reorder, but not for home group)

    html += '<div class="sg-group" '+(isHome?'':'data-gi="'+gi+'"')+'>';

    if (isHome) {

      // Home: just show HOME nav item, no header

      html += '<div class="sg-items">';

      html += '<div class="nav-item" id="nav-home" onclick="goHome()" style="font-size:14px;font-weight:800;color:var(--accent2)"><span class="icon">🏠</span>HOME</div>';

      html += '</div>';

    } else {

      var arrow = collapsed ? '&#9658;' : '&#9660;';

      html += '<div draggable="true" ondragstart="sgDragStart(event,'+gi+')" ondragover="sgDragOver(event,'+gi+')" ondrop="sgDrop(event,'+gi+')" ondragend="sgDragEnd(event)" style="display:flex;align-items:stretch;">';

      html += '<div title="Drag to reorder" style="display:flex;align-items:center;padding:0 4px 0 6px;cursor:grab;color:var(--text3);font-size:18px;user-select:none;" onclick="event.stopPropagation()">&#8942;</div>';

      html += '<div class="sg-grp-header" onclick="sgToggleCollapse('+gi+')" style="flex:1;">';

      html += '<div class="sg-grp-header-inner">';

      html += '<span class="sg-grp-header-name" ondblclick="event.stopPropagation();sgRename('+gi+')">'+esc(grp.name)+'</span>';

      html += '<span class="sg-grp-header-arrow">'+arrow+'</span>';

      html += '</div></div></div>';

      if (!collapsed) {

        html += '<div class="sg-items">';

        grp.items.forEach(function(item, ii) {

          var badge = item.badge ? '<span class="nav-badge'+(item.badgeRed?' red':'')+'">'+esc(item.badge)+'</span>' : '';

          // Each nav item is draggable for reorder within group

          html += '<div class="nav-item" id="nav-'+item.id+'" onclick="showPage(\''+item.id+'\')" draggable="true" ondragstart="sgItemDragStart(event,'+gi+','+ii+')" ondragover="sgItemDragOver(event,'+gi+','+ii+')" ondrop="sgItemDrop(event,'+gi+','+ii+')" ondragend="sgItemDragEnd()" style="display:flex;align-items:center;">' +

          '<span title="Drag to reorder" style="cursor:grab;color:var(--text3);font-size:18px;padding:0 6px 0 0;user-select:none;" onclick="event.stopPropagation()">&#8942;</span>' +

          (item.icon ? '<span class="icon">'+item.icon+'</span>' : '<span style="width:18px;flex-shrink:0;"></span>') +

          '<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+esc(item.label)+'</span>'+badge+'<span title="Edit tab name &amp; icon" class="sgitem-rename-btn" onclick="event.stopPropagation();sgItemEdit('+gi+','+ii+')" style="margin-left:4px;font-size:12px;opacity:0;transition:opacity .15s;cursor:pointer;color:var(--text3);flex-shrink:0;">&#9998;</span></div>';

        });

        html += '</div>';

      }

    }

    html += '</div>';

  });

  container.innerHTML = html;

}

// Item drag within group - with drop indicator

function showPage(id) {

  var sb=document.getElementById('sidebar');if(sb&&sb.classList.contains('open')){sb.classList.remove('open');var ov=document.getElementById('sidebar-overlay');if(ov)ov.style.display='none';}

  if (window.innerWidth <= 768) closeMobileSidebar();

  if (id !== _currentPage && _currentPage) {

    _navHistory.push(_currentPage);

  }

  _currentPage = id;

  history.pushState({page: id}, '', window.location.pathname + '?view=' + id);

  // Render dynamic pages

  if (id === 'vehicles') { renderVehicles(); }

  if (BIZ_CONFIG[id]) { renderBizPage(id); }

  if (id === 'fin-budgets') { renderFinPage(); }

  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });

  var pg = document.getElementById('page-'+id);

  if (pg) pg.classList.add('active');

  highlightNav(id);

  if (id === 'home') renderHomeBlocks();

  var map = {

    home:         ['🏠 EZY Life','Welcome back'],

    dashboard:    ['Dashboard','2025 Tax Year - Married Filing Jointly'],

    journal:      ['Trade Journal','All trades - 2025'],

    positions:    ['Open Positions','Buys not yet sold'],

    tax:          ['Tax Summary','2025 Capital Gains Tax Estimate'],

    goals:        ['🎯 GOALS',''],

    calendar:     ['Calendar','Google Calendar'],

    vehicles:     ['🚗 Vehicle Maintenance','Track service history'],

    'biz-bn1':    ['🏢 B&N Properties #1','Business financials'],

    'biz-bn2':    ['🏢 B&N Properties #2','Business financials'],

    'biz-ietc':   ['🦅 Iron Eagle Truck Center','Business financials'],

    'biz-ietl':   ['🚛 Iron Eagle Truck Lines','Business financials'],

    'fin-budgets':['💵 Financials','Budgets, checkbooks & ledgers'],

    hobbies:      ['🎨 Hobbies','']

  };

  var info = map[id] || [id, ''];

  document.getElementById('page-title').textContent = info[0];

  document.getElementById('page-sub').textContent   = info[1];

  var act = document.getElementById('topbar-actions');

  // Preserve the global search bar across all page transitions

  var gsw = document.getElementById('global-search-wrap');

  // Clear only non-search children

  Array.from(act.children).forEach(function(c){ if(c !== gsw) c.remove(); });

  // Inject page-specific buttons (before the search bar)

  function prependBtn(html) {

    var tmp = document.createElement('div'); tmp.innerHTML = html;

    Array.from(tmp.children).reverse().forEach(function(el){ act.insertBefore(el, gsw); });

  }

  if (id === 'home' || id === 'submenu') {

    // no extra buttons

  } else if (id === 'goals') {

    prependBtn('<button class="btn btn-primary btn-sm" onclick="openAddGoalModal(null)">+ Add Goal</button>');

  }

  if (id === 'goals') { renderKanban(); goalsGoTab(_goalsTabIdx); goalsCarouselInit(); goalsLoadTabs(); }

  updateNavButtons();

}

function highlightNav(id) {

  document.querySelectorAll('.nav-item').forEach(function(n) {

    var oc = n.getAttribute('onclick') || '';

    n.classList.toggle('active', oc.indexOf("'"+id+"'") !== -1);

  });

}

function showModal(id) { document.getElementById('modal-'+id).style.display='flex'; }

function closeModal(id) {

  document.getElementById('modal-'+id).style.display='none';

  if (id==='forgotpass'){document.getElementById('fp-err').style.display='none';document.getElementById('fp-ok').style.display='none';document.getElementById('fp-email').value='';}

  if (id==='forgotuser'){document.getElementById('fu-err').style.display='none';document.getElementById('fu-ok').style.display='none';document.getElementById('fu-email').value='';}

}

document.addEventListener('keydown', function(e) {

  if (e.key === 'Escape') {

    // Don't close if focus is inside an input/textarea/select (let those handle Escape themselves)

    var tag = document.activeElement && document.activeElement.tagName;

    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {

      // Just blur the field, don't close modal

      document.activeElement.blur();

      return;

    }

    // Otherwise close any open modal

    var open = document.querySelector('.modal-overlay[style*="flex"]');

    if (open) open.style.display = 'none';

  }

}, true);

document.addEventListener('click', function(e) {

  if (e.target.classList.contains('modal-overlay')) {

    e.target.style.display = 'none';

  }

});

// ===== AM/PM KEYBOARD SHORTCUTS =====

function updateNavButtons() {

  var back = document.getElementById('nav-back-btn');

  var home = document.getElementById('nav-home-btn');

  var cur = _currentPage || 'home';

  var showBack = _navHistory.length > 0 && cur !== 'home';

  if (back) back.style.display = showBack ? 'flex' : 'none';

  if (home) home.style.display = cur !== 'home' ? 'flex' : 'none';

}

function goBack() {

  if (_navHistory.length === 0) return;

  var prev = _navHistory.pop();

  _currentPage = prev;

  _showPageInternal(prev);

  updateNavButtons();

}

function goHome() {

  _navHistory = [];

  _currentPage = 'home';

  history.replaceState({page: 'home'}, '', window.location.pathname);

  _showPageInternal('home');

  renderHomeBlocks();

  updateNavButtons();

}

function _showPageInternal(id) {

  var isGCal = (id === 'timeblocking');

  var mc = document.getElementById('main-content');

  var tb = document.getElementById('page-timeblocking');

  if (mc) mc.style.display = isGCal ? 'none' : 'block';

  var mainEl2 = document.querySelector('.main');

  if (mainEl2) mainEl2.classList.toggle('tb-mode', isGCal);

  if (isGCal) {

    if (tb) tb.classList.add('active');

    renderGCal();

  } else {

    if (tb) tb.classList.remove('active');

    document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });

    var pg = document.getElementById('page-'+id);

    if (pg) pg.classList.add('active');

  }

}

// ===== MOBILE SIDEBAR =====

function toggleMobileSidebar() {

  var sb = document.getElementById('sidebar-el');

  var ov = document.getElementById('mobile-overlay');

  if (!sb) return;

  var isOpen = sb.classList.contains('mobile-open');

  if (isOpen) { closeMobileSidebar(); } else { mobileSidebarOpen(); }

}

function mobileSidebarOpen() {

  var sb = document.getElementById('sidebar-el');

  var ov = document.getElementById('mobile-overlay');

  if (sb) sb.classList.add('mobile-open');

  if (ov) ov.classList.add('active');

  document.getElementById('mobile-back-btn').style.display = 'none';

  document.getElementById('mobile-menu-btn').style.display = 'flex';

}

function closeMobileSidebar() {

  var sb = document.getElementById('sidebar-el');

  var ov = document.getElementById('mobile-overlay');

  if (sb) sb.classList.remove('mobile-open');

  if (ov) ov.classList.remove('active');

}

// ===== HOME BLOCKS =====

var _homeBlockOrder = null;

var _homeBlockDragSrc = null;

var _homeBlockDragging = false;

var _HB_STORAGE_KEY = 'ezy_homeblock_order_v1';


// --- window exports ---
window.showPage = showPage;
window.showModal = showModal;
window.closeModal = closeModal;
window.toggleMobileSidebar = toggleMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;
window.goBack = goBack;
window.goHome = goHome;
window.toggleTheme = toggleTheme;
window.highlightNav = highlightNav;
window.updateNavButtons = updateNavButtons;
window.setJTab = setJTab;
window.esc = esc;
