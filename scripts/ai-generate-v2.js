#!/usr/bin/env node
/**
 * AI画像生成 v2 — 7軸分析ベース刷新版
 *
 * v1からの変更（7axis-report.md 300件分析ベース）:
 *   - トップレス・水着を完全排除（実データ0件）
 *   - 鏡越し自撮りを1割に圧縮（実データ1件 / 300件）
 *   - ホテル/自宅/浴室後 の3シチュを同率に
 *   - 衣装は部屋着主体、下着は「チラ見え」レベルに制限
 *   - 「売れてる投稿の瞬間」を再現（お客見送った後の余韻 / 出勤前メイク / 一息つく瞬間）
 *   - 1投稿=連作2〜3枚 → SCENE固定でseedをずらした連作出力
 *
 * 使い方:
 *   node ai-generate-v2.js --cast きみ --count 10 --out /tmp/v2-preview
 *   node ai-generate-v2.js --all --count 20
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const getArg = (f, d) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d; };
const CAST = getArg('--cast', null);
const ALL = argv.includes('--all');
const COUNT = parseInt(getArg('--count', '10'), 10);
const OUT_BASE = getArg('--out', path.join(__dirname, 'ai-production'));
const RATE_SEC = parseInt(getArg('--rate', '15'), 10);

// キャストprofile（v1から流用）
const CAST_PROFILES = {
  'きみ':   { seed: 5297311, body: 'slim slender body',            hair: 'long straight black hair',             age: 'early 20s fresh look',    face: 'japanese woman, oval face, small nose, natural pink lips, double eyelid' },
  'けい':   { seed: 5296926, body: 'petite small frame',           hair: 'dark brown wavy shoulder length hair', age: 'mid 20s mature charm',    face: 'japanese woman, round face, cute eyes, small mouth, soft cheeks' },
  'あんな': { seed: 5296921, body: 'curvy figure with soft waist', hair: 'ash brown layered medium hair',        age: 'late 20s confident mood', face: 'japanese woman, heart shaped face, full lips, almond eyes, mature' },
  'のの':   { seed: 5109961, body: 'slim slender body',            hair: 'black bob cut messy',                  age: 'early 20s fresh look',    face: 'japanese woman, oval face, large innocent eyes, small nose' },
  'まき':   { seed: 5079003, body: 'athletic toned body',          hair: 'dark brown wavy shoulder length hair', age: 'mid 20s mature charm',    face: 'japanese woman, sharp jawline, confident eyes, natural lips' },
  'まどか': { seed: 4199302, body: 'average natural body',         hair: 'long straight black hair',             age: 'late 20s confident mood', face: 'japanese woman, gentle face, soft eyes, warm smile, mature mom vibe' },
  'みき':   { seed: 2272539, body: 'curvy figure with soft waist', hair: 'ash brown layered medium hair',        age: 'late 20s confident mood', face: 'japanese woman, soft round face, sleepy eyes, full lips' },
  'なおみ': { seed: 5041113, body: 'petite small frame',           hair: 'long straight black hair',             age: 'mid 20s mature charm',    face: 'japanese woman, fair skin, delicate features, narrow eyes' },
  'けいか': { seed: 4138474, body: 'average natural body',         hair: 'black bob cut messy',                  age: 'late 20s confident mood', face: 'japanese woman, refined face, cool eyes, mature elegance' },
  'なみ':   { seed: 5219440, body: 'curvy figure with soft waist', hair: 'dark brown wavy shoulder length hair', age: 'mid 20s mature charm',    face: 'japanese woman, round face, small nose, full lips, double eyelid' },
  'わかな': { seed: 3790402, body: 'slim slender body',            hair: 'ash brown layered medium hair',        age: 'early 20s fresh look',    face: 'japanese woman, small face, bright eyes, cute nose, youthful' },
  'あやせ': { seed: 5214107, body: 'athletic toned body',          hair: 'long straight black hair',             age: 'mid 20s mature charm',    face: 'japanese woman, sharp features, intense eyes, defined lips' },
  'しずか': { seed: 5079007, body: 'petite small frame',           hair: 'dark brown wavy shoulder length hair', age: 'early 20s fresh look',    face: 'japanese woman, quiet expression, gentle eyes, small lips' },
  'つばき': { seed: 5121129, body: 'curvy figure with soft waist', hair: 'black bob cut messy',                  age: 'mid 20s mature charm',    face: 'japanese woman, round cheeks, playful eyes, full lips' },
  'ゆりか': { seed: 5142399, body: 'average natural body',         hair: 'long straight black hair',             age: 'late 20s confident mood', face: 'japanese woman, elegant face, calm eyes, natural lips, grown up vibe' },
};

// ─── 刷新後シーン群（実データ分布に寄せる）───
// ホテル14 / 自宅15 / 浴室11 / 外出11 ≒ 各33% をこのセットで再現
const MOMENTS = [
  // 自宅系
  { tag: 'home_sofa_rest',       weight: 10, desc: 'sitting on low sofa in small japanese apartment, holding phone with both hands, messy coffee table with snacks and convenience store receipts, warm floor lamp light, candid relaxed moment' },
  { tag: 'bed_chill',            weight: 10, desc: 'sitting cross-legged on bed with crumpled sheets, leaning against pillow, phone in one hand, eating snacks from a plastic bag, warm bedside lamp glow' },
  { tag: 'vanity_makeup',        weight: 10, desc: 'sitting at small dressing table finishing makeup, cotton pads and cosmetics scattered, looking into mirror holding phone, soft bedroom light, just-about-to-go-out feeling' },
  { tag: 'window_afternoon',     weight: 8,  desc: 'leaning against window frame of small apartment, afternoon sunlight streaming in, sheer curtain, coffee mug on windowsill, contemplative relaxed expression' },
  // ホテル系
  { tag: 'hotel_bed_evening',    weight: 10, desc: 'sitting on the edge of a plain japanese business hotel bed with floral bedsheet, handbag on the chair, dim tungsten lamp glow, after-work relaxed moment' },
  { tag: 'hotel_mirror_vanity',  weight: 6,  desc: 'standing in front of hotel vanity mirror arranging hair, hotel hairdryer on counter, plain wallpaper, soft bathroom light' },
  { tag: 'hotel_afterwards',     weight: 10, desc: 'lying on hotel bed looking up at ceiling, fresh pillow beside face, hair slightly messy, calm breathing moment after client visit, dim romantic lighting' },
  // 浴室/お風呂後
  { tag: 'bath_afterwards',      weight: 10, desc: 'sitting on edge of small japanese unit bathtub wrapped in bath towel, hair still slightly wet, steam on mirror, plastic shower stool visible, fluorescent bathroom light' },
  { tag: 'dressing_room',        weight: 8,  desc: 'standing in narrow apartment hallway just after shower, bath towel wrapped around body, hair damp, bottles of skincare in background, warm yellow light' },
  // 外出/道中
  { tag: 'station_platform',     weight: 6,  desc: 'standing on a japanese train station platform at night, soft yellow platform lights, vending machine behind, quietly waiting for train, handbag on shoulder' },
  { tag: 'taxi_interior',        weight: 6,  desc: 'sitting in back seat of japanese taxi at night, city lights streaming by outside window, shoulder belt visible, quiet moment in motion' },
  { tag: 'cafe_alone',           weight: 6,  desc: 'sitting alone at small cafe table by the window, cup of coffee in hand, phone and small bag on table, afternoon soft light, candid daydreaming face' },
  { tag: 'entrance_preparing',   weight: 6,  desc: 'standing at apartment entrance tying shoes, handbag placed on shoe cabinet, about to go out, natural hallway light' },
  // 鏡越し（意図的に低比率）
  { tag: 'mirror_fullbody',      weight: 3,  desc: 'full length mirror selfie in bedroom, holding phone at chest level, casual outfit, slight smile, warm soft bedroom light' },
];

// 衣装（Lv1のみ・実データ反映で部屋着を主体に）
const OUTFIT_CHIP = [
  { tag: 'tshirt_shorts',   weight: 12, desc: 'wearing oversized white t-shirt and cotton shorts, bare legs, no makeup feeling' },
  { tag: 'camisole',        weight: 10, desc: 'wearing thin beige camisole and soft relaxed shorts, natural shoulder lines visible' },
  { tag: 'cardigan_soft',   weight: 10, desc: 'wearing cropped cardigan over camisole, soft knit texture, home relaxed look' },
  { tag: 'sweat_oneshoulder', weight: 8, desc: 'wearing loose grey sweatshirt slipping off one shoulder, soft cotton shorts, cozy at-home vibe' },
  { tag: 'pajama',          weight: 8, desc: 'wearing soft pink cotton pajama set, top two buttons casually undone, sleepy face' },
  { tag: 'plain_dress',     weight: 10, desc: 'wearing simple knee length cotton dress, bare arms, natural daytime outfit' },
  { tag: 'knit_skirt',      weight: 8, desc: 'wearing thin ribbed knit top and pleated skirt, ready to go out, casual daily outfit' },
  { tag: 'blouse_jeans',    weight: 8, desc: 'wearing soft white blouse and high waist jeans, cuffs rolled, natural everyday look' },
  { tag: 'bathtowel',       weight: 8, desc: 'wearing only a large white bath towel wrapped loosely around body after shower, bare shoulders, slight water drop on skin' },
  { tag: 'lingerie_tasteful', weight: 6, desc: 'wearing plain beige lace bra and matching panties, soft fabric, no heavy styling, intimate but tasteful vibe' },
];

// リアリティ/アンチAI固定
const REALISM = 'amateur iphone selfie photo, candid unstaged, slight camera shake, visible skin pores and texture, no professional retouching, no studio lighting, no model pose, natural imperfect composition, realistic grainy smartphone quality';
const ANTI_AI = 'not cgi, not 3d render, not anime, not perfect plastic skin, not airbrushed, not cinematic, not editorial, not glossy fashion magazine, not topless, not nude';

function buildPrompt(profile, moment, outfit) {
  return [profile.face, profile.body, profile.hair, profile.age, outfit.desc, moment.desc, REALISM, ANTI_AI].join(', ');
}

function pickWeighted(list, rand) {
  const total = list.reduce((a, x) => a + x.weight, 0);
  let r = rand * total;
  for (const x of list) { r -= x.weight; if (r <= 0) return x; }
  return list[list.length - 1];
}

function buildJobs(castName, profile, count) {
  const jobs = [];
  let seedOffset = 0;
  // 連作ペア: 同じ moment+outfit で seed を隣合わせ、視点差出し
  while (jobs.length < count) {
    const m = pickWeighted(MOMENTS, Math.random());
    const o = pickWeighted(OUTFIT_CHIP, Math.random());
    const pair = Math.random() < 0.55 ? 2 : 1;
    for (let k = 0; k < pair && jobs.length < count; k++) {
      jobs.push({
        cast: castName,
        name: `${castName}_v2_${m.tag}_${o.tag}_${seedOffset}`,
        prompt: buildPrompt(profile, m, o),
        seed: profile.seed + seedOffset * 13 + k,
      });
      seedOffset += 1;
    }
  }
  return jobs;
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const follow = (u, r = 0) => {
      if (r > 5) return reject(new Error('Too many redirects'));
      https.get(u, { timeout: 90000 }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) return follow(res.headers.location, r + 1);
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
  const jobs = buildJobs(castName, profile, count);
  console.log(`\n=== ${castName} ${jobs.length}枚 → ${outDir} ===`);
  let ok = 0, fail = 0;
  for (let i = 0; i < jobs.length; i++) {
    const j = jobs[i];
    const dest = path.join(outDir, `${j.name}.jpg`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
      console.log(`  [${i + 1}/${jobs.length}] ${j.name} (既存skip)`);
      ok += 1; continue;
    }
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(j.prompt)}?width=640&height=960&seed=${j.seed}&model=flux&nologo=true&enhance=false`;
    try {
      await downloadImage(url, dest);
      const size = fs.statSync(dest).size;
      if (size > 10000) { console.log(`  [${i + 1}/${jobs.length}] ${j.name} ✓ ${(size / 1024).toFixed(0)}KB`); ok += 1; }
      else { console.log(`  [${i + 1}/${jobs.length}] ${j.name} ✗ サイズ不足`); fs.unlinkSync(dest); fail += 1; }
    } catch (e) {
      console.log(`  [${i + 1}/${jobs.length}] ${j.name} ✗ ${e.message}`); fail += 1;
    }
    if (i < jobs.length - 1) await new Promise(r => setTimeout(r, RATE_SEC * 1000));
  }
  return { cast: castName, ok, fail };
}

async function main() {
  const targets = ALL
    ? Object.entries(CAST_PROFILES)
    : CAST ? [[CAST, CAST_PROFILES[CAST]]] : null;
  if (!targets) {
    console.error('Usage: --cast <name> --count N  |  --all --count N');
    console.error('Casts:', Object.keys(CAST_PROFILES).join(', '));
    process.exit(1);
  }
  if (targets.some(([, p]) => !p)) { console.error(`Unknown cast: ${CAST}`); process.exit(1); }
  console.log(`=== v2本番画像生成 ===`);
  console.log(`対象: ${targets.map(([n]) => n).join(', ')} × ${COUNT}枚`);
  console.log(`出力: ${OUT_BASE}\n`);
  const results = [];
  for (const [name, profile] of targets) results.push(await generateForCast(name, profile, COUNT));
  console.log(`\n=== サマリー ===`);
  for (const r of results) console.log(`  ${r.cast}: 成功${r.ok} / 失敗${r.fail}`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
