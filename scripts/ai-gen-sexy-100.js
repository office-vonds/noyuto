#!/usr/bin/env node
/**
 * AI画像生成 100枚（SEXY・顔なし特化）
 * Pollinations.ai FLUX / 無料・キー不要
 * レート制限回避: 20秒間隔 + 失敗時60秒待機リトライ
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'ai-generated-sexy');
fs.mkdirSync(OUT_DIR, { recursive: true });

// 20テーマ × 5バリエーション = 100枚
const THEMES = [
  // ── ランジェリー系 ──
  { base: 'realistic photo, japanese woman body from chin down, face not in frame, wearing black sheer lace bodysuit, kneeling on bed, dim warm lighting, sensual pose, arched back', tag: 'bodysuit_black' },
  { base: 'realistic photo, japanese woman torso neck to thigh, no face, white see-through babydoll lingerie, lying on silk sheets, soft romantic candlelight, seductive', tag: 'babydoll_white' },
  { base: 'realistic photo, japanese woman body chin to knee, face above frame, red lace bra and panty set, sitting on edge of bed, legs slightly apart, hotel room, moody lighting', tag: 'red_lingerie' },
  { base: 'realistic photo, japanese woman body neck down, no face visible, black garter belt and stockings, standing by window, backlit silhouette, sexy confident pose', tag: 'garter_silhouette' },
  { base: 'realistic photo, japanese woman body from collarbone down, face cropped, purple satin slip dress riding up thigh, lying sideways on couch, intimate warm light', tag: 'satin_purple' },

  // ── ストッキング・脚線美 ──
  { base: 'realistic photo, japanese woman legs and lower body only, black thigh-high stockings with lace tops, short skirt hiked up, sitting on chair, crossed legs, seductive angle, no face', tag: 'stockings_black' },
  { base: 'realistic photo, japanese woman long legs in white fishnet stockings, lying on bed, high angle shot looking down body, mini skirt, sensual, no face visible', tag: 'fishnet_white' },
  { base: 'realistic photo, japanese woman legs from hip to toe, wearing only oversized shirt unbuttoned, bare legs, sitting on floor, bedroom, soft morning light, no face', tag: 'shirt_legs' },

  // ── 背中・肩 ──
  { base: 'realistic photo, japanese woman bare back and shoulders from behind, bra unhooked hanging loose, sitting on bed edge, warm golden light, sensual artistic, face not visible', tag: 'bare_back' },
  { base: 'realistic photo, japanese woman from behind, wearing thong and nothing else, looking over shoulder but face in shadow, bedroom mirror, dim ambient light, tasteful sexy', tag: 'back_thong' },

  // ── ウェット・バスルーム ──
  { base: 'realistic photo, japanese woman body neck to waist, face not in frame, wet skin glistening, wrapped loosely in thin white towel slipping off shoulder, steam, bathroom, warm light', tag: 'wet_towel' },
  { base: 'realistic photo, japanese woman shoulders and chest, face above frame cropped, wet hair on skin, bath foam bubbles partially covering, sensual relaxed, soft focus warm', tag: 'bath_foam' },

  // ── ベッドシーン ──
  { base: 'realistic photo, japanese woman lying face down on bed, body from shoulders to hip, wearing only lace panty, white sheets tangled around legs, morning light, intimate sensual, no face', tag: 'facedown_bed' },
  { base: 'realistic photo, japanese woman body lying on back, neck to thigh, face not visible above frame, wearing sheer black camisole, one hand on stomach, messy sheets, warm dim light', tag: 'lying_camisole' },
  { base: 'realistic photo, japanese woman curled up in bed, body from neck down, wearing oversized sweater pulled up showing waist and hip, cozy sensual, soft warm light, no face', tag: 'sweater_curl' },

  // ── セクシーポーズ ──
  { base: 'realistic photo, japanese woman on all fours on bed, body from neck down, wearing black lace teddy, arched back, sensual pose from side angle, dim warm lighting, no face visible', tag: 'allfours_teddy' },
  { base: 'realistic photo, japanese woman sitting with knees up, body chin to feet, wearing white tank top and panty, hugging knees, bedroom floor, natural light, intimate vulnerable sexy, no face', tag: 'knees_up' },
  { base: 'realistic photo, japanese woman stretching on bed, arms above head body visible from chin down, wearing crop top and boyshorts, morning sun, yawning sensual, no face in frame', tag: 'stretch_morning' },

  // ── ミラー・セルフィー風 ──
  { base: 'realistic photo, japanese woman mirror selfie body from chin down, wearing matching black lace bra panty set, phone covering face, full body mirror, bedroom, warm ambient light', tag: 'mirror_selfie' },
  { base: 'realistic photo, japanese woman hotel bathroom mirror, body from neck down, wearing only white bathrobe open showing cleavage and legs, steam on mirror, seductive, no face', tag: 'robe_mirror' },
];

const VARIATIONS = [
  { suffix: 'v1', extra: ', shot on iPhone, natural grain' },
  { suffix: 'v2', extra: ', professional photography, bokeh background' },
  { suffix: 'v3', extra: ', warm color grading, golden hour tone' },
  { suffix: 'v4', extra: ', high contrast, dramatic shadows' },
  { suffix: 'v5', extra: ', soft pastel tones, dreamy atmosphere' },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const follow = (url, n = 0) => {
      if (n > 5) return reject(new Error('Too many redirects'));
      https.get(url, { timeout: 120000 }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) return follow(res.headers.location, n + 1);
        if (res.statusCode === 429) return reject(new Error('RATE_LIMIT'));
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          if (buf.length < 5000) return reject(new Error('Too small'));
          fs.writeFileSync(dest, buf);
          resolve(buf.length);
        });
      }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
    };
    follow(url);
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const total = THEMES.length * VARIATIONS.length;
  console.log(`=== AI画像生成 ${total}枚 ===\n`);

  let generated = 0;
  let failed = 0;
  let rateLimitHits = 0;

  for (let t = 0; t < THEMES.length; t++) {
    const theme = THEMES[t];
    for (let v = 0; v < VARIATIONS.length; v++) {
      const variation = VARIATIONS[v];
      const filename = `${theme.tag}_${variation.suffix}.jpg`;
      const dest = path.join(OUT_DIR, filename);

      // 既に生成済みならスキップ
      if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
        generated++;
        continue;
      }

      const prompt = encodeURIComponent(theme.base + variation.extra);
      const seed = 2000 + t * 100 + v;
      const url = `https://image.pollinations.ai/prompt/${prompt}?width=640&height=960&seed=${seed}&model=flux&nologo=true`;

      const idx = t * VARIATIONS.length + v + 1;
      process.stdout.write(`[${idx}/${total}] ${filename}... `);

      let retries = 0;
      let success = false;
      while (retries < 3 && !success) {
        try {
          const size = await download(url, dest);
          console.log(`✓ (${(size / 1024).toFixed(0)}KB)`);
          generated++;
          success = true;
        } catch (e) {
          if (e.message === 'RATE_LIMIT') {
            rateLimitHits++;
            retries++;
            const wait = 60 * retries;
            console.log(`429 → ${wait}秒待機 (retry ${retries}/3)`);
            await sleep(wait * 1000);
          } else if (e.message === 'Timeout') {
            retries++;
            console.log(`timeout → 30秒待機 (retry ${retries}/3)`);
            await sleep(30000);
          } else {
            console.log(`✗ ${e.message}`);
            failed++;
            break;
          }
        }
      }
      if (!success && retries >= 3) {
        console.log(`✗ 3回失敗 スキップ`);
        failed++;
      }

      // 通常の間隔
      await sleep(20000);
    }
  }

  console.log(`\n=== 結果 ===`);
  console.log(`生成: ${generated}枚 / 失敗: ${failed}枚 / レート制限: ${rateLimitHits}回`);
  console.log(`出力: ${OUT_DIR}`);

  // Pillow後処理（顔トリミング）を呼び出し
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.jpg') && !f.includes('_cropped'));
  console.log(`\n全${files.length}枚を顔トリミング処理...`);
}

main();
