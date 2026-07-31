const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ignoreHTTPSErrors: true
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
  
  try {
    await page.goto('https://www.ironplanet.com/jsp/acct/login-form.jsp', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#emailfield', { timeout: 10000 });
    await page.type('#emailfield', 'tomczak24brandon@gmail.com');
    await page.type('[name="!password"]', 'Gordon2448@@@');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
      page.evaluate(() => document.forms['f'].submit())
    ]);
    
    await page.goto('https://www.ironplanet.com/jsp/s/item/15467937', { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise(r => setTimeout(r, 8000));
    
    // Take screenshot
    await page.screenshot({ path: 'C:\\Users\\BIG D\\.openclaw\\workspace\\ip_screenshot.png', fullPage: false });
    console.log('Screenshot taken');
    
    // Get full page body text including generated content
    const fullText = await page.evaluate(() => document.body.innerText);
    console.log('FULL_TEXT:' + fullText.substring(0, 5000));
    
  } catch(e) {
    console.log('ERROR:' + e.message);
  }
  
  await browser.close();
})();
