

// Aggressively kill all service workers and caches

(function() {

  if ('serviceWorker' in navigator) {

    navigator.serviceWorker.getRegistrations().then(function(regs) {

      regs.forEach(function(r) { r.unregister(); console.log('SW unregistered:', r.scope); });

    });

  }

  if ('caches' in window) {

    caches.keys().then(function(keys) {

      keys.forEach(function(k) { caches.delete(k); console.log('Cache deleted:', k); });

    });

  }

  // If this page was loaded from SW cache, reload from network

  // SW reload removed - was causing infinite loop on cached pages

})();



    var _fbConfig = {
      apiKey: "AIzaSyDqekx9bFgWmEyp_rv-YqthlaLWCSex1AM",
      authDomain: "my-life-a37aa.firebaseapp.com",
      projectId: "my-life-a37aa",
      storageBucket: "my-life-a37aa.firebasestorage.app",
      messagingSenderId: "28106321797",
      appId: "1:28106321797:web:24245eeb22ded10766deec"
    };
    firebase.initializeApp(_fbConfig);
    var _fbAuth = firebase.auth();
    var _fbDb = firebase.firestore();
    // Enable offline persistence
    _fbDb.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence: multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence: not supported in this browser');
      }
    });
    var _fbUid = null;

    // Auth state listener - fires on login/logout
    // Handle redirect result from mobile Google sign-in
  _fbAuth.getRedirectResult().catch(function(e) {
    if (e && e.code !== 'auth/no-current-user') console.error('Redirect result error:', e);
  });

  _fbAuth.onAuthStateChanged(function(user) {
      if (user) {
        _fbUid = user.uid;
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        loadData().then(function() {
          appInit();
        }).catch(function(e) {
          console.error('loadData error:', e);
          appInit();
        });
      } else {
        _fbUid = null;
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
      }
    });
  


'use strict';

// ===== CREDENTIALS =====

// Auth handled by Firebase - CREDS removed

// ===== CAPTCHA =====

// ===== REMEMBER ME =====

function loadSaved(){

  var saved = localStorage.getItem('ezy_saved_creds');

  if (saved) {

    try {

      var c = JSON.parse(atob(saved));

      var u = document.getElementById('l-user'), pw = document.getElementById('l-pass');

      if (u && c.u) u.value = c.u.toLowerCase();

      if (pw && c.p) pw.value = c.p;

      document.getElementById('remember-me').checked = true;

    } catch(e){}

  }

}

loadSaved();

// ===== LOGIN =====

function doEmailSignIn() {
  var email = document.getElementById('login-email').value.trim();
  var pass = document.getElementById('login-password').value;
  var err = document.getElementById('login-err');
  if (!email || !pass) { if(err){err.textContent='Please enter email and password.';err.style.display='block';} return; }
  _fbAuth.signInWithEmailAndPassword(email, pass).catch(function(e) {
    if(err){err.textContent='Sign-in failed: '+(e.message||e.code);err.style.display='block';}
  });
}

function doEmailSignUp() {
  var email = document.getElementById('login-email').value.trim();
  var pass = document.getElementById('login-password').value;
  var err = document.getElementById('login-err');
  if (!email || !pass) { if(err){err.textContent='Please enter email and password.';err.style.display='block';} return; }
  if (pass.length < 6) { if(err){err.textContent='Password must be at least 6 characters.';err.style.display='block';} return; }
  _fbAuth.createUserWithEmailAndPassword(email, pass).catch(function(e) {
    if(err){err.textContent='Sign-up failed: '+(e.message||e.code);err.style.display='block';}
  });
}

function doGoogleSignIn() {
  var btn = document.getElementById('google-signin-btn');
  var err = document.getElementById('login-err');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }
  if (err) err.style.display = 'none';
  var provider = new firebase.auth.GoogleAuthProvider();
  // Use redirect on mobile (popup is blocked by Chrome on Android)
  var isMobile = /Mobi|Android/i.test(navigator.userAgent);
  if (isMobile) {
    _fbAuth.signInWithRedirect(provider).catch(function(e) {
      console.error('Google sign-in error:', e);
      if (err) { err.textContent = 'Sign-in failed: ' + (e.message || e.code); err.style.display = 'block'; }
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    });
  } else {
    _fbAuth.signInWithPopup(provider).catch(function(e) {
      console.error('Google sign-in error:', e);
      if (err) { err.textContent = 'Sign-in failed: ' + (e.message || e.code); err.style.display = 'block'; }
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    });
  }
}

function doSignOut() {
  _fbAuth.signOut().then(function() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
    _fbUid = null;
  });
}

function doLogin() {
  // Legacy stub - now handled by Firebase
  doGoogleSignIn();
}

document.addEventListener('keydown', function(e) {

  if (e.key === 'Enter') {

    var ls = document.getElementById('login-screen');

    if (ls && ls.style.display !== 'none') doLogin();

  }

});

// ===== FORGOT PASSWORD / USERNAME =====

function doForgotPass() {

  var email = (document.getElementById('fp-email').value || '').trim().toLowerCase();

  document.getElementById('fp-err').style.display = 'none';

  document.getElementById('fp-ok').style.display = 'none';

  if (email !== CREDS.user.toLowerCase()) { document.getElementById('fp-err').style.display = 'block'; return; }

  var body = 'EZY Life Login Recovery\n\nUsername: ' + CREDS.user + '\nPassword: ' + CREDS.pass + '\n\nURL: https://ezy-life.vercel.app';

  window.location.href = 'mailto:' + CREDS.user + '?subject=EZY%20Life%20-%20Password%20Recovery&body=' + encodeURIComponent(body);

  document.getElementById('fp-ok').style.display = 'block';

}

function doForgotUser() {

  var email = (document.getElementById('fu-email').value || '').trim().toLowerCase();

  document.getElementById('fu-err').style.display = 'none';

  document.getElementById('fu-ok').style.display = 'none';

  if (email !== CREDS.user.toLowerCase()) { document.getElementById('fu-err').style.display = 'block'; return; }

  var body = 'EZY Life - Your Username\n\nUsername: ' + CREDS.user + '\n\nURL: https://ezy-life.vercel.app';

  window.location.href = 'mailto:' + CREDS.user + '?subject=EZY%20Life%20-%20Your%20Username&body=' + encodeURIComponent(body);

  document.getElementById('fu-ok').style.display = 'block';

}

// ===== APP STATE =====

var _dataLoaded = false;
var goals = [];

var notes = [];

var categories = [

  { id:1, name:'Health',   emoji:'❤️' },

  { id:2, name:'Finance',  emoji:'💰' },

  { id:3, name:'Business', emoji:'💼' },

  { id:4, name:'Personal', emoji:'⭐' }

];

var _nextCatId = 5;

var _newCatEmoji = '😊';

var _tasks = {};

var _nextTaskId = 1;

var _newSubs = [];

var _pendingReassign = null;

var _calDate = null;

var _isPM = false;

var _isEndPM = false;

var _selectedTaskColor = '#1f6feb';

var _gcalView = 'day';

var _gcalAnchor = new Date();

var _addTaskDate = null;

var _addTaskHour = null;

var _editingGoalId = null;

var _editingNoteId = null;

var _editingTaskDk = null;

var _editingTaskId = null;

var _nmColor = '';

var _nmPinned = false;

// ===== SIDEBAR GROUPS =====

var sidebarGroups = [

  {

    id: 'home-group', name: 'Home',

    items: [

      { id:'home', icon:'🏠', label:'Home' }

    ]

  },

  {

    id: 'trading', name: 'Trading',

    items: [

      { id:'dashboard',  icon:'📊', label:'Dashboard' },

      { id:'journal',    icon:'📓', label:'Journal' },

      { id:'positions',  icon:'📈', label:'Open Positions', badge:'5' },

      { id:'tax',        icon:'🧾', label:'Tax Summary', badge:'!', badgeRed:true }

    ]

  },

  {

    id: 'life', name: 'Life',

    items: [

      { id:'goals',        icon:'🎯', label:'Goals' },

      { id:'timeblocking', icon:'⏰', label:'Time Blocking' },

      { id:'calendar',     icon:'📅', label:'Calendar' },

      { id:'notes',        icon:'📝', label:'Notes' }

    ]

  },

  {

    id: 'tools', name: 'Tools',

    items: [

      { id:'reports',  icon:'📊', label:'Reports' },

      { id:'settings', icon:'⚙️', label:'Settings' }

    ]

  },

  {

    id: 'vehicles', name: 'Vehicle Maintenance',

    items: [

      { id:'vehicles', icon:'🚗', label:'My Vehicles' }

    ]

  },

  {

    id: 'business', name: 'Business',

    items: [

      { id:'biz-bn1',     icon:'🏢', label:'B&N Properties #1' },

      { id:'biz-bn2',     icon:'🏢', label:'B&N Properties #2' },

      { id:'biz-ietc',    icon:'🦅', label:'Iron Eagle Truck Center' },

      { id:'biz-ietl',    icon:'🦅', label:'Iron Eagle Truck Lines' }

    ]

  },

  {

    id: 'financials', name: 'Financials',

    items: [

      { id:'fin-budgets', icon:'💰', label:'Financials' }

    ]

  },

  {

    id: 'hobbies', name: 'Hobbies',

    items: [

      { id:'hobbies', icon:'🎮', label:'My Hobbies' }

    ]

  }

];

var _sgDragSrc = null;

var _sgDragSrcIdx = null;

function renderSidebar() {

  var container = document.getElementById('sidebar-groups');

  var html = '';

  sidebarGroups.forEach(function(grp, gi) {

    html += '<div class="sg-group" draggable="true" data-gi="'+gi+'" ondragstart="sgDragStart(event,'+gi+')" ondragover="sgDragOver(event,'+gi+')" ondrop="sgDrop(event,'+gi+')" ondragend="sgDragEnd(event)">';

    html += '<div class="sg-label-row">';

    var grpIconHtml = '';

    if(grp._icon){

      if(grp._icon.indexOf('data:')===0){

        grpIconHtml = '<img src="'+grp._icon+'" style="width:18px;height:18px;border-radius:4px;object-fit:cover;vertical-align:middle;margin-right:5px;">';

      } else {

        grpIconHtml = '<span style="margin-right:4px;font-size:14px;">'+grp._icon+'</span>';

      }

    }

    html += '<span class="sg-label" ondblclick="sgRename('+gi+')" title="Double-click to rename">'+grpIconHtml+esc(grp.name)+'</span>';

    html += '<button class="sg-add-btn" onclick="sgAddItem('+gi+')" title="Add page">+</button>';

    html += '</div>';

    html += '<div class="sg-items">';

    grp.items.forEach(function(item) {

      var badge = item.badge ? '<span class="nav-badge'+(item.badgeRed?' red':'')+'">'+esc(item.badge)+'</span>' : '';

      html += '<div class="nav-item" id="nav-'+item.id+'" onclick="showPage(\''+item.id+'\')"><span class="icon">'+item.icon+'</span>'+esc(item.label)+badge+'</div>';

    });

    html += '</div></div>';

  });

  container.innerHTML = html;

}

// Track collapsed state per group

var _sgCollapsed = {};

function sgToggleCollapse(gi) { _sgCollapsed[gi] = !_sgCollapsed[gi]; renderSidebar(); }

function renderSidebar() {

  var container = document.getElementById('sidebar-groups');

  var html = '';

  sidebarGroups.forEach(function(grp, gi) {

    var collapsed = !!_sgCollapsed[gi];

    var arrow = collapsed ? '&#9658;' : '&#9660;';

    html += '<div class="sg-group" draggable="true" data-gi="'+gi+'" ondragstart="sgDragStart(event,'+gi+')" ondragover="sgDragOver(event,'+gi+')" ondrop="sgDrop(event,'+gi+')" ondragend="sgDragEnd(event)">';

    html += '<div class="sg-label-row" onclick="sgToggleCollapse('+gi+')" style="cursor:pointer;user-select:none">';

    html += '<span style="font-size:9px;color:var(--text3);margin-right:5px">'+arrow+'</span>';

    html += '<span class="sg-label" ondblclick="event.stopPropagation();sgRename('+gi+')" title="Double-click to rename">'+esc(grp.name)+'</span>';

    html += '<button class="sg-add-btn" onclick="event.stopPropagation();sgAddItem('+gi+')" title="Add page">+</button>';

    html += '</div>';

    if (!collapsed) {

      html += '<div class="sg-items">';

      grp.items.forEach(function(item) {

        var badge = item.badge ? '<span class="nav-badge'+(item.badgeRed?' red':'')+'">'+esc(item.badge)+'</span>' : '';

        html += '<div class="nav-item" id="nav-'+item.id+'" onclick="showPage(\''+item.id+'\')"><span class="icon">'+item.icon+'</span>'+esc(item.label)+badge+'</div>';

      });

      html += '</div>';

    }

    html += '</div>';

  });

  container.innerHTML = html;

}

// ===== SIDEBAR (unified, persistent) =====

var _sgCollapsed = {};

var _currentFinTab = 'personal';

var _finAccounts = {};

var _currentFinAccountId = null;

var _sgItemDragSrc = null; // { gi, ii } - group index, item index

function saveSidebarToStorage() {

  try { localStorage.setItem('ezy_sidebar_v3', JSON.stringify({ groups: sidebarGroups, collapsed: _sgCollapsed })); } catch(e){}

}

function loadSidebarFromFirestore() { return Promise.resolve(); }

function loadSidebarFromStorage() {

  try {

    var s = localStorage.getItem('ezy_sidebar_v3');

    if (s) { var d=JSON.parse(s); if(d.groups&&d.groups.length) sidebarGroups=d.groups; if(d.collapsed) _sgCollapsed=d.collapsed; }

  } catch(e){}

}

function sgToggleCollapse(gi) {

  _sgCollapsed[gi] = !_sgCollapsed[gi];

  saveSidebarToStorage();

  renderSidebar();

}

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

function sgItemDragStart(e,gi,ii){

  e.stopPropagation();

  _sgItemDragSrc={gi:gi,ii:ii};

  e.dataTransfer.setData('sgitem','1');

  e.dataTransfer.effectAllowed='move';

  setTimeout(function(){ var el=e.target; if(el) el.style.opacity='0.4'; },0);

}

function sgItemDragOver(e,gi,ii){

  if(!_sgItemDragSrc||_sgItemDragSrc.gi!==gi)return;

  e.preventDefault(); e.stopPropagation();

  // Show drop indicator

  document.querySelectorAll('.nav-drag-placeholder').forEach(function(p){p.remove();});

  var el = e.currentTarget;

  var rect = el.getBoundingClientRect();

  var midY = rect.top + rect.height/2;

  var ph = document.createElement('div');

  ph.className = 'nav-drag-placeholder';

  if (e.clientY < midY) {

    el.parentNode.insertBefore(ph, el);

  } else {

    el.parentNode.insertBefore(ph, el.nextSibling);

  }

}

function sgItemDrop(e,gi,ii){

  e.stopPropagation();

  document.querySelectorAll('.nav-drag-placeholder').forEach(function(p){p.remove();});

  if(!_sgItemDragSrc||_sgItemDragSrc.gi!==gi)return;

  e.preventDefault();

  var src=_sgItemDragSrc.ii;

  // Determine drop position above or below

  var el=e.currentTarget;

  var rect=el.getBoundingClientRect();

  var dropAfter = e.clientY > rect.top + rect.height/2;

  var targetIdx = dropAfter ? ii+1 : ii;

  if(src===ii)return;

  var item=sidebarGroups[gi].items.splice(src,1)[0];

  var newIdx = src < targetIdx ? targetIdx-1 : targetIdx;

  sidebarGroups[gi].items.splice(newIdx,0,item);

  _sgItemDragSrc=null;

  saveSidebarToStorage();

  renderSidebar();

}

function sgItemDragEnd(){

  _sgItemDragSrc=null;

  document.querySelectorAll('.nav-drag-placeholder').forEach(function(p){p.remove();});

  document.querySelectorAll('.nav-item').forEach(function(el){el.style.opacity='';});

}

function sgDragStart(e, gi) {

  _sgDragSrcIdx = gi;

  e.dataTransfer.effectAllowed = 'move';

  e.dataTransfer.setData('text/plain', String(gi));

  setTimeout(function() {

    var el = document.querySelector('.sg-group[data-gi="'+gi+'"]');

    if (el) el.classList.add('dragging');

  }, 0);

}

function sgDragOver(e, gi) {

  e.preventDefault();

  e.dataTransfer.dropEffect = 'move';

  document.querySelectorAll('.sg-group').forEach(function(el) { el.classList.remove('drag-over'); });

  if (gi !== _sgDragSrcIdx) {

    var el = document.querySelector('.sg-group[data-gi="'+gi+'"]');

    if (el) el.classList.add('drag-over');

  }

  // Show drop position indicator between groups

  document.querySelectorAll('.nav-drag-placeholder').forEach(function(p){p.remove();});

  var targetEl = document.querySelector('.sg-group[data-gi="'+gi+'"]');

  if (targetEl && gi !== _sgDragSrcIdx) {

    var rect = targetEl.getBoundingClientRect();

    var ph = document.createElement('div');

    ph.className = 'nav-drag-placeholder';

    ph.style.margin = '2px 8px';

    if (e.clientY < rect.top + rect.height/2) {

      targetEl.parentNode.insertBefore(ph, targetEl);

    } else {

      targetEl.parentNode.insertBefore(ph, targetEl.nextSibling);

    }

  }

}

function sgDrop(e, gi) {

  e.preventDefault();

  document.querySelectorAll('.nav-drag-placeholder').forEach(function(p){p.remove();});

  if (_sgDragSrcIdx === null || _sgDragSrcIdx === gi) return;

  // Determine position

  var targetEl = document.querySelector('.sg-group[data-gi="'+gi+'"]');

  var dropAfter = false;

  if (targetEl) {

    var rect = targetEl.getBoundingClientRect();

    dropAfter = e.clientY > rect.top + rect.height/2;

  }

  var src = _sgDragSrcIdx;

  var moved = sidebarGroups.splice(src, 1)[0];

  var insertAt = src < gi ? (dropAfter ? gi : gi-1) : (dropAfter ? gi+1 : gi);

  sidebarGroups.splice(insertAt, 0, moved);

  saveSidebarToStorage();

  renderSidebar();

  var curPage = document.querySelector('.page.active');

  if (curPage) highlightNav(curPage.id.replace('page-',''));

}

function sgDragEnd(e) {

  document.querySelectorAll('.sg-group').forEach(function(el) { el.classList.remove('dragging','drag-over'); });

  document.querySelectorAll('.nav-drag-placeholder').forEach(function(p){p.remove();});

  _sgDragSrcIdx = null;

}

function sgRename(gi) {

  var grp = sidebarGroups[gi];

  var name = prompt('Rename group:', grp.name);

  if (name && name.trim()) { grp.name = name.trim(); saveSidebarToStorage(); renderSidebar(); }

}

// ===== SUB-TAB EDIT (name + emoji) =====

var _sgItemEditGi = null;

var _sgItemEditIi = null;

var _sgItemPendingIcon = undefined; // undefined = unchanged, '' = no icon, string = emoji

var _SGITEM_EMOJIS = ['⭐','🎯','📌','💡','🏆','✅','🔥','💪','🌟','📈','🎓','🛠️','💰','🏠','🚗','🏋️','🎵','📚','✈️','🌿'];

function sgItemEdit(gi, ii) {

  var item = sidebarGroups[gi] && sidebarGroups[gi].items[ii];

  if (!item) return;

  _sgItemEditGi = gi;

  _sgItemEditIi = ii;

  _sgItemPendingIcon = undefined;

  // populate label

  document.getElementById('sgitem-label-input').value = item.label || '';

  // populate emoji grid

  var grid = document.getElementById('sgitem-emoji-grid');

  grid.innerHTML = _SGITEM_EMOJIS.map(function(em) {

    var sel = em === item.icon ? ' selected' : '';

    return '<button class="hie-emoji-btn'+sel+'" onclick="sgitemPickEmoji(\'' + em + '\')">'+em+'</button>';

  }).join('');

  // set custom input to current icon (if not in preset list)

  var customInp = document.getElementById('sgitem-custom-emoji');

  customInp.value = (_SGITEM_EMOJIS.indexOf(item.icon) === -1 && item.icon) ? item.icon : '';

  // update no-icon btn label

  document.getElementById('sgitem-no-icon-btn').textContent = item.icon ? '? Remove Icon' : '(No Icon)';

  showModal('sgitem');

  setTimeout(function(){ document.getElementById('sgitem-label-input').focus(); }, 80);

}

function sgitemPickEmoji(em) {

  document.querySelectorAll('#sgitem-emoji-grid .hie-emoji-btn').forEach(function(b){ b.classList.remove('selected'); });

  event.currentTarget.classList.add('selected');

  document.getElementById('sgitem-custom-emoji').value = '';

  _sgItemPendingIcon = em;

  document.getElementById('sgitem-no-icon-btn').textContent = '? Remove Icon';

}

function sgitemEmojiTyped(val) {

  document.querySelectorAll('#sgitem-emoji-grid .hie-emoji-btn').forEach(function(b){ b.classList.remove('selected'); });

  _sgItemPendingIcon = val.trim();

}

function sgitemClearIcon() {

  document.querySelectorAll('#sgitem-emoji-grid .hie-emoji-btn').forEach(function(b){ b.classList.remove('selected'); });

  document.getElementById('sgitem-custom-emoji').value = '';

  _sgItemPendingIcon = '';

  document.getElementById('sgitem-no-icon-btn').textContent = '(No Icon)';

}

function sgItemSave() {

  var item = sidebarGroups[_sgItemEditGi] && sidebarGroups[_sgItemEditGi].items[_sgItemEditIi];

  if (!item) { closeModal('sgitem'); return; }

  var newLabel = (document.getElementById('sgitem-label-input').value || '').trim();

  if (newLabel) item.label = newLabel;

  if (_sgItemPendingIcon !== undefined) item.icon = _sgItemPendingIcon;

  saveSidebarToStorage();

  closeModal('sgitem');

  renderSidebar();

}

function sgAddItem(gi) {

  var emoji = prompt('Emoji for new page (e.g. 😊):');

  if (!emoji) return;

  var label = prompt('Page name:');

  if (!label || !label.trim()) return;

  var id = 'custom-' + Date.now();

  sidebarGroups[gi].items.push({ id:id, icon:emoji.trim(), label:label.trim() });

  renderSidebar();

}

// ===== PAGE NAVIGATION =====

var _currentPage = 'dashboard';

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

  var isTimblocking = (id === 'timeblocking');

  var mc = document.getElementById('main-content');

  var tb = document.getElementById('page-timeblocking');

  mc.style.display = isTimblocking ? 'none' : 'block';

  var mainEl = document.querySelector('.main');

  if (mainEl) mainEl.classList.toggle('tb-mode', isTimblocking);

  if (isTimblocking) {

    tb.classList.add('active');

    renderGCal();

  } else {

    tb.classList.remove('active');

  }

  if (!isTimblocking) {

    document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });

    var pg = document.getElementById('page-'+id);

    if (pg) pg.classList.add('active');

  }

  highlightNav(id);

  if (id === 'home') renderHomeBlocks();

  var map = {

    home:         ['🏠 EZY Life','Welcome back'],

    dashboard:    ['Dashboard','2025 Tax Year - Married Filing Jointly'],

    journal:      ['Trade Journal','All trades - 2025'],

    positions:    ['Open Positions','Buys not yet sold'],

    tax:          ['Tax Summary','2025 Capital Gains Tax Estimate'],

    goals:        ['🎯 GOALS',''],

    timeblocking: ['Time Blocking',''],

    calendar:     ['Calendar','Monthly overview'],

    notes:        ['Notes','Quick notes & ideas'],

    vehicles:     ['🚗 Vehicle Maintenance','Track service history'],

    'biz-bn1':    ['🏢 B&N Properties #1','Business financials'],

    'biz-bn2':    ['🏢 B&N Properties #2','Business financials'],

    'biz-ietc':   ['🦅 Iron Eagle Truck Center','Business financials'],

    'biz-ietl':   ['🦅 Iron Eagle Truck Lines','Business financials'],

    'fin-budgets':['💰 Financials','Budgets, checkbooks & ledgers'],

    hobbies:      ['🎮 Hobbies','']

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

    // Add Goal + Edit Categories buttons removed

  } else if (id === 'timeblocking') {

    prependBtn('<button class="btn btn-outline btn-sm" onclick="printPage()">🖨️ Print</button>');

  } else if (id === 'notes') {

    prependBtn('<button class="btn btn-primary" onclick="openNoteModal(null)">+ Note</button>');

  }

  if (id === 'calendar') { if(!_calDate)_calDate=new Date(); renderCalendar(); }

  if (id === 'goals') { renderKanban(); goalsGoTab(_goalsTabIdx); goalsCarouselInit(); goalsLoadTabs(); }

  if (id === 'notes') renderNotes();

  updateNavButtons();

}

function highlightNav(id) {

  document.querySelectorAll('.nav-item').forEach(function(n) {

    var oc = n.getAttribute('onclick') || '';

    n.classList.toggle('active', oc.indexOf("'"+id+"'") !== -1);

  });

}

function setJTab(el) {

  document.querySelectorAll('.j-tab').forEach(function(t){ t.classList.remove('active'); });

  el.classList.add('active');

}

// ===== MODAL =====

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

function setAMPM(ampm) {

  _isPM = (ampm === 'PM');

  var amBtn = document.getElementById('t-am-btn'); if(amBtn) amBtn.classList.toggle('active', !_isPM);

  var pmBtn = document.getElementById('t-pm-btn'); if(pmBtn) pmBtn.classList.toggle('active', _isPM);

}

function setEndAMPM(ampm) {

  _isEndPM = (ampm === 'PM');

  var eamBtn = document.getElementById('t-eam-btn'); if(eamBtn) eamBtn.classList.toggle('active', !_isEndPM);

  var epmBtn = document.getElementById('t-epm-btn'); if(epmBtn) epmBtn.classList.toggle('active', _isEndPM);

}

