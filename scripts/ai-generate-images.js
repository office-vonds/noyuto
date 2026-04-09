#!/usr/bin/env node
/**
 * AI画像生成テスト（無料API: Pollinations.ai）
 * GPU不要・APIキー不要・完全無料
 * 写メ日記用の「顔なしボディ写真」を生成
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'ai-generated');
fs.mkdirSync(OUT_DIR, { recursive: true });

// 写メ日記向けプロンプト（顔なし・リアル写真風）
const PROMPTS = [
  {
    name: 'selfie_lingerie_01',
    prompt: 'close up photo of japanese woman body, cropped from chin down to waist, face not visible, face cropped out of frame, wearing white lace lingerie, sitting on bed, soft warm lighting, realistic smartphone selfie, intimate bedroom',
  },
  {
    name: 'selfie_casual_02',
    prompt: 'close up photo of japanese woman torso from collarbone to hip, face completely out of frame, wearing oversized cream knit sweater, lying on white sheets, soft window light, cozy intimate mood, realistic photo',
  },
  {
    name: 'selfie_dress_03',
    prompt: 'photo of japanese woman body from chin down, face not in frame, wearing tight black mini dress, sitting crossed legs, hotel room, mirror selfie, elegant sexy, realistic photography, moody lighting',
  },
  {
    name: 'selfie_bath_04',
    prompt: 'photo of japanese woman shoulders and chest area only, face completely cropped out, wrapped in white bath towel, after shower, dewy glowing skin, bathroom, realistic photo, steam, warm soft focus',
  },
  {
    name: 'selfie_nightwear_05',
    prompt: 'photo of japanese woman body from neck down only, no face, wearing pink silk camisole, lying on side on white bed, soft warm bedroom lighting, romantic atmosphere, realistic smartphone photo, delicate fabric texture',
  },
  {
    name: 'selfie_back_06',
    prompt: 'photo of japanese woman from behind, bare back and shoulders visible, wearing off-shoulder white blouse, face not visible, bedroom setting, artistic photography, warm golden hour backlight, realistic',
  },
  {
    name: 'selfie_legs_07',
    prompt: 'photo of japanese woman legs and lower body, wearing white thigh-high stockings and short plaid skirt, sitting on couch, feminine elegant, face not in photo, soft natural light, realistic photo',
  },
  {
    name: 'selfie_sweater_08',
    prompt: 'photo of japanese woman body from chin to thigh, face out of frame, wearing loose cream cable knit sweater that slips off one shoulder, cozy bedroom, warm tones, realistic smartphone selfie style',
  },
  {
    name: 'selfie_red_09',
    prompt: 'photo of japanese woman torso and waist, face not visible cropped out, wearing red lace bralette, sitting at vanity mirror, dim warm romantic candlelight, realistic photography, sensual tasteful',
  },
  {
    name: 'selfie_morning_10',
    prompt: 'photo of japanese woman body lying in bed from neck down, face not in photo, wearing white tank top, messy white sheets, morning sunlight through sheer curtains, natural candid realistic photo, warm soft tones',
  },
];

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const follow = (url, redirects = 0) => {
      if (redirects > 5) return reject(new Error('Too many redirects'));
      const mod = url.startsWith('https') ? https : require('http');
      mod.get(url, { timeout: 60000 }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return follow(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
        file.on('error', reject);
      }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
    };
    follow(url);
  });
}

async function generateImages() {
  console.log(`=== AI画像生成テスト (${PROMPTS.length}枚) ===\n`);

  for (let i = 0; i < PROMPTS.length; i++) {
    const p = PROMPTS[i];
    const filename = `${p.name}.jpg`;
    const dest = path.join(OUT_DIR, filename);

    console.log(`[${i + 1}/${PROMPTS.length}] ${p.name}...`);

    // Pollinations.ai - 無料・キー不要
    const encodedPrompt = encodeURIComponent(p.prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=640&height=960&seed=${1000 + i}&model=flux&nologo=true`;

    try {
      await downloadImage(url, dest);
      const size = fs.statSync(dest).size;
      if (size > 10000) {
        console.log(`  ✓ ${filename} (${(size / 1024).toFixed(0)}KB)`);
      } else {
        console.log(`  ✗ ${filename} サイズ不足 (${size}B)`);
        fs.unlinkSync(dest);
      }
    } catch (e) {
      console.log(`  ✗ エラー: ${e.message}`);
    }

    // レート制限回避（15秒待機）
    if (i < PROMPTS.length - 1) {
      console.log('  待機15秒...');
      await new Promise(r => setTimeout(r, 15000));
    }
  }

  // 結果サマリー
  const generated = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.jpg'));
  console.log(`\n=== 結果: ${generated.length}/${PROMPTS.length}枚生成 ===`);
  console.log(`出力先: ${OUT_DIR}`);
  generated.forEach(f => {
    const size = fs.statSync(path.join(OUT_DIR, f)).size;
    console.log(`  ${f} (${(size / 1024).toFixed(0)}KB)`);
  });
}

generateImages();
