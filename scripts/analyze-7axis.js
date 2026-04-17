/**
 * 7軸分析 — 売れてる写メ日記の勝ちパターン抽出
 *
 * 入力: dto-competitor-data-v2.json (無ければ v1 へフォールバック)
 * 出力: 7axis-analysis.json + 7axis-report.md
 *
 * 7軸:
 *   1. 文章（長さ・文体・段落構造）
 *   2. 写真（画像枚数・URL参照）
 *   3. ロケーション（本文から部屋/ホテル/風景の語を検出）
 *   4. 露出（衣装・肌描写ワード）
 *   5. 文章内容（お礼/次回予告/甘え/誘惑/報告）
 *   6. 誘惑フレーズ（エロ系・口説き系の高頻出句）
 *   7. 導線（出勤時刻・次回日付・予約URL・待機中の配置）
 *   8. リアリティ（生活感ワード密度：自宅/食事/疲れ/通勤等）
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const CANDIDATES = [
  path.join(DIR, 'dto-competitor-data-v2.json'),
  path.join(DIR, 'dto-competitor-data.json'),
];
const OUT_JSON = path.join(DIR, '7axis-analysis.json');
const OUT_MD = path.join(DIR, '7axis-report.md');

function loadData() {
  for (const p of CANDIDATES) {
    if (fs.existsSync(p)) {
      const d = JSON.parse(fs.readFileSync(p, 'utf-8'));
      console.log(`[loaded] ${p}: ${d.length}件`);
      return d;
    }
  }
  throw new Error('データファイルなし');
}

// ─── 辞書定義 ───
const LEXICON = {
  location: {
    '自宅/部屋': ['自宅','お家','部屋','リビング','寝室','ベッド','布団','ソファ'],
    'ホテル': ['ホテル','ラブホ','お部屋','客室','ルーム'],
    '浴室': ['お風呂','バスルーム','シャワー','湯船','バスタブ'],
    '外出': ['カフェ','レストラン','ショッピング','デート','お散歩','コンビニ'],
    '鏡越し': ['鏡','ミラー','鏡越し'],
  },
  outfit: {
    '下着': ['下着','ランジェリー','ブラ','パンツ','パンティ','ショーツ'],
    'トップレス': ['トップレス','裸','生乳','半裸','ノーブラ'],
    '水着/ビキニ': ['水着','ビキニ','水玉','スイム'],
    'コスプレ': ['コスプレ','制服','メイド','ナース','OL','スーツ'],
    '部屋着': ['パジャマ','スウェット','Tシャツ','ワンピース','ルームウェア','キャミ'],
    'シースルー': ['シースルー','透け','網タイツ','ガーター','ストッキング'],
  },
  content: {
    'お礼': ['ありがとう','感謝','嬉しかった','ほんと嬉しい','ありがとうございました'],
    '次回予告': ['次回','次は','また','明日','次の出勤','お待ちし'],
    '甘え': ['寂しい','会いたい','甘えたい','甘えさせて','独り'],
    '誘惑': ['エッチ','いじわる','ドキドキ','溶けちゃう','感じちゃう','濡れ','イっ','テクニック','気持ちいい','絶頂','欲望'],
    '報告': ['出勤','受付','終了','完売','🈵','空き','待機','キャンセル','ご予約'],
  },
  seduction: [
    'ドロドロ','ぐちゅぐちゅ','ぬるぬる','ビクビク','ピクピク','ビショビショ',
    '濡れ濡れ','クチュクチュ','きもちよすぎ','もっと','イかせて','欲しい',
    '焦らし','エッチしたい','お潮','潮吹き','絶頂','イキ','感じさせて',
    '優しく','激しく','攻め','受け','中に','奥に','深く','溺れ',
    'ムラムラ','ハメ','生','生挿れ','舐め','キス','ディープ','フェラ','ベロチュー',
  ],
  reality: [
    '疲れ','寝','眠','朝','夜','ご飯','食べ','お腹','ネイル','買い物',
    '洗濯','掃除','メイク','シャワー','湯船','お風呂','家','自宅','通勤',
    'お茶','お菓子','カフェ','コンビニ','お散歩','ダイエット','お化粧','生理',
  ],
  cta: {
    '出勤時刻': /(\d{1,2})[:：](\d{2})[\s～〜\-ー~]*(\d{1,2})?[:：]?(\d{2})?/g,
    '電話': /0[\d\-（）()\s]{9,}/g,
    'URL': /https?:\/\/[\S]+/g,
    '日付': /(\d{1,2})[\/月](\d{1,2})[\/日]?[（(]?[月火水木金土日]/g,
  },
};

function countMatches(text, words) {
  if (!text) return 0;
  let n = 0;
  for (const w of words) n += (text.match(new RegExp(w, 'g')) || []).length;
  return n;
}

function analyzeByCategory(text, catDict) {
  const out = {};
  for (const [cat, words] of Object.entries(catDict)) {
    out[cat] = countMatches(text, words);
  }
  return out;
}

function extractTopPhrases(allTexts, limit = 30) {
  const freq = {};
  const phraseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]{3,8}/g;
  const stop = new Set(['ありがとう','ございました','お願いします','今日','明日','みなさん','わたし','あなた','ください','いらっしゃい']);
  for (const t of allTexts) {
    if (!t) continue;
    const words = t.match(phraseRegex) || [];
    for (const w of words) if (!stop.has(w)) freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([p, c]) => ({ phrase: p, count: c }));
}

function analyzePost(entry) {
  const t = entry.bodyText || '';
  return {
    castName: entry.castName,
    area: entry.area,
    shopName: entry.shopName,
    title: entry.title,
    likes: entry.likes,
    bodyLen: t.length,
    imageCount: (entry.imageUrls || []).length,
    location: analyzeByCategory(t, LEXICON.location),
    outfit: analyzeByCategory(t, LEXICON.outfit),
    content: analyzeByCategory(t, LEXICON.content),
    seduction: countMatches(t, LEXICON.seduction),
    reality: countMatches(t, LEXICON.reality),
    cta: {
      hasSchedule: LEXICON.cta['出勤時刻'].test(t),
      hasPhone: LEXICON.cta['電話'].test(t),
      hasUrl: LEXICON.cta['URL'].test(t),
      hasDate: LEXICON.cta['日付'].test(t),
    },
  };
}

function summarize(analyses) {
  const byAxis = { location: {}, outfit: {}, content: {}, seduction: 0, reality: 0, cta: { hasSchedule: 0, hasPhone: 0, hasUrl: 0, hasDate: 0 } };
  let n = 0;
  let bodyLenSum = 0, imgCountSum = 0;
  let postsWithBody = 0;
  for (const a of analyses) {
    if (!a.bodyLen) continue;
    n += 1;
    postsWithBody += 1;
    bodyLenSum += a.bodyLen;
    imgCountSum += a.imageCount;
    for (const [k, v] of Object.entries(a.location)) byAxis.location[k] = (byAxis.location[k] || 0) + v;
    for (const [k, v] of Object.entries(a.outfit)) byAxis.outfit[k] = (byAxis.outfit[k] || 0) + v;
    for (const [k, v] of Object.entries(a.content)) byAxis.content[k] = (byAxis.content[k] || 0) + v;
    byAxis.seduction += a.seduction;
    byAxis.reality += a.reality;
    for (const k of Object.keys(byAxis.cta)) if (a.cta[k]) byAxis.cta[k] += 1;
  }
  return {
    postsAnalyzed: n,
    avgBodyLen: n > 0 ? Math.round(bodyLenSum / n) : 0,
    avgImageCount: n > 0 ? +(imgCountSum / n).toFixed(1) : 0,
    axis: byAxis,
    ctaRatio: Object.fromEntries(Object.entries(byAxis.cta).map(([k, v]) => [k, n > 0 ? +(v / n * 100).toFixed(1) : 0])),
  };
}

function main() {
  const data = loadData();
  const analyses = data.map(analyzePost);
  const summary = summarize(analyses);

  // 上位likes投稿（売れてる投稿）の特徴
  const withLikes = analyses.filter(a => a.likes != null && a.bodyLen);
  withLikes.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  const top20 = withLikes.slice(0, 20);
  const topSummary = summarize(top20);

  const allText = data.map(d => d.bodyText).filter(Boolean);
  const topPhrases = extractTopPhrases(allText, 40);
  const topSeductionPhrases = extractTopPhrases(allText.filter(t => LEXICON.seduction.some(w => t.includes(w))), 30);

  const result = {
    generatedAt: new Date().toISOString(),
    totalEntries: data.length,
    summaryAll: summary,
    summaryTop20: topSummary,
    topPhrases,
    topSeductionPhrases,
    top20Posts: top20.map(a => ({ castName: a.castName, area: a.area, shopName: a.shopName, title: a.title, likes: a.likes, bodyLen: a.bodyLen, seduction: a.seduction, reality: a.reality })),
    perPost: analyses,
  };
  fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2), 'utf-8');

  // Markdownレポート
  const md = [
    `# 7軸分析レポート (${new Date().toLocaleString('ja-JP')})`,
    ``,
    `- 対象: ${data.length}件 (内 本文あり: ${summary.postsAnalyzed}件)`,
    `- 平均本文長: ${summary.avgBodyLen}字`,
    `- 平均画像数: ${summary.avgImageCount}枚`,
    ``,
    `## 全体 各軸出現カウント`,
    ``,
    `### ロケーション`,
    ...Object.entries(summary.axis.location).sort((a, b) => b[1] - a[1]).map(([k, v]) => `- ${k}: ${v}`),
    ``,
    `### 衣装/露出`,
    ...Object.entries(summary.axis.outfit).sort((a, b) => b[1] - a[1]).map(([k, v]) => `- ${k}: ${v}`),
    ``,
    `### 文章内容`,
    ...Object.entries(summary.axis.content).sort((a, b) => b[1] - a[1]).map(([k, v]) => `- ${k}: ${v}`),
    ``,
    `- 誘惑フレーズ合計: ${summary.axis.seduction}`,
    `- リアリティワード合計: ${summary.axis.reality}`,
    ``,
    `### 導線 (CTA) 設置率`,
    ...Object.entries(summary.ctaRatio).map(([k, v]) => `- ${k}: ${v}%`),
    ``,
    `## 売れてる TOP20 投稿の特徴`,
    ``,
    `- 平均本文長: ${topSummary.avgBodyLen}字 (全体比: ${(topSummary.avgBodyLen / (summary.avgBodyLen || 1)).toFixed(2)}x)`,
    `- 平均画像数: ${topSummary.avgImageCount}枚`,
    `- 誘惑フレーズ合計: ${topSummary.axis.seduction}`,
    `- リアリティ合計: ${topSummary.axis.reality}`,
    ``,
    `### TOP20投稿リスト`,
    ...top20.slice(0, 20).map((a, i) => `${i + 1}. [${a.area}] ${a.castName} @ ${a.shopName} | ❤${a.likes} | "${a.title}" (${a.bodyLen}字)`),
    ``,
    `## 頻出フレーズ TOP40`,
    ...topPhrases.map((p, i) => `${i + 1}. ${p.phrase} (${p.count})`),
    ``,
    `## 誘惑文脈内フレーズ TOP30`,
    ...topSeductionPhrases.map((p, i) => `${i + 1}. ${p.phrase} (${p.count})`),
    ``,
  ].join('\n');
  fs.writeFileSync(OUT_MD, md, 'utf-8');

  console.log(`[saved] ${OUT_JSON}`);
  console.log(`[saved] ${OUT_MD}`);
}

main();