function autoToggleAMPM(which, changedEl) {

  var isEnd = which === 'end';

  var hrId  = isEnd ? 't-ehr' : 't-hr';

  var mnId  = isEnd ? 't-emin' : 't-min';

  var hrEl  = document.getElementById(hrId);

  var mnEl  = document.getElementById(mnId);

  var hr = parseInt(hrEl.value, 10);

  var mn = parseInt(mnEl.value, 10);

  if (isNaN(hr)) hr = 12;

  if (isNaN(mn)) mn = 0;

  var prevHr = parseInt(hrEl.getAttribute('data-prev') || String(hr), 10);

  var prevMn = parseInt(mnEl.getAttribute('data-prev') || String(mn), 10);

  if (isNaN(prevHr)) prevHr = hr;

  if (isNaN(prevMn)) prevMn = mn;

  var goingUp = (hr > prevHr) || (mn > prevMn && hr === prevHr);

  var goingDown = !goingUp;

  // Minute rollover: carry into hours

  if (mn > 59) { mn = 0; mnEl.value = '0'; hr += 1; hrEl.value = String(hr); goingUp = true; goingDown = false; }

  if (mn < 0)  { mn = 59; mnEl.value = '59'; hr -= 1; hrEl.value = String(hr); goingDown = true; goingUp = false; }

  // Hour wrap: 13->1, 0->12 (no period change on wrap — period only flips at 11<->12 boundary)

  if (hr > 12) { hr = 1; hrEl.value = '1'; }

  if (hr < 1)  { hr = 12; hrEl.value = '12'; }

  // AM/PM flip ONLY at the 11<->12 boundary

  // Going UP:   prevHr=11 and hr=12 -> flip period

  // Going DOWN: prevHr=12 and hr=11 -> flip period

  var flip = false;

  if (goingUp   && prevHr === 11 && hr === 12) flip = true;

  if (goingDown && prevHr === 12 && hr === 11) flip = true;

  // Also catch wrap-around: going up from 12 wraps to 1 (prev=12, hr=1) — cross occurred, flip

  if (goingUp   && prevHr === 12 && hr === 1)  flip = true;

  // Going down from 1 wraps to 12 (prev=1, hr=12) — cross occurred, flip

  if (goingDown && prevHr === 1  && hr === 12) flip = true;

  if (flip) {

    var isPM = isEnd ? _isEndPM : _isPM;

    isPM = !isPM;

    if (isEnd) setEndAMPM(isPM ? 'PM' : 'AM');

    else       setAMPM(isPM ? 'PM' : 'AM');

  }

  // Store for next event

  hrEl.setAttribute('data-prev', String(hr));

  mnEl.setAttribute('data-prev', String(mn));

}

document.addEventListener('keydown', function(e) {

  var modal = document.getElementById('modal-addtask');

  if (modal && modal.style.display !== 'none') {

    if (e.key === 'a' || e.key === 'A') { e.preventDefault(); setAMPM('AM'); }

    if (e.key === 'p' || e.key === 'P') { e.preventDefault(); setAMPM('PM'); }

  }

});

function getPickedTime() {

  var hr = parseInt(document.getElementById('t-hr').value||'9',10);

  var mn = parseInt(document.getElementById('t-min').value||'0',10);

  if (isNaN(hr)||hr<1||hr>12) hr=9;

  if (isNaN(mn)||mn<0||mn>59) mn=0;

  if (_isPM && hr!==12) hr+=12;

  if (!_isPM && hr===12) hr=0;

  return pad2(hr)+':'+pad2(mn);

}

function getPickedEndTime() {

  var hr = parseInt(document.getElementById('t-ehr').value||'10',10);

  var mn = parseInt(document.getElementById('t-emin').value||'0',10);

  if (isNaN(hr)||hr<1||hr>12) hr=10;

  if (isNaN(mn)||mn<0||mn>59) mn=0;

  if (_isEndPM && hr!==12) hr+=12;

  if (!_isEndPM && hr===12) hr=0;

  return pad2(hr)+':'+pad2(mn);

}

// ===== COLOR PICKER (events) =====

var EVT_COLORS = [

  { label:'Blue',   val:'#1f6feb' },

  { label:'Green',  val:'#2ea043' },

  { label:'Red',    val:'#da3633' },

  { label:'Yellow', val:'#b08800' },

  { label:'Purple', val:'#8957e5' },

  { label:'Teal',   val:'#1a7f74' },

  { label:'Pink',   val:'#bf4b8a' }

];

function buildTaskColorPicker() {

  var el = document.getElementById('task-color-picker');

  el.innerHTML = EVT_COLORS.map(function(c){

    return '<div class="evt-color-dot'+(c.val===_selectedTaskColor?' selected':'')+'" style="background:'+c.val+'" title="'+c.label+'" onclick="selectTaskColor(\''+c.val+'\')"></div>';

  }).join('');

}

function selectTaskColor(val) {

  _selectedTaskColor = val;

  buildTaskColorPicker();

}

// ===== GOALS (KANBAN) =====

// ===== GOAL STEPS (checklist) =====

var _gSteps = []; // temp steps when adding

var _gdSteps = []; // temp steps when editing

function addGoalStep() {

  var inp = document.getElementById('g-step-input');

  var t = (inp.value||'').trim();

  if (!t) return;

  _gSteps.push({text:t, done:false});

  inp.value = '';

  renderGoalStepsList('g-steps-list', _gSteps, 'g');

}

function addDetailStep() {

  var inp = document.getElementById('gd-step-input');

  var t = (inp.value||'').trim();

  if (!t) return;

  _gdSteps.push({text:t, done:false});

  inp.value = '';

  renderGoalStepsList('gd-steps-list', _gdSteps, 'gd');

}

function toggleGoalStep(prefix, i) {

  var arr = prefix==='g' ? _gSteps : _gdSteps;

  arr[i].done = !arr[i].done;

  renderGoalStepsList(prefix+'-steps-list', arr, prefix);

  // For Goal Detail modal: recalc progress + auto-archive/restore immediately

  if (prefix === 'gd') {

    var g = goals.find(function(x){ return x.id === _editingGoalId; });

    if (g && arr.length > 0) {

      var doneCnt = arr.filter(function(s){ return s.done; }).length;

      var newPct  = Math.round((doneCnt / arr.length) * 100);

      // Strict gate: only archive at exactly 100%, restore below 100%

      if (newPct === 100 && g.progress < 100) g.completedAt = Date.now();

      if (newPct < 100) g.completedAt = undefined;

      g.progress = newPct;

      g.steps = arr.slice();

      // Update slider + label in modal to reflect new pct

      var sl = document.getElementById('gd-progress');

      var lb = document.getElementById('gd-pct-label');

      if (sl) sl.value = newPct;

      if (lb) lb.textContent = newPct + '%';

      saveData();

      renderKanban();

    }

  }

}

function deleteGoalStep(prefix, i) {

  var arr = prefix==='g' ? _gSteps : _gdSteps;

  arr.splice(i,1);

  renderGoalStepsList(prefix+'-steps-list', arr, prefix);

}

function renderGoalStepsList(elId, arr, prefix) {

  var el = document.getElementById(elId);

  if (!el) return;

  if (!arr || arr.length === 0) {

    el.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:4px 0">No steps yet.</div>';

    return;

  }

  // Plain render for Add-Goal modal (prefix='g'); full drag+edit for Goal Detail (prefix='gd')

  if (prefix !== 'gd') {

    el.innerHTML = arr.map(function(s, i) {

      return '<div class="goal-step">' +

        '<span class="goal-step-num">' + (i+1) + '.</span>' +

        '<div class="goal-step-check' + (s.done ? ' done' : '') + '" onclick="toggleGoalStep(\'' + prefix + '\',' + i + ')"></div>' +

        '<span class="goal-step-text' + (s.done ? ' done-step' : '') + '">' + esc(s.text) + '</span>' +

        '<button class="goal-step-del" onclick="deleteGoalStep(\'' + prefix + '\',' + i + ')">\u2715</button>' +

      '</div>';

    }).join('');

    return;

  }

  // --- Goal Detail: DOM-built rows with inline edit + drag-to-reorder ---

  el.innerHTML = '';

  var dragSrcIdx = null;

  arr.forEach(function(s, i) {

    var row = document.createElement('div');

    row.className = 'goal-step';

    row.draggable = false;

    row.dataset.idx = i;

    // Drag handle

    var handle = document.createElement('span');

    handle.className = 'gd-step-drag';

    handle.innerHTML = '&#x22EE;&#x22EE;';

    handle.title = 'Drag to reorder';

    handle.draggable = true;

    // Step number

    var num = document.createElement('span');

    num.className = 'goal-step-num';

    num.textContent = (i + 1) + '.';

    // Checkbox

    var chk = document.createElement('div');

    chk.className = 'goal-step-check' + (s.done ? ' done' : '');

    (function(idx) {

      chk.addEventListener('click', function(e) { e.stopPropagation(); toggleGoalStep('gd', idx); });

    })(i);

    // Inline-editable text

    var txt = document.createElement('span');

    txt.className = 'gd-step-edit' + (s.done ? ' done-step' : '');

    txt.contentEditable = 'true';

    txt.spellcheck = false;

    txt.textContent = s.text;

    (function(idx) {

      txt.addEventListener('blur', function() {

        var val = (txt.textContent || '').trim();

        if (val) arr[idx].text = val;

        else txt.textContent = arr[idx].text;

      });

      txt.addEventListener('keydown', function(e) {

        e.stopPropagation();

        if (e.key === 'Enter') { e.preventDefault(); txt.blur(); }

        if (e.key === 'Escape') { txt.textContent = arr[idx].text; txt.blur(); }

      });

      // Prevent drag triggering while editing

      txt.addEventListener('mousedown', function(e) { e.stopPropagation(); });

    })(i);

    // Delete button

    var del = document.createElement('button');

    del.className = 'goal-step-del';

    del.textContent = '\u2715';

    (function(idx) {

      del.addEventListener('click', function(e) { e.stopPropagation(); deleteGoalStep('gd', idx); });

    })(i);

    row.appendChild(handle);

    row.appendChild(num);

    row.appendChild(chk);

    row.appendChild(txt);

    row.appendChild(del);

    // Drag events  only fire from handle or row background, not from contenteditable

    row.addEventListener('dragstart', function(e) {

      if (document.activeElement === txt) { e.preventDefault(); return; }

      dragSrcIdx = parseInt(row.dataset.idx, 10);

      row.draggable = true;

      e.dataTransfer.effectAllowed = 'move';

      e.dataTransfer.setData('gd-step', '1');

      setTimeout(function() { row.classList.add('gd-dragging'); }, 0);

    });

    handle.addEventListener('dragend', function() { row.draggable = false; });

    row.addEventListener('dragend', function() {

      row.classList.remove('gd-dragging');

      el.querySelectorAll('.goal-step').forEach(function(r) { r.classList.remove('gd-drop-above','gd-drop-below'); });

    });

    row.addEventListener('dragover', function(e) {

      if (!e.dataTransfer.types || !Array.from(e.dataTransfer.types).includes('gd-step')) return;

      e.preventDefault(); e.stopPropagation();

      var rect = row.getBoundingClientRect();

      var before = (e.clientY - rect.top) < rect.height / 2;

      el.querySelectorAll('.goal-step').forEach(function(r) { r.classList.remove('gd-drop-above','gd-drop-below'); });

      row._gdInsertBefore = before;

      row.classList.add(before ? 'gd-drop-above' : 'gd-drop-below');

    });

    row.addEventListener('dragleave', function() {

      row.classList.remove('gd-drop-above','gd-drop-below');

    });

    row.addEventListener('drop', function(e) {

      e.preventDefault(); e.stopPropagation();

      var insertBefore = row._gdInsertBefore !== false;

      row.classList.remove('gd-drop-above','gd-drop-below');

      var toIdx = parseInt(row.dataset.idx, 10);

      if (dragSrcIdx === null || dragSrcIdx === toIdx) { dragSrcIdx = null; return; }

      var moved = arr.splice(dragSrcIdx, 1)[0];

      var newToIdx = insertBefore ? toIdx : toIdx + 1;

      if (dragSrcIdx < toIdx) newToIdx = insertBefore ? toIdx - 1 : toIdx;

      if (newToIdx < 0) newToIdx = 0;

      if (newToIdx > arr.length) newToIdx = arr.length;

      arr.splice(newToIdx, 0, moved);

      dragSrcIdx = null;

      renderGoalStepsList(elId, arr, prefix);

    });

    el.appendChild(row);

  });

}

// ===== GOALS YEAR OVERVIEW =====

function renderGoalsDashboard() {

  var el = document.getElementById('goals-dashboard');

  if (!el) return;

  var allActive = goals.filter(function(g){ return g.progress < 100; });

  // Active Goals tab: show only the FIRST active goal per category (front-end display filter only)

  var seenCats = {};

  var active = allActive.filter(function(g) {

    if (seenCats[g.catId]) return false;

    seenCats[g.catId] = true;

    return true;

  });

  if (!active.length) {

    el.innerHTML = allActive.length > 0

      ? '<div class="gd-empty">✅ All goals complete! Check the <b>Archive</b> tab to see your achievements.</div>'

      : '<div class="gd-empty">No goals yet — add one with <b>+ Add Goal</b> above.</div>';

    return;

  }

  var html = '<div class="gd-section-label">Active Goals</div><div class="gd-grid">';

  active.forEach(function(g) {

    var cat = categories.find(function(c){ return c.id === g.catId; }) || { emoji: '⭐', name: 'General' };

    var steps = g.steps || [];

    var total = steps.length;

    var done = steps.filter(function(s){ return s.done; }).length;

    // Use manual progress slider; fall back to step ratio if steps exist and progress===0

    var pct = g.progress;

    if (pct === 0 && total > 0) pct = Math.round(done / total * 100);

    // Active Goals tab: show first INCOMPLETE task; fall back to first task if all done

    var firstIncomplete = steps.find(function(s){ return !s.done; }) || null;

    var firstStepIdx = firstIncomplete ? steps.indexOf(firstIncomplete) : -1;

    var firstTaskHtml;

    if (!steps.length) {

      // No tasks at all — placeholder

      firstTaskHtml = '<div class="gd-first-task" style="opacity:.6;cursor:pointer" onclick="openGoalDetail('+g.id+')">'

        + '<span style="font-size:1.05rem;color:var(--accent)">+ Add steps</span>'

        + '</div>';

    } else if (!firstIncomplete) {

      // All tasks done but goal not yet at 100%

      firstTaskHtml = '<div class="gd-first-task" style="opacity:.6">'

        + '<span style="font-size:1.05rem;color:var(--text3)">All steps complete</span>'

        + '</div>';

    } else {

      firstTaskHtml = '<div class="gd-first-task" onclick="event.stopPropagation()">'

        + '<div class="gd-task-chk' + (firstIncomplete.done ? ' done' : '') + '" onclick="gdDashToggleStep('+g.id+','+firstStepIdx+')"></div>'

        + '<span class="gd-task-text-lg' + (firstIncomplete.done ? ' done-step' : '') + '">'+esc(firstIncomplete.text)+'</span>'

        + '</div>';

    }

    var stepsMeta = total ? done+'/'+total+' steps' : '';

    var gStatus = getGoalStatus(g);

    var statusClass = gStatus ? ' status-'+gStatus : '';

    html += '<div class="gd-card'+statusClass+'" onclick="openGoalDetail('+g.id+')">';

    html += '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:2px">'

      +'<div class="gd-card-cat">'+cat.emoji+' '+esc(cat.name)+'</div>'

      +'<button class="kcard-edit-btn" onclick="event.stopPropagation();openEditGoalModal('+g.id+')" title="Edit goal" style="margin-top:-2px">&#9998;</button>'

      +'</div>';

    html += '<div class="gd-card-title">'+esc(g.title)+'</div>';

    if (g.targetDate) { var gtdLabel = fmtDate(g.targetDate); html += '<div style="font-size:10px;color:'+(gStatus==='overdue'?'var(--red)':'var(--text3)')+';margin-bottom:6px">📅 Goal due: '+gtdLabel+'</div>'; }

    html += '<div class="gd-bar-wrap"><div class="gd-bar-fill" style="width:'+pct+'%"></div></div>';

    html += '<div class="gd-bar-meta"><span class="gd-bar-pct">'+pct+'%</span><span class="gd-bar-steps">'+stepsMeta+'</span></div>';

    // Show ALL tasks with dates (not just first) in Active Goals tab

    if (!steps.length) {

      html += '<div class="gd-first-task" style="opacity:.6;cursor:pointer" onclick="event.stopPropagation();openGoalDetail('+g.id+')">'+'<span style="font-size:1.05rem;color:var(--accent)">+ Add steps</span></div>';

    } else {

      html += '<div class="gd-steps-list" onclick="event.stopPropagation()">';

      steps.forEach(function(s, si) {

        var sOverdue = checkStepOverdue(s);

        html += '<div class="gd-step-row">';

        html += '<div class="gd-task-chk'+(s.done?' done':'')+' " onclick="gdDashToggleStep('+g.id+','+si+')"></div>';

        html += '<span class="gd-task-text-lg'+(s.done?' done-step':'')+'">'+esc(s.text)+'</span>';

        html += '<input type="date" onclick="try{this.showPicker()}catch(e){}" style="cursor:pointer" class="gd-step-date'+(sOverdue?' overdue':'')+'" data-gid="'+g.id+'" data-si="'+si+'" value="'+(s.targetDate||'')+'" title="Task target date" onclick="event.stopPropagation()" onchange="gdDashStepDateChange(event)">';

        html += '</div>';

      });

      html += '</div>';

    }

    html += '</div>';

  });

  html += '</div>';

  el.innerHTML = html;

}

