
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


// --- window exports ---
window.nceGetValue = nceGetValue;
window.nceSetValue = nceSetValue;
