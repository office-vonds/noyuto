#!/usr/bin/env node
/**
 * noyutoブランド X自動投稿（Cookie直接認証版）
 *
 * パイプライン:
 *   1. generate_post.py でスレッド生成 → pending_posts/ に保存
 *   2. このスクリプトが pending_posts/ からキューイング → X投稿
 *
 * 初回セットアップ:
 *   node noyuto-x-post.js --setup
 *   → auth_token と ct0 を入力 → 保存
 *
 * Cookie取得方法（1分）:
 *   1. WindowsのChromeで https://x.com を開く（@noyuto でログイン済み）
 *   2. F12（DevTools） → Application タブ → Cookies → https://x.com
 *   3. auth_token の Value をコピー
 *   4. ct0 の Value をコピー
 *
 * コマンド:
 *   node noyuto-x-post.js --setup          # Cookie設定
 *   node noyuto-x-post.js --generate       # テーマからスレッド生成（generate_post.py呼び出し）
 *   node noyuto-x-post.js                  # pending_posts/ から1スレッド投稿
 *   node noyuto-x-post.js --dry-run        # テスト（投稿しない）
 *   node noyuto-x-post.js --full           # 生成 + 投稿（cron用）
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const NOYUTO_SCRIPTS_DIR = '/home/ozawakiryu0902/projects/noyuto/scripts';
const PENDING_POSTS_DIR = path.join(NOYUTO_SCRIPTS_DIR, 'data', 'generated', 'pending_posts');
const POSTED_DIR = path.join(SCRIPT_DIR, 'data', 'noyuto-x', 'posted');
const AUTH_FILE = path.join(SCRIPT_DIR, 'data', 'noyuto-x', '.x-auth.json');
const LOG_FILE = path.join(SCRIPT_DIR, 'data', 'noyuto-x', 'post.log');

const ACCOUNT_NAME = 'noyuto';

const args = process.argv.slice(2);
const setupMode = args.includes('--setup');
const dryRun = args.includes('--dry-run');
const generateMode = args.includes('--generate');
const fullMode = args.includes('--full');

function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch (e) { /* ignore */ }
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer.trim()); }));
}

function ensureDirs() {
  [POSTED_DIR, path.dirname(AUTH_FILE)].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
}

// ── テーマプール（思想DB v3 準拠・17テーマ）──
const THEME_POOL = [
  { id: 1, theme: '信頼の消費構造', angle: '信頼を語る人間の9割が、信頼を消費している事実', arrow: 'B' },
  { id: 2, theme: '善意の搾取構造', angle: '善意で動く人間ほど搾取される仕組み', arrow: 'A' },
  { id: 3, theme: '効率化の逆説', angle: '効率化を語る経営者が、社員の非効率を生んでいる構造', arrow: 'A' },
  { id: 4, theme: '努力の自己消費ループ', angle: '努力を続ける人間が報われない構造的理由', arrow: 'C' },
  { id: 5, theme: '正解依存症', angle: '正解を求める人間が正解から最も遠い理由', arrow: 'C' },
  { id: 6, theme: '矛盾を抱える強さ', angle: '矛盾を許容できない人間は強くなれない', arrow: 'B' },
  { id: 7, theme: '些事の力', angle: '些事に気を込められない人間が大事を成せるわけがない', arrow: 'C' },
  { id: 8, theme: '心の積極化', angle: '積極的な心を持つと決めた人間だけが見える景色', arrow: 'B' },
  { id: 9, theme: '評価経済の崩壊', angle: '評価を追う人間が信用を失う構造', arrow: 'A' },
  { id: 10, theme: '健康の自己欺瞞', angle: '健康を語りながら体を壊す矛盾を直視できるか', arrow: 'B' },
  { id: 11, theme: '金と志の関係', angle: '金を稼ぐ理由が自分のためだけなら、その金は腐る', arrow: 'A' },
  { id: 12, theme: '恩義の循環', angle: '恩を返すのではなく、次に渡す人間が強い', arrow: 'C' },
  { id: 13, theme: '少数派の生存戦略', angle: '人がやらないことだけを探す人間の共通点', arrow: 'B' },
  { id: 14, theme: '負の感情の処理構造', angle: '負の感情を人に話す人間は、自分の弱さを増幅している', arrow: 'C' },
  { id: 15, theme: '自然と不自然', angle: '自然に逆らう生き方が病を生む構造', arrow: 'B' },
  { id: 16, theme: '結果を出す前に辞める構造', angle: '結果を出す前に辞める人間の共通点', arrow: 'C' },
  { id: 17, theme: '貧しさの美学', angle: '貧しさは美しい。心が貧しくなければ生きていける', arrow: 'A' },
];

