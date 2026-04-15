/**
 * バニラ管理画面 一括最適化スクリプト
 *
 * 対象: 店舗情報 / 店長プロフィール / 画像キャプション / 採用情報 / 応募特典 / 給料情報 / 口コミ返信
 *
 * 使い方:
 *   node vanilla-optimize.js              # 全ページを最適化（確認のみ・dry-run）
 *   node vanilla-optimize.js --execute    # 実際に更新を実行
 *   node vanilla-optimize.js --page shop  # 特定ページのみ
 */
const { chromium } = require('playwright');
const path = require('path');

const CONFIG = {
  loginUrl: 'https://qzin.jp/entry/',
  username: 'kizuna0511',
  password: 'kiryu0902',
};

const args = process.argv.slice(2);
const execute = args.includes('--execute');
const targetPage = args.find((a, i) => args[i - 1] === '--page') || 'all';

// ═══════════════════════════════════════════════
// 最適化コンテンツ定義
// ═══════════════════════════════════════════════

const OPTIMIZE = {
  // 1. 店舗情報 — サブタイトルとお店からのメッセージ
  shop: {
    sub_title: '未経験OK×高額保証×完全自由出勤｜山梨で一番稼げるお店',
    shop_message: `◆ 山梨No.1の還元率 ◆
当店のバック率は業界トップクラス。他店と比べていただければ一目瞭然です。
「稼ぎたい」という気持ちに、数字で応えます。

◆ 未経験でも安心の保証制度 ◆
新人期間中は高額保証を完備。
「お客様が来なかったらどうしよう」という不安とは無縁です。
保証を出せるのは、あなたを稼がせる自信があるからです。

◆ 完全自由出勤・罰金ゼロ ◆
週1日・1日2時間からOK。
遅刻・当欠の罰金もノルマも一切ありません。
あなたのペースで、無理なく働けます。

◆ 万全のプライバシー保護 ◆
独自の顧客管理システムでお客様の顔を事前確認。
顔出しNG対応・アリバイ会社も完備。
県内の方も安心して働ける環境です。

◆ 充実のサポート体制 ◆
完全個室待機・送迎あり・寮完備（家具家電付き）。
すべての説明は女性スタッフが丁寧に行います。
30代・40代の方も大歓迎。年齢を理由に諦める必要はありません。`,
  },

  // 2. 店長プロフィール
  profile: {
    manager_name: 'てんちょう',
    age: '39',
    gender: '1', // 男性
    hobby: '温泉・ドライブ',
    message: `はじめまして、絆の店長です。

「働く女の子が安心できること」が当店の最優先事項です。
面倒な人間関係・理不尽な罰金・プライバシーの不安…
そういったストレスを一つずつ取り除いてきました。

面接だけでも大歓迎です。
LINEで気軽にメッセージください。
あなたの不安に、一つ一つ丁寧にお答えします。`,
  },

  // 3. 画像キャプション — 訴求力を強化
  pic: {
    sub_caption1: '19歳以上の女性を大募集中！未経験者も経験者も、年齢も問いません。あなたに合った働き方をご提案します',
    sub_caption2: '完全自由出勤制！週1日・1日2時間〜OK。あなたの生活リズムに合わせて無理なくお仕事できます',
    sub_caption3: '業界トップクラスのバック率＋高額保証制度。新人期間中も安定した収入をお約束します',
    sub_caption4: '経験豊富な専属ドライバーが安全にホテル・ご自宅まで送迎。深夜でも安心です',
    sub_caption5: '家具家電付きの完全個室寮を完備。遠方からの出稼ぎも即日入居OK。待機も完全個室です',
    sub_caption6: '独自の顧客管理システムでお客様の顔を事前確認。顔出しNG・アリバイ会社完備で身バレリスクゼロ',
  },

  // 4. 採用情報 — バック率・待遇テキスト・チェックボックス
  saiyo: {
    backrate_minute: '60',
    backrate_money: '18000',
    backrate_text: '業界最高水準のバック率！60分コースの場合、お客様から頂くお金の大部分があなたの報酬に。詳しくは面接時にご説明します。',
    daywage_text: '新人保証あり！10時間勤務で日給6万円を保証。出勤初日から安心して働けます。体験入店もOK（日払い対応）',
    provision: `◆ 高額保証制度 ◆
新人期間中はどなたでも保証が受けられます。
「稼げなかったらどうしよう」の不安はゼロ。

◆ 30代・40代も活躍中 ◆
人妻・熟女コースをご用意。年齢を理由に諦める必要はありません。
当店では幅広い年齢層の女性が活躍しています。

◆ 完全プライバシー保護 ◆
独自の顧客管理システムでお客様の顔を事前確認。
顔出しNG・アリバイ会社・身バレ対策を徹底。

◆ 日払い＆全額手渡し ◆
働いたその日に全額お渡し。引かれるものは一切ありません。
罰金・ノルマも完全ゼロ。`,
    // 追加チェックするべき項目
    checkboxes_to_enable: [
      'age_group[1]',  // 18・19歳
      'age_group[5]',  // 40代以上
      'provision_list[28]', // 完全ゴム着用
    ],
  },

  // 5. 応募特典
  benefit: {
    benefit: 'バニラ応募で寮費無料＋入店祝い金',
    benefit_detail: 'バニラを見て応募された方限定！滞在中の寮費が完全無料（通常1泊2,000円）。さらに入店祝い金もお渡しします。出稼ぎの方も大歓迎です♪',
  },

  // 6. 給料情報（急募インフォメーション）
  kyubo_info: {
    text: `<p style="text-align:center;"><strong><span style="color:#ff0000;font-size:18px;">＼ 急募！今なら高額保証あり ／</span></strong></p>
<p>&nbsp;</p>
<p><strong><span style="color:#ff1493;">■ 日給保証 6万円〜</span></strong>（10時間勤務の場合）</p>
<p><strong><span style="color:#ff1493;">■ 完全日払い</span></strong>・その日に全額手渡し</p>
<p><strong><span style="color:#ff1493;">■ 完全自由出勤</span></strong>・週1日〜OK</p>
<p>&nbsp;</p>
<p>━━━━━━━━━━━━━━</p>
<p><strong>こんな方を探しています</strong></p>
<p>━━━━━━━━━━━━━━</p>
<p>◆ 短期間でしっかり稼ぎたい方</p>
<p>◆ 他店で思うように稼げなかった方</p>
<p>◆ 未経験だけど挑戦してみたい方</p>
<p>◆ 出稼ぎで集中して働きたい方</p>
<p>&nbsp;</p>
<p>━━━━━━━━━━━━━━</p>
<p><strong>絆が選ばれる理由</strong></p>
<p>━━━━━━━━━━━━━━</p>
<p>◆ バック率 業界トップクラス</p>
<p>◆ 罰金・ノルマ 完全ゼロ</p>
<p>◆ 寮完備（家具家電付き・即日入居OK）</p>
<p>◆ 送迎あり・個室待機</p>
<p>◆ 身バレ対策万全（顔確認システム）</p>
<p>&nbsp;</p>
<p style="text-align:center;"><strong><span style="color:#ff0000;">まずはLINEで気軽にご相談ください</span></strong></p>
<p style="text-align:center;">「バニラを見た」でスムーズ対応！</p>`,
  },
};

