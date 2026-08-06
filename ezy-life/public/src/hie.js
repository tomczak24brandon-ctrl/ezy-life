
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


// --- window exports ---
window.hieLoad = hieLoad;
window.hieOpenModal = hieOpenModal;
window.hieTab = hieTab;
window.hiePickEmoji = hiePickEmoji;
window.hieEmojiTyped = hieEmojiTyped;
window.hieFileChosen = hieFileChosen;
window.hieSave = hieSave;
