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
    // Navigate to login page
    console.log('Navigating to login...');
    await page.goto('https://www.ironplanet.com/jsp/acct/login-form.jsp', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    await page.waitForSelector('#emailfield', { timeout: 10000 });
    
    // Fill in login form
    await page.type('#emailfield', 'tomczak24brandon@gmail.com');
    await page.type('[name="!password"]', 'Gordon2448@@@');
    
    // Submit the form directly
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
      page.evaluate(() => document.forms['f'].submit())
    ]);
    
    console.log('After login URL:' + page.url());
    const loginContent = await page.content();
    const loggedIn = loginContent.includes('loggedIn') || loginContent.includes('BRANDON') || loginContent.includes('usr_id');
    console.log('Logged in:' + loggedIn);
    
    // Now navigate to the item
    console.log('Navigating to item...');
    await page.goto('https://www.ironplanet.com/jsp/s/item/15467937', { waitUntil: 'networkidle2', timeout: 30000 });
    
    await new Promise(r => setTimeout(r, 3000)); // Wait for JS rendering
    
    const title = await page.title();
    const url = page.url();
    console.log('ITEM_TITLE:' + title);
    console.log('ITEM_URL:' + url);
    
    // Get bid info
    const bodyText = await page.evaluate(() => {
      return document.body.innerText;
    });
    
    // Look for price patterns
    const priceMatches = bodyText.match(/\$[\d,]+/g);
    console.log('PRICES_FOUND:' + JSON.stringify(priceMatches));
    
    // Output first 3000 chars
    console.log('BODY:' + bodyText.substring(0, 3000));
    
  } catch(e) {
    console.log('ERROR:' + e.message);
    console.log('STACK:' + e.stack);
  }
  
  await browser.close();
})();
