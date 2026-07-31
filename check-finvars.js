const fs = require('fs');
const html = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life-index.html', 'utf8');
console.log('_finAccounts declared:', html.includes('var _finAccounts'));
console.log('CREDS.pass:', html.match(/pass: '([^']+)'/)?.[1]);
console.log('doLogin check:', html.includes("if (user === CREDS.user.toLowerCase() && pass === CREDS.pass) {"));
