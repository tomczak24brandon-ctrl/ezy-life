const fs = require('fs');
let c = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');
const orig = c.length;

const CR = '\r\n';

// Remove the entire Google Calendar Sync block
const old = CR +
  "        <!-- GOOGLE CALENDAR SYNC -->" + CR +
  CR +
  "        <div style=\"margin-top:24px;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px\">" + CR +
  CR +
  "          <div style=\"font-size:15px;font-weight:700;margin-bottom:4px\">\ud83d\udcc5 Google Calendar Sync</div>" + CR +
  CR +
  "          <div style=\"font-size:13px;color:var(--text3);margin-bottom:16px\">Connect your Google account to show your Google Calendar events here.</div>" + CR +
  CR +
  "          <div id=\"gcal-sync-status\">" + CR +
  CR +
  "            <button class=\"btn btn-primary\" onclick=\"connectGCal()\">\ud83d\udcc5 Connect Google Calendar</button>" + CR +
  CR +
  "          </div>" + CR +
  CR +
  "          <div id=\"gcal-events-list\" style=\"margin-top:16px\"></div>" + CR +
  CR +
  "          <div style=\"margin-top:16px;padding:12px;background:var(--surface2);border-radius:8px;font-size:12px;color:var(--text3)\">" + CR +
  CR +
  "            <strong style=\"color:var(--text2)\">Setup required:</strong> To enable Google Calendar sync, a Google Cloud project with Calendar API must be set up and a Client ID added to the app. Ask Carlos to walk you through the one-time setup." + CR +
  CR +
  "          </div>" + CR +
  CR +
  "        </div>";

if (c.includes(old)) {
  c = c.split(old).join('');
  console.log('Removed Google Calendar Sync block: OK');
} else {
  console.log('NOT FOUND - trying partial search...');
  const key = '<!-- GOOGLE CALENDAR SYNC -->';
  const idx = c.indexOf(key);
  if (idx >= 0) {
    console.log('Block starts at idx', idx);
    console.log(JSON.stringify(c.slice(idx, idx + 300)));
  }
}

console.log('Length:', orig, '->', c.length);
fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', c, 'utf8');
console.log('Written.');
