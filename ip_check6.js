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
  
  // Track ALL XHR/fetch requests
  const allRequests = [];
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    allRequests.push({ url: req.url(), method: req.method(), type: req.resourceType() });
    req.continue();
  });
  
  const allResponses = [];
  page.on('response', async (resp) => {
    const url = resp.url();
    const ct = resp.headers()['content-type'] || '';
    if (!url.includes('.png') && !url.includes('.jpg') && !url.includes('.gif') && !url.includes('.css') && !url.includes('.woff') && !url.includes('.ico')) {
      try {
        const text = await resp.text();
        if (text.includes('bid') || text.includes('3250') || text.includes('price')) {
          allResponses.push({ url: url.substring(0, 150), snippet: text.substring(0, 300) });
        }
      } catch(e) {}
    }
  });
  
  try {
    await page.goto('https://www.ironplanet.com/jsp/acct/login-form.jsp', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForSelector('#emailfield', { timeout: 8000 });
    await page.type('#emailfield', 'tomczak24brandon@gmail.com');
    await page.type('[name="!password"]', 'Gordon2448@@@');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }),
      page.evaluate(() => document.forms['f'].submit())
    ]);
    
    // Navigate to item with full wait
    const response = await page.goto('https://www.ironplanet.com/jsp/s/item/15467937', { waitUntil: 'networkidle2', timeout: 40000 });
    await new Promise(r => setTimeout(r, 6000));
    
    // Check for CAPTCHA
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log('PAGE_TITLE:' + pageTitle);
    console.log('PAGE_URL:' + pageUrl);
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (bodyText.includes('confirm you are human')) {
      console.log('CAPTCHA_HIT: yes');
    } else {
      console.log('CAPTCHA_HIT: no');
      
      // Find bid data
      const bidData = await page.evaluate(() => {
        const r = {};
        // Look for specific text patterns around bid amounts
        const allText = document.body.innerText;
        // Find lines with bid amounts
        const lines = allText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const bidLines = [];
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].match(/bid|price|current|high|amount/i) || lines[i].match(/\$[\d,]+/)) {
            bidLines.push({ line: i, text: lines[i], prev: lines[i-1], next: lines[i+1] });
          }
        }
        r.bidLines = bidLines.slice(0, 30);
        
        // Directly look for the bid widget element
        const bidWidget = document.querySelector('#auctiondata, #bidWidget, #bid-widget, .bid-widget, [data-equip-id]');
        r.bidWidget = bidWidget ? bidWidget.outerHTML.substring(0, 1000) : null;
        
        // Get the sidebar/rightcol where bids usually appear
        const sidebar = document.querySelector('.sidebar, .rightcol, #sidebar, #rightcol, .item-actions, .bid-section');
        r.sidebar = sidebar ? sidebar.outerHTML.substring(0, 1500) : null;
        
        return r;
      });
      
      console.log('BID_LINES:' + JSON.stringify(bidData.bidLines));
      if (bidData.bidWidget) console.log('BID_WIDGET:' + bidData.bidWidget);
      if (bidData.sidebar) console.log('SIDEBAR:' + bidData.sidebar);
    }
    
    console.log('RESPONSES:' + JSON.stringify(allResponses.slice(0, 10)));
    
  } catch(e) {
    console.log('ERROR:' + e.message);
  }
  
  await browser.close();
})();
