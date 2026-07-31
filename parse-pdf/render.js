const fs = require('fs');
const path = require('path');

// Find pdfjs-dist entry
const pkgPath = path.join(__dirname, 'node_modules', 'pdfjs-dist', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
console.log('pdfjs main:', pkg.main);
console.log('pdfjs exports keys:', Object.keys(pkg.exports || {}).slice(0, 10));

// List files in pdfjs-dist build directory
const buildDir = path.join(__dirname, 'node_modules', 'pdfjs-dist');
const files = fs.readdirSync(buildDir);
console.log('Top-level files/dirs:', files);