// ── スレッド構造パーツ（リポスト誘発構造v4準拠）──
const HOOKS = {
  A: [
    (t) => `${t.theme}。\n\nこの言葉の意味を正確に理解している経営者は、100人に1人もいません。\n\n${t.angle}。\n\nこの構造を知らないまま経営を続けている人間がどれだけいるか。`,
    (t) => `「${t.theme}」という言葉を聞いて、自分は違うと思った人間ほど危険です。\n\n${t.angle}。\n\nこの事実を直視できるかどうかが、経営者としての分岐点です。`,
    (t) => `経営者の9割が見落としている構造があります。\n\n「${t.theme}」\n\n${t.angle}。\n\nこの構造を放置している限り、組織は内側から壊れ続けます。`,
  ],
  B: [
    (t) => `${t.theme}。\n\nこの構造に気づいている人間は、もう言葉を選んでいます。\n\n${t.angle}。\n\n気づいていない人間は、まだ同じ過ちを繰り返している。`,
    (t) => `「${t.theme}」\n\nこの言葉を聞いて、誰かの顔が浮かんだ人間は正常です。\n\n${t.angle}。\n\n問題は、浮かんだ顔が自分だった場合です。`,
    (t) => `${t.theme}について、本気で考えたことがある人間は少ない。\n\n${t.angle}。\n\nこの構造を理解している人間同士は、言葉が少なくても通じ合います。`,
  ],
  C: [
    (t) => `${t.theme}。\n\nこれを20代のうちに理解できるかどうかで、人生の軌道が変わります。\n\n${t.angle}。\n\n知っているか知らないかではない。気づけるかどうかです。`,
    (t) => `若い人間に一つだけ伝えるなら、「${t.theme}」の話をします。\n\n${t.angle}。\n\nこの構造を知らないまま30歳を迎える人間が多すぎる。`,
    (t) => `「${t.theme}」\n\n${t.angle}。\n\nこの話を素直に聞ける人間は、5年後に必ず差がつきます。\n\n素直に聞けない人間は、5年後も同じ場所にいます。`,
  ],
};

const PROVOKES = [
  (t) => `「そんなことはない」と思った人間。\n\nあなたのその反応こそが、${t.theme}の証拠です。\n\n反論したくなる構造自体が、この問題の本質。\n\n冷静に自分を見つめ直せるかどうか。それだけです。`,
  (t) => `この話をすると、必ず2種類の反応が返ってきます。\n\n「確かにそうだ」と黙る人間。\n「いや、自分は違う」と声を上げる人間。\n\n後者の方が、${t.theme}に深く嵌っています。`,
  (t) => `${t.angle}。\n\nこの事実を認めたくない人間の特徴は、「例外」を探し始めることです。\n\n例外を探す暇があるなら、まず自分の行動を棚卸ししてください。`,
];

const EVIDENCES = [
  (t) => `22年、現場を見てきました。\n\n${t.theme}に陥る人間には、共通のパターンがあります。\n\n・口では理想を語る\n・行動は昨日と同じ\n・変化を恐れていることに気づいていない\n\nこの3つが揃った瞬間、構造は固定されます。`,
  (t) => `数字で語ります。\n\n${t.theme}を理解して行動を変えた人間と、理解しなかった人間。\n\n3年後の差は、能力ではなく「構造への気づき」で決まっていました。\n\n才能の差ではありません。認識の差です。`,
  (t) => `中村天風はこう言いました。\n\n「些事に気を込めよ」\n\n${t.theme}の解決策は、実はここにあります。\n\n大きなことを変えようとする前に、目の前の些事に全力を注げるかどうか。\n\nそれができない人間が、構造を変えられるわけがない。`,
];

