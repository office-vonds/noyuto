#!/usr/bin/env node
/**
 * 全キャスト対応 AI画像生成（本番用）
 *
 * 方針（2026-04-17 NOYUTO指示）:
 *   - サンプル/テスト品質の ai-generated/* は本番投入禁止
 *   - 本スクリプトは scripts/ai-production/[cast]/ に本番品質画像を出力
 *   - Lv1のみ（Pollinations.ai のNSFWフィルタ対応）
 *   - 各キャストに固定seed+face/body/hair/ageで人物一貫性を確保
 *
 * 使い方:
 *   node ai-generate-all-casts.js --cast なみ --count 20
 *   node ai-generate-all-casts.js --all --count 20    # 全15キャスト × 20枚 = 300枚
 *   node ai-generate-all-casts.js --cast きみ --count 5 --out /tmp/preview
 *
 * レート制限:
 *   Pollinations.ai 15秒/枚 → 300枚 ≒ 75分
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

// ── 引数 ──
const argv = process.argv.slice(2);
const getArg = (flag, def) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : def;
};
const CAST_FILTER = getArg('--cast', null);
const MODE_ALL = argv.includes('--all');
const COUNT = parseInt(getArg('--count', '20'), 10);
const OUT_BASE = getArg('--out', path.join(__dirname, 'ai-production'));
const RATE_SEC = parseInt(getArg('--rate', '15'), 10);

// ── キャストprofile（seed = dto galId / 体型・髪・年齢・顔特徴は個別固定）──
const CAST_PROFILES = {
  'きみ':   { seed: 5297311, body: 'slim slender body',            hair: 'long straight black hair',              age: 'early 20s fresh look',       face: 'japanese woman, oval face, small nose, natural pink lips, double eyelid' },
  'けい':   { seed: 5296926, body: 'petite small frame',           hair: 'dark brown wavy shoulder length hair',  age: 'mid 20s mature charm',       face: 'japanese woman, round face, cute eyes, small mouth, soft cheeks' },
  'あんな': { seed: 5296921, body: 'curvy figure with soft waist', hair: 'ash brown layered medium hair',         age: 'late 20s confident mood',    face: 'japanese woman, heart shaped face, full lips, almond eyes, mature' },
  'のの':   { seed: 5109961, body: 'slim slender body',            hair: 'black bob cut messy',                   age: 'early 20s fresh look',       face: 'japanese woman, oval face, large innocent eyes, small nose' },
  'まき':   { seed: 5079003, body: 'athletic toned body',          hair: 'dark brown wavy shoulder length hair',  age: 'mid 20s mature charm',       face: 'japanese woman, sharp jawline, confident eyes, natural lips' },
  'まどか': { seed: 4199302, body: 'average natural body',         hair: 'long straight black hair',              age: 'late 20s confident mood',    face: 'japanese woman, gentle face, soft eyes, warm smile, mature mom vibe' },
  'みき':   { seed: 2272539, body: 'curvy figure with soft waist', hair: 'ash brown layered medium hair',         age: 'late 20s confident mood',    face: 'japanese woman, soft round face, sleepy eyes, full lips' },
  'なおみ': { seed: 5041113, body: 'petite small frame',           hair: 'long straight black hair',              age: 'mid 20s mature charm',       face: 'japanese woman, fair skin, delicate features, narrow eyes' },
  'けいか': { seed: 4138474, body: 'average natural body',         hair: 'black bob cut messy',                   age: 'late 20s confident mood',    face: 'japanese woman, refined face, cool eyes, mature elegance' },
  'なみ':   { seed: 5219440, body: 'curvy figure with soft waist', hair: 'dark brown wavy shoulder length hair',  age: 'mid 20s mature charm',       face: 'japanese woman, round face, small nose, full lips, double eyelid, soft cheeks' },
  'わかな': { seed: 3790402, body: 'slim slender body',            hair: 'ash brown layered medium hair',         age: 'early 20s fresh look',       face: 'japanese woman, small face, bright eyes, cute nose, youthful' },
  'あやせ': { seed: 5214107, body: 'athletic toned body',          hair: 'long straight black hair',              age: 'mid 20s mature charm',       face: 'japanese woman, sharp features, intense eyes, defined lips' },
  'しずか': { seed: 5079007, body: 'petite small frame',           hair: 'dark brown wavy shoulder length hair',  age: 'early 20s fresh look',       face: 'japanese woman, quiet expression, gentle eyes, small lips' },
  'つばき': { seed: 5121129, body: 'curvy figure with soft waist', hair: 'black bob cut messy',                   age: 'mid 20s mature charm',       face: 'japanese woman, round cheeks, playful eyes, full lips' },
  'ゆりか': { seed: 5142399, body: 'average natural body',         hair: 'long straight black hair',              age: 'late 20s confident mood',    face: 'japanese woman, elegant face, calm eyes, natural lips, grown up vibe' },
};

// ── シチュエーション（Lv1リアリティ重視・生活感）──
const SCENES = [
  { name: 'home_bed',         desc: 'lying on messy unmade bed in small japanese apartment, laundry basket visible in background, warm tungsten ceiling light, iphone front camera selfie angle' },
  { name: 'unit_bath',        desc: 'sitting on the edge of a small japanese unit bathtub, plastic shower stool visible, fluorescent bathroom light, steam on mirror, casual phone selfie' },
  { name: 'mirror_selfie',    desc: 'standing in front of bedroom full length mirror, holding iphone, cluttered desk behind with cosmetics and tissue box, warm soft light' },
  { name: 'kitchen_midnight', desc: 'leaning on small japanese kitchen counter at midnight, convenience store bag on counter, fluorescent light overhead, tired candid moment' },
  { name: 'love_hotel_plain', desc: 'sitting on a plain japanese business hotel bed with floral bedsheet, old TV visible, dim tungsten lamp, phone self timer shot' },
  { name: 'morning_futon',    desc: 'wrapped in futon on tatami floor, morning sunlight through sheer curtain, messy hair just woke up, candid phone selfie' },
  { name: 'dressing_table',   desc: 'sitting at small dressing table doing makeup, mirror with tape borders, cotton pads scattered, warm bedroom light' },
  { name: 'after_shower',     desc: 'bath towel wrapped around body, droplets on skin, standing in narrow japanese bathroom hallway, warm humid mood, phone selfie angle' },
  { name: 'laundry_room',     desc: 'leaning on washing machine, laundry detergent visible, cheap apartment bathroom lighting, candid everyday moment' },
  { name: 'window_night',     desc: 'sitting on windowsill of high rise apartment at night, city lights outside, dim room light, romantic candid phone photo' },
];

// Lv1衣装（NSFWフィルタ安全圏）
const OUTFITS_LV1 = [
  'wearing oversized white t-shirt and cotton panties',
  'wearing simple beige lace bra and matching panties',
  'wearing loose grey sweatshirt off one shoulder and shorts',
  'wearing thin white camisole and boy shorts',
  'wearing pale pink pajama shirt half buttoned and shorts',
];

// リアリティ固定句
const REALISM_SUFFIX = 'amateur iphone selfie photo, candid unstaged, slight camera shake, visible skin pores and texture, no professional retouching, no studio lighting, no model pose, natural imperfect composition, realistic grainy smartphone quality';
const ANTI_AI = 'not cgi, not 3d render, not anime, not perfect plastic skin, not airbrushed, not cinematic, not editorial, not glossy fashion magazine';

function buildPrompt(profile, scene, outfit) {
  return [
    profile.face,
    profile.body,
    profile.hair,
    profile.age,
    outfit,
    scene.desc,
    REALISM_SUFFIX,
    ANTI_AI,
  ].join(', ');
}

function buildJobsForCast(castName, profile, count) {
  const jobs = [];
  let seedOffset = 0;
  while (jobs.length < count) {
    for (const scene of SCENES) {
      for (const outfit of OUTFITS_LV1) {
        if (jobs.length >= count) break;
        jobs.push({
          cast: castName,
          name: `${castName}_lv1_${scene.name}_${seedOffset}`,
          prompt: buildPrompt(profile, scene, outfit),
          seed: profile.seed + seedOffset * 7,
        });
        seedOffset += 1;
      }
      if (jobs.length >= count) break;
    }
  }
  return jobs;
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const follow = (u, r = 0) => {
      if (r > 5) return reject(new Error('Too many redirects'));
      https.get(u, { timeout: 90000 }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return follow(res.headers.location, r + 1);
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
        file.on('error', reject);
      }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
    };
    follow(url);
  });
}

async function generateForCast(castName, profile, count) {
  const outDir = path.join(OUT_BASE, castName);
  fs.mkdirSync(outDir, { recursive: true });
  const jobs = buildJobsForCast(castName, profile, count);
  console.log(`\n=== ${castName} ${jobs.length}枚 → ${outDir} ===`);
  let ok = 0, fail = 0;
  for (let i = 0; i < jobs.length; i++) {
    const j = jobs[i];
    const dest = path.join(outDir, `${j.name}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
      console.log(`  [${i + 1}/${jobs.length}] ${j.name} (既存skip)`);
      ok += 1;
      continue;
    }
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(j.prompt)}?width=640&height=960&seed=${j.seed}&model=flux&nologo=true&enhance=false`;
    try {
      await downloadImage(url, dest);
      const size = fs.statSync(dest).size;
      if (size > 10000) {
        console.log(`  [${i + 1}/${jobs.length}] ${j.name} ✓ ${(size / 1024).toFixed(0)}KB`);
        ok += 1;
      } else {
        console.log(`  [${i + 1}/${jobs.length}] ${j.name} ✗ サイズ不足`);
        fs.unlinkSync(dest);
        fail += 1;
      }
    } catch (e) {
      console.log(`  [${i + 1}/${jobs.length}] ${j.name} ✗ ${e.message}`);
      fail += 1;
    }
    if (i < jobs.length - 1) await new Promise(r => setTimeout(r, RATE_SEC * 1000));
  }
  return { cast: castName, ok, fail };
}

async function main() {
  const targets = MODE_ALL
    ? Object.entries(CAST_PROFILES)
    : CAST_FILTER
      ? [[CAST_FILTER, CAST_PROFILES[CAST_FILTER]]]
      : null;
  if (!targets) {
    console.error('Usage: --cast <name> --count N  |  --all --count N');
    console.error('Available casts:', Object.keys(CAST_PROFILES).join(', '));
    process.exit(1);
  }
  if (targets.some(([, p]) => !p)) {
    console.error(`Unknown cast: ${CAST_FILTER}`);
    console.error('Available casts:', Object.keys(CAST_PROFILES).join(', '));
    process.exit(1);
  }
  console.log(`=== AI本番画像生成 開始 ===`);
  console.log(`対象: ${targets.map(([n]) => n).join(', ')} (${targets.length}キャスト × ${COUNT}枚)`);
  console.log(`出力: ${OUT_BASE}`);
  console.log(`推定時間: ${Math.ceil(targets.length * COUNT * RATE_SEC / 60)}分\n`);

  const results = [];
  for (const [name, profile] of targets) {
    const r = await generateForCast(name, profile, COUNT);
    results.push(r);
  }

  console.log(`\n=== 完了サマリー ===`);
  let totalOk = 0, totalFail = 0;
  for (const r of results) {
    console.log(`  ${r.cast}: 成功${r.ok} / 失敗${r.fail}`);
    totalOk += r.ok;
    totalFail += r.fail;
  }
  console.log(`\n合計: 成功${totalOk} / 失敗${totalFail}`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