function renderGoalsYearOverview() {

  var el = document.getElementById('goals-year-overview');

  var cntEl = document.getElementById('goals-count');

  if (!el) return;

  // Only show goals that have been marked complete (progress===100 + completedAt timestamp)

  // Goals without completedAt but progress===100 get fallback year = current year

  var completed = goals.filter(function(g){ return g.progress === 100; });

  // Update subtitle

  if (cntEl) cntEl.textContent = completed.length + ' completed goal' + (completed.length !== 1 ? 's' : '');

  if (!completed.length) {

    el.innerHTML = '<div style="font-size:13px;color:var(--text3);padding:8px 0">No completed goals yet. Set a goal\'s progress to 100% to archive it here.</div>';

    return;

  }

  // Group by year derived from completedAt timestamp; fall back to current year

  var byYear = {};

  var curYear = new Date().getFullYear();

  completed.forEach(function(g) {

    var yr = g.completedAt ? new Date(g.completedAt).getFullYear() : curYear;

    if (!byYear[yr]) byYear[yr] = [];

    byYear[yr].push(g);

  });

  // Sort years newest-first  automatically handles any future year with zero code changes

  var years = Object.keys(byYear).map(Number).sort(function(a,b){ return b - a; });

  var html = '';

  years.forEach(function(yr) {

    var list = byYear[yr];

    var sectionId = 'arch-yr-' + yr;

    html += '<div class="arch-year-section">';

    html += '<div class="arch-year-hdr" onclick="archToggleYear(\''+sectionId+'\')">';

    html += '<span class="arch-year-label">'+yr+'</span>';

    html += '<span class="arch-year-count">'+list.length+' goal'+(list.length!==1?'s':'')+'</span>';

    html += '<span class="arch-year-arrow" id="'+sectionId+'-arrow">?</span>';

    html += '</div>';

    html += '<div class="arch-year-body" id="'+sectionId+'">';

    list.forEach(function(g) {

      var cat = categories.find(function(c){ return c.id === g.catId; }) || {emoji:'⭐',name:'General'};

      var dateStr = g.completedAt ? new Date(g.completedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';

      html += '<div class="year-goal-card" onclick="openGoalDetail('+g.id+')" style="border-color:var(--green,#3fb950);">';

      html += '<div class="year-goal-cat">'+cat.emoji+' '+esc(cat.name)+'<span style="color:var(--green,#3fb950);font-size:10px;font-weight:700;margin-left:6px">? Done</span>'+(dateStr?'<span style="color:var(--text3);font-size:10px;margin-left:6px">'+dateStr+'</span>':'')+'</div>';

      html += '<div class="year-goal-title">'+esc(g.title)+'</div>';

      html += '<div class="year-goal-bar"><div class="year-goal-fill" style="width:100%;background:var(--green,#3fb950)"></div></div>';

      html += '</div>';

    });

    html += '</div>';

    html += '</div>';

  });

  el.innerHTML = html;

}

function archToggleYear(sectionId) {

  var body = document.getElementById(sectionId);

  var arrow = document.getElementById(sectionId+'-arrow');

  if (!body) return;

  var collapsed = body.style.display === 'none';

  body.style.display = collapsed ? '' : 'none';

  if (arrow) arrow.textContent = collapsed ? '?' : '?';

}

// ===== MANAGE CATEGORIES MODAL =====

// ===== MCAT EMOJI PICKER HELPERS =====

var _mcatNewEmoji = null;

var _mcatNewIconUrl = null;

function openManageCatsModal() {

  renderMcatList();

  showModal('manage-cats');

  // Wire EP for the "new" row

  setTimeout(function() {

    buildEP('mcat-new', function(emoji) {

      _mcatNewEmoji = emoji;

      _mcatNewIconUrl = null;

      var btn = document.getElementById('mcat-new-ep-btn');

      if (btn) btn.innerHTML = emoji;

    });

  }, 0);

}

function mcatToggleEP(catId) {

  toggleEP('mcat'+catId);

}

function mcatUploadIcon(catId) {

  var inp = document.getElementById('mcat-upload-'+catId);

  if (inp) inp.click();

}

function mcatHandleUpload(catId, input) {

  var file = input.files && input.files[0];

  if (!file) return;

  var reader = new FileReader();

  reader.onload = function(e) {

    var b64 = e.target.result;

    var cat = categories.find(function(c){ return c.id===catId; });

    if (!cat) return;

    cat.iconUrl = b64;

    cat.emoji = ''; // clear emoji when custom image set

    var btn = document.getElementById('mcat-epbtn-'+catId);

    if (btn) btn.innerHTML = '<img src="'+b64+'" class="mcat-icon-img" alt="">';

    saveData();

  };

  reader.readAsDataURL(file);

}

function mcatNewUpload(input) {

  var file = input.files && input.files[0];

  if (!file) return;

  var reader = new FileReader();

  reader.onload = function(e) {

    _mcatNewIconUrl = e.target.result;

    _mcatNewEmoji = null;

    var btn = document.getElementById('mcat-new-ep-btn');

    if (btn) btn.innerHTML = '<img src="'+_mcatNewIconUrl+'" class="mcat-icon-img" alt="">';

  };

  reader.readAsDataURL(file);

}

function catIconHtml(cat) {

  if (!cat) return '';

  if (cat.iconUrl) return '<img src="'+cat.iconUrl+'" class="mcat-icon-img" style="width:18px;height:18px;border-radius:3px;object-fit:cover;vertical-align:middle" alt="">';

  return cat.emoji || '';

}

function renderMcatList() {

  var el = document.getElementById('mcat-list');

  if (!el) return;

  if (!categories.length) { el.innerHTML = '<div style="color:var(--text3);font-size:13px">No categories yet.</div>'; return; }

  el.innerHTML = categories.map(function(cat) {

    var iconHtml = cat.iconUrl

      ? '<img src="'+cat.iconUrl+'" class="mcat-icon-img" alt="">'

      : cat.emoji;

    return '<div class="mcat-row" data-catid="'+cat.id+'">'

      +'<div class="ep-wrap">'

        +'<button class="cat-emoji-btn mcat-ep-btn" id="mcat-epbtn-'+cat.id+'" onclick="event.stopPropagation();mcatToggleEP('+cat.id+')" title="Pick emoji">'+iconHtml+'</button>'

        +'<div class="ep-popup" id="ep-mcat'+cat.id+'"></div>'

      +'</div>'

      +'<input class="mcat-name-inp" id="mcat-name-'+cat.id+'" value="'+esc(cat.name)+'" maxlength="32" placeholder="Category name" onkeydown="if(event.key==&quot;Enter&quot;){mcatSave('+cat.id+');}">'

      +'<button class="mcat-save-btn" onclick="mcatSave('+cat.id+')" title="Save">&#10003;</button>'

      +'<button class="mcat-del-btn" onclick="mcatDelete('+cat.id+')" title="Delete">&#128465;</button>'

      +'<input type="file" id="mcat-upload-'+cat.id+'" accept="image/*" style="display:none" onchange="mcatHandleUpload('+cat.id+',this)">'

      +'<button class="mcat-save-btn" onclick="mcatUploadIcon(\'' + cat.id + '\')" title="Upload custom icon" style="background:var(--surface2);color:var(--text2);font-size:11px">&#128247;</button>'

      +'</div>';

  }).join('');

  // Wire EP for each category row

  categories.forEach(function(cat) {

    buildEP('mcat'+cat.id, (function(c) {

      return function(emoji) {

        c.emoji = emoji;

        c.iconUrl = null;

        var btn = document.getElementById('mcat-epbtn-'+c.id);

        if (btn) btn.innerHTML = emoji;

        saveData();

      };

    })(cat));

  });

}

function mcatSave(catId) {

  var cat = categories.find(function(c){ return c.id===catId; });

  if (!cat) return;

  var nameEl = document.getElementById('mcat-name-'+catId);

  var emojiEl = document.getElementById('mcat-emoji-'+catId);

  var name = (nameEl ? nameEl.value : '').trim();

  if (!name) { alert('Category name cannot be empty.'); return; }

  // emoji is stored directly on cat by EP callback; just keep existing

  cat.name = name;

  saveData();

  renderMcatList();

  renderKanban();

}

function mcatDelete(catId) {

  var cat = categories.find(function(c){ return c.id===catId; });

  if (!cat) return;

  var inUse = goals.some(function(g){ return g.catId===catId; });

  if (inUse && !confirm('Goals using "'+cat.name+'" will be uncategorized. Delete anyway?')) return;

  categories = categories.filter(function(c){ return c.id!==catId; });

  saveData();

  renderMcatList();

  renderKanban();

}

function mcatAdd() {

  var nameEl = document.getElementById('mcat-new-name');

  var emojiEl = document.getElementById('mcat-new-emoji');

  var name = (nameEl ? nameEl.value : '').trim();

  if (!name) { alert('Enter a category name.'); return; }

  var newBtn = document.getElementById('mcat-new-ep-btn');

  var emoji = _mcatNewEmoji || (newBtn ? (newBtn.textContent || newBtn.innerText || '⭐').trim() : '⭐');

  var iconUrl = _mcatNewIconUrl || null;

  _mcatNewEmoji = null; _mcatNewIconUrl = null;

  var newCat = { id: _nextCatId++, name: name, emoji: emoji, iconUrl: iconUrl };

  categories.push(newCat);

  localStorage.setItem('ezy_next_cat_id', _nextCatId);

  if (nameEl) nameEl.value = '';

  saveData();

  renderMcatList();

  renderKanban();

}

function openEditGoalModal(gid) {

  var g = goals.find(function(x){ return x.id===gid; });

  if (!g) return;

  _editingGoalId = gid;

  _gSteps = (g.steps||[]).map(function(s){ return Object.assign({},s); });

  var sel = document.getElementById('g-cat');

  sel.innerHTML = categories.map(function(c){ return '<option value="'+c.id+'"'+(g.catId===c.id?' selected':'')+'>'+c.emoji+' '+esc(c.name)+'</option>'; }).join('')

    + '<option value="__custom__">+ Add Custom Category</option>';

  document.getElementById('g-cat-custom-wrap').style.display='none';

  document.getElementById('g-title').value = g.title;

  document.getElementById('g-date').value = g.targetDate||'';

  renderGSteps();

  document.querySelector('#modal-addgoal .modal-title').innerHTML = '&#9998; Edit Goal';

  showModal('addgoal');

}

function onGCatChange() {

  var val = document.getElementById('g-cat').value;

  document.getElementById('g-cat-custom-wrap').style.display = (val==='__custom__') ? '' : 'none';

}

function addCustomCategory() {

  var name = (document.getElementById('g-cat-custom-input').value||'').trim();

  if (!name) { alert('Enter a category name.'); return; }

  var emojiSel = document.getElementById('g-cat-custom-emoji');

  var emoji = emojiSel ? emojiSel.value : '&#11088;';

  // Decode entity if it's a text node

  var tmp = document.createElement('span'); tmp.innerHTML = emoji; emoji = tmp.textContent || emoji;

  var newCat = { id: _nextCatId++, name: name, emoji: emoji };

  categories.push(newCat);

  localStorage.setItem('ezy_next_cat_id', _nextCatId);

  saveData();

  // Select the new category

  var sel = document.getElementById('g-cat');

  sel.innerHTML = categories.map(function(c){ return '<option value="'+c.id+'"'+(c.id===newCat.id?' selected':'')+'>'+c.emoji+' '+esc(c.name)+'</option>'; }).join('')

    + '<option value="__custom__">+ Add Custom Category</option>';

  document.getElementById('g-cat-custom-wrap').style.display='none';

  document.getElementById('g-cat-custom-input').value='';

  renderKanban();

}

function openAddGoalModal(catId) {

  _editingGoalId = null;

  document.querySelector('#modal-addgoal .modal-title').innerHTML = '&#127919; Add Goal';

  _gSteps = [];

  var sel = document.getElementById('g-cat');

  sel.innerHTML = categories.map(function(c){ return '<option value="'+c.id+'"'+(catId===c.id?' selected':'')+'>'+c.emoji+' '+esc(c.name)+'</option>'; }).join('')

    + '<option value="__custom__">+ Add Custom Category</option>';

  document.getElementById('g-cat-custom-wrap').style.display='none';

  document.getElementById('g-title').value='';

  document.getElementById('g-date').value='';

  document.getElementById('g-step-input').value='';

  renderGoalStepsList('g-steps-list', _gSteps, 'g');

  showModal('addgoal');

  // Force-clear step input after browser autofill runs (autofill can fire after DOM update)

  setTimeout(function(){

    var inp = document.getElementById('g-step-input');

    if (inp) inp.value = '';

  }, 80);

}

function saveGoal() {

  var title = (document.getElementById('g-title').value||'').trim();

  if (!title){ alert('Please enter a goal title.'); return; }

  var catSel = document.getElementById('g-cat').value;

  var catId = parseInt(catSel, 10);

  if (isNaN(catId) || catSel === '__custom__') {

    alert('Please create or select a category first.');

    return;

  }

  var dateVal = document.getElementById('g-date').value;

  if (_editingGoalId) {

    // Edit mode — update existing goal

    var existing = goals.find(function(g){ return g.id === _editingGoalId; });

    if (existing) {

      existing.title = title;

      existing.catId = catId;

      existing.targetDate = dateVal;

      existing.steps = _gSteps.slice();

    }

    _editingGoalId = null;

  } else {

    goals.unshift({ id:Date.now(), title:title, catId:catId, targetDate:dateVal, steps:_gSteps.slice(), progress:0 });

  }

  _gSteps = [];

  closeModal('addgoal');

  renderKanban();

  renderGoalsYearOverview();

  updateGoalsCount();

  saveData();

}

function updateGoalsCount() {

  var el = document.getElementById('goals-count');

  if (el) el.textContent = goals.length + ' goal' + (goals.length!==1?'s':'');

}

// ===== PRINT =====

function printPage() {

  var mc = document.getElementById('main-content');

  var tb = document.getElementById('page-timeblocking');

  var isTimeblocking = _currentPage === 'timeblocking';

  if (isTimeblocking) {

    // ---- BUILD AGENDA HTML ----

    var anchor = new Date(_gcalAnchor);

    var days = [];

    if (_gcalView === 'week') {

      var sunday = new Date(anchor);

      sunday.setDate(anchor.getDate() - anchor.getDay());

      for (var i = 0; i < 7; i++) {

        var dd = new Date(sunday);

        dd.setDate(dd.getDate() + i);

        days.push(dd);

      }

    } else {

      days = [anchor];

    }

    // Month names + day names for header

    var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    // Collect all tasks across visible days, sorted by date then time

    var allItems = [];

    days.forEach(function(d) {

      var dk = tbDateKey(d);

      var dayTasks = (_tasks[dk] || []).slice();

      // Sort by start time

      dayTasks.sort(function(a, b) {

        var ta = (a.time || '00:00'), tb2 = (b.time || '00:00');

        return ta < tb2 ? -1 : ta > tb2 ? 1 : 0;

      });

      if (dayTasks.length) {

        allItems.push({ date: d, dk: dk, tasks: dayTasks });

      }

    });

    // Build agenda HTML

    var html = '<div class="ezy-agenda-wrap">';

    // Title

    if (_gcalView === 'week') {

      var firstDay = days[0], lastDay = days[6];

      html += '<div class="ezy-agenda-title">Week of ' + MONTHS[firstDay.getMonth()] + ' ' + firstDay.getDate() + ', ' + firstDay.getFullYear() + '</div>';

    } else {

      html += '<div class="ezy-agenda-title">' + DAYS[anchor.getDay()] + ', ' + MONTHS[anchor.getMonth()] + ' ' + anchor.getDate() + ', ' + anchor.getFullYear() + '</div>';

    }

    if (allItems.length === 0) {

      html += '<div style="color:#666;font-size:14px;">No tasks scheduled.</div>';

    } else {

      allItems.forEach(function(dayItem) {

        // Day heading (only in week view)

        if (_gcalView === 'week') {

          html += '<div style="font-size:13px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.5px;margin:18px 0 10px;border-bottom:1px solid #ddd;padding-bottom:4px;">' +

            DAYS[dayItem.date.getDay()] + ', ' + MONTHS[dayItem.date.getMonth()] + ' ' + dayItem.date.getDate() +

            '</div>';

        }

        dayItem.tasks.forEach(function(t) {

          var timeStr = fmt12(t.time || '00:00');

          if (t.endTime) timeStr += ' → ' + fmt12(t.endTime);

          html += '<div class="ezy-agenda-item">';

          html += '<div class="ezy-agenda-time">' + timeStr + '</div>';

          html += '<div class="ezy-agenda-task">' + esc(t.title) + '</div>';

          if (t.subtasks && t.subtasks.length) {

            html += '<div class="ezy-agenda-subs">';

            t.subtasks.forEach(function(s) {

              html += '<div class="ezy-agenda-sub">✓ ' + esc(s.title) + '</div>';

            });

            html += '</div>';

          }

          html += '</div>';

        });

      });

    }

    // Day view only: append Active Goal Tasks section

    if (_gcalView === 'day') {

      var goalTasks = getActiveGoalTasks();

      if (goalTasks.length) {

        html += '<div class="ezy-goal-tasks-section">';

        html += '<div class="ezy-goal-tasks-title">🎯 Today\'s Active Goal Tasks</div>';

        goalTasks.forEach(function(gt) {

          html += '<div class="ezy-goal-task-row">';

          html += '<div class="ezy-goal-task-chk"></div>';

          html += '<div class="ezy-goal-task-body">';

          if (gt.taskText) {

            html += '<div class="ezy-goal-task-name">' + esc(gt.taskText) + '</div>';

            html += '<div class="ezy-goal-task-meta">' + gt.catEmoji + ' ' + esc(gt.goalTitle) + ' &bull; ' + gt.progress + '% complete' + (gt.taskDate ? ' &bull; Due: ' + gt.taskDate : ' &bull; No date') + '</div>';

          } else {

            html += '<div class="ezy-goal-task-name">' + esc(gt.goalTitle) + '</div>';

            html += '<div class="ezy-goal-task-meta">' + gt.catEmoji + ' ' + esc(gt.catName) + ' &bull; ' + gt.progress + '% complete &bull; No sub-tasks</div>';

          }

          html += '</div></div>';

        });

        html += '</div>';

      }

    }

    html += '</div>';

    // Inject into the print-only div

    var agendaEl = document.getElementById('ezy-print-agenda');

    agendaEl.innerHTML = html;

    // Show time blocking page for print

    mc.style.display = 'none';

    tb.classList.add('print-target');

    window.print();

    // Restore

    setTimeout(function() {

      agendaEl.innerHTML = '';

      mc.style.display = '';

      tb.classList.remove('print-target');

    }, 1500);

  } else {

    // Non-timeblocking pages: standard print

    var pg = document.getElementById('page-' + _currentPage);

    if (pg) pg.classList.add('print-target');

    window.print();

    setTimeout(function() {

      var pg2 = document.getElementById('page-' + _currentPage);

      if (pg2) pg2.classList.remove('print-target');

    }, 1000);

  }

}

function renderKanban() {

  renderGoalsDashboard();

  renderGoalsYearOverview();

  var board = document.getElementById('kanban-board');

  board.innerHTML = '';

  categories.forEach(function(cat) {

    var catGoals = goals.filter(function(g){ return g.catId === cat.id && !(g.progress >= 100 && g.completedAt); });

    var col = document.createElement('div');

    col.className = 'kanban-col';

    col.dataset.catId = cat.id;

    col.draggable = true;

    col.addEventListener('dragstart', function(e) {

      if (e.target !== col && !e.target.classList.contains('kanban-col-header')) return;

      _colDragSrc = Array.from(board.children).indexOf(col);

      e.dataTransfer.setData('colmove','1');

      e.dataTransfer.effectAllowed='move';

      setTimeout(function(){ col.style.opacity='0.4'; },0);

    });

    col.addEventListener('dragend', function() {

      col.style.opacity='';

      board.querySelectorAll('.kanban-col').forEach(function(c){c.classList.remove('drag-over-col');});

    });

    col.ondragover = function(e){ e.preventDefault(); col.classList.add('drag-over-col'); };

    col.ondragleave = function(){ col.classList.remove('drag-over-col'); };

    col.ondrop = function(e){

      e.preventDefault(); col.classList.remove('drag-over-col');

      if (e.dataTransfer.getData('colmove')==='1' && _colDragSrc!==null) {

        var toIdx=Array.from(board.children).indexOf(col);

        if(toIdx!==_colDragSrc){ var m=categories.splice(_colDragSrc,1)[0]; categories.splice(toIdx,0,m); _colDragSrc=null; renderKanban(); } return;

      }

      kbDrop(e, cat.id);

    };

    var hdr = '<div class="kanban-col-header" style="cursor:grab"><span class="kanban-col-emoji">'+cat.emoji+'</span><span class="kanban-col-name">'+esc(cat.name)+'</span><span class="kanban-col-count">'+catGoals.length+'</span></div>';

    var body = '<div class="kanban-col-body" id="kb-body-'+cat.id+'">';

    catGoals.forEach(function(g) {

      body += buildKCard(g);

    });

    body += '<div class="kanban-add-card" onclick="openAddGoalModal('+cat.id+')">+ Add Goal</div>';

    body += '</div>';

    col.innerHTML = hdr + body;

    board.appendChild(col);

    catGoals.forEach(function(g){ renderKCardSteps(g.id); });

  });

  updateGoalsCount();

}

function buildKCard(g) {

  var dateStr = g.targetDate ? '<div class="kcard-date">\uD83D\uDCC5 '+fmtDate(g.targetDate)+'</div>' : '';

  var chevronId = 'kchev-'+g.id;

  var stepsId = 'kcs-'+g.id;

  var isDone = g.progress >= 100;

  var kStatus = isDone ? '' : getGoalStatus(g);

  var kStatusClass = kStatus ? ' status-'+kStatus : '';

  return '<div class="kanban-card'+kStatusClass+'" draggable="true" data-gid="'+g.id+'" ondragstart="kbDragStart(event,'+g.id+')" ondragover="kbCardDragOver(event)" ondrop="kbCardDrop(event,'+g.id+')" ondragleave="kbCardDragLeave(event)" onclick="if(!event.target.closest(\'.kcard-steps\')&&!event.target.closest(\'.kcard-chevron\')&&!event.target.closest(\'.kcard-done-chk\')&&!event.target.closest(\'.kcard-edit-btn\'))openGoalDetail('+g.id+')">'

    +'<div class="kcard-title" style="display:flex;align-items:center;gap:4px">'

    +'<span style="flex:1;min-width:0">'+esc(g.title)+'</span>'

    +'<input type="checkbox" class="kcard-done-chk" title="Mark goal complete" '+(isDone?'checked':'')+' onclick="event.stopPropagation();kcardComplete('+g.id+',this)" />'

    +'<button class="kcard-edit-btn" onclick="event.stopPropagation();openEditGoalModal('+g.id+')" title="Edit goal">&#9998;</button>'

    +'<button class="kcard-chevron" id="'+chevronId+'" onclick="event.stopPropagation();kcardToggle(\'' + g.id + '\')" title="Expand/collapse tasks">▼</button>'

    +'</div>'

    +'<div class="kcard-bar"><div class="kcard-fill" id="kcs-bar-'+g.id+'" style="width:'+g.progress+'%"></div></div>'

    +'<div class="kcard-meta"><span class="kcard-pct" id="kcs-pct-'+g.id+'">'+g.progress+'%</span>'+dateStr+'</div>'

    +'<div class="kcard-steps" id="'+stepsId+'"></div>'

    +'</div>';

}

function kcardComplete(gid, chk) {

  var g = goals.find(function(x){ return x.id === gid; });

  if (!g) return;

  var checking = chk ? chk.checked : !(g.progress >= 100 && g.completedAt);

  if (checking) {

    // Confirm before archiving

    var ok = confirm('Mark "' + g.title + '" as 100% complete and move it to Completed Goals?');

    if (!ok) {

      // Revert checkbox to unchecked state without doing anything

      if (chk) chk.checked = false;

      return;

    }

    // Save snapshot of current step states before overwriting

    if (g.steps && g.steps.length > 0) {

      g.previousTaskStates = g.steps.map(function(s){ return !!s.done; });

      g.steps.forEach(function(s){ s.done = true; });

    }

    g.progress = 100;

    g.completedAt = Date.now();

  } else {

    // Restore previous step states

    if (g.steps && g.steps.length > 0) {

      if (g.previousTaskStates && g.previousTaskStates.length === g.steps.length) {

        g.steps.forEach(function(s, i){ s.done = g.previousTaskStates[i]; });

      } else {

        // Fallback: all incomplete

        g.steps.forEach(function(s){ s.done = false; });

      }

      g.previousTaskStates = undefined;

    }

    // Recalculate progress from restored steps

    if (g.steps && g.steps.length > 0) {

      var done = g.steps.filter(function(s){ return s.done; }).length;

      g.progress = Math.round((done / g.steps.length) * 100);

    } else {

      g.progress = 0;

    }

    g.completedAt = undefined;

  }

  saveData();

  renderKanban();

  renderGoalsDashboard();

}

function kcardToggle(gid) {

  var steps = document.getElementById('kcs-' + gid);

  var chev  = document.getElementById('kchev-' + gid);

  if (!steps) return;

  var collapsed = steps.classList.toggle('collapsed');

  if (chev) chev.textContent = collapsed ? '▶' : '▼';

}

function checkStepOverdue(step) {

  if (!step.targetDate || step.done) return false;

  var today = new Date(); today.setHours(0,0,0,0);

  var d = new Date(step.targetDate + 'T00:00:00');

  return d < today;

}

// Returns 'overdue', 'healthy', or '' (no target dates set)

function getGoalStatus(g) {

  var today = new Date(); today.setHours(0,0,0,0);

  // Goal-level: no date = overdue/unscheduled

  if (!g.targetDate) return 'overdue';

  // Goal-level date past due

  var gd = new Date(g.targetDate + 'T00:00:00');

  if (gd < today && g.progress < 100) return 'overdue';

  // Check sub-task target dates

  var steps = g.steps || [];

  for (var i = 0; i < steps.length; i++) {

    var s = steps[i];

    if (!s.done) {

      // No date on incomplete step = overdue/unscheduled

      if (!s.targetDate) return 'overdue';

      var sd = new Date(s.targetDate + 'T00:00:00');

      if (sd < today) return 'overdue';

    }

  }

  return 'healthy';

}

// Returns first incomplete sub-task for goals shown in the Active Goals tab only.

// Mirrors renderGoalsDashboard: progress < 100, first goal per category (same filter as Active Goals tab).

function getActiveGoalTasks() {

  var result = [];

  var allActive = (goals || []).filter(function(g) { return g.progress < 100; });

  var seenCats = {};

  var activeGoals = allActive.filter(function(g) {

    if (seenCats[g.catId]) return false;

    seenCats[g.catId] = true;

    return true;

  });

  activeGoals.forEach(function(g) {

    var steps = g.steps || [];

    var firstIncomplete = null;

    for (var i = 0; i < steps.length; i++) {

      if (!steps[i].done) { firstIncomplete = steps[i]; break; }

    }

    var cat = (categories || []).find(function(c){ return c.id === g.catId; }) || { emoji: '🎯', name: 'Goal' };

    result.push({

      goalTitle: g.title,

      catEmoji: cat.emoji,

      catName: cat.name,

      taskText: firstIncomplete ? firstIncomplete.text : null,

      taskDate: firstIncomplete ? (firstIncomplete.targetDate || null) : (g.targetDate || null),

      progress: g.progress

    });

  });

  return result;

}

function getOverdueSteps() {

  var result = [];

  var today = new Date(); today.setHours(0,0,0,0);

  (goals||[]).forEach(function(g) {

    if (g.progress >= 100 && g.completedAt) return; // skip completed goals

    if (!g.steps) return;

    g.steps.forEach(function(s) {

      if (s.done) return;

      if (!s.targetDate) {

        // No date = unscheduled/overdue

        result.push({ goalTitle: g.title, stepText: s.text, targetDate: null, daysLate: null });

      } else {

        var d = new Date(s.targetDate + 'T00:00:00');

        if (d < today) result.push({ goalTitle: g.title, stepText: s.text, targetDate: s.targetDate, daysLate: Math.floor((today - d) / 86400000) });

      }

    });

  });

  return result;

}

function goalsShowOverdue() {

  // Navigate to Goals page, All Goals tab (index 1)

  showPage('goals');

  goalsGoTab(1);

  // After render, scroll to first overdue goal card and flash it

  requestAnimationFrame(function() {

    var og = getOverdueGoals();

    if (!og.length) return;

    var firstId = og[0].id;

    var card = document.querySelector('.kanban-card[data-gid="' + firstId + '"]');

    if (card) {

      card.scrollIntoView({ behavior:'smooth', block:'center' });

      card.classList.add('overdue-highlight');

      setTimeout(function(){ card.classList.remove('overdue-highlight'); }, 2000);

    }

  });

}

function getOverdueGoals() {

  var result = [];

  var today = new Date(); today.setHours(0,0,0,0);

  (goals||[]).forEach(function(g) {

    if (g.progress >= 100 && g.completedAt) return; // already complete

    if (!g.targetDate) {

      // No date = unscheduled/overdue

      result.push({ id: g.id, title: g.title, targetDate: null, daysLate: null, progress: g.progress });

    } else {

      var d = new Date(g.targetDate + 'T00:00:00');

      if (d < today) result.push({ id: g.id, title: g.title, targetDate: g.targetDate, daysLate: Math.floor((today - d) / 86400000), progress: g.progress });

    }

  });

  return result;

}

function renderKCardSteps(gid) {

  var wrap = document.getElementById('kcs-' + gid);

  if (!wrap) return;

  var g = goals.find(function(x){ return x.id === gid; });

  if (!g || !g.steps || g.steps.length === 0) { wrap.innerHTML = ''; return; }

  wrap.innerHTML = '';

  var arr = g.steps;

  var dragSrcIdx = null;

  arr.forEach(function(step, idx) {

    var row = document.createElement('div');

    row.className = 'kcard-step-row';

    row.draggable = false;

    // Drag handle

    var hdl = document.createElement('span');

    hdl.className = 'kcard-step-hdl';

    hdl.innerHTML = '&#x22EE;&#x22EE;';

    hdl.title = 'Drag to reorder';

    hdl.draggable = true;

    // Checkbox

    var chk = document.createElement('div');

    chk.className = 'kcard-step-chk' + (step.done ? ' done' : '');

    // Text

    var txt = document.createElement('span');

    txt.className = 'kcard-step-txt' + (step.done ? ' done-step' : '');

    txt.contentEditable = 'true';

    txt.textContent = step.text;

    // Stop clicks on interactive elements from opening goal detail modal

    chk.addEventListener('click', function(e) {

      e.stopPropagation();

      step.done = !step.done;

      if (step.done) { chk.classList.add('done'); txt.classList.add('done-step'); }

      else { chk.classList.remove('done'); txt.classList.remove('done-step'); }

      // Recalc progress

      var doneCnt = arr.filter(function(s){ return s.done; }).length;

      var newPct = Math.round((doneCnt / arr.length) * 100);

      g.progress = newPct;

      if (newPct === 100 && !g.completedAt) { g.completedAt = Date.now(); }

      else if (newPct < 100) { g.completedAt = null; }

      saveData();

      renderKanban();

    });

    txt.addEventListener('click', function(e){ e.stopPropagation(); });

    txt.addEventListener('blur', function() {

      var val = txt.textContent.trim();

      if (val) { step.text = val; saveData(); }

      else { txt.textContent = step.text; }

    });

    txt.addEventListener('keydown', function(e) {

      if (e.key === 'Enter') { e.preventDefault(); txt.blur(); }

    });

    // DnD  scoped to this steps list, tagged kcs-step -- drag via handle only

    hdl.addEventListener('dragstart', function(e) {

      e.stopPropagation();

      dragSrcIdx = idx;

      row.draggable = true;

      e.dataTransfer.setData('kcs-step', String(gid));

      e.dataTransfer.effectAllowed = 'move';

      setTimeout(function(){ row.classList.add('kcs-dragging'); }, 0);

    });

    hdl.addEventListener('dragend', function() { row.draggable = false; });

    row.addEventListener('dragstart', function(e) {

      if (!row.draggable) { e.preventDefault(); e.stopPropagation(); return; }

      e.stopPropagation();

    });

    row.addEventListener('dragend', function() {

      row.classList.remove('kcs-dragging');

      wrap.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-drop-above','kcs-drop-below'); });

    });

    row.addEventListener('dragover', function(e) {

      if (e.dataTransfer.types.indexOf('kcs-step') === -1) return;

      e.preventDefault(); e.stopPropagation();

      var rect = row.getBoundingClientRect();

      var before = (e.clientY - rect.top) < rect.height / 2;

      wrap.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-drop-above','kcs-drop-below'); });

      row.classList.add(before ? 'kcs-drop-above' : 'kcs-drop-below');

      row._kcsInsertBefore = before;

    });

    row.addEventListener('dragleave', function() {

      row.classList.remove('kcs-drop-above');

    });

    row.addEventListener('drop', function(e) {

      e.preventDefault(); e.stopPropagation();

      var insertBefore = row._kcsInsertBefore !== false;

      row.classList.remove('kcs-drop-above','kcs-drop-below');

      if (dragSrcIdx === null || dragSrcIdx === idx) return;

      var moved = arr.splice(dragSrcIdx, 1)[0];

      var newIdx = insertBefore ? idx : idx + 1;

      if (dragSrcIdx < idx) newIdx = insertBefore ? idx - 1 : idx;

      if (newIdx < 0) newIdx = 0;

      if (newIdx > arr.length) newIdx = arr.length;

      arr.splice(newIdx, 0, moved);

      dragSrcIdx = null;

      g.steps = arr;

      saveData();

      renderKCardSteps(gid);

    });

    // Date picker for this step

    var datePick = document.createElement('input');

    datePick.type = 'date';

    datePick.className = 'kcard-step-date' + (checkStepOverdue(step) ? ' overdue' : '');

    datePick.title = 'Set target date for this task';

    if (step.targetDate) datePick.value = step.targetDate;

    datePick.addEventListener('click', function(e){ e.stopPropagation(); });

    datePick.addEventListener('change', function(e) {

      e.stopPropagation();

      step.targetDate = datePick.value || undefined;

      datePick.className = 'kcard-step-date' + (checkStepOverdue(step) ? ' overdue' : '');

      saveData();

    });

    row.appendChild(hdl);

    row.appendChild(chk);

    row.appendChild(txt);

    row.appendChild(datePick);

    wrap.appendChild(row);

  });

}

var _kbDragGoalId = null;

var _colDragSrc = null;

function kbDragStart(e, gid) {

  _kbDragGoalId = gid;

  e.dataTransfer.effectAllowed = 'move';

  e.dataTransfer.setData('text/plain', String(gid));

  setTimeout(function(){

    var el = document.querySelector('.kanban-card[data-gid="'+gid+'"]');

    if(el) el.classList.add('dragging-card');

  },0);

}

function kbDrop(e, catId) {

  e.preventDefault();

  if (_kbDragGoalId === null) return;

  var g = goals.find(function(x){ return x.id === _kbDragGoalId; });

  if (g) g.catId = catId;

  _kbDragGoalId = null;

  document.querySelectorAll('.kanban-card').forEach(function(c){ c.classList.remove('dragging-card','drag-over-card'); });

  renderKanban();

}

function kbCardDragOver(e) {

  e.preventDefault(); e.stopPropagation();

  e.currentTarget.classList.add('drag-over-card');

}

function kbCardDragLeave(e) {

  e.currentTarget.classList.remove('drag-over-card');

}

function kbCardDrop(e, targetGid) {

  e.preventDefault(); e.stopPropagation();

  e.currentTarget.classList.remove('drag-over-card');

  if (_kbDragGoalId === null || _kbDragGoalId === targetGid) return;

  var srcIdx = goals.findIndex(function(g){ return g.id===_kbDragGoalId; });

  var tgtIdx = goals.findIndex(function(g){ return g.id===targetGid; });

  if (srcIdx<0||tgtIdx<0) return;

  var srcG = goals[srcIdx];

  // Move to same catId as target

  srcG.catId = goals[tgtIdx].catId;

  goals.splice(srcIdx,1);

  var newTgt = goals.findIndex(function(g){ return g.id===targetGid; });

  goals.splice(newTgt,0,srcG);

  _kbDragGoalId = null;

  renderKanban();

}

function openGoalDetail(gid) {

  var g = goals.find(function(x){ return x.id===gid; });

  if (!g) return;

  _editingGoalId = gid;

  var cat = categories.find(function(c){ return c.id===g.catId; }) || {emoji:'⭐',name:'General'};

  document.getElementById('gd-cat-badge').textContent = cat.emoji+' '+cat.name;

  document.getElementById('gd-title').value = g.title;

  document.getElementById('gd-progress').value = g.progress;

  document.getElementById('gd-pct-label').textContent = g.progress + '%';

  document.getElementById('gd-date').value = g.targetDate || '';

  _gdSteps = (g.steps || []).map(function(s){ return {text:s.text, done:s.done}; });

  document.getElementById('gd-step-input').value='';

  renderGoalStepsList('gd-steps-list', _gdSteps, 'gd');

  showModal('goaldetail');

}

function renderStepList(steps) {

  var el = document.getElementById('gd-steps');

  el.innerHTML = steps.length === 0 ? '<div style="font-size:12px;color:var(--text3);padding:4px 0 6px">No steps yet.</div>' :

    steps.map(function(s,i) {

      return '<div class="step-row">'

        +'<div class="step-check'+(s.done?' done':'')+'" onclick="gdToggleStep('+i+')"></div>'

        +'<input class="step-text" value="'+esc(s.text)+'" onchange="gdUpdateStepText('+i+',this.value)"'+(s.done?' style="text-decoration:line-through;color:var(--text3)"':'')+'>'

        +'<button class="step-del" onclick="gdDeleteStep('+i+')">?</button>'

        +'</div>';

    }).join('');

}

function gdAddStep() {

  var inp = document.getElementById('gd-new-step');

  var txt = (inp.value||'').trim();

  if (!txt) return;

  var g = goals.find(function(x){return x.id===_editingGoalId;});

  if (!g) return;

  if (!g.steps) g.steps = [];

  g.steps.push({id:Date.now(),text:txt,done:false});

  inp.value = '';

  renderStepList(g.steps);

}

// Dashboard card step toggle — marks step by index, recalculates progress, archives if 100%

function gdDashToggleStep(goalId, stepIdx) {

  var g = goals.find(function(x){ return x.id === goalId; });

  if (!g || !g.steps || !g.steps[stepIdx]) return;

  g.steps[stepIdx].done = !g.steps[stepIdx].done;

  // Recalculate progress from steps

  var total = g.steps.length;

  var doneCnt = g.steps.filter(function(s){ return s.done; }).length;

  var newPct = total > 0 ? Math.round(doneCnt / total * 100) : g.progress;

  if (newPct === 100 && g.progress < 100) g.completedAt = Date.now();

  if (newPct === 100 && !g.completedAt) g.completedAt = Date.now();

  if (newPct < 100) g.completedAt = undefined;

  g.progress = newPct;

  saveData();

  renderKanban();

}

function gdDashStepDateChange(e) {

  var inp = e.target;

  var gid = parseInt(inp.dataset.gid, 10);

  var si = parseInt(inp.dataset.si, 10);

  var g = goals.find(function(x){ return x.id === gid; });

  if (!g || !g.steps || !g.steps[si]) return;

  g.steps[si].targetDate = inp.value || undefined;

  saveData();

  renderKanban();

}

function gdToggleStep(i) {

  var g = goals.find(function(x){return x.id===_editingGoalId;});

  if (!g||!g.steps) return;

  g.steps[i].done = !g.steps[i].done;

  renderStepList(g.steps);

}

function gdUpdateStepText(i, val) {

  var g = goals.find(function(x){return x.id===_editingGoalId;});

  if (g&&g.steps&&g.steps[i]) g.steps[i].text = val;

}

function gdDeleteStep(i) {

  var g = goals.find(function(x){return x.id===_editingGoalId;});

  if (!g||!g.steps) return;

  g.steps.splice(i,1);

  renderStepList(g.steps);

}

function gdSave() {

  var g = goals.find(function(x){return x.id===_editingGoalId;});

  if (!g) return;

  g.title = (document.getElementById('gd-title').value||'').trim() || g.title;

  g.steps = _gdSteps.slice();

  var sliderPct = parseInt(document.getElementById('gd-progress').value,10)||0;

  // If steps exist, derive progress from steps (step checkboxes are authoritative)

  var newPct = sliderPct;

  if (_gdSteps.length > 0) {

    var doneCnt = _gdSteps.filter(function(s){ return s.done; }).length;

    newPct = Math.round((doneCnt / _gdSteps.length) * 100);

  }

  // Strict 100% gate: only archive at exactly 100%, restore below 100%

  if (newPct === 100 && g.progress < 100) g.completedAt = Date.now();

  if (newPct === 100 && !g.completedAt) g.completedAt = Date.now();

  if (newPct < 100) g.completedAt = undefined;

  g.progress = newPct;

  g.targetDate = document.getElementById('gd-date').value;

  closeModal('goaldetail');

  renderKanban();

  saveData();

}

function gdDeleteGoal() {

  if (!confirm('Delete this goal?')) return;

  goals = goals.filter(function(g){ return g.id !== _editingGoalId; });

  closeModal('goaldetail');

  renderKanban();

  saveData();

}

// ===== CATEGORIES =====

function openCatModal() {

  _newCatEmoji='😊';

  document.getElementById('new-cat-emoji').textContent='😊';

  document.getElementById('new-cat-name').value='';

  renderCatList();

  renderKanban();

  buildEP('new',function(emoji){ _newCatEmoji=emoji; document.getElementById('new-cat-emoji').textContent=emoji; });

  showModal('cats');

}

function renameCat(id){

  var c=categories.find(function(x){return x.id===id;});

  if(!c)return;

  var n=prompt('Rename category:',c.name);

  if(n&&n.trim()&&n.trim()!==c.name){

    if(categories.find(function(x){return x.id!==id&&x.name.toLowerCase()===n.trim().toLowerCase();})){alert('Name already used.');return;}

    c.name=n.trim(); renderCatList(); saveData();

  }

}

// ===== CATEGORY LIST DRAG-AND-DROP =====

var _catDragSrc = null;

function catItemDragStart(e, idx) {

  _catDragSrc = idx;

  e.dataTransfer.effectAllowed = 'move';

  setTimeout(function(){ var el=e.currentTarget; if(el) el.classList.add('cat-dragging'); },0);

}

function catItemDragOver(e, idx) {

  if(_catDragSrc===null||_catDragSrc===idx) return;

  e.preventDefault();

  var el = e.currentTarget;

  var rect = el.getBoundingClientRect();

  var insertBefore = (e.clientY - rect.top) < rect.height / 2;

  document.querySelectorAll('.cat-item').forEach(function(r){ r.classList.remove('cat-drag-over','cat-drop-before','cat-drop-after'); });

  el.classList.add(insertBefore ? 'cat-drop-before' : 'cat-drop-after');

  el._catInsertBefore = insertBefore;

}

function catItemDrop(e, idx) {

  e.preventDefault();

  var target = e.currentTarget;

  var insertBefore = target._catInsertBefore !== false;

  document.querySelectorAll('.cat-item').forEach(function(el){ el.classList.remove('cat-drag-over','cat-dragging','cat-drop-before','cat-drop-after'); });

  if(_catDragSrc===null||_catDragSrc===idx) return;

  var moved = categories.splice(_catDragSrc, 1)[0];

  // Recalc idx after splice

  var newIdx = categories.findIndex(function(x){ return false; }); // placeholder

  // Find the target element's new position

  var allItems = document.querySelectorAll('.cat-item');

  var targetItem = target;

  var afterSplice = Array.from(allItems).indexOf(targetItem);

  var insertAt = insertBefore ? idx : idx + 1;

  if (_catDragSrc < idx) insertAt = insertBefore ? idx - 1 : idx;

  if (insertAt < 0) insertAt = 0;

  if (insertAt > categories.length) insertAt = categories.length;

  categories.splice(insertAt, 0, moved);

  _catDragSrc = null;

  renderCatList(); renderKanban(); saveData();

}

function catItemDragEnd() {

  _catDragSrc = null;

  document.querySelectorAll('.cat-item').forEach(function(el){ el.classList.remove('cat-drag-over','cat-dragging','cat-drop-before','cat-drop-after'); });

}

function renderCatList(){

  var list=document.getElementById('cat-list');

  list.innerHTML=categories.map(function(c, idx){

    return '<div class="cat-item" draggable="true" ondragstart="catItemDragStart(event,'+idx+')" ondragover="catItemDragOver(event,'+idx+')" ondrop="catItemDrop(event,'+idx+')" ondragend="catItemDragEnd()"><span class="cat-drag-handle" title="Drag to reorder">?</span><div class="ep-wrap"><button class="cat-emoji-btn" onclick="openCatEP('+c.id+')">'+c.emoji+'</button><div class="ep-popup" id="ep-cat'+c.id+'"></div></div><span class="cat-name" title="Double-click to rename" ondblclick="renameCat('+c.id+')">'+esc(c.name)+'</span><button class="btn btn-outline btn-sm" onclick="renameCat('+c.id+')" style="padding:3px 8px;font-size:11px">✏️</button><button class="cat-del" onclick="delCat('+c.id+')" title="Delete">?</button></div>';

  }).join('');

  categories.forEach(function(c){

    buildEP('cat'+c.id,(function(cat){ return function(emoji){ cat.emoji=emoji; closeAllEPs(); renderCatList(); saveData(); }; })(c));

  });

}

function openCatEP(id){ toggleEP('cat'+id); }

function addCat(){

  var name=(document.getElementById('new-cat-name').value||'').trim();

  if(!name){ alert('Enter a category name.'); return; }

  if(categories.find(function(c){ return c.name.toLowerCase()===name.toLowerCase(); })){ alert('That category already exists.'); return; }

  categories.push({id:_nextCatId++,name:name,emoji:_newCatEmoji});

  _newCatEmoji='😊'; document.getElementById('new-cat-emoji').textContent='😊'; document.getElementById('new-cat-name').value='';

  renderCatList();

  renderKanban();

  buildEP('new',function(emoji){ _newCatEmoji=emoji; document.getElementById('new-cat-emoji').textContent=emoji; });

  saveData();

}

function delCat(id){

  if(categories.length<=1){alert('Need at least one category.');return;}

  if(!confirm('Delete this category?'))return;

  categories=categories.filter(function(c){return c.id!==id;});

  renderCatList();

  saveData();

}

// ===== EMOJI PICKER =====

var EP_CATS = [

  { icon:'😊', label:'Smileys', emojis:['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','🤩','😘','😗','😚','😙','🥲','😐','😑','😶','😏','😒','🙄','😬','😌','😔','😪','😴','😷','🤒','🤕','🤢','🤧','😵','🤯','🤠','🥳','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👻','👽','🤖','🎃'] },

  { icon:'👤', label:'People', emojis:['👋','🤚','🖐️','✋','🖖','🤙','💪','👶','🧒','👦','👧','🧑','👱','👨','👩','🧓','👴','👵','👮','🕵️','💂','👷','🤴','👸','👳','👲','🧕','🤵','👰','🤰','🤱','👼','🎅','🤶','🦸','🦹','🧙','🧝','🧛','🧟','🧞','🧜','🧚','👫','👬','👭','💏','💑','👪','🧑‍💼','👩‍💼','👨‍💼','🧑‍🎓','🧑‍🔧','🧑‍🍳','🧑‍🌾','🧑‍🔬','🧑‍🎨','🧑‍✈️','🧑‍🚀','🧑‍⚕️','🧑‍🏫','🧑‍🏭','🧑‍💻','🧑‍🎤','🧑‍🎭','🧑‍🎪','🧑‍⚖️'] },

  { icon:'🐾', label:'Animals', emojis:['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🐢','🐍','🦎','🦕','🦖','🐙','🦑','🦐','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐑','🐐','🦌','🐕','🐩','🐈','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐿️','🦔'] },

  { icon:'🍕', label:'Food', emojis:['🍕','🍔','🌮','🌯','🥙','🧆','🥚','🍳','🥘','🍲','🥣','🥗','🍿','🍱','🍙','🍚','🍛','🍜','🍝','🍣','🍤','🍥','🍡','🥟','🥡','🦀','🦞','🦐','🦑','🦪','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','🍼','🥛','☕','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🥄','🍴','🍽️','🥢','🫙','🍞','🧀','🥩','🍗','🍖','🌭','🥪','🧇','🥞','🧈','🥓','🍟','🌽','🥦','🥕','🥑','🍎','🍊','🍋','🍇','🍓'] },

  { icon:'✈️', label:'Travel', emojis:['✈️','🚀','🛸','🚁','🚗','🚕','🚙','🛻','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🚚','🚛','🚜','🏍️','🛵','🚲','🛴','🛹','🛼','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚞','🚝','🚋','🚌','🚍','🚎','🚐','⛵','🚤','🛥️','🛳️','⛴️','🚢','🗺️','🧭','🏔️','⛰️','🌋','🏕️','🏖️','🏜️','🏝️','🏞️','🏟️','🏛️','🏗️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏬','🏭','🏯','🏰','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉'] },

  { icon:'⚽', label:'Sports', emojis:['⚽','🏀','🏈','⚾','🥎','🏐','🏉','🎾','🥏','🎱','🏓','🏸','⛳','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','⛷️','🏂','🪂','🏋️','🤼','🤸','⛹️','🤺','🏇','🧘','🏄','🏊','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎯','🎳','🎰','🎲','🎭','🎨','🎬','🎤','🎧','🎼','🎵','🎶','🥁','🎷','🎺','🎸','🎻','🎮','🕹️','🎲','🎯','🎳','🎰'] },

  { icon:'🛠️', label:'Objects', emojis:['🛠️','🔧','🪛','🔩','⚙️','🔑','🗝️','🔒','🔓','🔨','⛏️','🧲','💡','🔦','🕯️','🧯','💰','💳','💎','⚖️','🧰','🔭','🔬','🩺','💊','🩹','👓','🕶️','🥽','🌡️','🛋️','🪑','🚿','🛁','🪞','🛏️','🧸','🖼️','🪄','🎀','🎊','🎉','🎈','🎁','📱','💻','⌨️','🖥️','🖨️','📷','📸','📹','🎥','📺','📻','📡','🔋','🪫','🔌','💾','💿','📀','🖱️','🖨️','📠','📟','📺','🎙️','📷','📸','🔭','🔬','🕯️','💡','🔦','🏮','🪔'] },

  { icon:'✅', label:'Symbols', emojis:['✅','❌','⭐','🔥','💯','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','☢️','☣️','📴','📳','✴️','🆚','💮','🈴','🈵','🅰️','🅱️','🆎','🆑','🅾️','🆘','❓','❔','❕','❗','🔅','🔆','📶','💤','🔔','🔕','🎵','🎶','♻️','💠','🔱','📛','🔰','⭕','✅','❎','🔲','🔳','▪️','▫️','◾','◽','◼️','◻️','⬛','⬜','🟥','🟧','🟨','🟩','🟦','🟪','🟫','⬛','⬜'] }

];

var _epActiveIdx = 0;

var _epSearchTerm = '';

var _epCBs = {};

function buildEP(key, cb) {

  var el = document.getElementById('ep-' + key);

  if (!el) return;

  _epCBs[key] = cb;

  el._cb = cb;

  _renderEP(key);

}

function _renderEP(key) {

  var el = document.getElementById('ep-' + key);

  if (!el) return;

  var cat = EP_CATS[_epActiveIdx] || EP_CATS[0];

  var term = _epSearchTerm.toLowerCase();

  var list = term

    ? EP_CATS.reduce(function(a,c){ return a.concat(c.emojis); }, []).filter(function(e){ return e.indexOf(term) >= 0; }).slice(0,120)

    : cat.emojis;

  var tabsHtml = EP_CATS.map(function(cat2, i) {

    var cls = 'ep-cat-tab' + ((i === _epActiveIdx && !term) ? ' ep-tab-active' : '');

    return '<button class="' + cls + '" data-epkey="' + key + '" data-idx="' + i + '" onclick="event.stopPropagation();_epSetCat(this.dataset.epkey,parseInt(this.dataset.idx))" title="' + cat2.label + '">' + cat2.icon + '</button>';

  }).join('');

  var gridHtml = list.map(function(emoji) {

    var safeEmoji = emoji.replace(/"/g, '&quot;');

    return '<span class="ep-opt" data-epkey="' + key + '" data-val="' + safeEmoji + '" onclick="event.stopPropagation();pickEmoji(this.dataset.epkey,this.dataset.val)">' + emoji + '</span>';

  }).join('');

  var kbdId = 'ep-kbd-' + key;

  var kbdRow = '<div class="ep-kbd-row">'

    + '<input class="ep-kbd-inp" id="' + kbdId + '" placeholder="Type or paste any emoji, press Use" data-epkey="' + key + '" oninput="event.stopPropagation()" onkeydown="event.stopPropagation();if(event.key===String.fromCharCode(13)){var v=this.value.trim();if(v)pickEmoji(this.dataset.epkey,v);}" autocomplete="off">'

    + '<button class="ep-kbd-btn" data-kbdid="' + kbdId + '" data-epkey="' + key + '" onclick="event.stopPropagation();var v=document.getElementById(this.dataset.kbdid).value.trim();if(v)pickEmoji(this.dataset.epkey,v);">Use ?</button>'

    + '</div>';

  var searchRow = '<input class="ep-search-inp" placeholder="Search emoji..." value="'

    + _epSearchTerm.replace(/"/g, '&quot;')

    + '" data-epkey="' + key + '" oninput="event.stopPropagation();_epSearch(this.dataset.epkey,this.value)" autocomplete="off">';

  el.innerHTML = kbdRow + searchRow + '<div class="ep-cat-tabs">' + tabsHtml + '</div><div class="ep-grid">' + gridHtml + '</div>';

}

function _epSetCat(key, idx) {

  _epActiveIdx = idx;

  _epSearchTerm = '';

  _renderEP(key);

}

function _epSearch(key, term) {

  _epSearchTerm = term;

  _renderEP(key);

}

function toggleEP(key) {

  var el = document.getElementById('ep-' + key);

  if (!el) return;

  var was = el.classList.contains('open');

  closeAllEPs();

  if (!was) { _epActiveIdx = 0; _epSearchTerm = ''; el.classList.add('open'); _renderEP(key); }

}

function pickEmoji(key, emoji) {

  var el = document.getElementById('ep-' + key);

  var cb = (el && el._cb) || _epCBs[key];

  if (cb) cb(emoji);

  closeAllEPs();

}

function closeAllEPs() { document.querySelectorAll('.ep-popup').forEach(function(p){ p.classList.remove('open'); }); }

document.addEventListener('click',function(e){ if(!e.target.closest('.ep-wrap')&&!e.target.classList.contains('cat-emoji-btn'))closeAllEPs(); });

// ===== NOTES =====

var NOTE_COLORS = [

  {cls:'',      label:'Default'},

  {cls:'nc-red',    label:'Red'},

  {cls:'nc-orange', label:'Orange'},

  {cls:'nc-yellow', label:'Yellow'},

  {cls:'nc-green',  label:'Green'},

  {cls:'nc-teal',   label:'Teal'},

  {cls:'nc-blue',   label:'Blue'},

  {cls:'nc-pink',   label:'Pink'}

];

function buildNoteColorPicker(selectedCls) {

  var el = document.getElementById('nm-colors');

  el.innerHTML = NOTE_COLORS.map(function(c){

    var sel = (c.cls === selectedCls) ? ' sel' : '';

    var dotCls = c.cls ? 'nc-dot-'+c.cls.replace('nc-','') : 'nc-dot-default';

    return '<div class="nc-dot '+dotCls+sel+'" title="'+c.label+'" onclick="nmSelectColor(\''+c.cls+'\')" style="position:relative"></div>';

  }).join('');

}

function nmSelectColor(cls) {

  _nmColor = cls;

  buildNoteColorPicker(cls);

}

function openNoteModal(noteId) {

  _editingNoteId = noteId;

  _nmPinned = false;

  _nmColor = '';

  if (noteId !== null) {

    var n = notes.find(function(x){return x.id===noteId;});

    if (!n) return;

    document.getElementById('nm-title').value = n.title || '';

    nceSetValue(n.body || '');

    _nmColor = n.color || '';

    _nmPinned = !!n.pinned;

    document.getElementById('nm-del-btn').style.display = 'inline-flex';

    document.getElementById('note-modal-ttl').textContent = '📝 Edit Note';

  } else {

    document.getElementById('nm-title').value = '';

    nceSetValue('');

    document.getElementById('nm-del-btn').style.display = 'none';

    document.getElementById('note-modal-ttl').textContent = '📝 New Note';

  }

  var pinBtn = document.getElementById('nm-pin-btn');

  pinBtn.textContent = _nmPinned ? '📌 Unpin' : '📌 Pin';

  buildNoteColorPicker(_nmColor);

  showModal('note');

}

function nmTogglePin() {

  _nmPinned = !_nmPinned;

  document.getElementById('nm-pin-btn').textContent = _nmPinned ? '📌 Unpin' : '📌 Pin';

}

function nmSave() {

  var body = nceGetValue().trim();

  if (!body) { alert('Note body cannot be empty.'); return; }

  if (_editingNoteId !== null) {

    var n = notes.find(function(x){return x.id===_editingNoteId;});

    if (n) {

      n.title = (document.getElementById('nm-title').value||'').trim();

      n.body = body;

      n.color = _nmColor;

      n.pinned = _nmPinned;

    }

  } else {

    notes.unshift({

      id: Date.now(),

      title: (document.getElementById('nm-title').value||'').trim(),

      body: body,

      color: _nmColor,

      pinned: _nmPinned

    });

  }

  closeModal('note');

  renderNotes();

  saveData();

}

function nmDelete() {

  if (!confirm('Delete this note?')) return;

  notes = notes.filter(function(n){return n.id!==_editingNoteId;});

  closeModal('note');

  renderNotes();

  saveData();

}

// ===== NOTES FORMATTING TOOLBAR =====

function noteInsertFormat(type) {

  var el = document.getElementById('nm-body'); if (!el) return;

  // Append a new formatted row to the contenteditable editor

  if (type === 'numbered') {

    // Count existing numbered rows to determine next number

    var numRows = el.querySelectorAll('.nce-num-label').length;

    var row = _nceNumRow(numRows + 1, '');

    if (el.lastChild && el.lastChild.nodeName !== 'BR') el.appendChild(document.createElement('br'));

    el.appendChild(row);

    var span = row.querySelector('.nce-text'); if (span) span.focus();

  } else {

    var row = _nceRow(false, '');

    if (el.lastChild && el.lastChild.nodeName !== 'BR') el.appendChild(document.createElement('br'));

    el.appendChild(row);

    var span = row.querySelector('.nce-text'); if (span) span.focus();

  }

}


// ===== NOTE CONTENTEDITABLE HELPERS =====
// Store/retrieve plain-text markdown format from the contenteditable div.
// The div renders live checkboxes; internally we always serialize back to "[ ]"/"[x]" text.

function nceGetValue() {
  var el = document.getElementById('nm-body'); if (!el) return '';
  // Serialize the live DOM back to plain text
  var lines = [];
  el.childNodes.forEach(function(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      // plain text node at root level
      node.textContent.split('\n').forEach(function(l){ lines.push(l); });
    } else if (node.classList && node.classList.contains('nce-row')) {
      var cb = node.querySelector('.nce-cb');
      var txt = node.querySelector('.nce-text');
      var textContent = txt ? txt.textContent : node.textContent;
      if (cb) {
        lines.push((cb.checked ? '[x] ' : '[ ] ') + textContent);
      } else {
        // numbered list row or plain row
        lines.push(textContent);
      }
    } else if (node.nodeName === 'BR') {
      lines.push('');
    } else {
      lines.push(node.textContent||'');
    }
  });
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function nceSetValue(text) {
  var el = document.getElementById('nm-body'); if (!el) return;
  el.innerHTML = '';
  if (!text) return;
  var lines = text.split('\n');
  lines.forEach(function(line, idx) {
    var cbMatch = line.match(/^\[([ x])\]\s?(.*)/i);
    var numMatch = line.match(/^(\d+)\.\s?(.*)/);
    if (cbMatch) {
      var row = _nceRow(cbMatch[1].toLowerCase() === 'x', cbMatch[2]);
      el.appendChild(row);
    } else if (numMatch) {
      var row = _nceNumRow(numMatch[1], numMatch[2]);
      el.appendChild(row);
    } else {
      var row = _ncePlainRow(line);
      el.appendChild(row);
    }
    if (idx < lines.length - 1) el.appendChild(document.createElement('br'));
  });
}

function _nceRow(checked, text) {
  var div = document.createElement('div');
  div.className = 'nce-row';
  var cb = document.createElement('input');
  cb.type = 'checkbox'; cb.className = 'nce-cb'; cb.checked = checked;
  cb.addEventListener('change', function(){ var s = div.querySelector('.nce-text'); if(s){ s.classList.toggle('done', cb.checked); } });
  var span = document.createElement('span');
  span.className = 'nce-text' + (checked ? ' done' : '');
  span.contentEditable = 'true'; span.textContent = text;
  div.appendChild(cb); div.appendChild(span);
  return div;
}

function _nceNumRow(num, text) {
  var div = document.createElement('div');
  div.className = 'nce-row';
  var label = document.createElement('span');
  label.className = 'nce-num-label';
  label.style.cssText = 'flex-shrink:0;color:var(--text2);min-width:22px;';
  label.textContent = num + '.';
  var span = document.createElement('span');
  span.className = 'nce-text';
  span.contentEditable = 'true'; span.textContent = text;
  div.appendChild(label); div.appendChild(span);
  return div;
}

function _ncePlainRow(text) {
  var div = document.createElement('div');
  div.className = 'nce-row';
  var span = document.createElement('span');
  span.className = 'nce-text';
  span.contentEditable = 'true'; span.textContent = text;
  div.appendChild(span);
  return div;
}

// Keyboard: Enter auto-continuation and numbered list increment
(function _nceKeyboardInit() {
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    var el = document.getElementById('nm-body'); if (!el) return;
    // Find focused element inside nm-body
    var active = document.activeElement;
    if (!el.contains(active)) return;
    var row = active.closest ? active.closest('.nce-row') : null;
    if (!row || !el.contains(row)) return;
    e.preventDefault();
    var isCheckbox = !!row.querySelector('.nce-cb');
    var isNum = !!row.querySelector('.nce-num-label');
    var newRow;
    if (isCheckbox) {
      newRow = _nceRow(false, '');
    } else if (isNum) {
      // Find current number and increment
      var label = row.querySelector('.nce-num-label');
      var cur = label ? parseInt(label.textContent, 10) : 1;
      // Update all subsequent sibling num rows
      var sibs = el.querySelectorAll('.nce-row');
      var found = false;
      sibs.forEach(function(s) {
        if (s === row) { found = true; return; }
        if (!found) return;
        var sl = s.querySelector('.nce-num-label');
        if (sl) { sl.textContent = (parseInt(sl.textContent,10)+1)+'.'; }
      });
      newRow = _nceNumRow(cur + 1, '');
    } else {
      newRow = _ncePlainRow('');
    }
    // Insert newRow after current row
    var br = row.nextSibling && row.nextSibling.nodeName === 'BR' ? row.nextSibling : null;
    var insertAfter = br || row;
    var brNew = document.createElement('br');
    el.insertBefore(brNew, insertAfter.nextSibling || null);
    el.insertBefore(newRow, brNew.nextSibling || null);
    // Focus the text span of new row
    var newSpan = newRow.querySelector('.nce-text');
    if (newSpan) { newSpan.focus(); }
  });
})();

// ===== NOTES CHECKBOX CARD RENDERING =====

function buildNoteBodyHtml(body) {

  if (!body) return '';

  var lines = body.split('\n');

  var hasCb = lines.some(function(l){ return /^\[[ x]\]\s/.test(l); });

  if (!hasCb) return '<div class="note-card-body">'+esc(body.slice(0,300))+'</div>';

  var out = '<ul class="note-cb-list">';

  lines.slice(0,20).forEach(function(l) {

    if (/^\[ \]\s/.test(l)) {

      var text = l.replace(/^\[ \]\s*/,'');

      out += '<li class="note-cb-item"><input type="checkbox" onclick="event.stopPropagation();noteCardToggleCb(this)" data-line="'+esc(l)+'"><span>'+esc(text)+'</span></li>';

    } else if (/^\[x\]\s/i.test(l)) {

      var text = l.replace(/^\[x\]\s*/i,'');

      out += '<li class="note-cb-item done"><input type="checkbox" checked onclick="event.stopPropagation();noteCardToggleCb(this)" data-line="'+esc(l)+'"><span>'+esc(text)+'</span></li>';

    } else if (l.trim()) {

      out += '<li class="note-cb-item" style="list-style:none"><span style="color:var(--text2)">'+esc(l)+'</span></li>';

    }

  });

  out += '</ul>';

  return out;

}

function noteCardToggleCb(checkbox) {

  var card = checkbox.closest('[data-noteid]');

  if (!card) return;

  var nid = parseInt(card.getAttribute('data-noteid'));

  var n = notes.find(function(x){return x.id===nid;});

  if (!n) return;

  var line = checkbox.getAttribute('data-line');

  if (checkbox.checked) {

    n.body = n.body.replace(line, line.replace(/^\[ \]/, '[x]'));

  } else {

    n.body = n.body.replace(line, line.replace(/^\[x\]/i, '[ ]'));

  }

  saveNotes();

  renderNotes();

}

function saveNotes() {

  localStorage.setItem('ezy_notes_v2', JSON.stringify(notes));

}

// ===== NOTES DRAG-AND-DROP REORDER =====

var _noteDragId = null;

function initNoteDnD(gridId) {

  var grid = document.getElementById(gridId);

  if (!grid) return;

  var cards = grid.querySelectorAll('.note-card[data-noteid]');

  cards.forEach(function(card) {

    card.setAttribute('draggable', 'true');

    card.addEventListener('dragstart', function(e) {

      _noteDragId = parseInt(card.getAttribute('data-noteid'));

      setTimeout(function(){ card.classList.add('note-dragging'); }, 0);

      e.dataTransfer.effectAllowed = 'move';

    });

    card.addEventListener('dragend', function() {

      card.classList.remove('note-dragging');

      grid.querySelectorAll('.note-card').forEach(function(c){ c.classList.remove('note-drag-over'); });

    });

    card.addEventListener('dragover', function(e) {

      e.preventDefault();

      e.dataTransfer.dropEffect = 'move';

      var rect = card.getBoundingClientRect();

      var insertBefore = (e.clientY - rect.top) < rect.height / 2;

      grid.querySelectorAll('.note-card').forEach(function(c){ c.classList.remove('note-drag-over','note-drop-before','note-drop-after'); });

      card.classList.add(insertBefore ? 'note-drop-before' : 'note-drop-after');

      card._noteInsertBefore = insertBefore;

    });

    card.addEventListener('dragleave', function() { card.classList.remove('note-drag-over','note-drop-before','note-drop-after'); });

    card.addEventListener('drop', function(e) {

      e.preventDefault();

      var insertBefore = card._noteInsertBefore !== false;

      grid.querySelectorAll('.note-card').forEach(function(c){ c.classList.remove('note-drag-over','note-drop-before','note-drop-after'); });

      var targetId = parseInt(card.getAttribute('data-noteid'));

      if (_noteDragId === null || _noteDragId === targetId) return;

      var dragIdx = notes.findIndex(function(n){ return n.id===_noteDragId; });

      var targetIdx = notes.findIndex(function(n){ return n.id===targetId; });

      if (dragIdx < 0 || targetIdx < 0) return;

      var dragged = notes.splice(dragIdx, 1)[0];

      // Recalc targetIdx after splice

      var newTargetIdx = notes.findIndex(function(n){ return n.id===targetId; });

      var insertAt = insertBefore ? newTargetIdx : newTargetIdx + 1;

      if (insertAt < 0) insertAt = 0;

      notes.splice(insertAt, 0, dragged);

      saveNotes();

      renderNotes();

    });

  });

}

function renderNotes() {

  var q = (document.getElementById('notes-search').value||'').toLowerCase();

  var filtered = q ? notes.filter(function(n){

    return (n.title||'').toLowerCase().indexOf(q)>=0 || (n.body||'').toLowerCase().indexOf(q)>=0;

  }) : notes;

  var pinned = filtered.filter(function(n){return n.pinned;});

  var unpinned = filtered.filter(function(n){return !n.pinned;});

  var pinnedSec = document.getElementById('notes-pinned-section');

  var allSec = document.getElementById('notes-all-section');

  var emptyEl = document.getElementById('notes-empty');

  var allLabel = document.getElementById('notes-all-label');

  if (pinned.length > 0) {

    pinnedSec.style.display = 'block';

    document.getElementById('notes-pinned-grid').innerHTML = pinned.map(buildNoteCard).join('');

    initNoteDnD('notes-pinned-grid');

  } else {

    pinnedSec.style.display = 'none';

  }

  allLabel.textContent = pinned.length > 0 ? 'Other' : 'Notes';

  if (unpinned.length > 0) {

    document.getElementById('notes-all-grid').innerHTML = unpinned.map(buildNoteCard).join('');

    initNoteDnD('notes-all-grid');

    emptyEl.style.display = 'none';

  } else if (pinned.length === 0) {

    document.getElementById('notes-all-grid').innerHTML = '';

    emptyEl.style.display = 'block';

  } else {

    document.getElementById('notes-all-grid').innerHTML = '';

    emptyEl.style.display = 'none';

  }

}

function buildNoteCard(n) {

  var colorCls = n.color ? ' '+n.color : '';

  var pinnedBadge = n.pinned ? '<span class="note-pinned-icon">&#128204; Pinned</span>' : '';

  var titleHtml = n.title ? '<div class="note-card-title">'+esc(n.title)+'</div>' : '';

  var bodyHtml = buildNoteBodyHtml(n.body||'');

  return '<div class="note-card'+colorCls+'" data-noteid="'+n.id+'" onclick="openNoteModal('+n.id+')" draggable="true">'

    +pinnedBadge

    +titleHtml

    +bodyHtml

    +'<div class="note-actions">'

    +'<button class="note-action-btn" onclick="event.stopPropagation();toggleNotePin('+n.id+')">'+(n.pinned?'&#128204; Unpin':'&#128204; Pin')+'</button>'

    +'<button class="note-action-btn" onclick="event.stopPropagation();deleteNote('+n.id+')" style="color:var(--red)">&#128465;&#65039;</button>'

    +'</div>'

    +'</div>';

}

function toggleNotePin(id) {

  var n = notes.find(function(x){return x.id===id;});

  if (n) n.pinned = !n.pinned;

  renderNotes();

}

function deleteNote(id) {

  if (!confirm('Delete this note?')) return;

  notes = notes.filter(function(n){return n.id!==id;});

  renderNotes();

}

// ===== GOOGLE CALENDAR (TIME BLOCKING) =====

function setGCalView(v) {

  _gcalView = v;

  ['day','week','month','schedule'].forEach(function(vv){

    var btn = document.getElementById('gcal-vbtn-'+vv);

    if (btn) btn.classList.toggle('active', vv===v);

  });

  renderGCal();

}


function gcalToday() {

  _gcalAnchor = new Date();

  renderGCal();

}

// ===== SWIPE GESTURES FOR TIME BLOCKING =====
(function() {
  var _swipeX = null, _swipeY = null;
  var SWIPE_MIN_X = 50, SWIPE_MAX_Y = 80;
  function _doSwipeInit(el) {
    if (!el || el._swipeReady) return;
    el._swipeReady = true;
    el.addEventListener('touchstart', function(e) {
      if (e.touches.length !== 1) return;
      _swipeX = e.touches[0].clientX; _swipeY = e.touches[0].clientY;
    }, { passive: true });
    el.addEventListener('touchend', function(e) {
      if (_swipeX === null) return;
      var dx = e.changedTouches[0].clientX - _swipeX;
      var dy = e.changedTouches[0].clientY - _swipeY;
      _swipeX = null; _swipeY = null;
      if (Math.abs(dx) < SWIPE_MIN_X || Math.abs(dy) > SWIPE_MAX_Y) return;
      gcalShift(dx < 0 ? 1 : -1);
    }, { passive: true });
  }
  function _initAllSwipe() {
    ['gcal-body-scroll','gcal-month-outer','gcal-schedule-outer'].forEach(function(id) {
      _doSwipeInit(document.getElementById(id));
    });
  }
  window.addEventListener('DOMContentLoaded', function() { setTimeout(_initAllSwipe, 900); });
  var _origShowPage2 = null;
  window.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      if (typeof showPage === 'function') {
        var _sp = showPage;
        showPage = function(id) { _sp(id); if (id === 'timeblocking') setTimeout(_initAllSwipe, 120); };
      }
    }, 1000);
  });
})();