const LANDINGS = {
  A: [
    (t) => `この構造に気づいている経営者は、もう動いています。\n\nあなたの会社の経営者は、この話を聞いてどう反応するでしょうか。\n\n「知っている」と言うか。「考えたこともなかった」と言うか。\n\nその反応が、全てを物語っています。\n\n#${t.theme.replace(/[の・]/g, '')}`,
    (t) => `あなたの上司にこの話を見せてみてください。\n\n反応を見れば、その人間がどちら側にいるか分かります。\n\n${t.theme}から抜け出すための第一歩は、気づくこと。\n\nその答えは、もうここにある。\n\n#${t.theme.replace(/[の・]/g, '')}`,
  ],
  B: [
    (t) => `この話を読んで、誰かの顔が浮かんだ人間へ。\n\nその人に、この投稿を見せてみてください。\n\n同じ反応が返ってきたら、あなたたちは同じ側にいます。\n\n違う反応が返ってきたら、それもまた答えです。\n\n#${t.theme.replace(/[の・]/g, '')}`,
    (t) => `${t.theme}に気づいている人間は、もう動いています。\n\nあなたの隣にいる仲間は、まだ気づいていないかもしれません。\n\nその答えは、もうここにある。\n\n#${t.theme.replace(/[の・]/g, '')}`,
  ],
  C: [
    (t) => `この話を、あなたの後輩に見せてみてください。\n\n素直に受け取る人間は、必ず伸びます。\n\n反発する人間は、まだ準備ができていないだけです。\n\nどちらも、間違いではありません。\n\nタイミングは人それぞれです。\n\n#${t.theme.replace(/[の・]/g, '')}`,
    (t) => `${t.theme}。\n\nこの構造を若いうちに理解できた人間は幸運です。\n\n理解できなくても、この投稿を保存しておいてください。\n\nいつか必ず、意味が分かる日が来ます。\n\n#${t.theme.replace(/[の・]/g, '')}`,
  ],
};

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── 使用済みテーマ管理 ──
const USED_THEMES_FILE = path.join(SCRIPT_DIR, 'data', 'noyuto-x', 'used-themes.json');

function getUnusedTheme() {
  let used = [];
  if (fs.existsSync(USED_THEMES_FILE)) {
    try { used = JSON.parse(fs.readFileSync(USED_THEMES_FILE, 'utf-8')); } catch (e) { used = []; }
  }
  const unused = THEME_POOL.filter(t => !used.includes(t.id));
  if (unused.length === 0) {
    // 全テーマ使い切り → リセット
    log('全17テーマ使い切り。リセット');
    used = [];
    fs.writeFileSync(USED_THEMES_FILE, '[]', 'utf-8');
    return pickRandom(THEME_POOL);
  }
  const theme = pickRandom(unused);
  used.push(theme.id);
  fs.writeFileSync(USED_THEMES_FILE, JSON.stringify(used), 'utf-8');
  return theme;
}

// ── スレッド生成（API不要・内蔵エンジン）──
function generateThread() {
  log('内蔵エンジンでスレッド生成中...');
  ensureDirs();

  const theme = getUnusedTheme();
  log(`テーマ: [${theme.id}] ${theme.theme} (矢印:${theme.arrow})`);

  const hook = pickRandom(HOOKS[theme.arrow])(theme);
  const provoke = pickRandom(PROVOKES)(theme);
  const evidence = pickRandom(EVIDENCES)(theme);
  const landing = pickRandom(LANDINGS[theme.arrow])(theme);

  const thread = [
    { position: 1, type: 'hook', text: hook },
    { position: 2, type: 'provoke', text: provoke },
    { position: 3, type: 'evidence', text: evidence },
    { position: 4, type: 'landing', text: landing },
  ];

  const data = {
    thread,
    hashtags: [`#${theme.theme.replace(/[の・]/g, '')}`],
    arrow_direction: theme.arrow,
    structure_name: theme.theme,
    generated_at: new Date().toISOString(),
    engine: 'builtin-v1',
  };

  // pending_posts/ に保存
  if (!fs.existsSync(PENDING_POSTS_DIR)) fs.mkdirSync(PENDING_POSTS_DIR, { recursive: true });
  const fileName = `thread_${Date.now()}.json`;
  fs.writeFileSync(path.join(PENDING_POSTS_DIR, fileName), JSON.stringify(data, null, 2), 'utf-8');

  log(`生成完了: ${fileName}`);
  thread.forEach((t, i) => log(`  [${i + 1}] ${t.text.substring(0, 50)}...`));
  return true;
}

// ── pending_posts/ から最古のスレッドを取得 ──
function getNextThread() {
  if (!fs.existsSync(PENDING_POSTS_DIR)) {
    log(`pending_posts/ が存在しません: ${PENDING_POSTS_DIR}`);
    return null;
  }
  const files = fs.readdirSync(PENDING_POSTS_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    log('pending_posts/ にスレッドがありません');
    return null;
  }

  const file = files[0];
  const filePath = path.join(PENDING_POSTS_DIR, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return { file, filePath, data };
  } catch (err) {
    log(`ERROR: JSONパース失敗 ${file}: ${err.message}`);
    return null;
  }
}

