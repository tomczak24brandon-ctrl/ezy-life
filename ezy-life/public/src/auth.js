// auth.js — sign-in / sign-out handlers

function doGoogleSignIn() {
  var btn = document.getElementById('google-signin-btn');
  var err = document.getElementById('login-err');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }
  if (err) err.style.display = 'none';

  if (!window._fbAuth) {
    console.error('doGoogleSignIn: window._fbAuth is not initialised (Firebase SDK may not have loaded).');
    if (err) { err.textContent = 'Sign-in unavailable — Firebase failed to load. Please refresh.'; err.style.display = 'block'; }
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    return;
  }

  var provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/calendar.events');
  provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
  provider.addScope('https://www.googleapis.com/auth/tasks');
  provider.addScope('https://www.googleapis.com/auth/tasks.readonly');

  window._fbAuth.signInWithPopup(provider).then(function(result) {
    var credential = result.credential;
    if (credential && credential.accessToken) {
      sessionStorage.setItem('goog_oauth_token', credential.accessToken);
    }
  }).catch(function(e) {
    console.error('Google sign-in error:', e);
    if (err) { err.textContent = 'Sign-in failed: ' + (e.message || e.code); err.style.display = 'block'; }
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  });
}

function doSignOut() {
  if (!window._fbAuth) return;
  window._fbAuth.signOut().then(function() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
    window._fbUid = null;
  });
}

function doLogin() {
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

window._dataLoaded = false;
var goals = [];
var notes = [];

var categories = [
  { id:1, name:'Health',   emoji:'❤️' },
  { id:2, name:'Finance',  emoji:'💰' },
  { id:3, name:'Business', emoji:'💼' },
  { id:4, name:'Personal', emoji:'⭐' }
];

window._nextCatId = 5;
window._newCatEmoji = '⭐';
window._tasks = {};
window._nextTaskId = 1;
window._newSubs = [];
window._pendingReassign = null;
window._calDate = null;
window._isPM = false;
window._isEndPM = false;
window._selectedTaskColor = '#1f6feb';
window._gcalView = 'day';
window._gcalAnchor = new Date();
window._addTaskDate = null;
window._addTaskHour = null;
window._editingGoalId = null;
window._editingNoteId = null;
window._editingTaskDk = null;
window._editingTaskId = null;
window._nmColor = '';
window._nmPinned = false;

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
      { id:'dashboard',  icon:'📈', label:'Dashboard' },
      { id:'journal',    icon:'📓', label:'Journal' },
      { id:'positions',  icon:'📊', label:'Open Positions', badge:'5' },
      { id:'tax',        icon:'🧾', label:'Tax Summary', badge:'!', badgeRed:true }
    ]
  },
  {
    id: 'life', name: 'Life',
    items: [
      { id:'goals',    icon:'🎯', label:'Goals' },
      { id:'calendar', icon:'📅', label:'Calendar', externalUrl:'https://calendar.google.com', target:'_blank' }
    ]
  },
  {
    id: 'tools', name: 'Tools',
    items: [
      { id:'reports',  icon:'📋', label:'Reports' },
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
      { id:'biz-bn1',  icon:'🏢', label:'B&N Properties #1' },
      { id:'biz-bn2',  icon:'🏢', label:'B&N Properties #2' },
      { id:'biz-ietc', icon:'🦅', label:'Iron Eagle Truck Center' },
      { id:'biz-ietl', icon:'🚛', label:'Iron Eagle Truck Lines' }
    ]
  },
  {
    id: 'financials', name: 'Financials',
    items: [
      { id:'fin-budgets', icon:'💵', label:'Financials' }
    ]
  },
  {
    id: 'hobbies', name: 'Hobbies',
    items: [
      { id:'hobbies', icon:'🎨', label:'My Hobbies' }
    ]
  }
];

window._sgDragSrc = null;
window._sgDragSrcIdx = null;

function _getOAuthToken() {
  return sessionStorage.getItem('goog_oauth_token') || null;
}

// --- window exports ---
window.doGoogleSignIn = doGoogleSignIn;
window.doSignOut      = doSignOut;
window.doLogin        = doLogin;
window.doForgotPass   = doForgotPass;
window.doForgotUser   = doForgotUser;
