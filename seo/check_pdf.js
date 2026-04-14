const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Open the PDF itself and take page screenshots
  const page = await browser.newPage();
  const pdfPath = 'file://' + path.resolve(__dirname, 'a-truck-proposal.pdf');

  // Instead, re-render the HTML in A4 landscape viewport and take screenshots
  const htmlPath = 'file://' + path.resolve(__dirname, 'a-truck-proposal.html');
  // A4 landscape at 96dpi = 1123 x 794px
  await page.setViewport({width: 1123, height: 794});
  await page.goto(htmlPath, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.emulateMediaType('print');
  await new Promise(r => setTimeout(r, 300));

  const slides = await page.$$('.slide');
  console.log('Total slides:', slides.length);

  // Check all slide dimensions
  for (let i = 0; i < slides.length; i++) {
    const box = await slides[i].boundingBox();
    if (box) {
      const h = Math.round(box.height);
      const fits = h <= 794 ? 'OK' : 'OVERFLOW';
      console.log('Slide ' + (i+1) + ': ' + Math.round(box.width) + 'x' + h + ' [' + fits + ']');
    }
  }

  // Screenshot key slides
  for (const idx of [0, 4, 6, 9, 16, 17]) {
    if (slides[idx]) {
      await slides[idx].screenshot({path: '/tmp/final_slide' + (idx+1) + '.png'});
    }
  }

  console.log('Screenshots saved');
  await browser.close();
})();