// ── X GraphQL API でツイート投稿 ──
function postTweet(authToken, ct0, text, replyToId = null) {
  return new Promise((resolve, reject) => {
    const variables = {
      tweet_text: text,
      dark_request: false,
      media: { media_entities: [], possibly_sensitive: false },
      semantic_annotation_ids: [],
    };

    if (replyToId) {
      variables.reply = { in_reply_to_tweet_id: replyToId, exclude_reply_user_ids: [] };
    }

    const body = JSON.stringify({
      variables,
      features: {
        communities_web_enable_tweet_community_results_fetch: true,
        c9s_tweet_anatomy_moderator_badge_enabled: true,
        tweetypie_unmention_optimization_enabled: true,
        responsive_web_edit_tweet_api_enabled: true,
        graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
        view_counts_everywhere_api_enabled: true,
        longform_notetweets_consumption_enabled: true,
        responsive_web_twitter_article_tweet_consumption_enabled: true,
        tweet_awards_web_tipping_enabled: false,
        creator_subscriptions_quote_tweet_preview_enabled: false,
        longform_notetweets_rich_text_read_enabled: true,
        longform_notetweets_inline_media_enabled: true,
        articles_preview_enabled: true,
        rweb_video_timestamps_enabled: true,
        rweb_tipjar_consumption_enabled: true,
        responsive_web_graphql_exclude_directive_enabled: true,
        verified_phone_label_enabled: false,
        freedom_of_speech_not_reach_fetch_enabled: true,
        standardized_nudges_misinfo: true,
        tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
        responsive_web_graphql_timeline_navigation_enabled: true,
        responsive_web_enhance_cards_enabled: false,
      },
      queryId: 'c50A_puUoQGK_4SXseYz3A',
    });

    const options = {
      hostname: 'x.com',
      path: '/i/api/graphql/c50A_puUoQGK_4SXseYz3A/CreateTweet',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'Cookie': `auth_token=${authToken}; ct0=${ct0}`,
        'X-Csrf-Token': ct0,
        'X-Twitter-Auth-Type': 'OAuth2Session',
        'X-Twitter-Active-User': 'yes',
        'X-Twitter-Client-Language': 'ja',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Referer': 'https://x.com/compose/tweet',
        'Origin': 'https://x.com',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            const tweetResult = json?.data?.create_tweet?.tweet_results?.result;
            const tweetId = tweetResult?.rest_id
                          || tweetResult?.legacy?.id_str
                          || tweetResult?.tweet?.rest_id
                          || json?.data?.create_tweet?.rest_id
                          || 'unknown';
            if (tweetId === 'unknown') {
              log(`  DEBUG: response structure = ${data.substring(0, 800)}`);
            }
            resolve({ id: tweetId, success: true });
          } catch (e) {
            log(`  DEBUG: JSON parse failed, raw data = ${data.substring(0, 500)}`);
            resolve({ id: 'unknown', success: true });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── スレッド投稿（4本を連続リプライ） ──
async function postThread(authToken, ct0, thread, hashtags) {
  const tweetIds = [];

  for (let i = 0; i < thread.length; i++) {
    const item = thread[i];
    let text = item.text;

    // 最後のツイートにハッシュタグ追加
    if (i === thread.length - 1 && hashtags && hashtags.length > 0) {
      text += '\n\n' + hashtags.join(' ');
    }

    // 280文字（日本語140文字相当）を超えないようにトリム
    if (text.length > 280) {
      text = text.substring(0, 277) + '...';
    }

    const replyTo = i > 0 ? tweetIds[i - 1] : null;
    log(`  [${i + 1}/4] ${item.type}: ${text.substring(0, 60)}...`);

    try {
      const result = await postTweet(authToken, ct0, text, replyTo);
      tweetIds.push(result.id);
      log(`  -> Tweet ID: ${result.id}`);

      // レート制限回避: スレッド間に3秒待機
      if (i < thread.length - 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch (err) {
      log(`  ERROR: ツイート${i + 1}本目失敗: ${err.message}`);
      if (err.message.includes('401') || err.message.includes('403')) {
        log('  Cookie期限切れの可能性あり。--setup で再取得してください');
      }
      throw err;
    }
  }

  return tweetIds;
}

// ── 投稿済みに移動 ──
function moveToPosted(filePath, fileName, tweetIds) {
  ensureDirs();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const firstId = tweetIds[0] || 'unknown';
  const newName = `${timestamp}_${firstId}_${fileName}`;
  const destPath = path.join(POSTED_DIR, newName);
  fs.renameSync(filePath, destPath);
  log(`移動: ${fileName} -> posted/${newName}`);
}

// ── 認証テスト ──
function testAuth(authToken, ct0) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'x.com',
      path: '/i/api/1.1/account/verify_credentials.json',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
        'Cookie': `auth_token=${authToken}; ct0=${ct0}`,
        'X-Csrf-Token': ct0,
        'X-Twitter-Auth-Type': 'OAuth2Session',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try { resolve(JSON.parse(data).screen_name); }
          catch (e) { resolve('unknown'); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// ── セットアップ ──
async function doSetup() {
  ensureDirs();
  console.log('\n========================================');
  console.log('  noyuto X Cookie セットアップ');
  console.log('========================================');
  console.log('  1. WindowsのChromeで https://x.com を開く');
  console.log('     （@noyuto でログイン済みの状態）');
  console.log('  2. F12 キーを押す（DevTools）');
  console.log('  3. 上部タブ「Application」をクリック');
  console.log('  4. 左メニュー「Cookies」→「https://x.com」');
  console.log('  5. 以下の2つの値をコピー:');
  console.log('     - auth_token');
  console.log('     - ct0');
  console.log('========================================\n');

  const authToken = await ask('auth_token の値: ');
  const ct0 = await ask('ct0 の値: ');

  if (!authToken || !ct0) {
    log('ERROR: 両方の値を入力してください');
    process.exit(1);
  }

  fs.writeFileSync(AUTH_FILE, JSON.stringify({ authToken, ct0 }, null, 2));
  log('認証情報を保存しました');

  log('認証テスト中...');
  try {
    const screenName = await testAuth(authToken, ct0);
    log(`認証成功: @${screenName}`);
  } catch (err) {
    log(`WARNING: 認証テスト失敗: ${err.message}`);
    log('Cookie値を再確認してください');
  }
}

// ── メイン投稿処理 ──
async function doPost() {
  ensureDirs();

  const next = getNextThread();
  if (!next) return;

  const { file, filePath, data } = next;
  const thread = data.thread || [];
  const hashtags = data.hashtags || [];

  if (thread.length === 0) {
    log(`ERROR: スレッドが空です: ${file}`);
    return;
  }

  log(`投稿ファイル: ${file}`);
  log(`テーマ: ${data.theme || 'N/A'}`);
  log(`矢印: ${data.arrow_direction || 'N/A'}`);
  log(`スレッド: ${thread.length}本`);

  for (const item of thread) {
    log(`  [${item.position}] ${item.type}: ${(item.text || '').substring(0, 80)}...`);
  }

  if (dryRun) {
    log('[DRY-RUN] 投稿をスキップしました');
    return;
  }

  if (!fs.existsSync(AUTH_FILE)) {
    log('ERROR: 認証情報なし。まず --setup を実行してください');
    log(`  node noyuto-x-post.js --setup`);
    process.exit(1);
  }

  const { authToken, ct0 } = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));

  try {
    const tweetIds = await postThread(authToken, ct0, thread, hashtags);
    log(`スレッド投稿成功: ${tweetIds.length}本`);
    log(`URL: https://x.com/${ACCOUNT_NAME}/status/${tweetIds[0]}`);
    moveToPosted(filePath, file, tweetIds);
  } catch (err) {
    log(`ERROR: スレッド投稿失敗: ${err.message}`);
    process.exit(1);
  }
}

// ── フルモード（生成 + 投稿） ──
async function doFull() {
  // まず pending に在庫があるか確認
  let next = getNextThread();
  if (!next) {
    // 在庫がなければ生成
    const ok = generateThread();
    if (!ok) {
      log('ERROR: スレッド生成失敗。投稿をスキップ');
      process.exit(1);
    }
  }
  await doPost();
}

// ── エントリーポイント ──
(async () => {
  if (setupMode) {
    await doSetup();
  } else if (generateMode) {
    generateThread();
  } else if (fullMode) {
    await doFull();
  } else {
    await doPost();
  }
})();
