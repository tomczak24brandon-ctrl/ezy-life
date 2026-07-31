import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 860 });
await page.goto('http://127.0.0.1:18789/__openclaw__/canvas/trade-journal-preview.html', { waitUntil: 'networkidle0' });
await page.screenshot({ path: 'C:\\Users\\BIG D\\.openclaw\\workspace\\trade-journal-preview.png', fullPage: false });
console.log('Screenshot saved.');
await browser.close();