function gcalShift(delta) {

  var d = new Date(_gcalAnchor);

  if (_gcalView === 'day')   d.setDate(d.getDate() + delta);

  else if (_gcalView === 'week')  d.setDate(d.getDate() + delta*7);

  else d.setMonth(d.getMonth() + delta);

  _gcalAnchor = d;

  renderGCal();

}

function renderGCal() {

  var go = document.getElementById('gcal-grid-outer');

  var mo = document.getElementById('gcal-month-outer');

  var so = document.getElementById('gcal-schedule-outer');

  if (_gcalView === 'month') {

    go.style.display = 'none';

    mo.style.display = 'flex';

    if (so) so.style.display = 'none';

    renderGCalMonth();

  } else if (_gcalView === 'schedule') {

    go.style.display = 'none';

    mo.style.display = 'none';

    if (so) { so.style.display = 'flex'; renderGCalSchedule(); }

  } else {

    go.style.display = 'flex';

    mo.style.display = 'none';

    if (so) so.style.display = 'none';

    if (_gcalView === 'week') renderGCalWeek();

    else renderGCalDay();

  }

  // Overdue goal-task + goal-level banner

  var banner = document.getElementById('gcal-overdue-banner');

  if (banner) {

    var ov = getOverdueSteps();

    var og = getOverdueGoals();

    var parts = [];

    if (og.length > 0) {

      parts.push('<span style="font-weight:700;color:#ff9944">&#9888; ' + og.length + ' overdue/unscheduled goal' + (og.length>1?'s':'') + ':</span> '

        + og.slice(0,3).map(function(x){ var meta = x.daysLate !== null ? x.daysLate+'d overdue, '+x.progress+'% done' : 'no date, '+x.progress+'% done'; return '<span style="color:#ff9944">' + esc(x.title) + '</span> <span style="color:var(--text3)">(' + meta + ')</span>'; }).join(' &bull; ')

        + (og.length > 3 ? ' &bull; <span style="color:var(--text3)">+' + (og.length-3) + ' more</span>' : ''));

    }

    if (ov.length > 0) {

      parts.push('<span style="font-weight:700;color:var(--red)">&#9888; ' + ov.length + ' overdue/unscheduled sub-task' + (ov.length>1?'s':'') + ':</span> '

        + ov.slice(0,3).map(function(x){ var meta = x.daysLate !== null ? x.goalTitle+', '+x.daysLate+'d late' : x.goalTitle+', no date'; return esc(x.stepText) + ' <span style="color:var(--text3)">(' + esc(meta) + ')</span>'; }).join(' &bull; ')

        + (ov.length > 3 ? ' &bull; <span style="color:var(--text3)">+' + (ov.length-3) + ' more</span>' : ''));

    }

    if (parts.length > 0) {

      banner.style.display = 'block';

      banner.style.cursor = 'pointer';

      banner.title = 'Click to view overdue goals';

      banner.onclick = goalsShowOverdue;

      banner.innerHTML = '<span style="float:right;opacity:.6;font-size:11px">View Goals →</span>' + parts.join('<br>');

    } else {

      banner.style.display = 'none';

      banner.onclick = null;

      banner.style.cursor = '';

    }

  }

}

