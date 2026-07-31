"""
Firebase migration for ezy-life/index.html
- Adds Firebase CDN (auth + firestore compat)
- Replaces hardcoded CREDS login with Google sign-in button
- Replaces saveData/loadData with Firestore reads/writes
- Enables offline persistence
- Keeps all UI, drag/drop, emoji picker, modals untouched
"""
import re, time, subprocess

src = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\index.html"
check_js = r"C:\Users\BIG D\.openclaw\workspace\ezy-life\_check.js"

with open(src, 'r', encoding='utf-8') as f:
    c = f.read()

print(f"File length: {len(c)}")
fixes = 0

# ===========================================================
# 1. Inject Firebase CDN scripts before closing </head>
# ===========================================================
FIREBASE_CDN = """
  <!-- Firebase -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
  <script>
    var _fbConfig = {
      apiKey: "AIzaSyBzRr2hkqFzJnl3p9YKDo7RCW-hKXx1AM",
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
  </script>
"""

if 'firebase-app-compat.js' not in c:
    c = c.replace('</head>', FIREBASE_CDN + '</head>', 1)
    print("Injected Firebase CDN scripts")
    fixes += 1
else:
    print("Firebase CDN already present")

# ===========================================================
# 2. Replace login box HTML with Google sign-in button
# ===========================================================
# Find the login-box div
LOGIN_BOX_OLD = re.search(
    r'<div class="login-box">.*?</div>\s*</div>\s*<!-- ===== MAIN APP',
    c, re.DOTALL
)
if LOGIN_BOX_OLD:
    print(f"Found login-box at {LOGIN_BOX_OLD.start()}-{LOGIN_BOX_OLD.end()}")

LOGIN_BOX_NEW = '''<div class="login-box">

    <img src="logo.jpg" alt="EZY LIFE" style="width:200px;border-radius:10px;display:block;margin:0 auto 18px">

    <div class="login-sub" style="margin-bottom:28px">Your personal life dashboard</div>

    <button id="google-signin-btn" onclick="doGoogleSignIn()" style="
      display:flex;align-items:center;justify-content:center;gap:12px;
      width:100%;padding:14px 20px;border-radius:10px;border:1px solid var(--border);
      background:var(--surface2);color:var(--text);font-size:15px;font-weight:600;
      cursor:pointer;transition:background 0.2s;
    " onmouseover="this.style.background='var(--accent)';this.style.color='#fff'"
       onmouseout="this.style.background='var(--surface2)';this.style.color='var(--text)'">
      <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
      Sign in with Google
    </button>

    <div id="login-err" style="color:#f85149;font-size:13px;margin-top:14px;text-align:center;display:none">
      Sign-in failed. Please try again.
    </div>

  </div>

  </div>

  <!-- ===== MAIN APP'''

if LOGIN_BOX_OLD:
    c = c[:LOGIN_BOX_OLD.start()] + LOGIN_BOX_NEW + c[LOGIN_BOX_OLD.end() - len('<!-- ===== MAIN APP'):]
    print("Replaced login box with Google sign-in button")
    fixes += 1
else:
    print("WARNING: login-box not found via regex - trying simpler replace")
    # Find login-box start and main-app comment
    lb_start = c.find('<div class="login-box">')
    ma_start = c.find('<!-- ===== MAIN APP')
    if lb_start > 0 and ma_start > lb_start:
        c = c[:lb_start] + LOGIN_BOX_NEW + c[ma_start:]
        print(f"Replaced login box (fallback): {lb_start} -> {ma_start}")
        fixes += 1
    else:
        print(f"FAIL: login-box={lb_start}, main-app={ma_start}")

# ===========================================================
# 3. Replace CREDS var + doLogin function with Firebase auth
# ===========================================================
CREDS_LINE = "var CREDS = { user: 'tomczak24brandon@gmail.com', pass: 'Gordon2448@@@' };"
if CREDS_LINE in c:
    c = c.replace(CREDS_LINE,
        "// Auth handled by Firebase - CREDS removed", 1)
    print("Removed hardcoded CREDS")
    fixes += 1

# Replace doLogin function
DO_LOGIN_OLD = re.search(
    r'function doLogin\(\) \{.*?\n\}',
    c, re.DOTALL
)
DO_LOGIN_NEW = '''function doGoogleSignIn() {
  var btn = document.getElementById('google-signin-btn');
  var err = document.getElementById('login-err');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }
  if (err) err.style.display = 'none';
  var provider = new firebase.auth.GoogleAuthProvider();
  _fbAuth.signInWithPopup(provider).catch(function(e) {
    console.error('Google sign-in error:', e);
    if (err) { err.textContent = 'Sign-in failed: ' + (e.message || e.code); err.style.display = 'block'; }
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  });
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
}'''

if DO_LOGIN_OLD:
    c = c[:DO_LOGIN_OLD.start()] + DO_LOGIN_NEW + c[DO_LOGIN_OLD.end():]
    print("Replaced doLogin with Firebase auth functions")
    fixes += 1
else:
    print("WARNING: doLogin() not found via regex")

# ===========================================================
# 4. Replace appInit() call inside doLogin success block
#    with Firebase onAuthStateChanged
# ===========================================================
# The old flow: doLogin() -> hide login -> show main -> appInit()
# New flow: onAuthStateChanged fires after Google popup -> same sequence
# We need to add onAuthStateChanged listener after Firebase is initialized
# Best place: right before the closing </script> of the Firebase init block

FIREBASE_AUTH_LISTENER = """
    // Auth state listener - fires on login/logout
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
"""

