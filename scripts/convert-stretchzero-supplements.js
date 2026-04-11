const puppeteer = require('puppeteer');

const jobs = [
  {
    input: '/home/ozawakiryu0902/projects/vonds/proposal/stretchzero-article-sample.html',
    output: '/home/ozawakiryu0902/projects/vonds/proposal/stretchzero-article-sample.pdf',
    width: '1123px', height: '794px', // A4 landscape
  },
  {
    input: '/home/ozawakiryu0902/projects/vonds/proposal/stretchzero-consent-form.html',
    output: '/home/ozawakiryu0902/projects/vonds/proposal/stretchzero-consent-form.pdf',
    width: '794px', height: '1123px', // A4 portrait
  },
  {
    input: '/home/ozawakiryu0902/projects/vonds/proposal/stretchzero-shooting-guide.html',
    output: '/home/ozawakiryu0902/projects/vonds/proposal/stretchzero-shooting-guide.pdf',
    width: '794px', height: '1123px', // A4 portrait
  },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  for (const job of jobs) {
    const page = await browser.newPage();
    await page.goto('file://' + job.input, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.pdf({
      path: job.output,
      width: job.width,
      height: job.height,
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
      preferCSSPageSize: false,
    });
    await page.close();
    console.log('生成完了: ' + job.output);
  }

  await browser.close();
})();