// ═══════════════════════════════════════════════
// 実行ロジック
// ═══════════════════════════════════════════════

async function login(page) {
  await page.goto(CONFIG.loginUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#form_username', CONFIG.username);
  await page.fill('#form_password', CONFIG.password);
  await page.click('#button');
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  if (!page.url().includes('top.html')) throw new Error('ログイン失敗');
  return page.url();
}

async function clickTopButton(page, topUrl, buttonName, buttonValue) {
  await page.goto(topUrl, { waitUntil: 'networkidle', timeout: 15000 });
  // goBackの代わりに再ログインで確実にトップへ
  if (!page.url().includes('top.html')) {
    await login(page);
  }
  const btn = await page.$(`input[name="${buttonName}"][value="${buttonValue}"]`);
  if (!btn) throw new Error(`ボタン未発見: ${buttonName}=${buttonValue}`);
  await btn.click();
  await page.waitForLoadState('networkidle', { timeout: 20000 });
}

async function submitConfirm(page) {
  // 「確認する」ボタンをクリック
  const confirmBtn = await page.$('input[name="confirm"], input[value="確認する"]');
  if (!confirmBtn) throw new Error('確認ボタンが見つからない');
  await confirmBtn.click();
  await page.waitForLoadState('networkidle', { timeout: 20000 });

  // 確認ページで「変更する」「登録する」等をクリック
  const submitBtn = await page.$('input[name="complete"], input[value="変更する"], input[value="登録する"], input[value="投稿する"]');
  if (submitBtn) {
    // type=buttonをsubmitに変更（バニラの仕様）
    await page.evaluate(() => {
      const btns = document.querySelectorAll('input[name="complete"], input[value="変更する"], input[value="登録する"]');
      btns.forEach(b => {
        if (b.getAttribute('onclick')) b.removeAttribute('onclick');
        b.type = 'submit';
      });
    });
    await submitBtn.click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    return true;
  }
  return false;
}

// ── 各ページ更新関数 ──

async function optimizeShop(page, topUrl) {
  console.log('\n[1/7] 店舗情報...');
  await clickTopButton(page, topUrl, 'shop', '更新/入力する');

  const data = OPTIMIZE.shop;
  await page.fill('#form_sub_title', data.sub_title);
  console.log('  サブタイトル更新:', data.sub_title);

  // お店からのメッセージ（textarea）
  await page.evaluate((msg) => {
    const ta = document.querySelector('textarea[name="shop_message"]');
    if (ta) ta.value = msg;
  }, data.shop_message);
  console.log('  メッセージ更新:', data.shop_message.substring(0, 50) + '...');

  if (execute) {
    await submitConfirm(page);
    console.log('  → 更新完了');
  } else {
    await page.screenshot({ path: '/tmp/vanilla-opt-shop.png', fullPage: true });
    console.log('  → dry-run（スクショ保存）');
  }
}

async function optimizeProfile(page, topUrl) {
  console.log('\n[2/7] 店長プロフィール...');
  // 再ログインしてトップへ
  topUrl = await login(page);
  await clickTopButton(page, topUrl, 'shopmanager_profile', '更新/入力する');

  const data = OPTIMIZE.profile;
  await page.fill('#manager_name', data.manager_name);
  await page.selectOption('select[name="age"]', data.age);
  await page.fill('#hobby', data.hobby);
  await page.evaluate((msg) => {
    const ta = document.querySelector('textarea[name="message"]');
    if (ta) ta.value = msg;
  }, data.message);
  console.log('  名前:', data.manager_name, '/ 趣味:', data.hobby);
  console.log('  メッセージ更新:', data.message.substring(0, 50) + '...');

  if (execute) {
    await submitConfirm(page);
    console.log('  → 更新完了');
  } else {
    await page.screenshot({ path: '/tmp/vanilla-opt-profile.png', fullPage: true });
    console.log('  → dry-run');
  }
}

async function optimizePic(page, topUrl) {
  console.log('\n[3/7] 画像キャプション...');
  topUrl = await login(page);
  await clickTopButton(page, topUrl, 'pic', '更新/入力する');

  const data = OPTIMIZE.pic;
  for (const [name, value] of Object.entries(data)) {
    await page.evaluate(({ name, value }) => {
      const ta = document.querySelector(`textarea[name="${name}"]`);
      if (ta) ta.value = value;
    }, { name, value });
    console.log(`  ${name}: ${value.substring(0, 40)}...`);
  }

  if (execute) {
    await submitConfirm(page);
    console.log('  → 更新完了');
  } else {
    await page.screenshot({ path: '/tmp/vanilla-opt-pic.png', fullPage: true });
    console.log('  → dry-run');
  }
}

async function optimizeSaiyo(page, topUrl) {
  console.log('\n[4/7] 採用情報...');
  topUrl = await login(page);
  await clickTopButton(page, topUrl, 'saiyo', '更新/入力する');

  const data = OPTIMIZE.saiyo;

  // バック率
  await page.fill('#backrate_minute', data.backrate_minute);
  await page.fill('#backrate_money', data.backrate_money);
  console.log(`  バック率: ${data.backrate_minute}分 / ${data.backrate_money}円`);

  // テキスト
  await page.evaluate(({ backrate_text, daywage_text, provision }) => {
    const bt = document.querySelector('#backrate_text');
    if (bt) bt.value = backrate_text;
    const dt = document.querySelector('#daywage_text');
    if (dt) dt.value = daywage_text;
    const pv = document.querySelector('#provision');
    if (pv) pv.value = provision;
  }, data);
  console.log('  バック率テキスト更新');
  console.log('  日給テキスト更新');
  console.log('  待遇テキスト更新');

  // チェックボックス有効化
  for (const cb of data.checkboxes_to_enable) {
    await page.evaluate((name) => {
      const el = document.querySelector(`input[name="${name}"]`);
      if (el && !el.checked) el.checked = true;
    }, cb);
    console.log(`  チェック: ${cb}`);
  }

  if (execute) {
    await submitConfirm(page);
    console.log('  → 更新完了');
  } else {
    await page.screenshot({ path: '/tmp/vanilla-opt-saiyo.png', fullPage: true });
    console.log('  → dry-run');
  }
}

async function optimizeBenefit(page, topUrl) {
  console.log('\n[5/7] 応募特典...');
  topUrl = await login(page);
  await clickTopButton(page, topUrl, 'search', '更新/入力する');

  // benefit ページに遷移したか確認
  const url = page.url();
  if (!url.includes('benefit')) {
    console.log('  警告: benefitページに遷移できず。スキップ');
    return;
  }

  const data = OPTIMIZE.benefit;
  await page.evaluate(({ benefit, detail }) => {
    const b = document.querySelector('input[name="benefit"]');
    if (b) b.value = benefit;
    const d = document.querySelector('textarea[name="benefit_detail"]');
    if (d) d.value = detail;
  }, { benefit: data.benefit, detail: data.benefit_detail });
  console.log('  特典:', data.benefit);
  console.log('  詳細:', data.benefit_detail.substring(0, 50) + '...');

  if (execute) {
    await submitConfirm(page);
    console.log('  → 更新完了');
  } else {
    await page.screenshot({ path: '/tmp/vanilla-opt-benefit.png', fullPage: true });
    console.log('  → dry-run');
  }
}

async function optimizeKyubo(page, topUrl) {
  console.log('\n[6/7] 給料情報...');
  topUrl = await login(page);
  await clickTopButton(page, topUrl, 'info', '更新/入力する');

  const url = page.url();
  if (!url.includes('kyubo_info')) {
    console.log('  警告: 給料情報ページに遷移できず。スキップ');
    return;
  }

  // CKEditor にHTMLをセット
  const data = OPTIMIZE.kyubo_info;
  await page.waitForFunction(() =>
    typeof CKEDITOR !== 'undefined' &&
    CKEDITOR.instances.editor1 &&
    CKEDITOR.instances.editor1.status === 'ready',
    { timeout: 10000 }
  ).catch(() => {
    console.log('  CKEditor待ちタイムアウト。直接textarea設定');
  });

  await page.evaluate((html) => {
    if (typeof CKEDITOR !== 'undefined' && CKEDITOR.instances.editor1) {
      CKEDITOR.instances.editor1.setData(html);
    } else {
      const ta = document.querySelector('textarea[name="info[text]"]');
      if (ta) ta.value = html;
    }
  }, data.text);
  console.log('  給料情報テキスト更新');

  if (execute) {
    await submitConfirm(page);
    console.log('  → 更新完了');
  } else {
    await page.screenshot({ path: '/tmp/vanilla-opt-kyubo.png', fullPage: true });
    console.log('  → dry-run');
  }
}

async function optimizeReviewReply(page, topUrl) {
  console.log('\n[7/7] 口コミ返信...');
  topUrl = await login(page);
  await clickTopButton(page, topUrl, 'review', '確認する');

  // 返信リンクを確認
  const replyLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).filter(a =>
      a.textContent.includes('口コミに返信')
    ).map(a => ({ text: a.textContent.trim(), href: a.href }));
  });

  console.log(`  返信可能な口コミ: ${replyLinks.length}件`);

  if (replyLinks.length === 0) {
    console.log('  返信リンクなし。スキップ');
    return;
  }

  const replies = [
    // みどり（20代前半）への返信 — 客層コメント
    `みどりさん、口コミありがとうございます！東京からの出稼ぎ、お疲れ様です。検温などの衛生管理は当店が特に力を入れている部分なので、そこを評価していただけて嬉しいです。山梨は自然も豊かで、お休みの日にリフレッシュできる環境なのも魅力ですよね。これからも安心して働ける環境をスタッフ一同で守っていきます！`,
    // 早紀（20代中盤）への返信 — スタッフ関係コメント
    `早紀さん、口コミありがとうございます！未経験での入店、最初は不安だったと思います。「スタッフが優しい」と言ってもらえるのが一番嬉しいです。当店は女の子が安心して長く働ける環境を一番大切にしています。これからも何でも気軽にスタッフに相談してくださいね！`,
  ];

  for (let i = 0; i < Math.min(replyLinks.length, replies.length); i++) {
    console.log(`  口コミ${i + 1}への返信: ${replies[i].substring(0, 40)}...`);

    if (execute) {
      try {
        // 返信リンクをクリック
        await page.click(`a:has-text("口コミに返信"):nth-match(a, ${i + 1})`);
        await page.waitForLoadState('networkidle', { timeout: 15000 });

        // 返信フォームにテキスト入力
        const replyField = await page.$('textarea[name="reply"], textarea[name="comment"], textarea');
        if (replyField) {
          await replyField.fill(replies[i]);
          await submitConfirm(page);
          console.log(`  → 返信${i + 1}投稿完了`);
        } else {
          console.log(`  → 返信フォームが見つからない`);
          await page.screenshot({ path: `/tmp/vanilla-opt-reply${i + 1}.png`, fullPage: true });
        }

        // 口コミ一覧に戻る
        topUrl = await login(page);
        await clickTopButton(page, topUrl, 'review', '確認する');
      } catch (e) {
        console.log(`  → 返信${i + 1}エラー: ${e.message}`);
      }
    }
  }

  if (!execute) {
    await page.screenshot({ path: '/tmp/vanilla-opt-review.png', fullPage: true });
    console.log('  → dry-run');
  }
}

