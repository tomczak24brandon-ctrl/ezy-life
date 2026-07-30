
function doGoogleSignIn() {
  var btn = document.getElementById('google-signin-btn');
  var err = document.getElementById('login-err');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }
  if (err) err.style.display = 'none';
  var provider = new firebase.auth.GoogleAuthProvider();
  // Request scopes for Google Calendar and Google Tasks
  provider.addScope('https://www.googleapis.com/auth/calendar.events');
  provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
  provider.addScope('https://www.googleapis.com/auth/tasks');
  provider.addScope('https://www.googleapis.com/auth/tasks.readonly');
  window._fbAuth.signInWithPopup(provider).then(function(result) {
    // Capture and store OAuth access token securely in sessionStorage
    var credential = result.credential;
    if (credential && credential.accessToken) {
      sessionStorage.setItem('goog_oauth_token', credential.accessToken);
      console.log('OAuth token captured and stored in sessionStorage');
    }
  }).catch(function(e) {
    console.error('Google sign-in error:', e);
    if (err) { err.textContent = 'Sign-in failed: ' + (e.message || e.code); err.style.display = 'block'; }
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  });
}

// ===== THEME TOGGLE =====
function doSignOut() {
  window._fbAuth.signOut().then(function() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
    window._fbUid = null;
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

var _newCatEmoji = '⭐';

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

      { id:'dashboard',  icon:'📈', label:'Dashboard' },

      { id:'journal',    icon:'📓', label:'Journal' },

      { id:'positions',  icon:'📊', label:'Open Positions', badge:'5' },

      { id:'tax',        icon:'🧾', label:'Tax Summary', badge:'!', badgeRed:true }

    ]

  },

  {

    id: 'life', name: 'Life',

    items: [

      { id:'goals',        icon:'🎯', label:'Goals' },

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

      { id:'biz-bn1',     icon:'🏢', label:'B&N Properties #1' },

      { id:'biz-bn2',     icon:'🏢', label:'B&N Properties #2' },

      { id:'biz-ietc',    icon:'🦅', label:'Iron Eagle Truck Center' },

      { id:'biz-ietl',    icon:'🚛', label:'Iron Eagle Truck Lines' }

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

var _sgDragSrc = null;

var _sgDragSrcIdx = null;

function _getOAuthToken() {
  return sessionStorage.getItem('goog_oauth_token') || null;
}



// Fetch Google Tasks (first task list) and map into the notes[] array
// Replaces the broken custom Firebase notes logic

// --- window exports ---
if (typeof doGoogleSignIn !== 'undefined') window.doGoogleSignIn = doGoogleSignIn;
if (typeof doSignOut !== 'undefined') window.doSignOut = doSignOut;
if (typeof doLogin !== 'undefined') window.doLogin = doLogin;
if (typeof doForgotPass !== 'undefined') window.doForgotPass = doForgotPass;
if (typeof doForgotUser !== 'undefined') window.doForgotUser = doForgotUser;
