const pdf = require('pdf-parse');
const fs = require('fs');
const buf = fs.readFileSync('C:\\Users\\BIG D\\.openclaw\\media\\inbound\\trading_journa---e78356c0-fe0a-4640-ae45-b27a36e75eef.pdf');
pdf(buf).then(d => {
  console.log('Pages:', d.numpages);
  console.log('Text length:', d.text.length);
  console.log('Text:', JSON.stringify(d.text.substring(0, 2000)));
  console.log('Info:', JSON.stringify(d.info));
}).catch(e => {
  console.error('Error:', e.message);
  console.error(e.stack);
});
