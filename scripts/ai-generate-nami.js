#!/usr/bin/env node
/**
 * なみ専用 AI画像生成（リアリティ追求版）
 *
 * 方針:
 *   - 豪華/ホテル/プロ撮影を脱し、生活感のある素人自撮りに寄せる
 *   - 体型/髪/年齢/シチュ/露出レベルを軸に多変量でバリエーション
 *   - Pollinations.ai (flux) 使用・GPU不要・無料
 *   - なみの顔一貫性はシード固定+顔特徴プロンプト固定で擬似再現
 *
 * 使い方:
 *   node ai-generate-nami.js                  # preview: 3枚だけ生成
 *   node ai-generate-nami.js --batch 20       # バッチ: 20枚
 *   node ai-generate-nami.js --all            # 全組合せ生成（要注意: 大量）
 *   node ai-generate-nami.js --level 3        # 露出レベル指定 (1|2|3)
 *   node ai-generate-nami.js --out /tmp/test  # 出力先指定
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

// ── 引数パース ──
const argv = process.argv.slice(2);
const getArg = (flag, def) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : def;
};
const MODE_BATCH = argv.includes('--batch');
const MODE_ALL = argv.includes('--all');
const BATCH_N = parseInt(getArg('--batch', '3'), 10);
const LEVEL_FILTER = getArg('--level', null);
const OUT_DIR = getArg('--out', path.join(__dirname, 'ai-generated', 'nami'));

fs.mkdirSync(OUT_DIR, { recursive: true });

// ── なみ固定パラメータ ──
// NOTE: シードは DTO管理画面の なみID を基点にオフセットで派生
const NAMI_BASE_SEED = 5219440;

// 顔特徴（毎回同じ文字列を埋める = 擬似的な同一人物化）
const NAMI_FACE =
  'japanese woman, round face, small nose, full lips, double eyelid, soft cheeks, mid 20s';

// ── バリエーション軸 ──
const BODY_TYPES = [
  'slim slender body',
  'petite small frame',
  'curvy figure with soft waist',
  'athletic toned body',
  'average natural body',
];

const HAIR_STYLES = [
  'long straight black hair',
  'dark brown wavy shoulder length hair',
  'ash brown layered medium hair',
  'black bob cut messy',
];

const AGE_VIBES = [
  'early 20s fresh look',
  'mid 20s mature charm',
  'late 20s confident mood',
];

// シチュエーション（リアリティ重視: 生活感・日常・素人感）
const SCENES = [
  {
    name: 'home_bed',
    desc: 'lying on messy unmade bed in small japanese apartment, laundry basket visible in background, warm tungsten ceiling light, iphone front camera selfie angle',
  },
  {
    name: 'unit_bath',
    desc: 'sitting on the edge of a small japanese unit bathtub, plastic shower stool visible, fluorescent bathroom light, steam on mirror, casual phone selfie',
  },
  {
    name: 'mirror_selfie',
    desc: 'standing in front of bedroom full length mirror, holding iphone, cluttered desk behind with cosmetics and tissue box, warm soft light',
  },
  {
    name: 'kitchen_midnight',
    desc: 'leaning on small japanese kitchen counter at midnight, convenience store bag on counter, fluorescent light overhead, tired candid moment',
  },
  {
    name: 'love_hotel_plain',
    desc: 'sitting on a plain japanese business hotel bed with floral bedsheet, old TV visible, dim tungsten lamp, phone self timer shot',
  },
  {
    name: 'morning_futon',
    desc: 'wrapped in futon on tatami floor, morning sunlight through sheer curtain, messy hair just woke up, candid phone selfie',
  },
  {
    name: 'dressing_table',
    desc: 'sitting at small dressing table doing makeup, mirror with tape borders, cotton pads scattered, warm bedroom light',
  },
  {
    name: 'after_shower',
    desc: 'bath towel wrapped around body, droplets on skin, standing in narrow japanese bathroom hallway, warm humid mood, phone selfie angle',
  },
  {
    name: 'laundry_room',
    desc: 'leaning on washing machine, laundry detergent visible, cheap apartment bathroom lighting, candid everyday moment',
  },
  {
    name: 'window_night',
    desc: 'sitting on windowsill of high rise apartment at night, city lights outside, dim room light, romantic candid phone photo',
  },
];

// 露出レベル（衣装指定）
const OUTFITS_BY_LEVEL = {
  1: [
    'wearing oversized white t-shirt and cotton panties',
    'wearing simple beige lace bra and matching panties',
    'wearing loose grey sweatshirt off one shoulder and shorts',
    'wearing thin white camisole and boy shorts',
  ],
  2: [
    'wearing sheer white slip nightdress, fabric slightly see through',
    'wearing only a white bath towel wrapped loosely around chest',
    'wearing oversized mens button shirt half unbuttoned, no pants',
    'wearing thin wet t-shirt clinging to skin after shower, no bra visible through fabric',
  ],
  3: [
    'topless with arms covering chest, only wearing cotton panties, face cropped out of frame',
    'topless sitting with back to camera, looking over shoulder, face not visible',
    'wrapped in white bedsheet covering chest, bare shoulders and legs visible, face cropped',
    'topless with long hair covering chest, wearing only stockings, face out of frame',
  ],
};

// リアリティ強化の固定フレーズ
const REALISM_SUFFIX =
  'amateur iphone selfie photo, candid unstaged, slight camera shake, visible skin pores and texture, no professional retouching, no studio lighting, no model pose, natural imperfect composition, realistic grainy smartphone quality';

// AIっぽさ除去（Pollinations/fluxは negative 正式対応しないので positive 側で NOT 句）
const ANTI_AI =
  'not cgi, not 3d render, not anime, not perfect plastic skin, not airbrushed, not cinematic, not editorial, not glossy fashion magazine';

// ── プロンプト組立 ──
function buildPrompt({ body, hair, age, scene, outfit }) {
  return [
    NAMI_FACE,
    body,
    hair,
    age,
    outfit,
    scene.desc,
    REALISM_SUFFIX,
    ANTI_AI,
  ].join(', ');
}

// ── 全組合せ生成 ──
function buildAllJobs() {
  const jobs = [];
  const levels = LEVEL_FILTER ? [parseInt(LEVEL_FILTER, 10)] : [1, 2, 3];
  let seedOffset = 0;
  for (const lv of levels) {
    const outfits = OUTFITS_BY_LEVEL[lv];
    for (const scene of SCENES) {
      for (const outfit of outfits) {
        for (const body of BODY_TYPES) {
          for (const hair of HAIR_STYLES) {
            for (const age of AGE_VIBES) {
              jobs.push({
                lv,
                name: `nami_lv${lv}_${scene.name}_${body.split(' ')[0]}_${hair.split(' ')[0]}_${seedOffset}`,
                prompt: buildPrompt({ body, hair, age, scene, outfit }),
                seed: NAMI_BASE_SEED + seedOffset,
              });
              seedOffset += 1;
            }
          }
        }
      }
    }
  }
  return jobs;
}

// ── ダウンロード ──
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const follow = (u, r = 0) => {
      if (r > 5) return reject(new Error('Too many redirects'));
      https
        .get(u, { timeout: 90000 }, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            return follow(res.headers.location, r + 1);
          }
          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode}`));
          }
          const file = fs.createWriteStream(dest);
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
          file.on('error', reject);
        })
        .on('error', reject)
        .on('timeout', () => reject(new Error('Timeout')));
    };
    follow(url);
  });
}

// ── メイン ──
async function main() {
  const allJobs = buildAllJobs();
  let jobs;
  if (MODE_ALL) {
    jobs = allJobs;
  } else if (MODE_BATCH) {
    jobs = allJobs.sort(() => Math.random() - 0.5).slice(0, BATCH_N);
  } else {
    // preview: レベル別1枚ずつ = 最大3枚
    const levels = LEVEL_FILTER ? [parseInt(LEVEL_FILTER, 10)] : [1, 2, 3];
    jobs = levels.map((lv) => allJobs.find((j) => j.lv === lv)).filter(Boolean);
  }

  console.log(`=== なみ AI生成 (${jobs.length}枚) 出力先: ${OUT_DIR} ===\n`);

  let ok = 0;
  for (let i = 0; i < jobs.length; i++) {
    const j = jobs[i];
    const dest = path.join(OUT_DIR, `${j.name}.jpg`);
    console.log(`[${i + 1}/${jobs.length}] ${j.name}`);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      j.prompt,
    )}?width=640&height=960&seed=${j.seed}&model=flux&nologo=true&enhance=false`;
    try {
      await downloadImage(url, dest);
      const size = fs.statSync(dest).size;
      if (size > 10000) {
        console.log(`  ✓ ${(size / 1024).toFixed(0)}KB`);
        ok += 1;
      } else {
        console.log(`  ✗ サイズ不足 (${size}B) 削除`);
        fs.unlinkSync(dest);
      }
    } catch (e) {
      console.log(`  ✗ ${e.message}`);
    }
    if (i < jobs.length - 1) {
      await new Promise((r) => setTimeout(r, 15000));
    }
  }

  console.log(`\n=== 完了: ${ok}/${jobs.length} ===`);
}

main();
