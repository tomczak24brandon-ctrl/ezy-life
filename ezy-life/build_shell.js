const fs = require('fs');
const mono = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index-rollback-candidate.html', 'utf8');

// Remove first <style>...</style> block
let html = mono.replace(/<style>[\s\S]*?<\/style>/, '');

// Remove all inline <script> blocks (not src= ones)
html = html.replace(/<script>[\s\S]*?<\/script>/g, '');

// Add CSS link in <head>
html = html.replace('<head>', '<head>\n<link rel="stylesheet" href="/src/styles.css">');

// Add module script before </body>
html = html.replace('</body>', '<script type="module" src="/src/main.js"></script>\n</body>');

// Update version comment
const ts = Date.now();
html = html.replace(/<!-- v\d+ -->/, '<!-- v' + ts + ' -->');

fs.writeFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', html, 'utf8');
console.log('index.html written:', html.length, 'chars');
const hasFbApp = html.includes('firebase-app-compat');
const hasModuleScript = html.includes('type="module"');
const hasCssLink = html.includes('src/styles.css');
console.log('Firebase CDN:', hasFbApp, '| Module script:', hasModuleScript, '| CSS link:', hasCssLink);
