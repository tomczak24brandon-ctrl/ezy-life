const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
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
    
    await page.goto('https://www.ironplanet.com/jsp/s/item/15467937', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000));
    
    // Get detailed bid information
    const bidInfo = await page.evaluate(() => {
      const result = {};
      
      // Look for current bid elements
      const allText = document.body.innerHTML;
      
      // Try various selectors for current bid
      const bidSelectors = [
        '.bid-amount', '.current-bid', '#current-bid', '[class*="currentBid"]',
        '[id*="currentBid"]', '[class*="current_bid"]', '[id*="current_bid"]',
        '.high-bid', '#highBid', '[class*="highBid"]',
        'td:contains("Current Bid")', 'td:contains("High Bid")'
      ];
      
      // Get all text containing dollar amounts
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const texts = [];
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (text && (text.includes('$') || text.toLowerCase().includes('bid') || text.toLowerCase().includes('current'))) {
          const parent = node.parentElement;
          texts.push({
            text: text,
            tag: parent.tagName,
            id: parent.id,
            className: parent.className.substring(0, 50)
          });
        }
      }
      
      result.bidTexts = texts.slice(0, 40);
      
      // Also try specific known IronPlanet elements
      const ipBidEl = document.querySelector('#ipBidAmt, #bidAmt, .bidAmt, [name="bidAmt"]');
      result.ipBidEl = ipBidEl ? ipBidEl.textContent : null;
      
      // Get all input values
      const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="hidden"]')).map(el => ({
        name: el.name, value: el.value, id: el.id
      })).filter(el => el.name && el.value && parseFloat(el.value) > 100);
      result.inputs = inputs;
      
      return result;
    });
    
    console.log('BID_INFO:' + JSON.stringify(bidInfo, null, 2));
    
  } catch(e) {
    console.log('ERROR:' + e.message);
  }
  
  await browser.close();
})();
