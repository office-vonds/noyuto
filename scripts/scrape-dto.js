const { chromium } = require('playwright');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE = 'https://admin.dto.jp';
const SHOP_ID = '21720';
const INPUT_DIR = path.join(__dirname, 'input');

const CASTS = [
  { id: '5297311', name: 'きみ' },
  { id: '5296926', name: 'けい' },
  { id: '5296921', name: 'あんな' },
  { id: '5109961', name: 'のの' },
  { id: '5079003', name: 'まき' },
  { id: '4199302', name: 'まどか' },
  { id: '2272539', name: 'みき' },
  { id: '3538242', name: 'ひいら' },
  { id: '5041113', name: 'なおみ' },
  { id: '4138474', name: 'けいか' },
];

const MIN_SIZE = 10 * 1024; // 10KB threshold

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length < MIN_SIZE) {
          return resolve(null); // thumbnail, skip
        }
        fs.writeFileSync(destPath, buf);
        resolve(buf.length);
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

function urlHash(url) {
  // Use the hash/filename part of the URL for dedup
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return filename.replace(/\.[^.]+$/, ''); // e.g. "95ff3a345c24665008141bf4d4e40d84"
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // === Login ===
  console.log('Logging in...');
  await page.goto(`${BASE}/a/auth/input?key=000874b3ba76b36a7c5308288e6501e5`, { waitUntil: 'domcontentloaded' });
  await page.fill('#login_id', 'kisaki-no1@au.com');
  await page.fill('input[name="password"]', 'kisaki0902');
  await page.click('#login_button');
  await page.waitForURL(/shop-admin/, { timeout: 30000 });
  console.log('Logged in successfully.');

  const results = {};

  for (const cast of CASTS) {
    const castDir = path.join(INPUT_DIR, cast.name);
    if (!fs.existsSync(castDir)) fs.mkdirSync(castDir, { recursive: true });

    const imageUrls = [];
    const seenHashes = new Set();

    // Track already downloaded hashes from existing files (skip re-download on re-run)
    const existing = fs.readdirSync(castDir).filter(f => f.startsWith('dto_'));
    let counter = existing.length + 1;

    console.log(`\n--- ${cast.name} (ID: ${cast.id}) ---`);

    // === Edit/Profile page (has multiple profile photos) ===
    try {
      const editUrl = `${BASE}/shop-admin/${SHOP_ID}/gal/up-input?id=${cast.id}`;
      await page.goto(editUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(1000);

      const html = await page.content();
      const matches = html.match(/https?:\/\/img\.dto\.jp[^"'\s)]+/g) || [];
      const unique = [...new Set(matches)];
      console.log(`  Profile/Edit: found ${unique.length} image URLs`);
      for (const u of unique) {
        const h = urlHash(u);
        if (!seenHashes.has(h)) {
          seenHashes.add(h);
          imageUrls.push(u);
        }
      }
    } catch (e) {
      console.log(`  Edit page error: ${e.message}`);
    }

    // === Diary pages (up to 3 pages) ===
    for (let pg = 1; pg <= 3; pg++) {
      try {
        const diaryUrl = `${BASE}/shop-admin/${SHOP_ID}/diary/list?gal_id=${cast.id}&page=${pg}`;
        await page.goto(diaryUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(1000);

        const html = await page.content();
        const matches = html.match(/https?:\/\/img\.dto\.jp[^"'\s)]+/g) || [];
        const unique = [...new Set(matches)];
        console.log(`  Diary page ${pg}: found ${unique.length} image URLs`);

        let added = 0;
        for (const u of unique) {
          const h = urlHash(u);
          if (!seenHashes.has(h)) {
            seenHashes.add(h);
            imageUrls.push(u);
            added++;
          }
        }

        // If no new images found, stop pagination
        if (unique.length === 0) break;
      } catch (e) {
        console.log(`  Diary page ${pg} error: ${e.message}`);
        break;
      }
    }

    // === Download ===
    let downloaded = 0;
    let skippedSmall = 0;

    for (const url of imageUrls) {
      const ext = url.match(/\.(jpe?g|png|gif|webp)/i)?.[1] || 'jpg';
      const fname = `dto_${String(counter).padStart(2, '0')}.${ext}`;
      const dest = path.join(castDir, fname);

      try {
        const size = await downloadFile(url, dest);
        if (size === null) {
          skippedSmall++;
        } else {
          downloaded++;
          counter++;
        }
      } catch (e) {
        console.log(`  DL error: ${e.message}`);
      }
    }

    const totalFiles = fs.readdirSync(castDir).filter(f => f.startsWith('dto_')).length;
    console.log(`  Result: ${downloaded} new (${skippedSmall} skipped < 10KB) / ${totalFiles} total files`);
    results[cast.name] = { downloaded, skippedSmall, totalFiles };
  }

  await browser.close();

  // === Summary ===
  console.log('\n========== SUMMARY ==========');
  let grandTotal = 0;
  for (const cast of CASTS) {
    const r = results[cast.name];
    console.log(`${cast.name}: ${r.downloaded} new / ${r.totalFiles} total`);
    grandTotal += r.totalFiles;
  }
  console.log(`\nGrand Total: ${grandTotal} images`);
})();