# Inject after the _fbDb enablePersistence block, before closing </script> of firebase init
FIREBASE_INIT_END = '    var _fbUid = null;\n  </script>'
if FIREBASE_INIT_END in c:
    c = c.replace(FIREBASE_INIT_END,
        '    var _fbUid = null;\n' + FIREBASE_AUTH_LISTENER + '  </script>', 1)
    print("Injected onAuthStateChanged listener")
    fixes += 1
else:
    print("WARNING: firebase init end marker not found")

# ===========================================================
# 5. Remove the old appInit() call inside doLogin success
# ===========================================================
OLD_APPINIT_CALL = """    document.getElementById('login-screen').style.display = 'none';

    document.getElementById('main-app').style.display = 'flex';

    appInit();"""
if OLD_APPINIT_CALL in c:
    c = c.replace(OLD_APPINIT_CALL,
        "    // App init now handled by onAuthStateChanged", 1)
    print("Removed old appInit() call from doLogin")
    fixes += 1
else:
    # Try to find it
    idx = c.find("appInit();")
    if idx >= 0:
        snippet = c[max(0,idx-100):idx+20]
        print(f"appInit() call context: {repr(snippet)}")

# ===========================================================
# 6. Replace saveData() with Firestore writes
# ===========================================================
SAVE_DATA_OLD = re.search(
    r'function saveData\(\) \{.*?\n\}',
    c, re.DOTALL
)

SAVE_DATA_NEW = '''function saveData() {
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
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function(e) {
    console.error('saveData Firestore error:', e);
  });
}'''

if SAVE_DATA_OLD:
    c = c[:SAVE_DATA_OLD.start()] + SAVE_DATA_NEW + c[SAVE_DATA_OLD.end():]
    print("Replaced saveData() with Firestore version")
    fixes += 1
else:
    print("WARNING: saveData() not found")

# ===========================================================
# 7. Replace loadData() with Firestore reads (returns Promise)
# ===========================================================
LOAD_DATA_OLD = re.search(
    r'function loadData\(\) \{.*?\n\}(?=\s*\n// ={3})',
    c, re.DOTALL
)

LOAD_DATA_NEW = '''function loadData() {
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
        categories.forEach(function(x){ if(x.id >= _nextCatId) _nextCatId = x.id + 1; });
        console.log('Loaded data from Firestore for uid:', _fbUid);
      } else {
        console.log('No Firestore data found - fresh user');
      }
    })
    .catch(function(e) {
      console.error('loadData Firestore error:', e);
    });
}'''

if LOAD_DATA_OLD:
    c = c[:LOAD_DATA_OLD.start()] + LOAD_DATA_NEW + c[LOAD_DATA_OLD.end():]
    print("Replaced loadData() with Firestore version")
    fixes += 1
else:
    # Try simpler find
    ld_start = c.find("function loadData() {")
    if ld_start >= 0:
        # find end of function
        depth = 0
        i = ld_start
        fn_end = -1
        while i < len(c):
            if c[i] == '{': depth += 1
            elif c[i] == '}':
                depth -= 1
                if depth == 0:
                    fn_end = i + 1
                    break
            i += 1
        if fn_end > 0:
            c = c[:ld_start] + LOAD_DATA_NEW + c[fn_end:]
            print(f"Replaced loadData() via brace-matching fallback")
            fixes += 1
        else:
            print("WARNING: could not find loadData() end brace")
    else:
        print("WARNING: loadData() not found at all")

# ===========================================================
# 8. Make appInit() NOT call loadData() (it's now called before appInit)
# ===========================================================
# Find loadData() call inside appInit
AI_START = c.find("function appInit() {")
if AI_START >= 0:
    # Find loadData call within next 500 chars
    ai_snippet = c[AI_START:AI_START+600]
    if 'loadData()' in ai_snippet:
        c = c[:AI_START] + ai_snippet.replace('loadData();', '// loadData() now called before appInit() via onAuthStateChanged', 1) + c[AI_START+600:]
        print("Removed loadData() call from appInit()")
        fixes += 1
    else:
        print("No loadData() call found in appInit() - OK")

# ===========================================================
# 9. Add sign-out button in topbar-actions
# ===========================================================
SIGNOUT_BTN = '<button onclick="doSignOut()" style="background:none;border:1px solid var(--border);color:var(--text2);border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer" title="Sign out">Sign out</button>'
TOPBAR_ACTIONS = 'id="topbar-actions">'
if TOPBAR_ACTIONS in c and 'doSignOut' not in c[c.find(TOPBAR_ACTIONS):c.find(TOPBAR_ACTIONS)+500]:
    c = c.replace(TOPBAR_ACTIONS, TOPBAR_ACTIONS + '\n        ' + SIGNOUT_BTN, 1)
    print("Added sign-out button to topbar")
    fixes += 1

# ===========================================================
# 10. Update version timestamp
# ===========================================================
ts = int(time.time() * 1000)
c = re.sub(r'<!-- v\d+ -->', f'<!-- v{ts} -->', c)

# ===========================================================
# 11. node --check
# ===========================================================
script_start = c.rfind('<script>')
script_end = c.rfind('</script>')
js_block = c[script_start+8:script_end]
with open(check_js, 'w', encoding='utf-8') as f:
    f.write(js_block)
result = subprocess.run(['node', '--check', check_js], capture_output=True, text=True)
combined = result.stdout + result.stderr
print(f"\nnode --check: {'CLEAN' if result.returncode == 0 else 'ERRORS'}")
if result.returncode != 0:
    print(combined[:800])

# Save
with open(src, 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)
print(f"\nSaved v{ts}, length={len(c)}, fixes={fixes}")
