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
    
    // Get the FULL HTML of the bid section
    const bidSectionHTML = await page.evaluate(() => {
      // Find the bid section
      const allElements = document.querySelectorAll('*');
      let bidHTML = '';
      for (const el of allElements) {
        const text = el.textContent || '';
        if ((text.includes('STARTING BID') || text.includes('CURRENT BID') || text.includes('HIGH BID')) && 
            el.children.length < 5 && text.length < 500) {
          bidHTML += 'TAG:' + el.tagName + ' ID:' + el.id + ' CLASS:' + el.className + '\n';
          bidHTML += 'PARENT_HTML:' + (el.parentElement ? el.parentElement.outerHTML.substring(0, 800) : '') + '\n---\n';
        }
      }
      return bidHTML;
    });
    
    console.log('BID_SECTION:' + bidSectionHTML.substring(0, 5000));
    
    // Also get the area around the bid form
    const bidFormArea = await page.evaluate(() => {
      const form = document.querySelector('form[action*="bid"], form[name*="bid"], #bidForm, .bid-form');
      if (form) return form.outerHTML.substring(0, 2000);
      // Try to get the main content div
      const content = document.querySelector('#main-content, .main-content, #content, .item-detail, .equip-detail');
      return content ? content.outerHTML.substring(0, 3000) : 'NOT FOUND';
    });
    console.log('BID_FORM:' + bidFormArea.substring(0, 3000));
    
  } catch(e) {
    console.log('ERROR:' + e.message);
  }
  
  await browser.close();
})();
