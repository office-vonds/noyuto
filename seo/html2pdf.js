const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const htmlPath = path.resolve(__dirname, 'a-truck-proposal.html');
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0', timeout: 30000 });

  await page.pdf({
    path: path.resolve(__dirname, 'a-truck-proposal.pdf'),
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
    preferCSSPageSize: false
  });

  console.log('PDF generated: seo/a-truck-proposal.pdf');
  await browser.close();
})();
