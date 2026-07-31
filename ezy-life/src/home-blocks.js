
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

  var icons = { trading:'📈', life:'🌱', tools:'🛠️' }

  var descs = { trading:'Trading journal, tax tracking, open positions', life:'Goals, time blocking, notes & calendar', tools:'Reports, settings & more' }

  var firstPages = { trading:'dashboard', life:'goals', tools:'timeblocking' }

  var cards = orderedGroups.map(function(g, i) {

    var rawIcon = _homeIcons[g.id] || icons[g.id] || '?';

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

    '<div class="home-block-icon">?</div>' +

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


// --- window exports ---
if (typeof renderHomeBlocks !== 'undefined') window.renderHomeBlocks = renderHomeBlocks;
if (typeof homeBlockClick !== 'undefined') window.homeBlockClick = homeBlockClick;
if (typeof homeBlockDragStart !== 'undefined') window.homeBlockDragStart = homeBlockDragStart;
if (typeof homeBlockDragOver !== 'undefined') window.homeBlockDragOver = homeBlockDragOver;
if (typeof homeBlockDrop !== 'undefined') window.homeBlockDrop = homeBlockDrop;
if (typeof homeBlockDragEnd !== 'undefined') window.homeBlockDragEnd = homeBlockDragEnd;
if (typeof hbSaveOrder !== 'undefined') window.hbSaveOrder = hbSaveOrder;
if (typeof hbLoadOrder !== 'undefined') window.hbLoadOrder = hbLoadOrder;
