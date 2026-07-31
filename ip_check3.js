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
  
  // Intercept network requests to find bid API calls
  const apiCalls = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('bid') || url.includes('auction') || url.includes('item') || url.includes('equip') || url.includes('price')) {
      try {
        const text = await response.text();
        if (text.length < 5000 && (text.includes('bid') || text.includes('price') || text.includes('amount'))) {
          apiCalls.push({ url: url, body: text.substring(0, 500) });
        }
      } catch(e) {}
    }
  });
  
  try {
    // Login
    await page.goto('https://www.ironplanet.com/jsp/acct/login-form.jsp', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#emailfield', { timeout: 10000 });
    await page.type('#emailfield', 'tomczak24brandon@gmail.com');
    await page.type('[name="!password"]', 'Gordon2448@@@');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
      page.evaluate(() => document.forms['f'].submit())
    ]);
    
    // Load item page and capture all XHR calls
    await page.goto('https://www.ironplanet.com/jsp/s/item/15467937', { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise(r => setTimeout(r, 8000)); // Wait for all AJAX to finish
    
    console.log('API_CALLS:' + JSON.stringify(apiCalls, null, 2));
    
    // Also extract data variables from JavaScript
    const jsVars = await page.evaluate(() => {
      const vars = {};
      // Look for auctionId, equipId, currentBid variables
      vars.auctionId = typeof auctionId !== 'undefined' ? auctionId : 'undefined';
      vars.equipId = typeof equipId !== 'undefined' ? equipId : 'undefined';
      vars.currentBid = typeof currentBid !== 'undefined' ? currentBid : 'undefined';
      vars.highBid = typeof highBid !== 'undefined' ? highBid : 'undefined';
      vars.bidAmount = typeof bidAmount !== 'undefined' ? bidAmount : 'undefined';
      vars.startingBid = typeof startingBid !== 'undefined' ? startingBid : 'undefined';
      vars.groupId = typeof groupId !== 'undefined' ? groupId : 'undefined';
      return vars;
    });
    console.log('JS_VARS:' + JSON.stringify(jsVars));
    
  } catch(e) {
    console.log('ERROR:' + e.message);
  }
  
  await browser.close();
})();
