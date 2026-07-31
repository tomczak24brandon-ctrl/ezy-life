const fs = require('fs');
const path = 'C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html';
let html = fs.readFileSync(path, 'utf8');

// ── OLD BLOCK (lines 2888–2944) ─────────────────────────────────────────────
const OLD_START = 'var _homeBlockOrder = null;\nvar _homeBlockDragSrc = null;\nfunction renderHomeBlocks() {';
const OLD_END   = '  _homeBlockDragSrc=null;\n}';

const startIdx = html.indexOf(OLD_START);
if (startIdx === -1) { console.error('START not found'); process.exit(1); }

// Find the closing brace of homeBlockDragEnd (last function in the block)
const searchFrom = startIdx + OLD_START.length;
const dragEndMarker = 'function homeBlockDragEnd(){';
const dragEndIdx = html.indexOf(dragEndMarker, searchFrom);
if (dragEndIdx === -1) { console.error('homeBlockDragEnd not found'); process.exit(1); }

// Find the closing } of homeBlockDragEnd
const closeIdx = html.indexOf('\n}', dragEndIdx);
if (closeIdx === -1) { console.error('close brace not found'); process.exit(1); }

const oldBlock = html.slice(startIdx, closeIdx + 2); // include \n}
console.log('Old block length:', oldBlock.length);
console.log('Old block start:', oldBlock.slice(0, 60));
console.log('Old block end:  ', oldBlock.slice(-60));

// ── NEW BLOCK ────────────────────────────────────────────────────────────────
// We preserve the emoji chars verbatim from the original; only the structure changes.
// Extract the icons/descs/firstPages line as-is from the old block so emoji survive.
const iconsLine  = oldBlock.match(/  var icons = \{[^\n]+\}/)?.[0]  || "  var icons = { trading:'📈', life:'🌿', tools:'🛠️' };";
const descsLine  = oldBlock.match(/  var descs = \{[^\n]+\}/)?.[0]  || "  var descs = { trading:'Trading journal, tax tracking, open positions', life:'Goals, time blocking, notes & calendar', tools:'Reports, settings & more' };";
const fpLine     = oldBlock.match(/  var firstPages = \{[^\n]+\}/)?.[0] || "  var firstPages = { trading:'dashboard', life:'goals', tools:'timeblocking' };";
const qlIconLine = oldBlock.match(/'<div class="home-block-icon">(.+?)<\/div>'\s*\+\s*\n\s*'<div class="home-block-title">\+ Add Shortcut/)?.[1] || '🔗';

const newBlock = `var _homeBlockOrder = null;
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
${iconsLine}
${descsLine}
${fpLine}
  var cards = orderedGroups.map(function(g, i) {
    var icon = icons[g.id] || '📁';
    var desc = descs[g.id] || g.name + ' section';
    var gid2 = g.id;
    return '<div class="home-block" draggable="true" data-gid="' + gid2 + '" data-hbi="' + i + '"' +
      ' ondragstart="homeBlockDragStart(event,' + i + ')"' +
      ' ondragover="homeBlockDragOver(event)"' +
      ' ondrop="homeBlockDrop(event,' + i + ')"' +
      ' ondragend="homeBlockDragEnd()"' +
      ' onclick="homeBlockClick(event,\\\'' + gid2 + '\\\')"' +
      ' style="cursor:grab;">' +
      '<div class="home-block-icon">' + icon + '</div>' +
      '<div class="home-block-title">' + esc(g.name) + '</div>' +
      '<div class="home-block-desc">' + desc + '</div>' +
      '<div class="home-block-count">' + g.items.length + ' sections</div>' +
    '</div>';
  });
  var qlBadge = _quickLinks.length ? _quickLinks.length + ' saved' : 'none saved';
  cards.push(
    '<div class="home-block" style="border-style:dashed;opacity:.85;cursor:pointer;" onclick="qlOpenModal()">' +
    '<div class="home-block-icon">🔗</div>' +
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
}`;

const result = html.slice(0, startIdx) + newBlock + html.slice(startIdx + oldBlock.length);
fs.writeFileSync(path, result, 'utf8');
console.log('Done. File length:', result.length);
