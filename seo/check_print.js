const puppeteer = require('puppeteer');
const path = require('path');
(async () => {
  const browser = await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('file://' + path.resolve(__dirname, 'a-truck-proposal.html'), {waitUntil:'networkidle0',timeout:30000});

  // Emulate print media
  await page.emulateMediaType('print');

  // A4 landscape dimensions in pixels (at 96dpi): 1123 x 794, minus margins
  await page.setViewport({width: 1123, height: 794});

  // Wait for styles to settle
  await new Promise(r => setTimeout(r, 500));

  const slides = await page.$$('.slide');
  console.log('Print mode - Total slides:', slides.length);
  for (let i = 0; i < slides.length; i++) {
    const box = await slides[i].boundingBox();
    if (box) {
      const h = Math.round(box.height);
      const flag = h > 794 ? ' ** OVERFLOW A4 **' : '';
      console.log('Slide ' + (i+1) + ' - ' + Math.round(box.width) + 'x' + h + flag);
    }
  }

  // Take full page screenshot in print mode
  await page.screenshot({path:'/tmp/print_full.png', fullPage: true});
  console.log('Print screenshot saved');
  await browser.close();
})();
