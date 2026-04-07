const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const inputPath = '/mnt/c/Users/ozawa/OneDrive/デスクトップ/shop-preview.html';
  const outputPath = '/mnt/c/Users/ozawa/OneDrive/デスクトップ/ストレッチゼロ_店舗一覧改修案.pdf';

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.goto('file://' + inputPath, { waitUntil: 'networkidle0', timeout: 30000 });

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '16mm', bottom: '16mm', left: '12mm', right: '12mm' },
    displayHeaderFooter: false,
  });

  await browser.close();
  console.log('PDF生成完了: ' + outputPath);
})();
