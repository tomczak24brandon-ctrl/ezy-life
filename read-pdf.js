// Try multiple PDF parsing approaches
const fs = require('fs');
const path = require('path');

const pdfPath = path.join('C:\\Users\\BIG D\\.openclaw\\media\\inbound\\trading_journa---e78356c0-fe0a-4640-ae45-b27a36e75eef.pdf');

// Check file exists and size
const stat = fs.statSync(pdfPath);
console.log('File size:', stat.size, 'bytes');

// Try to find pdf-related modules globally
const globalModules = [
  'C:/Users/BIG D/AppData/Roaming/npm/node_modules/pdf-parse',
  'C:/Program Files/nodejs/node_modules/pdf-parse',
];

let pdfParse = null;
for (const m of globalModules) {
  try {
    pdfParse = require(m);
    console.log('Found pdf-parse at:', m);
    break;
  } catch(e) {}
}

if (pdfParse) {
  const buf = fs.readFileSync(pdfPath);
  pdfParse(buf).then(d => {
    console.log('=== PDF TEXT ===');
    console.log(d.text);
  }).catch(e => console.log('Parse error:', e.message));
} else {
  console.log('pdf-parse not found globally');
  // Show available global modules
  const dirs = [
    'C:/Users/BIG D/AppData/Roaming/npm/node_modules',
    'C:/Program Files/nodejs/node_modules'
  ];
  dirs.forEach(d => {
    try {
      console.log('Modules in', d, ':', fs.readdirSync(d).join(', '));
    } catch(e) {}
  });
}
