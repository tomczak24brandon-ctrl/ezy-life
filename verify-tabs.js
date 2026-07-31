const fs = require('fs');
const t = fs.readFileSync('C:/Users/BIG D/.openclaw/workspace/ezy-life/index.html', 'utf8');
console.log('?? count:', (t.match(/\?\?/g)||[]).length);
console.log('Sequential prompts:', t.includes("Edit name for ' + labels[i]"));
console.log('No pipe prompt:', !t.includes('separate with |'));
console.log('Cancel-safe:', t.includes('result !== null'));
console.log('Has emoji:', t.includes('\uD83C\uDFAF'));
