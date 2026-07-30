
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
    window._fbAuth = _fbAuth;
    window._fbDb = _fbDb;
    // Enable offline persistence
    _fbDb.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence: multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence: not supported in this browser');
      }
    });
    var _fbUid = null;
    window._fbUid = null;

    // Auth state listener - fires on login/logout
    _fbAuth.onAuthStateChanged(function(user) {
      if (user) {
        _fbUid = user.uid;
        window._fbUid = user.uid;
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        // If token not yet in sessionStorage (e.g. page refresh), try to get fresh token
        if (!sessionStorage.getItem('goog_oauth_token')) {
          user.getIdToken(true).catch(function(){});
          // Re-auth to get access token if missing � graceful degradation
          console.warn('OAuth token not found in sessionStorage. Re-sign-in may be needed for Calendar/Tasks.');
        }
        loadData().then(function() {
          appInit();
          // Google Calendar / Tasks fetches removed (views removed)
        }).catch(function(e) {
          console.error('loadData error:', e);
          appInit();
        });
      } else {
        _fbUid = null;
        window._fbUid = null;
        sessionStorage.removeItem('goog_oauth_token');
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
      }
    });
  