
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

// Drag support � mouse + touch with radial Math.atan2
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

// Defer AMPM wrappers until all modules have loaded so the originals are defined
document.addEventListener('DOMContentLoaded', function() {
  // t-prefix functions live in ui.js (loads before timepicker.js)
  if (typeof window.setAMPM === 'function') {
    var _orig_setAMPM = window.setAMPM;
    window.setAMPM = function(ampm) { _orig_setAMPM(ampm); var k=clockKey('t','start'); if(_clockState[k]){ _clockState[k].isPM=(ampm==='PM'); clockUpdateDisplay('t','start'); } };
  }
  if (typeof window.setEndAMPM === 'function') {
    var _orig_setEndAMPM = window.setEndAMPM;
    window.setEndAMPM = function(ampm) { _orig_setEndAMPM(ampm); var k=clockKey('t','end'); if(_clockState[k]){ _clockState[k].isPM=(ampm==='PM'); clockUpdateDisplay('t','end'); } };
  }
  // td-prefix functions live in tasks.js (loads after timepicker.js)
  if (typeof window.setAMPM_td === 'function') {
    var _orig_setAMPM_td = window.setAMPM_td;
    window.setAMPM_td = function(v) { _orig_setAMPM_td(v); var k=clockKey('td','start'); if(_clockState[k]){ _clockState[k].isPM=(v==='PM'); clockUpdateDisplay('td','start'); } };
  }
  if (typeof window.setEndAMPM_td === 'function') {
    var _orig_setEndAMPM_td = window.setEndAMPM_td;
    window.setEndAMPM_td = function(v) { _orig_setEndAMPM_td(v); var k=clockKey('td','end'); if(_clockState[k]){ _clockState[k].isPM=(v==='PM'); clockUpdateDisplay('td','end'); } };
  }
});

// --- window exports ---
window.clockFaceClick = clockFaceClick;
window.clockInitFace = clockInitFace;
window.clockKey = clockKey;
window.clockSelectMinute = clockSelectMinute;
window.clockSyncFromInputs = clockSyncFromInputs;
window.clockSyncHidden = clockSyncHidden;
window.clockUpdateDisplay = clockUpdateDisplay;
window.buildHourGrid = buildHourGrid;
window.clockCustomMin = clockCustomMin;
