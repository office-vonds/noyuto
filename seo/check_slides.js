const puppeteer = require('puppeteer');
const path = require('path');
(async () => {
  const browser = await puppeteer.launch({headless:true,args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('file://' + path.resolve(__dirname, 'a-truck-proposal.html'), {waitUntil:'networkidle0',timeout:30000});
  const slides = await page.$$('.slide');
  console.log('Total slides:', slides.length);
  let overflows = [];
  for (let i = 0; i < slides.length; i++) {
    const box = await slides[i].boundingBox();
    const h = Math.round(box.height);
    const flag = h > 540 ? ' ** OVERFLOW **' : '';
    if (flag) overflows.push(i+1);
    console.log('Slide ' + (i+1) + ' - ' + Math.round(box.width) + 'x' + h + flag);
  }
  if (overflows.length) console.log('\nOverflow slides: ' + overflows.join(', '));
  else console.log('\nAll slides fit within 540px height');
  // Screenshots of key slides
  await slides[4].screenshot({path:'/tmp/slide5_v2.png'});
  await slides[6].screenshot({path:'/tmp/slide7_v2.png'});
  await slides[16].screenshot({path:'/tmp/slide17_v2.png'});
  await slides[17].screenshot({path:'/tmp/slide18_v2.png'});
  console.log('Screenshots saved');
  await browser.close();
})();
