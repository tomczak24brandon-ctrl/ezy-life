import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFileSync } from 'fs';

const pdfPath = 'C:\\Users\\BIG D\\.openclaw\\media\\inbound\\trading_journa---e78356c0-fe0a-4640-ae45-b27a36e75eef.pdf';
const data = new Uint8Array(readFileSync(pdfPath));

const doc = await getDocument({ data, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
console.log('Pages:', doc.numPages);

for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const content = await page.getTextContent();
  console.log(`\n--- Page ${i} (${content.items.length} items) ---`);
  
  // Group by approximate y position to reconstruct rows
  const rows = {};
  content.items.forEach(item => {
    if (!item.str || !item.str.trim()) return;
    const y = Math.round(item.transform[5] / 5) * 5; // round to nearest 5
    if (!rows[y]) rows[y] = [];
    rows[y].push({ x: item.transform[4], str: item.str });
  });
  
  // Sort by y descending (PDF coords go bottom-up)
  const sortedY = Object.keys(rows).sort((a, b) => b - a);
  sortedY.forEach(y => {
    const cols = rows[y].sort((a, b) => a.x - b.x);
    console.log(cols.map(c => c.str).join(' | '));
  });
}