function renderGCalWeek() {

  var anchor = new Date(_gcalAnchor);

  var sunday = new Date(anchor);

  sunday.setDate(anchor.getDate() - anchor.getDay());

  var days = [];

  for (var i=0;i<7;i++) { var d=new Date(sunday); d.setDate(d.getDate()+i); days.push(d); }

  var MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  var s=days[0], e=days[6];

  var label = (s.getMonth()===e.getMonth())

    ? MONTHS[s.getMonth()]+' '+s.getDate()+'-'+e.getDate()+', '+s.getFullYear()

    : MONTHS[s.getMonth()]+' '+s.getDate()+' - '+MONTHS[e.getMonth()]+' '+e.getDate()+', '+e.getFullYear();

  document.getElementById('gcal-period-label').textContent = label;

  buildWeekDayHeaders(days);

  buildHourGrid(days);

}

function renderGCalDay() {

  var d = new Date(_gcalAnchor);

  var DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

  document.getElementById('gcal-period-label').textContent = DAYS[d.getDay()]+', '+MONTHS[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();

  buildWeekDayHeaders([d]);

  buildHourGrid([d]);

}

function buildWeekDayHeaders(days) {

  var today = new Date();

  var todayKey = tbDateKey(today);

  var ABBR=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  var html = '<div class="gcal-gutter-hdr"></div>';

  days.forEach(function(d){

    var dk = tbDateKey(d);

    var isToday = dk === todayKey;

    html += '<div class="gcal-col-hdr" onclick="gcalClickDayHeader(\''+dk+'\')">'

      +'<div class="gcal-day-abbr">'+ABBR[d.getDay()]+'</div>'

      +'<div class="gcal-day-num'+(isToday?' is-today':'')+'">'+d.getDate()+'</div>'

      +'</div>';

  });

  document.getElementById('gcal-col-headers').innerHTML = html;

}

function buildHourGrid(days) {

  var totalH = 24 * 60; // total px

  var today = new Date();

  var todayKey = tbDateKey(today);

  // Time gutter

  var gutterHtml = '';

  for (var h=0;h<24;h++) {

    var top = h * 60;

    var lbl = h===0 ? '12 AM' : h<12 ? h+' AM' : h===12 ? '12 PM' : (h-12)+' PM';

    if (h > 0) gutterHtml += '<div class="gcal-time-label" style="top:'+top+'px">'+lbl+'</div>';

  }

  var gutter = document.getElementById('gcal-time-gutter');

  gutter.innerHTML = gutterHtml;

  gutter.style.height = totalH+'px';

  // Day columns

  var colsHtml = '';

  days.forEach(function(d){

    var dk = tbDateKey(d);

    var isToday = dk === todayKey;

    var dayTasks = _tasks[dk] || [];

    colsHtml += '<div class="gcal-day-col" data-date="'+dk+'" onclick="gcalColClick(event,\''+dk+'\')">';

    // hour lines

    for (var h2=0;h2<24;h2++) {

      colsHtml += '<div class="gcal-hour-line" style="top:'+(h2*60)+'px"></div>';

      colsHtml += '<div class="gcal-half-line" style="top:'+(h2*60+30)+'px"></div>';

    }

    // events

    dayTasks.forEach(function(t){

      var tp = (t.time||'09:00').split(':');

      var sh = parseInt(tp[0],10), sm = parseInt(tp[1]||'0',10);

      var ep = (t.endTime||'').split(':');

      var eh = ep[0]?parseInt(ep[0],10):sh+1;

      var em = ep[1]?parseInt(ep[1],10):sm;

      var dur = (eh*60+em)-(sh*60+sm);

      if(dur<=0) dur=60;

      var topPx = sh*60+sm;

      var htPx = Math.max(30,dur);

      var clr = t.color||'#1f6feb';

      colsHtml += '<div class="gcal-evt" style="top:'+topPx+'px;height:'+htPx+'px;background:'+clr+'" onclick="event.stopPropagation();gcalOpenTask(\''+dk+'\','+t.id+')">';

      colsHtml += '<div class="gcal-evt-title">'+esc(t.title)+'</div>';

      colsHtml += '<div class="gcal-evt-time">'+fmt12(t.time)+(t.endTime?'-'+fmt12(t.endTime):'')+'</div>';

      colsHtml += '</div>';

    });

    // current time indicator

    if (isToday) {

      var now2=new Date();

      var nTop=now2.getHours()*60+now2.getMinutes();

      colsHtml += '<div class="gcal-now-wrap" style="top:'+nTop+'px"><div class="gcal-now-line"><div class="gcal-now-dot"></div></div></div>';

    }

    colsHtml += '</div>';

  });

  var wrap = document.getElementById('gcal-cols-wrap');

  wrap.innerHTML = colsHtml;

  wrap.style.height = totalH+'px';

  // Scroll to 7am

  var scroll = document.getElementById('gcal-body-scroll');

  scroll.scrollTop = 7*60;

}

function gcalColClick(e, dk) {

  if (e.target.classList.contains('gcal-evt') || e.target.classList.contains('gcal-evt-title') || e.target.classList.contains('gcal-evt-time')) return;

  var col = e.currentTarget;

  var rect = col.getBoundingClientRect();

  var scrollTop = document.getElementById('gcal-body-scroll').scrollTop;

  var clickY = e.clientY - rect.top + (e.currentTarget.closest('.gcal-body-scroll')||{scrollTop:0}).scrollTop;

  // Actually compute relative to the scrollable body

  var bodyEl = document.getElementById('gcal-body-scroll');

  var bodyRect = bodyEl.getBoundingClientRect();

  var relY = e.clientY - bodyRect.top + bodyEl.scrollTop;

  var hour = Math.floor(relY / 60);

  openAddTaskModal(dk, hour);

}

function gcalClickDayHeader(dk) {

  _gcalAnchor = new Date(dk+'T12:00:00');

  setGCalView('day');

}

function gcalOpenTask(dk, tid) {

  var t = (_tasks[dk]||[]).find(function(x){return x.id===tid;});

  if (!t) return;

  _editingTaskDk = dk; _editingTaskId = tid;

  // Title

  document.getElementById('td-title-input').value = t.title || '';

  // Date

  setTimeout(function(){

    var di = document.getElementById('td-date-input');

    if (di) di.value = dk;

  }, 0);

  // Sub-tasks — copy into _tdSubs

  _tdSubs = (t.subtasks || []).map(function(s){ return {id:s.id||(_subIdCtr++),title:s.title,done:!!s.done,rdate:s.rdate||null}; });

  renderTdSubList();

  // Time: parse "HH:MM" → h12 + am/pm

  function parseTime(str, hrId, minId, amId, pmId, isPMFlag) {

    if (!str) return;

    var parts = str.split(':');

    var hh = parseInt(parts[0]||'9',10);

    var mm = parseInt(parts[1]||'0',10);

    var isPM = hh >= 12;

    var h12 = hh === 0 ? 12 : hh > 12 ? hh-12 : hh;

    document.getElementById(hrId).value = h12;

    document.getElementById(minId).value = mm;

    document.getElementById(amId).classList.toggle('active', !isPM);

    document.getElementById(pmId).classList.toggle('active', isPM);

    return isPM;

  }

  _tdIsPM = parseTime(t.time, 'td-hr','td-min','td-am-btn','td-pm-btn') || false;

  _tdIsEndPM = parseTime(t.endTime||t.time, 'td-ehr','td-emin','td-eam-btn','td-epm-btn') || false;

  // Color

  _tdTaskColor = t.color || '#1f6feb';

  buildTdColorPicker();

  // Reminder

  var rdrop = document.getElementById('td-reminder');

  if (rdrop) rdrop.value = (t.reminder !== undefined && t.reminder !== null) ? String(t.reminder) : '';

  showModal('taskdetail');

}

// ===== TASK DETAIL (EDIT) MODAL HELPERS =====

var _tdIsPM = false;

var _tdIsEndPM = false;

var _tdTaskColor = '#1f6feb';

var _tdSubs = [];

var _tdGlobalDragSrc = null;

function setAMPM_td(v) {

  _tdIsPM = (v === 'PM');

  document.getElementById('td-am-btn').classList.toggle('active', !_tdIsPM);

  document.getElementById('td-pm-btn').classList.toggle('active', _tdIsPM);

}

function setEndAMPM_td(v) {

  _tdIsEndPM = (v === 'PM');

  document.getElementById('td-eam-btn').classList.toggle('active', !_tdIsEndPM);

  document.getElementById('td-epm-btn').classList.toggle('active', _tdIsEndPM);

}

function autoToggleAMPM_td(which, inp) {

  var v = parseInt(inp.value, 10);

  if (isNaN(v)) return;

  if (v > 12) {

    if (which === 'start') { setAMPM_td('PM'); inp.value = v - 12; }

    else { setEndAMPM_td('PM'); inp.value = v - 12; }

  }

  inp.setAttribute('data-prev', inp.value);

}

function getTdPickedTime() {

  var h = parseInt(document.getElementById('td-hr').value||'9',10);

  var m = parseInt(document.getElementById('td-min').value||'0',10);

  if (_tdIsPM && h!==12) h+=12;

  if (!_tdIsPM && h===12) h=0;

  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');

}

function getTdPickedEndTime() {

  var h = parseInt(document.getElementById('td-ehr').value||'10',10);

  var m = parseInt(document.getElementById('td-emin').value||'0',10);

  if (_tdIsEndPM && h!==12) h+=12;

  if (!_tdIsEndPM && h===12) h=0;

  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');

}

function buildTdColorPicker() {
  var el = document.getElementById('td-color-picker');
  if (!el) return;
  var colors = ['#1f6feb','#2ea043','#e3b341','#f85149','#a371f7','#fd7e14','#20c997','#e36396'];
  el.innerHTML = colors.map(function(col) {
    var active = col === _tdTaskColor ? ' style="outline:3px solid #fff;outline-offset:2px"' : '';
    return '<button type="button" class="color-swatch" data-col="' + col + '" '
      + 'style="background:' + col + ';width:28px;height:28px;border-radius:50%;border:none;cursor:pointer;margin:2px"'
      + active
      + ' onclick="pickTdColor(this.dataset.col)"></button>';
  }).join('');
}

function pickTdColor(col) {

  _tdTaskColor = col;

  buildTdColorPicker();

}

function tdAddSub() {

  var inp = document.getElementById('td-sub-input');

  var title = (inp ? inp.value : '').trim();

  if (!title) return;

  _tdSubs.push({id: _subIdCtr++, title: title, done: false, rdate: null});

  if (inp) inp.value = '';

  renderTdSubList();

}

function renderTdSubList() {

  var el = document.getElementById('td-sub-list');

  if (!el) return;

  if (_tdSubs.length === 0) {

    el.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:4px 0 6px">No sub-tasks yet.</div>';

    return;

  }

  el.innerHTML = _tdSubs.map(function(s, i) {

    return '<div class="kcard-step-row" data-tdidx="'+i+'" draggable="false">'

      + '<span class="kcard-step-hdl" title="Drag to reorder">&#8942;&#8942;</span>'

      + '<div class="step-check'+(s.done?' done':'')+'"></div>'

      + '<span class="kcard-step-txt'+(s.done?' done-step':'')+'" contenteditable="true" '

      + 'onblur="updateTdSub('+i+',this.textContent)" '

      + 'onkeydown="if(event.key===\'Enter\'){event.preventDefault();this.blur();}" '

      + 'style="flex:1;outline:none;cursor:text;padding:1px 4px;border-radius:4px;font-size:13px">'

      + esc(s.title)+'</span>'

      + '<button class="btn btn-outline btn-sm" onclick="remTdSub('+i+')" '

      + 'style="padding:2px 8px;color:var(--red);font-size:14px;line-height:1">&#10005;</button>'

      + '</div>';

  }).join('');

  // Wire drag handles

  el.querySelectorAll('.kcard-step-row').forEach(function(row) {

    var hdl = row.querySelector('.kcard-step-hdl');

    var chk = row.querySelector('.step-check');

    var i = parseInt(row.getAttribute('data-tdidx'), 10);

    hdl.addEventListener('dragstart', function(e) {

      e.stopPropagation();

      _tdGlobalDragSrc = i;

      row.draggable = true;

      e.dataTransfer.setData('td-step', '1');

      e.dataTransfer.effectAllowed = 'move';

      setTimeout(function(){ row.classList.add('kcs-dragging'); }, 0);

    });

    hdl.addEventListener('dragend', function() { row.draggable = false; });

    row.addEventListener('dragover', function(e) {

      if (e.dataTransfer.types.indexOf('td-step') === -1) return;

      e.preventDefault(); e.stopPropagation();

      var rect = row.getBoundingClientRect();

      var before = (e.clientY - rect.top) < rect.height / 2;

      el.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-drop-above','kcs-drop-below'); });

      row.classList.add(before ? 'kcs-drop-above' : 'kcs-drop-below');

      row._tdInsertBefore = before;

    });

    row.addEventListener('dragleave', function(){ row.classList.remove('kcs-drop-above','kcs-drop-below'); });

    row.addEventListener('dragend', function(){

      el.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-dragging','kcs-drop-above','kcs-drop-below'); });

    });

    row.addEventListener('drop', function(e) {

      e.preventDefault(); e.stopPropagation();

      var before = row._tdInsertBefore !== false;

      el.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-drop-above','kcs-drop-below','kcs-dragging'); });

      if (_tdGlobalDragSrc === null || _tdGlobalDragSrc === i) return;

      var moved = _tdSubs.splice(_tdGlobalDragSrc, 1)[0];

      var newIdx = before ? i : i + 1;

      if (_tdGlobalDragSrc < i) newIdx = before ? i - 1 : i;

      if (newIdx < 0) newIdx = 0;

      _tdSubs.splice(newIdx, 0, moved);

      _tdGlobalDragSrc = null;

      renderTdSubList();

    });

    chk.addEventListener('click', function(e) {

      e.stopPropagation();

      _tdSubs[i].done = !_tdSubs[i].done;

      chk.classList.toggle('done', _tdSubs[i].done);

      var txt = row.querySelector('.kcard-step-txt');

      if (txt) txt.classList.toggle('done-step', _tdSubs[i].done);

    });

  });

}

function remTdSub(i) { _tdSubs.splice(i, 1); renderTdSubList(); }

function updateTdSub(i, text) { if (_tdSubs[i]) _tdSubs[i].title = (text||'').trim() || _tdSubs[i].title; }

function tdSave() {

  if (!_editingTaskDk) return;

  var t = (_tasks[_editingTaskDk]||[]).find(function(x){return x.id===_editingTaskId;});

  if (!t) return;

  t.title = (document.getElementById('td-title-input').value||'').trim() || t.title;

  // Time

  t.time = getTdPickedTime();

  t.endTime = getTdPickedEndTime();

  // Color

  t.color = _tdTaskColor || t.color;

  // Reminder

  var rdrop = document.getElementById('td-reminder');

  if (rdrop) t.reminder = rdrop.value;

  // Sub-tasks

  t.subtasks = _tdSubs.slice();

  // Date change

  var newDk = (document.getElementById('td-date-input')||{}).value || _editingTaskDk;

  if (newDk && newDk !== _editingTaskDk) {

    _tasks[_editingTaskDk] = (_tasks[_editingTaskDk]||[]).filter(function(x){return x.id!==_editingTaskId;});

    if (!_tasks[newDk]) _tasks[newDk] = [];

    _tasks[newDk].push(t);

    _editingTaskDk = newDk;

  }

  saveData();

  closeModal('taskdetail');

  renderGCal();

  renderCalendar();

}

function tdDelete() {

  if (!confirm('Delete this task?')) return;

  if (_tasks[_editingTaskDk]) {

    _tasks[_editingTaskDk] = _tasks[_editingTaskDk].filter(function(x){return x.id!==_editingTaskId;});

  }

  closeModal('taskdetail');

  renderGCal();

  renderCalendar();

  saveData();

}

function renderGCalMonth() {

  var y = _gcalAnchor.getFullYear(), mo = _gcalAnchor.getMonth();

  var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

  document.getElementById('gcal-period-label').textContent = MONTHS[mo]+' '+y;

  var first = new Date(y,mo,1).getDay();

  var last  = new Date(y,mo+1,0).getDate();

  var today = new Date(), todayKey = tbDateKey(today);

  var cells = [];

  for (var i=0;i<first;i++) cells.push(null);

  for (var d=1;d<=last;d++) cells.push(d);

  while (cells.length%7!==0) cells.push(null);

  var html = cells.map(function(d){

    if (!d) return '<div class="gcal-month-cell empty-month"></div>';

    var dk = y+'-'+pad2(mo+1)+'-'+pad2(d);

    var dayTasks = _tasks[dk]||[];

    var isToday = dk===todayKey;

    var numCls = isToday?' today-mnum':'';

    var pills = dayTasks.slice(0,2).map(function(t){

      return '<div class="gcal-month-pill" style="background:'+(t.color||'#1f6feb')+'">'+esc(t.title)+'</div>';

    }).join('');

    var more = dayTasks.length>2 ? '<div class="gcal-month-more">+'+( dayTasks.length-2)+' more</div>' : '';

    // Goal sub-task due/overdue indicators on this date

    var goalPills = '';

    var cellDate = new Date(dk+'T00:00:00'); cellDate.setHours(0,0,0,0);

    var todayMid = new Date(); todayMid.setHours(0,0,0,0);

    (goals||[]).forEach(function(g) {

      if (!g.steps) return;

      g.steps.forEach(function(s) {

        if (s.targetDate === dk && !s.done) {

          var isOv = cellDate < todayMid;

          goalPills += '<div class="gcal-overdue-strip" style="'+(isOv?'':'border-color:#1f6feb;color:var(--text2)')+'">'+esc(s.text)+'</div>';

        }

      });

    });

    return '<div class="gcal-month-cell'+(isToday?' today-cell':'')+'" onclick="gcalMonthCellClick(\''+dk+'\')">'+'<span class="gcal-month-daynum'+numCls+'">'+d+'</span>'+pills+more+goalPills+'</div>';

  }).join('');

  document.getElementById('gcal-month-grid').innerHTML = html;

}

function gcalMonthCellClick(dk) {

  _gcalAnchor = new Date(dk+'T12:00:00');

  setGCalView('day');

}

// ===== ADD TASK MODAL =====

function openAddTaskModal(dk, hour) {

  _newSubs = []; renderNewSubList();

  _selectedTaskColor = '#1f6feb';

  buildTaskColorPicker();

  var d = dk ? new Date(dk+'T12:00:00') : new Date(_gcalAnchor);

  _addTaskDate = tbDateKey(d);

  var h = (hour !== null && hour !== undefined) ? hour : 9;

  if (h < 0) h = 0; if (h > 23) h = 23;

  _isPM = h >= 12;

  var h12 = h === 0 ? 12 : h > 12 ? h-12 : h;

  document.getElementById('t-hr').value = h12;

  document.getElementById('t-min').value = '0';

  var tamBtn = document.getElementById('t-am-btn'); if(tamBtn) tamBtn.classList.toggle('active', !_isPM);

  var tpmBtn = document.getElementById('t-pm-btn'); if(tpmBtn) tpmBtn.classList.toggle('active', _isPM);

  // end time = start + 1 hour

  var eh = h + 1;

  _isEndPM = eh >= 12;

  var eh12 = eh === 0 ? 12 : eh > 12 ? eh-12 : eh;

  document.getElementById('t-ehr').value = eh12 > 12 ? eh12-12 : eh12;

  document.getElementById('t-emin').value = '0';

  var teamBtn = document.getElementById('t-eam-btn'); if(teamBtn) teamBtn.classList.toggle('active', !_isEndPM);

  var tepmBtn = document.getElementById('t-epm-btn'); if(tepmBtn) tepmBtn.classList.toggle('active', _isEndPM);

  document.getElementById('t-title').value = '';

  var rr = document.getElementById('t-reminder'); if(rr) rr.value='10';

  var ru = document.getElementById('t-rrule'); if(ru) ru.value='';

  var rcp = document.getElementById('reminder-custom-panel'); if(rcp) rcp.style.display='none';

  var rrup = document.getElementById('rrule-custom-panel'); if(rrup) rrup.style.display='none';

  document.querySelectorAll('.rrule-day-btn').forEach(function(b){b.classList.remove('active');});

  var ri = document.getElementById('rrule-interval'); if(ri) ri.value='1';

  var rf = document.getElementById('rrule-freq'); if(rf) rf.value='WEEKLY';

  var rcn = document.getElementById('reminder-custom-num'); if(rcn) rcn.value='1';

  var rcu = document.getElementById('reminder-custom-unit'); if(rcu) rcu.value='minutes';

  _customRrule=''; _customReminderMinutes=null;

  showModal('addtask');

  clockInitFace('t','start', h12, 0, _isPM);

  clockInitFace('t','end', (eh12 > 12 ? eh12-12 : eh12), 0, _isEndPM);

  setTimeout(function(){ var inp = document.getElementById('addtask-date-input'); if(inp) inp.value = _addTaskDate; }, 0);

}

function addTaskDateChanged(val) { if (val) _addTaskDate = val; }

var _subIdCtr=1;

function addNewSub(){ var inp=document.getElementById('new-sub-input'); var title=(inp.value||'').trim(); if(!title)return; _newSubs.push({id:_subIdCtr++,title:title,done:false,rdate:null}); inp.value=''; renderNewSubList(); }

function renderNewSubList() {

  var el = document.getElementById('new-sub-list');

  if (!el) return;

  if (_newSubs.length === 0) {

    el.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:4px 0 6px">No sub-tasks yet.</div>';

    return;

  }

  el.innerHTML = _newSubs.map(function(s, i) {

    return '<div class="kcard-step-row" data-nsidx="'+i+'" draggable="false">'

      + '<span class="kcard-step-hdl" title="Drag to reorder">&#8942;&#8942;</span>'

      + '<div class="step-check'+(s.done?' done':'')+'"></div>'

      + '<span class="kcard-step-txt'+(s.done?' done-step':'')+'" contenteditable="true" '

      + 'onblur="updateNewSub('+i+',this.textContent)" '

      + 'onkeydown="if(event.key===\'Enter\'){event.preventDefault();this.blur();}" '

      + 'style="flex:1;outline:none;cursor:text;padding:1px 4px;border-radius:4px;font-size:13px">'

      + esc(s.title)+'</span>'

      + '<button class="btn btn-outline btn-sm" onclick="remNewSub('+i+')" '

      + 'style="padding:2px 8px;color:var(--red);font-size:14px;line-height:1">&#10005;</button>'

      + '</div>';

  }).join('');

  // Wire drag handles

  el.querySelectorAll('.kcard-step-row').forEach(function(row) {

    var hdl = row.querySelector('.kcard-step-hdl');

    var chk = row.querySelector('.step-check');

    var idx = parseInt(row.getAttribute('data-nsidx'), 10);

    var _ns_dragSrc = null;

    hdl.addEventListener('dragstart', function(e) {

      e.stopPropagation();

      _nsGlobalDragSrc = idx;

      row.draggable = true;

      e.dataTransfer.setData('ns-step', '1');

      e.dataTransfer.effectAllowed = 'move';

      setTimeout(function(){ row.classList.add('kcs-dragging'); }, 0);

    });

    hdl.addEventListener('dragend', function() { row.draggable = false; });

    row.addEventListener('dragover', function(e) {

      if (e.dataTransfer.types.indexOf('ns-step') === -1) return;

      e.preventDefault(); e.stopPropagation();

      var rect = row.getBoundingClientRect();

      var before = (e.clientY - rect.top) < rect.height / 2;

      el.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-drop-above','kcs-drop-below'); });

      row.classList.add(before ? 'kcs-drop-above' : 'kcs-drop-below');

      row._nsInsertBefore = before;

    });

    row.addEventListener('dragleave', function(){ row.classList.remove('kcs-drop-above','kcs-drop-below'); });

    row.addEventListener('dragend', function(){

      el.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-dragging','kcs-drop-above','kcs-drop-below'); });

    });

    row.addEventListener('drop', function(e) {

      e.preventDefault(); e.stopPropagation();

      var before = row._nsInsertBefore !== false;

      el.querySelectorAll('.kcard-step-row').forEach(function(r){ r.classList.remove('kcs-drop-above','kcs-drop-below','kcs-dragging'); });

      if (_nsGlobalDragSrc === null || _nsGlobalDragSrc === idx) return;

      var moved = _newSubs.splice(_nsGlobalDragSrc, 1)[0];

      var newIdx = before ? idx : idx + 1;

      if (_nsGlobalDragSrc < idx) newIdx = before ? idx - 1 : idx;

      if (newIdx < 0) newIdx = 0;

      _newSubs.splice(newIdx, 0, moved);

      _nsGlobalDragSrc = null;

      renderNewSubList();

    });

    // Checkbox toggle

    chk.addEventListener('click', function(e) {

      e.stopPropagation();

      s.done = !s.done;

      chk.classList.toggle('done', s.done);

      var txt = row.querySelector('.kcard-step-txt');

      if (txt) txt.classList.toggle('done-step', s.done);

    });

  });

}

function updateNewSub(i, text) {

  if (_newSubs[i]) _newSubs[i].title = (text || '').trim() || _newSubs[i].title;

}

var _nsGlobalDragSrc = null;

function remNewSub(i){ _newSubs.splice(i,1); renderNewSubList(); }

// ===== CUSTOM REMINDER PANEL =====

var _customReminderMinutes = 60;

function onReminderChange(val) {

  var panel = document.getElementById('reminder-custom-panel');

  if (val === 'custom') { panel.style.display = 'block'; buildCustomReminder(); }

  else { panel.style.display = 'none'; _customReminderMinutes = null; }

}

function buildCustomReminder() {

  var num = parseInt(document.getElementById('reminder-custom-num').value, 10) || 1;

  var unit = document.getElementById('reminder-custom-unit').value;

  var mins = unit === 'minutes' ? num : unit === 'hours' ? num*60 : unit === 'days' ? num*1440 : num*10080;

  _customReminderMinutes = mins;

}

function getReminderMinutes() {

  var sel = document.getElementById('t-reminder');

  if (!sel) return null;

  if (sel.value === 'custom') return _customReminderMinutes;

  if (sel.value === '') return null;

  return parseInt(sel.value, 10);

}

// ===== CUSTOM RRULE BUILDER =====

var _customRrule = '';

function onRruleChange(val) {

  var panel = document.getElementById('rrule-custom-panel');

  if (val === 'custom') { panel.style.display = 'block'; buildCustomRrule(); updateRruleFreqLabel(); }

  else { panel.style.display = 'none'; _customRrule = ''; }

}

function updateRruleFreqLabel() {

  var freq = document.getElementById('rrule-freq') ? document.getElementById('rrule-freq').value : 'WEEKLY';

  var daysRow = document.getElementById('rrule-days-row');

  var moRow = document.getElementById('rrule-monthly-row');

  if (daysRow) daysRow.style.display = (freq === 'WEEKLY') ? 'block' : 'none';

  if (moRow) moRow.style.display = (freq === 'MONTHLY') ? 'block' : 'none';

  buildCustomRrule();

}

function toggleRruleDay(btn) {

  btn.classList.toggle('active');

  buildCustomRrule();

}

function buildCustomRrule() {

  var freq = (document.getElementById('rrule-freq') || {value:'WEEKLY'}).value;

  var interval = parseInt((document.getElementById('rrule-interval') || {value:'1'}).value, 10) || 1;

  var parts = ['FREQ=' + freq];

  if (interval > 1) parts.push('INTERVAL=' + interval);

  if (freq === 'WEEKLY') {

    var days = [];

    document.querySelectorAll('.rrule-day-btn.active').forEach(function(b){ days.push(b.getAttribute('data-day')); });

    if (days.length) parts.push('BYDAY=' + days.join(','));

  }

  if (freq === 'MONTHLY') {

    var mtype = (document.getElementById('rrule-monthly-type') || {value:'bymonthday'}).value;

    var mday = (document.getElementById('rrule-monthly-day') || {value:'MO'}).value;

    if (mtype !== 'bymonthday') {

      var posMap = {'byday-1st':'1','byday-2nd':'2','byday-3rd':'3','byday-4th':'4','byday-last':'-1'};

      var pos = posMap[mtype] || '1';

      parts.push('BYDAY=' + pos + mday);

    }

  }

  _customRrule = parts.join(';');

  var freqLabel = {DAILY:'day',WEEKLY:'week',MONTHLY:'month',YEARLY:'year'}[freq] || freq.toLowerCase();

  var preview = 'Every ' + (interval > 1 ? interval + ' ' + freqLabel + 's' : freqLabel);

  if (freq === 'WEEKLY') {

    var dayNames = {MO:'Mon',TU:'Tue',WE:'Wed',TH:'Thu',FR:'Fri',SA:'Sat',SU:'Sun'};

    var activeDays = [];

    document.querySelectorAll('.rrule-day-btn.active').forEach(function(b){ activeDays.push(dayNames[b.getAttribute('data-day')]||b.getAttribute('data-day')); });

    if (activeDays.length) preview += ' on ' + activeDays.join(', ');

  }

  var prev = document.getElementById('rrule-preview');

  if (prev) prev.textContent = preview;

}

function getEffectiveRrule(originKey) {

  var sel = document.getElementById('t-rrule');

  if (!sel || sel.value === '') return '';

  if (sel.value !== 'custom') return sel.value;

  var mtype = document.getElementById('rrule-monthly-type') ? document.getElementById('rrule-monthly-type').value : '';

  if (mtype === 'bymonthday' && _customRrule.indexOf('MONTHLY') >= 0) {

    var d = new Date(originKey + 'T12:00:00');

    return _customRrule + ';BYMONTHDAY=' + d.getDate();

  }

  return _customRrule;

}

// ===== RECURRENCE EXPANSION =====

function expandRecurringTask(task, originKey) {

  var rrule = task.rrule || '';

  if (!rrule) return;

  var origin = new Date(originKey + 'T12:00:00');

  var endRange = new Date(origin); endRange.setFullYear(endRange.getFullYear() + 2);

  var freq = 'DAILY', byDay = null;

  var parts = rrule.split(';');

  parts.forEach(function(p) {

    if (p.indexOf('FREQ=') === 0) freq = p.replace('FREQ=','');

    if (p.indexOf('BYDAY=') === 0) byDay = p.replace('BYDAY=','').split(',');

  });

  var dayMap = {SU:0,MO:1,TU:2,WE:3,TH:4,FR:5,SA:6};

  var cur = new Date(origin);

  var limit = 730; var count = 0;

  while (cur <= endRange && count < limit) {

    var step = freq === 'DAILY' ? 1 : freq === 'WEEKLY' ? 7 : freq === 'MONTHLY' ? 0 : 1;

    if (freq === 'MONTHLY') { cur.setMonth(cur.getMonth()+1); } else { cur.setDate(cur.getDate()+step); }

    if (cur <= origin) continue;

    if (byDay) {

      var dow = cur.getDay();

      var match = byDay.some(function(d){ return dayMap[d] === dow; });

      if (!match) { count++; continue; }

    }

    var dk = cur.getFullYear()+'-'+('0'+(cur.getMonth()+1)).slice(-2)+'-'+('0'+cur.getDate()).slice(-2);

    if (!_tasks[dk]) _tasks[dk] = [];

    // Avoid duplicates

    var exists = _tasks[dk].some(function(t){ return t.recurId === task.id; });

    if (!exists) _tasks[dk].push({id:_nextTaskId++,recurId:task.id,title:task.title,time:task.time,endTime:task.endTime,done:false,color:task.color,subtasks:[],reminder:task.reminder,rrule:'',originDate:task.originDate,isRecurring:true});

    count++;

  }

}

// ===== BROWSER NOTIFICATION REMINDERS =====

function requestNotifPermission(cb) {

  if (!('Notification' in window)) { if(cb) cb(false); return; }

  if (Notification.permission === 'granted') { if(cb) cb(true); return; }

  if (Notification.permission !== 'denied') {

    Notification.requestPermission().then(function(p){ if(cb) cb(p==='granted'); });

  } else { if(cb) cb(false); }

}

function scheduleTaskReminder(task, dateKey) {

  var minsBefore = parseInt(task.reminder, 10);

  if (isNaN(minsBefore) && task.reminder !== '0') return;

  if (task.reminder === '') return;

  var timeParts = (task.time || '09:00').split(':');

  var taskHr = parseInt(timeParts[0],10), taskMin = parseInt(timeParts[1]||'0',10);

  var taskDate = new Date(dateKey + 'T00:00:00');

  taskDate.setHours(taskHr, taskMin, 0, 0);

  var fireAt = new Date(taskDate.getTime() - minsBefore * 60000);

  var msUntil = fireAt.getTime() - Date.now();

  if (msUntil < 0) return; // already past

  requestNotifPermission(function(granted) {

    if (!granted) return;

    setTimeout(function() {

      var label = minsBefore === 0 ? 'Now: ' : (minsBefore + ' min: ');

      new Notification('\u23f0 Reminder: ' + task.title, {

        body: label + (task.time || '') + (dateKey ? ' on ' + dateKey : ''),

        icon: '/favicon.ico'

      });

    }, msUntil);

  });

}

// Re-schedule all saved reminders on page load

function rescheduleAllReminders() {

  Object.keys(_tasks || {}).forEach(function(dk) {

    (_tasks[dk] || []).forEach(function(t) {

      if (t.reminder && t.reminder !== '' && !t.isRecurring) scheduleTaskReminder(t, dk);

    });

  });

}

// ===== SCHEDULE/LIST VIEW =====
function renderGCalSchedule() {
  var so = document.getElementById('gcal-schedule-outer'); if (!so) return;
  // Collect all date keys with tasks, sorted
  var keys = Object.keys(_tasks).filter(function(k){ return _tasks[k] && _tasks[k].length > 0; }).sort();
  if (!keys.length) { so.innerHTML = '<div style="color:var(--text3);text-align:center;padding:40px">No tasks scheduled.</div>'; return; }
  var html = '';
  keys.forEach(function(dk) {
    var d = new Date(dk+'T12:00:00');
    var DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    html += '<div style="margin-bottom:18px">';
    html += '<div style="font-size:13px;font-weight:700;color:var(--accent2);letter-spacing:.04em;margin-bottom:6px;text-transform:uppercase">';
    html += DAYS[d.getDay()]+', '+MONTHS[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();
    html += '</div>';
    var tasks = _tasks[dk].slice().sort(function(a,b){ return (a.time||'').localeCompare(b.time||''); });
    tasks.forEach(function(t) {
      var color = t.color || '#1f6feb';
      html += '<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;background:var(--card);border-radius:10px;border-left:4px solid '+color+';margin-bottom:6px;cursor:pointer" onclick="event.stopPropagation();gcalOpenTask(\\''+dk+'\\','+t.id+')" >';
      html += '<input type="checkbox"'+(t.done?' checked':'')+' onchange="_schedToggleTask(\''+dk+'\','+t.id+',this.checked)" style="margin-top:3px;cursor:pointer;accent-color:'+color+'">';
      html += '<div style="flex:1">';
      html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">';
      html += '<span style="font-weight:700;font-size:15px;color:'+(t.done?'var(--text3)':'var(--text)')+';text-decoration:'+(t.done?'line-through':'none')+'">'+esc(t.title)+'</span>';
      if (t.time) html += '<span style="font-size:12px;color:var(--text3)">'+esc(t.time)+(t.endTime?' – '+esc(t.endTime):'')+'</span>';
      html += '</div>';
      if (t.subtasks && t.subtasks.length) {
        html += '<div style="margin-top:6px;display:flex;flex-direction:column;gap:4px">';
        t.subtasks.forEach(function(s,si) {
          html += '<div style="display:flex;align-items:center;gap:8px;padding-left:4px">';
          html += '<input type="checkbox"'+(s.done?' checked':'')+' onchange="_schedToggleSub(\''+dk+'\','+t.id+','+si+',this.checked)" style="cursor:pointer;accent-color:'+color+'">';
          html += '<span style="font-size:13px;color:'+(s.done?'var(--text3)':'var(--text2)')+';text-decoration:'+(s.done?'line-through':'none')+'">'+esc(s.text||s.title||'')+'</span>';
          html += '</div>';
        });
        html += '</div>';
      }
      html += '</div></div>';
    });
    html += '</div>';
  });
  so.innerHTML = html;
}
function _schedToggleTask(dk,id,done){
  if(!_tasks[dk])return;
  var t=_tasks[dk].find(function(x){return x.id===id;});
  if(t){t.done=done;saveData();}
}
function _schedToggleSub(dk,id,si,done){
  if(!_tasks[dk])return;
  var t=_tasks[dk].find(function(x){return x.id===id;});
  if(t&&t.subtasks&&t.subtasks[si]){t.subtasks[si].done=done;saveData();}
}

// ===== UI STATE PERSISTENCE (localStorage) =====
var _UI_PERSIST_KEY = 'ezy_modal_ui_state';
function _uiPersistSave(state) {
  try { localStorage.setItem(_UI_PERSIST_KEY, JSON.stringify(state)); } catch(e){}
}
function _uiPersistLoad() {
  try { var s=localStorage.getItem(_UI_PERSIST_KEY); return s?JSON.parse(s):null; } catch(e){ return null; }
}
function _uiPersistClear() {
  try { localStorage.removeItem(_UI_PERSIST_KEY); } catch(e){}
}
// Hook into showModal/closeModal to auto-persist add-task draft
var _origShowModal = showModal;
showModal = function(id) {
  _origShowModal(id);
  if (id === 'addtask') {
    // persist a snapshot of the draft on open
    try {
      var titleEl = document.getElementById('t-title');
      _uiPersistSave({modal:'addtask', date:_addTaskDate, title:titleEl?titleEl.value:''});
    } catch(e){}
  }
};
var _origCloseModal = closeModal;
closeModal = function(id) {
  _origCloseModal(id);
  if (id === 'addtask') _uiPersistClear();
};
// On page load, restore persisted modal state
(function _uiPersistRestore() {
  window.addEventListener('DOMContentLoaded', function() {
    var st = _uiPersistLoad();
    if (st && st.modal === 'addtask') {
      // Restore draft
      setTimeout(function(){
        try {
          openAddTaskModal(st.date || null, null);
          var te = document.getElementById('t-title'); if(te && st.title) te.value = st.title;
        } catch(e){}
      }, 600);
    }
  });
})();

function saveTask(){

  var title=(document.getElementById('t-title').value||'').trim();

  if(!title){alert('Please enter a task title.');return;}

  var dateInp = document.getElementById('addtask-date-input'); var key = (dateInp && dateInp.value) ? dateInp.value : (_addTaskDate || tbDateKey(new Date()));

  var reminderMins = getReminderMinutes();

  var reminderVal = (reminderMins !== null && reminderMins !== undefined) ? String(reminderMins) : '';

  var rruleVal = getEffectiveRrule(key);

  var taskObj = {id:_nextTaskId++,title:title,time:getPickedTime(),endTime:getPickedEndTime(),done:false,color:_selectedTaskColor,subtasks:_newSubs.slice(),reminder:reminderVal,rrule:rruleVal,originDate:key};

  if(!_tasks[key])_tasks[key]=[];

  _tasks[key].push(taskObj);

  // Expand recurrence into visible range (2 years forward)

  if (rruleVal) expandRecurringTask(taskObj, key);

  // Schedule browser notification reminder

  if (reminderVal !== '') scheduleTaskReminder(taskObj, key);

  _newSubs=[];

  var subInp=document.getElementById('new-sub-input'); if(subInp) subInp.value='';

  document.getElementById('t-title').value='';

  closeModal('addtask');

  renderGCal();

  renderCalendar();

  saveData();

}

// ===== CALENDAR (monthly overview page) =====

function tbDateKey(d){ return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }

function fmtTBDate(d){

  var DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

  var n=d.getDate(), sfx=(n===1||n===21||n===31)?'st':(n===2||n===22)?'nd':(n===3||n===23)?'rd':'th';

  return DAYS[d.getDay()]+', '+MONTHS[d.getMonth()]+' '+n+sfx;

}

function renderCalendar(){

  if(!_calDate) return;

  var y=_calDate.getFullYear(), mo=_calDate.getMonth();

  var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

  document.getElementById('cal-month-label').textContent=MONTHS[mo]+' '+y;

  var first=new Date(y,mo,1).getDay();

  var last=new Date(y,mo+1,0).getDate();

  var today=new Date(), todayKey=tbDateKey(today);

  var cells=[];

  for(var i=0;i<first;i++) cells.push(null);

  for(var d=1;d<=last;d++) cells.push(d);

  while(cells.length%7!==0) cells.push(null);

  var html=cells.map(function(d){

    if(!d) return '<div class="cal-cell empty"></div>';

    var dk=y+'-'+pad2(mo+1)+'-'+pad2(d);

    var dayTasks=_tasks[dk]||[];

    var isToday=dk===todayKey;

    var pills=dayTasks.slice(0,2).map(function(t){ return '<div class="cal-task-pill'+(t.done?' done-pill':'')+'">'+esc(t.title)+'</div>'; }).join('');

    var more=dayTasks.length>2?'<div class="cal-more">+'+(dayTasks.length-2)+' more</div>':'';

    return '<div class="cal-cell'+(isToday?' today':'')+'" onclick="calGo(\''+dk+'\')">'+'<span class="cal-day-num">'+d+'</span><div class="cal-task-pills">'+pills+more+'</div></div>';

  }).join('');

  document.getElementById('cal-grid').innerHTML=html;

}

function calShift(delta){ _calDate=new Date(_calDate.getFullYear(),_calDate.getMonth()+delta,1); renderCalendar(); }

function calGo(dk){ _gcalAnchor=new Date(dk+'T12:00:00'); showPage('timeblocking'); setGCalView('day'); }

// ===== REASSIGN =====

function confirmReassign(){ if(!_pendingReassign)return; var nd=document.getElementById('reassign-date').value; if(!nd){alert('Pick a date.');return;} var _a=_pendingReassign; var t=(_tasks[_a.dk]||[]).find(function(x){return x.id===_a.tid;}); if(t){var s=t.subtasks.find(function(x){return x.id===_a.sid;}); if(s){s.rdate=nd;s.done=false;}} _pendingReassign=null; closeModal('reassign'); renderGCal(); }

// ===== UTILS =====

function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function pad2(n){ return String(n).padStart(2,'0'); }

function fmtDate(ds){ var d=new Date(ds+'T00:00:00'); var M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return M[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear(); }

function fmt12(t){ if(!t)return''; var p=t.split(':'); var h=parseInt(p[0],10),m=p[1]||'00'; var ap=h>=12?'PM':'AM'; h=h%12||12; return h+':'+m+' '+ap; }

// ===== INIT =====

// ===== NAVIGATION HISTORY =====

var _navHistory = [];

window.addEventListener('popstate', function(e) {
  var pg = (e.state && e.state.page) ? e.state.page : 'home';
  _currentPage = pg;
  _showPageInternal(pg);
  highlightNav(pg);
  updateNavButtons();
  if (pg === 'home') renderHomeBlocks();
});

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

function showCategoryMenu(groupId) {

  var group = sidebarGroups.find(function(g){ return g.id === groupId; });

  if (!group) { return; }

  // If only 1 item, navigate directly

  if (group.items.length === 1) { showPage(group.items[0].id); return; }

  

  if (window.innerWidth <= 768) closeMobileSidebar();

  var grid = document.getElementById('submenu-grid');

  var title = document.getElementById('submenu-title');

  if (title) title.textContent = group.name;

  if (grid) {

    grid.innerHTML = group.items.map(function(item) {

      return '<div class="submenu-card" onclick="showPage(\''+item.id+'\')">' +

        '<div class="submenu-card-icon">'+(item.icon||'⭐')+'</div>' +

        '<div class="submenu-card-label">'+esc(item.label)+'</div>' +

        '</div>';

    }).join('');

  }

  _navHistory.push(_currentPage || 'home');

  _currentPage = 'submenu';

  _showPageInternal('submenu');

  highlightNav('submenu');

  var info = document.getElementById('page-title');

  if (info) info.textContent = group.name;

  var sub = document.getElementById('page-sub');

  if (sub) sub.textContent = 'Choose a section';

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

function hbSaveOrder(){ try{ localStorage.setItem(_HB_STORAGE_KEY, JSON.stringify(_homeBlockOrder)); }catch(e){} }

function hbLoadOrder(){

  try{

    var d = localStorage.getItem(_HB_STORAGE_KEY);

    if(d){ var arr=JSON.parse(d); if(Array.isArray(arr)&&arr.length){ _homeBlockOrder=arr; return; } }

  }catch(e){}

  _homeBlockOrder = null;

}

function renderHomeBlocks() {

  if (!_homeBlockOrder) {

    _homeBlockOrder = sidebarGroups.filter(function(g){return g.id!=='home-group';}).map(function(g){ return g.id; });

  }

  var wrap = document.getElementById('home-blocks');

  if (!wrap) return;

  var mainGroups = sidebarGroups.filter(function(g){return g.id!=='home-group';});

  var orderedGroups = _homeBlockOrder.map(function(id){ return mainGroups.find(function(g){return g.id===id;}); }).filter(Boolean);

  mainGroups.forEach(function(g){ if(_homeBlockOrder.indexOf(g.id)===-1){ _homeBlockOrder.push(g.id); orderedGroups.push(g); } });

  var icons = { trading:'📈', life:'🌿', tools:'🔧' }

  var descs = { trading:'Trading journal, tax tracking, open positions', life:'Goals, time blocking, notes & calendar', tools:'Reports, settings & more' }

  var firstPages = { trading:'dashboard', life:'goals', tools:'timeblocking' }

  var cards = orderedGroups.map(function(g, i) {

    var rawIcon = _homeIcons[g.id] || icons[g.id] || '⭐';

    var isImg = rawIcon.indexOf('data:') === 0;

    var iconHtml = isImg

      ? '<img src="' + rawIcon + '" style="width:52px;height:52px;border-radius:8px;object-fit:cover;">'

      : '<span style="font-size:52px;line-height:1;">' + rawIcon + '</span>';

    var desc = descs[g.id] || g.name + ' section';

    var gid2 = g.id;

    return '<div class="home-block" draggable="true" data-gid="' + gid2 + '" data-hbi="' + i + '"' +

      ' ondragstart="homeBlockDragStart(event,' + i + ')"' +

      ' ondragover="homeBlockDragOver(event)"' +

      ' ondrop="homeBlockDrop(event,' + i + ')"' +

      ' ondragend="homeBlockDragEnd()"' +

      ' onclick="homeBlockClick(event,\'' + gid2 + '\')"' +

      ' style="cursor:grab;">' +

      '<div class="home-block-icon-wrap">' +

        '<div class="home-block-icon" style="margin-bottom:0;">' + iconHtml + '</div>' +

        '<button class="hb-edit-btn" title="Edit icon" ondragstart="event.stopPropagation();event.preventDefault();" onclick="hieOpenModal(event,\'' + gid2 + '\')">✏️</button>' +

      '</div>' +

      '<div class="home-block-title">' + esc(g.name) + '</div>' +

      '<div class="home-block-desc">' + desc + '</div>' +

      '<div class="home-block-count">' + g.items.length + ' sections</div>' +

    '</div>';

  });

  var qlBadge = _quickLinks.length ? _quickLinks.length + ' saved' : 'none saved';

  cards.push(

    '<div class="home-block" style="border-style:dashed;opacity:.85;cursor:pointer;" onclick="qlOpenModal()">' +

    '<div class="home-block-icon">⭐</div>' +

    '<div class="home-block-title">+ Add Shortcut</div>' +

    '<div class="home-block-desc">Pin your most-used pages for quick access</div>' +

    '<div class="home-block-count" id="ql-count-badge">' + qlBadge + '</div>' +

    '</div>'

  );

  wrap.innerHTML = cards.join('');

}

function homeBlockClick(e, gid){

  if(_homeBlockDragging){ _homeBlockDragging=false; return; }

  showCategoryMenu(gid);

}

function homeBlockDragStart(e,i){

  _homeBlockDragSrc=i;

  _homeBlockDragging=true;

  e.currentTarget.classList.add('dragging');

  e.dataTransfer.effectAllowed='move';

  e.dataTransfer.setData('text/plain', String(i));

}

function homeBlockDragOver(e){

  e.preventDefault();

  e.dataTransfer.dropEffect='move';

  document.querySelectorAll('.home-block[draggable]').forEach(function(b){ b.classList.remove('drag-over'); });

  e.currentTarget.classList.add('drag-over');

}

function homeBlockDrop(e,i){

  e.preventDefault();

  document.querySelectorAll('.home-block[draggable]').forEach(function(b){ b.classList.remove('drag-over'); });

  if(_homeBlockDragSrc===null||_homeBlockDragSrc===i){ return; }

  var moved=_homeBlockOrder.splice(_homeBlockDragSrc,1)[0];

  _homeBlockOrder.splice(i,0,moved);

  hbSaveOrder();

  renderHomeBlocks();

}

function homeBlockDragEnd(){

  document.querySelectorAll('.home-block').forEach(function(b){b.classList.remove('dragging','drag-over');});

  _homeBlockDragSrc=null;

  setTimeout(function(){ _homeBlockDragging=false; }, 50);

}

// ===== DATA PERSISTENCE =====

// ============================================================

// ===== QUICK LINKS =====

// ============================================================

var _quickLinks = [];

function qlSave(){ try{ localStorage.setItem('ezy_quicklinks_v1', JSON.stringify(_quickLinks)); }catch(e){} }

function qlLoad(){ try{ var d=localStorage.getItem('ezy_quicklinks_v1'); if(d) _quickLinks=JSON.parse(d); }catch(e){} }

function renderQuickLinks(){

  // Update badge count on the Add Shortcut grid card

  var badge = document.getElementById('ql-count-badge');

  if (badge) badge.textContent = _quickLinks.length ? _quickLinks.length + ' saved' : 'none saved';

}

function qlOpenModal(){

  var lb=document.getElementById('ql-listbox'); if(!lb) return;

  // Clear selection

  document.getElementById('ql-selected-id').value='';

  document.getElementById('ql-selected-icon').value='';

  document.getElementById('ql-selected-label').value='';

  var rows='';

  sidebarGroups.forEach(function(grp){

    grp.items.forEach(function(item){

      if(item.id==='home') return;

      var already=_quickLinks.find(function(l){ return l.id===item.id; });

      rows+='<div class="ql-list-item'+(already?' ql-list-saved':'')

        +'" data-id="'+item.id+'" data-icon="'+esc(item.icon)+'" data-label="'+esc(item.label)+'"'

        +' onclick="qlSelectItem(this)">'

        +'<span style="font-size:16px;margin-right:9px;">'+item.icon+'</span>'

        +'<span style="flex:1;">'+esc(item.label)+'</span>'

        +(already?'<span style="font-size:11px;color:var(--text3);margin-left:6px;">saved</span>':'')

        +'</div>';

    });

  });

  lb.innerHTML=rows;

  showModal('ql-add');

}

function qlSelectItem(el){

  document.querySelectorAll('.ql-list-item').forEach(function(r){ r.classList.remove('ql-list-active'); });

  el.classList.add('ql-list-active');

  document.getElementById('ql-selected-id').value=el.getAttribute('data-id');

  document.getElementById('ql-selected-icon').value=el.getAttribute('data-icon');

  document.getElementById('ql-selected-label').value=el.getAttribute('data-label');

}

function qlSaveShortcut(){

  var id=document.getElementById('ql-selected-id').value;

  if(!id){ closeModal('ql-add'); return; }

  if(_quickLinks.find(function(l){ return l.id===id; })){ closeModal('ql-add'); return; }

  var icon=document.getElementById('ql-selected-icon').value||'⭐';

  var label=document.getElementById('ql-selected-label').value||id;

  _quickLinks.push({id:id,icon:icon,label:label});

  qlSave(); renderHomeBlocks(); closeModal('ql-add');

}

function qlDelete(i){ _quickLinks.splice(i,1); qlSave(); renderHomeBlocks(); }

// ============================================================

// ===== HOME ICON EDITOR =====

// ============================================================

var _homeIcons = {}; // { groupId: 'emoji' | 'data:image/...' }

var _hieGroupId = null;

var _hiePendingValue = null; // emoji string or data URL

var _HIE_STORAGE = 'ezy_grpicons_v1';

var _HIE_EMOJIS = ['🏠','⭐','🎯','📌','💡','🏆','✅','🔥','💪','🌟','📈','🎓','🛠️','💰','🚗','🏋️','🎵','📚','✈️','🌿','🎮','🐾','🍕','🌍','💼','🎨','🔑','📊','🧘','🏖️'];

function hieLoad(){ try{ var d=localStorage.getItem(_HIE_STORAGE); if(d) _homeIcons=JSON.parse(d); }catch(e){} }

function hieSaveStore(){ try{ localStorage.setItem(_HIE_STORAGE, JSON.stringify(_homeIcons)); }catch(e){} }

function hieOpenModal(e, groupId){

  e.stopPropagation();

  e.preventDefault();

  _hieGroupId = groupId;

  _hiePendingValue = null;

  // reset tabs

  hieTab('emoji');

  // populate emoji grid

  var grid = document.getElementById('hie-emoji-grid');

  grid.innerHTML = _HIE_EMOJIS.map(function(em){

    return '<button class="hie-emoji-btn" onclick="hiePickEmoji(\''+em+'\')">' + em + '</button>';

  }).join('');

  document.getElementById('hie-custom-emoji').value = '';

  document.getElementById('hie-img-preview').style.display = 'none';

  document.getElementById('hie-file-input').value = '';

  showModal('hie');

}

function hieTab(name){

  ['emoji','image'].forEach(function(t){

    document.getElementById('hie-tab-'+t).classList.toggle('active', t===name);

    document.getElementById('hie-pane-'+t).classList.toggle('active', t===name);

  });

}

function hiePickEmoji(em){

  document.querySelectorAll('.hie-emoji-btn').forEach(function(b){ b.classList.remove('selected'); });

  event.currentTarget.classList.add('selected');

  document.getElementById('hie-custom-emoji').value = em;

  _hiePendingValue = em;

}

function hieEmojiTyped(val){

  document.querySelectorAll('.hie-emoji-btn').forEach(function(b){ b.classList.remove('selected'); });

  _hiePendingValue = val.trim() || null;

}

function hieFileChosen(input){

  var file = input.files[0]; if(!file) return;

  var reader = new FileReader();

  reader.onload = function(ev){

    var img = new Image();

    img.onload = function(){

      var canvas = document.createElement('canvas');

      canvas.width = 64; canvas.height = 64;

      var ctx = canvas.getContext('2d');

      // cover-fit: crop to square then draw

      var s = Math.min(img.width, img.height);

      var sx = (img.width - s) / 2, sy = (img.height - s) / 2;

      ctx.drawImage(img, sx, sy, s, s, 0, 0, 64, 64);

      var dataUrl = canvas.toDataURL('image/jpeg', 0.72);

      _hiePendingValue = dataUrl;

      var preview = document.getElementById('hie-img-preview');

      preview.src = dataUrl; preview.style.display = 'block';

    };

    img.src = ev.target.result;

  };

  reader.readAsDataURL(file);

}

function hieSave(){

  if(!_hieGroupId || !_hiePendingValue) { closeModal('hie'); return; }

  _homeIcons[_hieGroupId] = _hiePendingValue;

  hieSaveStore();

  // Sync to sidebar: update icon of every item in this group that has a group-level icon

  // (we store separately so sidebar item icons remain independent; we update group header icon via _homeIcons)

  // Also update first item icon in sidebar for visual consistency

  sidebarGroups.forEach(function(grp){

    if(grp.id === _hieGroupId){

      // Store as group-level icon  sidebar groups don't have their own icon field yet, but we can tag it

      grp._icon = _hiePendingValue;

    }

  });

  saveSidebarToStorage();

  renderSidebar();

  renderHomeBlocks();

  closeModal('hie');

}

function saveData() {
  if (!_dataLoaded) {
    // Buffer the save and retry once data is loaded instead of silently dropping it
    console.warn('saveData: data not yet loaded, buffering save for retry');
    setTimeout(function(){ if(_dataLoaded) saveData(); }, 1500);
    return;
  }
  // Always save sidebar to localStorage (UI prefs only)
  try { saveSidebarToStorage(); } catch(e) {}
  try { localStorage.setItem('ezy_app_version', localStorage.getItem('ezy_app_version') || ''); } catch(e) {}

  if (!_fbUid) {
    // Fallback to localStorage if not authenticated
    try {
      localStorage.setItem('ezy_goals_v2', JSON.stringify(goals));
      localStorage.setItem('ezy_notes_v2', JSON.stringify(notes));
      localStorage.setItem('ezy_categories_v2', JSON.stringify(categories));
      localStorage.setItem('ezy_next_cat_id', String(_nextCatId));
      localStorage.setItem('ezy_tasks_v2', JSON.stringify(_tasks));
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
  var userRef = _fbDb.collection('users').doc(_fbUid);
  userRef.collection('data').doc('main').set({
    goals: goals,
    notes: notes,
    categories: categories,
    nextCatId: _nextCatId,
    tasks: _tasks,
    nextTaskId: _nextTaskId,
    subIdCtr: _subIdCtr,
    vehicles: _vehicles,
    bizData: _bizData,
    budgets: _budgets,
    checkbooks: _checkbooks,
    finAccounts: _finAccounts,
    sidebarGroups: sidebarGroups,
    sgCollapsed: _sgCollapsed,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function(e) {
    console.error('saveData Firestore error:', e);
  });
}

function loadData() {
  try { loadSidebarFromStorage(); } catch(e) {}

  if (!_fbUid) {
    // Fallback: load from localStorage
    try {
      var g = localStorage.getItem('ezy_goals_v2'); if (g) goals = JSON.parse(g);
      var n = localStorage.getItem('ezy_notes_v2'); if (n) notes = JSON.parse(n);
      var cv = localStorage.getItem('ezy_categories_v2'); if (cv) categories = JSON.parse(cv);
      var nc = localStorage.getItem('ezy_next_cat_id'); if (nc) _nextCatId = parseInt(nc,10) || _nextCatId;
      categories.forEach(function(x){ if(x.id >= _nextCatId) _nextCatId = x.id + 1; });
      var t = localStorage.getItem('ezy_tasks_v2'); if (t) _tasks = JSON.parse(t);
      var nt = localStorage.getItem('ezy_next_task_id'); if (nt) _nextTaskId = parseInt(nt,10) || 1;
      var sc = localStorage.getItem('ezy_sub_id_ctr'); if (sc) _subIdCtr = parseInt(sc,10) || 1;
      var veh = localStorage.getItem('ezy_vehicles_v1'); if (veh) _vehicles = JSON.parse(veh);
      var bd = localStorage.getItem('ezy_bizdata_v1'); if (bd) _bizData = JSON.parse(bd);
      var bgt = localStorage.getItem('ezy_budgets_v1'); if (bgt) _budgets = JSON.parse(bgt);
      var cbk = localStorage.getItem('ezy_checkbooks_v1'); if (cbk) _checkbooks = JSON.parse(cbk);
      var fin = localStorage.getItem('ezy_finaccounts_v1'); if (fin) _finAccounts = JSON.parse(fin);
    } catch(e) {}
    _dataLoaded = true;
    return Promise.resolve();
  }

  // Load from Firestore
  return _fbDb.collection('users').doc(_fbUid)
    .collection('data').doc('main').get()
    .then(function(doc) {
      if (doc.exists) {
        var d = doc.data();
        if (d.goals)        goals       = d.goals;
        if (d.notes)        notes       = d.notes;
        if (d.categories)   categories  = d.categories;
        if (d.nextCatId)    _nextCatId  = d.nextCatId;
        if (d.tasks)        _tasks      = d.tasks;
        if (d.nextTaskId)   _nextTaskId = d.nextTaskId;
        if (d.subIdCtr)     _subIdCtr   = d.subIdCtr;
        if (d.vehicles)     _vehicles   = d.vehicles;
        if (d.bizData)      _bizData    = d.bizData;
        if (d.budgets)      _budgets    = d.budgets;
        if (d.checkbooks)   _checkbooks = d.checkbooks;
        if (d.finAccounts)  _finAccounts = d.finAccounts;
        if (d.sidebarGroups && d.sidebarGroups.length) { sidebarGroups = d.sidebarGroups; try { localStorage.setItem('ezy_sidebar_v3', JSON.stringify({ groups: sidebarGroups, collapsed: _sgCollapsed })); } catch(e){} }
        if (d.sgCollapsed)  _sgCollapsed = d.sgCollapsed;
        categories.forEach(function(x){ if(x.id >= _nextCatId) _nextCatId = x.id + 1; });
        _dataLoaded = true;
        console.log('Loaded data from Firestore for uid:', _fbUid);

      } else {
        _dataLoaded = true;
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

function getBizData(id) {

  if (!_bizData[id]) _bizData[id] = { income: [], workorders: [], inventory: [], mileage: [], woCounter: 1 };

  return _bizData[id];

}

var BIZ_CONFIG = {

  'biz-bn1':  { name: "B&N Properties #1",     icon: '🏢', showInventory: false, showMileage: false },

  'biz-bn2':  { name: "B&N Properties #2",     icon: '🏢', showInventory: false, showMileage: false },

  'biz-ietc': { name: "Iron Eagle Truck Center", icon: '🦅', showInventory: true,  showMileage: true  },

  'biz-ietl': { name: "Iron Eagle Truck Lines",  icon: '🦅', showInventory: false, showMileage: true  }

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

        '<div style="font-size:24px;text-align:center;margin-bottom:6px">💰</div>' +

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

      '<div><div style="font-size:16px;font-weight:700">🚙 Mileage Log</div>' +

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

      '<div class="fin-account-icon">' + (a.icon||'💰') + '</div>' +

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

    '<button class="btn btn-outline btn-sm" onclick="_currentFinAccountId=null;renderFinPage()">← Back</button>' +

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

    html += '<div class="empty-state"><div class="empty-icon">📂</div><div class="empty-text">No categories yet for ' + getMonthLabel(month) + '.</div></div>';

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

  if (acct) renderBudgetAccount(acct, document.getElementById('fin-content'), '<div style="display:flex;align-items:center;gap:12px;margin-bottom:18px"><button class="btn btn-outline btn-sm" onclick="_currentFinAccountId=null;renderFinPage()">← Back</button><div style="font-size:18px;font-weight:800">' + (acct.icon||'') + ' ' + esc(acct.name) + '</div><button class="btn btn-outline btn-sm" style="margin-left:auto;color:var(--red)" onclick="deleteFinAccount(\'' + acct.id + '\')">Delete</button></div>');

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

  var acct = { id: 'fin-' + Date.now(), name: name, type: type, icon: icons[type]||'💰', openingBalance: 0, transactions: [], budgetData: {} };

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

function appInit() {

  _gcalAnchor = new Date();

  _calDate = new Date();

  // Version gate: track app version for future migrations (no longer resets sidebar)

  var APP_VERSION = '2026-07-20-v5';

  localStorage.setItem('ezy_app_version', APP_VERSION);

  // Sidebar loaded from Firestore in loadData() - localStorage used only as offline fallback

  // loadData() now called before appInit() via onAuthStateChanged

  rescheduleAllReminders();

  qlLoad();

  hbLoadOrder();

  hieLoad();

  renderSidebar();

  renderCalendar();

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

function gsearchRun() {

  clearTimeout(_gsearchTimer);

  _gsearchTimer = setTimeout(function() {

    var q = (document.getElementById('gsearch-input').value || '').trim().toLowerCase();

    var dd = document.getElementById('gsearch-dropdown');

    if (!q) { dd.classList.remove('open'); dd.innerHTML = ''; return; }

    var results = [];

    // --- Notes (read-only) ---

    notes.forEach(function(n) {

      var t = (n.title||'').toLowerCase();

      var b = (n.body||'').toLowerCase();

      if (t.indexOf(q) >= 0 || b.indexOf(q) >= 0) {

        var preview = (n.body||'').replace(/\[[ x]\]\s*/gi,'').slice(0,60);

        results.push({ section:'Notes', icon:'&#128221;', title: n.title || '(untitled)', sub: preview, action: function(nid){ return function(){ openNoteModal(nid); }; }(n.id) });

      }

    });

    // --- Goals / Kanban (read-only) ---

    goals.forEach(function(g) {

      var t = (g.title||'').toLowerCase();

      if (t.indexOf(q) >= 0) {

        var sub = []; if (g.category) sub.push(g.category); if (g.targetDate) sub.push('Due '+g.targetDate);

        results.push({ section:'Goals', icon:'&#127919;', title: g.title, sub: sub.join(' · '), action: function(gid){ return function(){ showPage('goals'); setTimeout(function(){ if(typeof openGoalDetail==='function') openGoalDetail(gid); },150); }; }(g.id) });

      }

      (g.steps||[]).forEach(function(s) {

        if ((s.title||'').toLowerCase().indexOf(q) >= 0) {

          results.push({ section:'Goals', icon:'&#127919;', title: s.title, sub: 'Step in: '+(g.title||''), action: function(gid){ return function(){ showPage('goals'); setTimeout(function(){ if(typeof openGoalDetail==='function') openGoalDetail(gid); },150); }; }(g.id) });

        }

      });

    });

    // --- Tasks (read-only, all dates) ---

    Object.keys(_tasks).forEach(function(dk) {

      (_tasks[dk]||[]).forEach(function(t) {

        var tt = (t.title||'').toLowerCase();

        if (tt.indexOf(q) >= 0) {

          results.push({ section:'Tasks', icon:'&#9989;', title: t.title, sub: dk, action: function(dkk, tid){ return function(){ showPage('timeblocking'); setTimeout(function(){ if(typeof _tbDate!=='undefined') _tbDate=dkk; if(typeof renderTimeblocking==='function') renderTimeblocking(); setTimeout(function(){ if(typeof gcalOpenTask==='function') gcalOpenTask(dkk,tid); },180); },150); }; }(dk, t.id) });

        }

        (t.subtasks||[]).forEach(function(s) {

          if ((s.title||'').toLowerCase().indexOf(q) >= 0) {

            results.push({ section:'Tasks', icon:'&#9989;', title: s.title, sub: 'Subtask on '+dk+' • '+t.title, action: function(dkk, tid){ return function(){ showPage('timeblocking'); setTimeout(function(){ if(typeof _tbDate!=='undefined') _tbDate=dkk; if(typeof renderTimeblocking==='function') renderTimeblocking(); setTimeout(function(){ if(typeof gcalOpenTask==='function') gcalOpenTask(dkk,tid); },180); },150); }; }(dk, t.id) });

          }

        });

      });

    });

    // --- Quick Links (read-only) ---

    _quickLinks.forEach(function(l) {

      if ((l.label||'').toLowerCase().indexOf(q) >= 0 || (l.url||'').toLowerCase().indexOf(q) >= 0) {

        results.push({ section:'Quick Links', icon:'\ud83d\udd17', title: l.label||l.url, sub: l.url, action: function(url){ return function(){ window.open(url,'_blank'); }; }(l.url) });

      }

    });

    // --- Render ---

    if (!results.length) {

      dd.innerHTML = '<div class="gsearch-empty">No results for \''+esc(q)+'\'</div>';

      dd.classList.add('open');

      return;

    }

    var sections = {};

    results.forEach(function(r) { if (!sections[r.section]) sections[r.section] = []; sections[r.section].push(r); });

    var html = '';

    Object.keys(sections).forEach(function(sec) {

      html += '<div class="gsearch-section">'+esc(sec)+'</div>';

      sections[sec].slice(0,5).forEach(function(r, i) {

        html += '<div class="gsearch-item" data-sec="'+esc(sec)+'" data-idx="'+i+'" onclick="gsearchActEl(this)">'+'<span class="gsearch-item-icon">'+r.icon+'</span><div class="gsearch-item-main"><div class="gsearch-item-title">'+esc(r.title)+'</div>'+(r.sub ? '<div class="gsearch-item-sub">'+esc(r.sub)+'</div>' : '')+'</div></div>';

      });

    });

    dd.innerHTML = html;

    dd.classList.add('open');

    // store actions

    dd._actions = {};

    Object.keys(sections).forEach(function(sec) {

      sections[sec].slice(0,5).forEach(function(r,i) {

        dd._actions[sec+'_'+i] = r.action;

      });

    });

  }, 120);

}

function gsearchActEl(el) {

  var sec = el.getAttribute('data-sec');

  var i = parseInt(el.getAttribute('data-idx'));

  gsearchAct(sec, i);

}

function gsearchAct(sec, i) {

  var dd = document.getElementById('gsearch-dropdown');

  var fn = dd._actions && dd._actions[sec+'_'+i];

  document.getElementById('gsearch-input').value = '';

  dd.classList.remove('open');

  dd.innerHTML = '';

  if (typeof fn === 'function') fn();

}

function gsearchBlur() {

  // Delay so click on item fires first

  setTimeout(function() {

    var dd = document.getElementById('gsearch-dropdown');

    if (dd) { dd.classList.remove('open'); }

  }, 200);

}

function gsearchKey(e) {

  if (e.key === 'Escape') {

    document.getElementById('gsearch-input').value = '';

    var dd = document.getElementById('gsearch-dropdown');

    dd.classList.remove('open');

    dd.innerHTML = '';

    return;

  }

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {

    e.preventDefault();

    var dd = document.getElementById('gsearch-dropdown');

    var items = dd.querySelectorAll('.gsearch-item');

    if (!items.length) return;

    var cur = dd.querySelector('.gsearch-item.gs-active');

    var idx = -1;

    items.forEach(function(el,i){ if(el===cur) idx=i; });

    if (cur) cur.classList.remove('gs-active');

    idx = e.key === 'ArrowDown' ? Math.min(idx+1, items.length-1) : Math.max(idx-1, 0);

    items[idx].classList.add('gs-active');

    items[idx].scrollIntoView({block:'nearest'});

    return;

  }

  if (e.key === 'Enter') {

    var dd = document.getElementById('gsearch-dropdown');

    var cur = dd.querySelector('.gsearch-item.gs-active');

    if (cur) cur.click();

  }

}

document.addEventListener('keydown', function(e) {

  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {

    e.preventDefault();

    var inp = document.getElementById('gsearch-input');

    if (inp) { inp.focus(); inp.select(); }

  }

});

// ===== GOALS CAROUSEL =====

var _goalsTabIdx = 0;

// ===== GOALS TAB CUSTOMIZATION =====

var _goalsTabDefaults = ['🎯 Active Goals', '📋 All Goals', '✅ Complete goals'];

function goalsLoadTabs() {

  var tabs = document.querySelectorAll('.goals-tab[data-tab-key]');

  tabs.forEach(function(tab, i) {

    var key = 'goalsTab' + i;

    var saved = localStorage.getItem(key);

    if (saved) tab.textContent = saved;

  });

}

function goalsEditTabs() {

  var tabs = document.querySelectorAll('.goals-tab[data-tab-key]');

  if (!tabs || tabs.length < 3) { alert('Could not find all 3 tabs. Try again.'); return; }

  document.getElementById('get-tab0').value = tabs[0].textContent.trim();

  document.getElementById('get-tab1').value = tabs[1].textContent.trim();

  document.getElementById('get-tab2').value = tabs[2].textContent.trim();

  openModal('goals-edit-tabs');

}

function goalsEditTabsSave() {

  var tabs = document.querySelectorAll('.goals-tab[data-tab-key]');

  var vals = [

    document.getElementById('get-tab0').value.trim(),

    document.getElementById('get-tab1').value.trim(),

    document.getElementById('get-tab2').value.trim()

  ];

  for (var i = 0; i < 3; i++) {

    var val = vals[i] || _goalsTabDefaults[i];

    localStorage.setItem('goalsTab' + i, val);

    if (tabs[i]) tabs[i].textContent = val;

  }

  closeModal('goals-edit-tabs');

}

function goalsGoTab(idx) {

  _goalsTabIdx = idx;

  var track = document.getElementById('goals-carousel-track');

  if (track) track.style.transform = 'translateX(-' + (idx * 100) + '%)';

  var tabs = document.querySelectorAll('.goals-tab');

  tabs.forEach(function(t, i) {

    t.classList.toggle('active', i === idx);

  });

}

function goalsCarouselInit() {

  var wrap = document.getElementById('goals-carousel-wrap');

  if (!wrap || wrap._carouselBound) return;

  wrap._carouselBound = true;

  var startX = 0, startY = 0, dx = 0, dragging = false, locked = false;

  var track = document.getElementById('goals-carousel-track');

  wrap.addEventListener('touchstart', function(e) {

    var t = e.touches[0];

    startX = t.clientX; startY = t.clientY; dx = 0; dragging = true; locked = false;

    track.style.transition = 'none';

  }, { passive: true });

  wrap.addEventListener('touchmove', function(e) {

    if (!dragging) return;

    var t = e.touches[0];

    dx = t.clientX - startX;

    var dy = t.clientY - startY;

    if (!locked) {

      // Lock axis after 6px threshold

      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;

      locked = true;

      if (Math.abs(dy) > Math.abs(dx)) { dragging = false; track.style.transition = ''; return; }

    }

    e.preventDefault();

    var base = _goalsTabIdx * 100;

    var pct = base - (dx / wrap.offsetWidth * 100);

    track.style.transform = 'translateX(-' + pct + '%)';

  }, { passive: false });

  wrap.addEventListener('touchend', function() {

    if (!dragging) return;

    dragging = false;

    track.style.transition = '';

    var panels = 3;

    if (dx < -50 && _goalsTabIdx < panels - 1) goalsGoTab(_goalsTabIdx + 1);

    else if (dx > 50 && _goalsTabIdx > 0) goalsGoTab(_goalsTabIdx - 1);

    else goalsGoTab(_goalsTabIdx);

  });

}



// ===== MATERIAL DESIGN TIME PICKER =====
var _clockState = {};
function clockKey(p, slot) { return p + '-' + slot; }

function clockSyncFromInputs(p, slot, isPM) {
  var hrId = (slot==='start') ? (p==='td' ? 'td-hr' : 't-hr') : (p==='td' ? 'td-ehr' : 't-ehr');
  var mnId = (slot==='start') ? (p==='td' ? 'td-min' : 't-min') : (p==='td' ? 'td-emin' : 't-emin');
  var hrEl = document.getElementById(hrId), mnEl = document.getElementById(mnId);
  var h = hrEl ? parseInt(hrEl.value||'9',10) : 9;
  var m = mnEl ? parseInt(mnEl.value||'0',10) : 0;
  if (isNaN(h)||h<1||h>12) h=9; if (isNaN(m)||m<0||m>59) m=0;
  _clockState[clockKey(p,slot)] = {h:h, m:m, isPM: isPM||false};
}

function clockInitFace(p, slot, h12, m, isPM) {
  _clockState[clockKey(p,slot)] = {h:h12, m:m, isPM: isPM||false};
  clockUpdateDisplay(p, slot);
  clockSyncHidden(p, slot);
}

function clockUpdateDisplay(p, slot) {
  var st = _clockState[clockKey(p,slot)]; if (!st) return;
  var el = document.getElementById(p+'-'+(slot==='start'?'start':'end')+'-display');
  if (!el) return;
  el.textContent = st.h+':'+String(st.m).padStart(2,'0')+' '+(st.isPM?'PM':'AM');
}

function clockSyncHidden(p, slot) {
  var st = _clockState[clockKey(p,slot)]; if (!st) return;
  var hrId = slot==='start' ? (p==='td'?'td-hr':'t-hr') : (p==='td'?'td-ehr':'t-ehr');
  var mnId = slot==='start' ? (p==='td'?'td-min':'t-min') : (p==='td'?'td-emin':'t-emin');
  var hrEl=document.getElementById(hrId), mnEl=document.getElementById(mnId);
  if(hrEl) hrEl.value=st.h; if(mnEl) mnEl.value=st.m;
}

function clockSelectMinute(p,slot,m){ var k=clockKey(p,slot); if(!_clockState[k]) _clockState[k]={h:9,m:0,isPM:false}; _clockState[k].m=m; clockUpdateDisplay(p,slot); clockSyncHidden(p,slot); }
function clockCustomMin(el,p,slot){ var m=parseInt(el.value,10); if(!isNaN(m)&&m>=0&&m<=59) clockSelectMinute(p,slot,m); }
function clockFaceClick(e,p,slot){}

var _mtpContext = null;

function mtpOpen(p, slot) {
  var isPM = false;
  if (p==='td') {
    if (slot==='start') { var ab=document.getElementById('td-am-btn'); isPM=ab?!ab.classList.contains('active'):false; }
    else { var eb=document.getElementById('td-eam-btn'); isPM=eb?!eb.classList.contains('active'):false; }
  } else {
    if (slot==='start') { var ab2=document.getElementById('t-am-btn'); isPM=ab2?!ab2.classList.contains('active'):false; }
    else { var eb2=document.getElementById('t-eam-btn'); isPM=eb2?!eb2.classList.contains('active'):false; }
  }
  clockSyncFromInputs(p, slot, isPM);
  var st=_clockState[clockKey(p,slot)];
  _mtpContext = {p:p, slot:slot, mode:'hour', pendingH:st.h, pendingM:st.m, pendingPM:st.isPM};
  _mtpRender();
  var ov=document.getElementById('mtp-overlay');
  if(ov) ov.style.display='flex';
}

function mtpClose(confirm) {
  var ov=document.getElementById('mtp-overlay');
  if(ov) ov.style.display='none';
  if(!confirm||!_mtpContext) return;
  var p=_mtpContext.p, slot=_mtpContext.slot;
  var k=clockKey(p,slot);
  _clockState[k]={h:_mtpContext.pendingH, m:_mtpContext.pendingM, isPM:_mtpContext.pendingPM};
  clockUpdateDisplay(p,slot);
  clockSyncHidden(p,slot);
  _mtpSyncAMPM(p,slot,_mtpContext.pendingPM);
  if(slot==='end') _mtpAutoEndAMPM(p);
  _mtpContext=null;
}

function _mtpSyncAMPM(p,slot,isPM) {
  var amId,pmId;
  if(p==='td'){ amId=slot==='start'?'td-am-btn':'td-eam-btn'; pmId=slot==='start'?'td-pm-btn':'td-epm-btn'; }
  else { amId=slot==='start'?'t-am-btn':'t-eam-btn'; pmId=slot==='start'?'t-pm-btn':'t-epm-btn'; }
  var amEl=document.getElementById(amId), pmEl=document.getElementById(pmId);
  if(amEl) amEl.classList.toggle('active',!isPM);
  if(pmEl) pmEl.classList.toggle('active',isPM);
  try { if(p==='td'){ if(slot==='start') _tdIsStartPM=isPM; else _tdIsEndPM=isPM; } else { if(slot==='start') _isStartPM=isPM; else _isEndPM=isPM; } } catch(e){}
}

function _mtpAutoEndAMPM(p) {
  var startSt=_clockState[clockKey(p,'start')], endSt=_clockState[clockKey(p,'end')];
  if(!startSt||!endSt) return;
  var s24=startSt.isPM?(startSt.h===12?12:startSt.h+12):(startSt.h===12?0:startSt.h);
  var e24am=(endSt.h===12)?0:endSt.h;
  var e24pm=(endSt.h===12)?12:endSt.h+12;
  if(!endSt.isPM && e24am<=s24 && e24pm>s24) {
    endSt.isPM=true; _mtpSyncAMPM(p,'end',true); clockUpdateDisplay(p,'end');
  }
}

function _mtpRender() {
  if(!_mtpContext) return;
  var c=_mtpContext, isHour=(c.mode==='hour');
  var hStr=String(c.pendingH).padStart(2,'0');
  var mStr=String(c.pendingM).padStart(2,'0');
  var label=c.slot==='start'?'Start time':'End time';
  var html='<div class="mtp-modal">'+
    '<div class="mtp-header">'+
    '<div class="mtp-label">'+label+'</div>'+
    '<div class="mtp-digital">'+
    '<input class="mtp-dbox mtp-dinput'+(isHour?' active':'')+'" id="mtp-hr-input" type="number" min="1" max="12" value="'+c.pendingH+'" onclick="_mtpSetMode(\'hour\')" oninput="_mtpHrInput(this)" onblur="_mtpHrBlur(this)">'+
    '<span class="mtp-dsep">:</span>'+
    '<input class="mtp-dbox mtp-dinput'+(isHour?'':' active')+'" id="mtp-min-input" type="number" min="0" max="59" value="'+c.pendingM+'" onclick="_mtpSetMode(\'min\')" oninput="_mtpMinInput(this)" onblur="_mtpMinBlur(this)">'+
    '<div class="mtp-ampm">'+
    '<button class="mtp-ampm-btn'+(c.pendingPM?'':' active')+'" onclick="_mtpSetAMPM(false)">AM</button>'+
    '<button class="mtp-ampm-btn'+(c.pendingPM?' active':'')+'" onclick="_mtpSetAMPM(true)">PM</button>'+
    '</div></div></div>'+
    '<div class="mtp-body"><div class="mtp-clock-wrap" id="mtp-clock" onmousedown="_mtpDragStart(event)" ontouchstart="_mtpDragStart(event)" onclick="_mtpClockClick(event)">'+
    _mtpBuildClock(c.mode,c.pendingH,c.pendingM)+
    '</div></div>'+
    '<div class="mtp-footer">'+
    '<button class="mtp-footer-btn mtp-cancel" onclick="mtpClose(false)">Cancel</button>'+
    '<button class="mtp-footer-btn mtp-ok" onclick="mtpClose(true)">OK</button>'+
    '</div></div>';
  var ov=document.getElementById('mtp-overlay');
  if(ov) ov.innerHTML=html;
}

function _mtpBuildClock(mode, selH, selM) {
  var cx=110, cy=110, r=85, nums='', handX, handY;
  if(mode==='hour') {
    for(var i=1;i<=12;i++){
      var ang=((i/12)*360-90)*Math.PI/180;
      var nx=cx+r*Math.cos(ang), ny=cy+r*Math.sin(ang);
      nums+='<div class="mtp-num'+(i===selH?' sel':'')+'" style="left:'+nx+'px;top:'+ny+'px" onclick="event.stopPropagation();_mtpPickHour('+i+')">'+i+'</div>';
    }
    var ha=((selH/12)*360-90)*Math.PI/180; handX=cx+r*Math.cos(ha); handY=cy+r*Math.sin(ha);
  } else {
    for(var j=0;j<12;j++){
      var mv=j*5;
      var ang2=((j/12)*360-90)*Math.PI/180;
      var nx2=cx+r*Math.cos(ang2), ny2=cy+r*Math.sin(ang2);
      nums+='<div class="mtp-num'+(mv===selM?' sel':'')+'" style="left:'+nx2+'px;top:'+ny2+'px" onclick="event.stopPropagation();_mtpPickMin('+mv+')">'+String(mv).padStart(2,'0')+'</div>';
    }
    var ma=((selM/60)*360-90)*Math.PI/180; handX=cx+r*Math.cos(ma); handY=cy+r*Math.sin(ma);
  }
  return '<svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">'+
    '<line x1="'+cx+'" y1="'+cy+'" x2="'+handX+'" y2="'+handY+'" stroke="#1f6feb" stroke-width="2.5" stroke-linecap="round"/>'+
    '</svg>'+nums+'<div class="mtp-center-dot"></div>';
}

function _mtpSetMode(mode){ if(_mtpContext){ _mtpContext.mode=mode; _mtpRender(); } }
function _mtpSetAMPM(isPM){ if(_mtpContext){ _mtpContext.pendingPM=isPM; _mtpRender(); } }
function _mtpPickHour(h){ if(!_mtpContext) return; _mtpContext.pendingH=h; _mtpContext.mode='min'; _mtpRender(); }
function _mtpPickMin(m){ if(!_mtpContext) return; _mtpContext.pendingM=m; _mtpRender(); }

function _mtpClockClick(e) {
  var wrap=document.getElementById('mtp-clock'); if(!wrap) return;
  var rect=wrap.getBoundingClientRect();
  var cx2=rect.left+rect.width/2, cy2=rect.top+rect.height/2;
  var dx=e.clientX-cx2, dy=e.clientY-cy2;
  if(Math.sqrt(dx*dx+dy*dy)<25) return;
  var angle=Math.atan2(dy,dx)*180/Math.PI+90; if(angle<0) angle+=360;
  if(_mtpContext.mode==='hour'){
    var h2=Math.round(angle/30)||12; if(h2<1)h2=1; if(h2>12)h2=12; _mtpPickHour(h2);
  } else {
    var m2=Math.round(angle/6); if(m2>=60)m2=0; m2=Math.round(m2/5)*5; if(m2>=60)m2=55; _mtpPickMin(m2);
  }
}

// Manual text input handlers
function _mtpHrInput(el){var v=parseInt(el.value,10);if(!isNaN(v)&&v>=1&&v<=12&&_mtpContext){_mtpContext.pendingH=v;_mtpRenderClockOnly();}}
function _mtpHrBlur(el){var v=parseInt(el.value,10);if(isNaN(v)||v<1)v=1;if(v>12)v=12;el.value=String(v).padStart(2,'0');if(_mtpContext){_mtpContext.pendingH=v;_mtpRenderClockOnly();}}
function _mtpMinInput(el){var v=parseInt(el.value,10);if(!isNaN(v)&&v>=0&&v<=59&&_mtpContext){_mtpContext.pendingM=v;_mtpRenderClockOnly();}}
function _mtpMinBlur(el){var v=parseInt(el.value,10);if(isNaN(v)||v<0)v=0;if(v>59)v=59;el.value=String(v).padStart(2,'0');if(_mtpContext){_mtpContext.pendingM=v;_mtpRenderClockOnly();}}
function _mtpRenderClockOnly(){if(!_mtpContext)return;var wrap=document.getElementById('mtp-clock');if(!wrap)return;wrap.innerHTML=_mtpBuildClock(_mtpContext.mode,_mtpContext.pendingH,_mtpContext.pendingM);}

// Drag support — mouse + touch with radial Math.atan2
var _mtpDragging=false;
function _mtpAngleToValue(e){
  var wrap=document.getElementById('mtp-clock');if(!wrap||!_mtpContext)return;
  var rect=wrap.getBoundingClientRect();
  var cx2=rect.left+rect.width/2,cy2=rect.top+rect.height/2;
  var clientX=(e.touches&&e.touches[0])?e.touches[0].clientX:e.clientX;
  var clientY=(e.touches&&e.touches[0])?e.touches[0].clientY:e.clientY;
  var dx=clientX-cx2,dy=clientY-cy2;
  if(Math.sqrt(dx*dx+dy*dy)<18)return;
  var angle=Math.atan2(dy,dx)*180/Math.PI+90;if(angle<0)angle+=360;
  if(_mtpContext.mode==='hour'){
    var h2=Math.round(angle/30)||12;if(h2<1)h2=1;if(h2>12)h2=12;
    _mtpContext.pendingH=h2;
    var hi=document.getElementById('mtp-hr-input');if(hi)hi.value=String(h2).padStart(2,'0');
  }else{
    var m2=Math.round(angle/6);if(m2>=60)m2=0;
    _mtpContext.pendingM=m2;
    var mi=document.getElementById('mtp-min-input');if(mi)mi.value=String(m2).padStart(2,'0');
  }
  _mtpRenderClockOnly();
}
function _mtpDragStart(e){_mtpDragging=true;_mtpAngleToValue(e);e.preventDefault();}
function _mtpDragMove(e){if(!_mtpDragging)return;_mtpAngleToValue(e);e.preventDefault();}
function _mtpDragEnd(){_mtpDragging=false;}
document.addEventListener('mousemove',_mtpDragMove);
document.addEventListener('mouseup',_mtpDragEnd);
document.addEventListener('touchmove',_mtpDragMove,{passive:false});
document.addEventListener('touchend',_mtpDragEnd);

var _orig_setAMPM=setAMPM; setAMPM=function(ampm){ _orig_setAMPM(ampm); var k=clockKey('t','start'); if(_clockState[k]){ _clockState[k].isPM=(ampm==='PM'); clockUpdateDisplay('t','start'); }};
var _orig_setEndAMPM=setEndAMPM; setEndAMPM=function(ampm){ _orig_setEndAMPM(ampm); var k=clockKey('t','end'); if(_clockState[k]){ _clockState[k].isPM=(ampm==='PM'); clockUpdateDisplay('t','end'); }};
var _orig_setAMPM_td=setAMPM_td; setAMPM_td=function(v){ _orig_setAMPM_td(v); var k=clockKey('td','start'); if(_clockState[k]){ _clockState[k].isPM=(v==='PM'); clockUpdateDisplay('td','start'); }};
var _orig_setEndAMPM_td=setEndAMPM_td; setEndAMPM_td=function(v){ _orig_setEndAMPM_td(v); var k=clockKey('td','end'); if(_clockState[k]){ _clockState[k].isPM=(v==='PM'); clockUpdateDisplay('td','end'); }};
