# NOYUTO 1分アクション集

最終更新: 2026-04-17 12:30 / まとめ: KIRYU

> NOYUTO本人しか動かせない作業を「その場で1分で完了できる手順」にまで分解したもの。
> 隙間時間に1個ずつ片付ければ、複数プロジェクトが前に進む。

---

## A. 会社PCで30秒〜10分で済む作業

### ~~A-0. A-TRUCK 鈑金ページ改修 承認依頼メール送付~~ ✅完了（2026-04-17）

NOYUTOがA-TRUCK担当者へ送付完了。返信受領待ち。
- 返信あり次第 → KIRYUが `state/atruck-seo.md` 更新 → サムに実装発注

---

### 🔥 A-0.5. X Cookie 両アカウント再取得（1分×2 = 2分・最優先）

**着手条件**: Chrome で X.com にログイン済み・WSL Ubuntu が開ける
**所要**: 2分（rina 30秒 + unryuto_ai 30秒 + コマンド実行）
**詳細手順**: `tasks/noyuto-cookie-setup.md`

これを実行すれば **rina 55本 + unryuto_ai 6本 = 計61本の投稿ストック** が即再開。
現在両方とも401で完全停止中。これを叩かないと稼働率ゼロ。

手順サマリ:
1. Chrome → x.com → @rina_xxxfree ログイン状態 → F12 → Cookies → auth_token と ct0 コピー
2. WSL で `cd ~/projects/vonds && node rina/x-cookie-post.js --setup` 実行・貼り付け
3. 同様に @unryuto_ai → `node unryuto/x-posts/x-cookie-post.js --setup`
4. KIRYUに「Cookie両方入れた」と一言

---

### A-1. ストレッチゼロ Google広告CSV 7本DL

**着手条件**: 会社PC・Google広告ログイン済み
**所要**: 10-15分
**置き場**: `ads-audit/samples/stretchzero/data/`

手順:
1. Google広告にログイン → 顧客ID: **854-911-4235** (ストレッチゼロ)
2. 以下7本を CSV エクスポート:
   - キャンペーン（全期間）
   - 広告グループ（全期間）
   - キーワード（全期間）
   - 検索語句（直近90日）
   - 除外KW
   - 広告（アセット含む）
   - 設定（地域・時間帯）
3. `ads-audit/samples/stretchzero/data/` に配置してpush
4. KIRYUに「CSV置いた」とひとこと → 74チェック監査が自動発火（30-60分で完成）

**詳細手順書**: `ads-audit/samples/stretchzero/EXPORT_CHECKLIST.md`

---

## B. スマホで30秒〜3分で済む作業

### B-1. 本気ストレッチ お問合せメール実機テスト

**着手条件**: スマホ or PC・ブラウザ
**所要**: 2-3分

手順:
1. https://majistretch.com/lp/index.html#contact にアクセス
2. 問合せフォームを送信（テスト用内容でOK）
3. 以下2箇所に着信確認:
   - `info@majistretch.com`
   - `yuki.nakagomi@sanken-gr.com`
4. 届いたらKIRYUに「メールテストOK」

**何故今か**: PHPMailer+Google Workspace SMTP化(4/8)してから実機テスト未実施。本番のCV機能がunknownのまま。

---

### B-2. 絆JOB GSC 手動インデックス登録

**着手条件**: Google Search Console (kizuna-job.com) ログイン
**所要**: 15分
**対象URL 6本**:

手順:
1. GSCにログイン → プロパティ: kizuna-job.com
2. URL検査ツールに以下を1本ずつ貼る → 「インデックス登録をリクエスト」
   - 各URLは `session-logs/2026-04-15_1140_kizuna-seo-phase2.md` 参照
3. 6本終了後、KIRYUに「絆JOBインデックス登録完了」

**重要**: GSC APIにこの機能は存在しない（`reference_gsc_api_limits.md`）。NOYUTO手動が唯一の道。

---

### B-3. 絆バニラ 口コミ返信 手動投稿

**着手条件**: バニラ管理画面ログイン
**所要**: 返信ドラフト準備済なら各3分

手順:
1. `state/vanilla-optimize.md` or `session-logs/2026-04-15_1840_vanilla-optimize.md` で返信ドラフト確認
2. バニラ管理画面 → 口コミ一覧 → 返信ボタン
3. ドラフトをコピペして送信

---

## C. 口頭判断で進む作業

### C-1. ILゲーム事業分析 5つの質問

**着手条件**: KIRYUに「ILゲーム5問答える」と言うだけ
**所要**: 15-30分（口頭）
**保留の根本原因**: NOYUTO口頭待ち

質問はKIRYUが保管。いつでも起動可能。

---

### C-1.5. UNRYUTO ブランド定義ドラフト 赤入れ（30分で決着できる4問）

**着手条件**: ブラウザでMarkdown読めればOK
**所要**: 30分
**置き場**: `unryuto/docs/brand-definition-draft.md`

NOYUTO確認事項セクションの Q1〜Q4 にYES/NO + 補足記入するだけ。
これがあれば新AIデザインツールリリース当日に `skills/creative-production/SKILL.md` ＋ UNRYUTO試走が即走れる。

---

### C-2. UNRYUTO X Cookie方式セットアップ

**着手条件**: PC・X.comログイン
**所要**: 1分

手順:
1. X.com にログインした状態で DevTools → Application → Cookies → x.com
2. `auth_token` と `ct0` の値をコピー
3. KIRYUに「Cookie貼る」と言えばサムが即セットアップ

---

## 運用

- 1件終わるごとに `[x]` に変更
- KIRYUが状態確認して STATE.md 更新
- 完了したら削除
