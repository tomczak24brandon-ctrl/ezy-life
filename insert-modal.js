const fs = require('fs');
let html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');

const MODAL_HTML = `
<!-- ADD FIN ACCOUNT MODAL -->
<div id="modal-addfin" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;align-items:center;justify-content:center">
  <div class="modal-box" style="min-width:320px;max-width:440px;width:90%">
    <div class="modal-header"><span style="font-size:17px;font-weight:800">Add Account</span></div>
    <div class="modal-body">
      <div class="form-group form-full">
        <label class="form-label">Account Name</label>
        <input id="fin-acct-name" class="form-input" type="text" placeholder="e.g. Chase Checking" autocomplete="off">
      </div>
      <div class="form-group form-full">
        <label class="form-label">Account Type</label>
        <select id="fin-acct-type" class="form-input">
          <option value="budget">💰 Budget</option>
          <option value="checkbook">📒 Checkbook Ledger</option>
          <option value="credit">💳 Credit Card Ledger</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('addfin')">Cancel</button>
      <button class="btn btn-primary" onclick="saveFinAccount()">Add Account ✓</button>
    </div>
  </div>
</div>

`;

const INSERT_BEFORE = '\n</body>\n</html>';
if (html.includes(INSERT_BEFORE)) {
  html = html.replace(INSERT_BEFORE, MODAL_HTML + INSERT_BEFORE);
  console.log('✅ modal-addfin inserted before </body>');
} else {
  // Try alternate ending
  const alt = '</body>\n</html>';
  if (html.endsWith(alt)) {
    html = html.slice(0, html.length - alt.length) + MODAL_HTML + alt;
    console.log('✅ modal-addfin inserted (alt method)');
  } else {
    console.log('❌ Could not find insertion point');
    console.log('Last 100 chars:', JSON.stringify(html.slice(-100)));
  }
}

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', html, 'utf8');
console.log('Saved. Size:', html.length);
