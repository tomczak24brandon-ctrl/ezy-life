// firebase.js — Firebase init; guards against CDN not loaded yet
(function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded. Check CDN script tags in index.html.');
    // Expose stubs so the rest of the app does not hard-crash
    window._fbAuth = null;
    window._fbDb   = null;
    window._fbUid  = null;
    return;
  }

  var _fbConfig = {
    apiKey: "AIzaSyDqekx9bFgWmEyp_rv-YqthlaLWCSex1AM",
    authDomain: "my-life-a37aa.firebaseapp.com",
    projectId: "my-life-a37aa",
    storageBucket: "my-life-a37aa.firebasestorage.app",
    messagingSenderId: "28106321797",
    appId: "1:28106321797:web:24245eeb22ded10766deec"
  };

  // Avoid double-init on hot reloads
  if (!firebase.apps.length) {
    firebase.initializeApp(_fbConfig);
  }

  var _fbAuth = firebase.auth();
  var _fbDb   = firebase.firestore();
  window._fbAuth = _fbAuth;
  window._fbDb   = _fbDb;
  window._fbUid  = null;

  // Enable offline persistence
  _fbDb.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence: not supported in this browser');
    }
  });

  // Auth state listener
  _fbAuth.onAuthStateChanged(function(user) {
    if (user) {
      window._fbUid = user.uid;
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('main-app').style.display = 'flex';
      if (!sessionStorage.getItem('goog_oauth_token')) {
        user.getIdToken(true).catch(function(){});
        console.warn('OAuth token not found in sessionStorage. Re-sign-in may be needed for Calendar/Tasks.');
      }
      loadData().then(function() {
        appInit();
      }).catch(function(e) {
        console.error('loadData error:', e);
        appInit();
      });
    } else {
      window._fbUid = null;
      sessionStorage.removeItem('goog_oauth_token');
      document.getElementById('login-screen').style.display = 'flex';
      document.getElementById('main-app').style.display = 'none';
    }
  });
}());
