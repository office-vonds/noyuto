const puppeteer = require('puppeteer');

(async () => {
  const inputPath = '/home/ozawakiryu0902/projects/vonds/proposal/stretchzero-photo-seo.html';
  const outputPath = '/home/ozawakiryu0902/projects/vonds/proposal/stretchzero-photo-seo.pdf';

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.goto('file://' + inputPath, { waitUntil: 'networkidle0', timeout: 60000 });

  await page.pdf({
    path: outputPath,
    width: '1123px',
    height: '794px',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
    preferCSSPageSize: false,
  });

  await browser.close();
  console.log('PDF生成完了: ' + outputPath);
})();
