import { fromPath } from 'pdf2pic';

const convert = fromPath('C:\\Users\\BIG D\\.openclaw\\media\\inbound\\trading_journa---e78356c0-fe0a-4640-ae45-b27a36e75eef.pdf', {
  density: 150,
  saveFilename: 'journal_page',
  savePath: 'C:\\Users\\BIG D\\.openclaw\\workspace\\parse-pdf',
  format: 'png',
  width: 1600,
  height: 900
});

try {
  const result = await convert(1, { responseType: 'image' });
  console.log('Saved:', result);
} catch(e) {
  console.error('Error:', e.message);
}