// ── メイン ──

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  バニラ管理画面 一括最適化');
  console.log(`  モード: ${execute ? '【本番実行】' : '【dry-run】'}`);
  console.log(`  対象: ${targetPage}`);
  console.log('═══════════════════════════════════════');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    let topUrl = await login(page);
    console.log('ログイン成功');

    const tasks = {
      shop: optimizeShop,
      profile: optimizeProfile,
      pic: optimizePic,
      saiyo: optimizeSaiyo,
      benefit: optimizeBenefit,
      kyubo: optimizeKyubo,
      review: optimizeReviewReply,
    };

    if (targetPage === 'all') {
      for (const [name, fn] of Object.entries(tasks)) {
        try {
          await fn(page, topUrl);
        } catch (e) {
          console.log(`  ${name} エラー: ${e.message}`);
        }
      }
    } else if (tasks[targetPage]) {
      await tasks[targetPage](page, topUrl);
    } else {
      console.log(`未知のページ: ${targetPage}`);
    }

    console.log('\n═══════════════════════════════════════');
    console.log('  完了');
    if (!execute) {
      console.log('  スクショ: /tmp/vanilla-opt-*.png で確認');
      console.log('  本番実行: node vanilla-optimize.js --execute');
    }
    console.log('═══════════════════════════════════════');

  } catch (e) {
    console.error('致命的エラー:', e.message);
    await page.screenshot({ path: '/tmp/vanilla-opt-error.png', fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }
}

main();
