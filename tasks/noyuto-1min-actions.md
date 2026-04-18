# NOYUTO 1分アクション集

最終更新: 2026-04-18 11:20 / まとめ: KIRYU

> NOYUTO本人しか動かせない作業を「その場で1分で完了できる手順」にまで分解したもの。
> 隙間時間に1個ずつ片付ければ、複数プロジェクトが前に進む。

---

## 🔥 最優先（今止まってる・1コマンドで解除できる）

### 🔥 A-0.5. X Cookie 両アカウント再取得（1分×2 = 2分）

rina 55本 + unryuto_ai 6本のストック凍結を解除する。詳細 `tasks/noyuto-cookie-setup.md`

---

### 🔥 A-0.6. Ads Developer Token 即リセット → GCP OAuth 発行 → auth_setup.py 実行（3-5分）

**着手条件**: MCC管理画面 + GCP Console にログイン可能
**所要**: 3-5分（手順書通り）
**止まっている物**: VONDS広告運用MCC の API 統合基盤まるごと（4/17事故で Token を一旦無効化済み）

手順:
1. https://ads.google.com/aw/apicenter → MCC 709-306-3546 → Developer Token を「リセット」
2. GCP Console → OAuth 2.0 クライアントID 発行（Desktop App）→ `client_id` / `client_secret` ダウンロード
3. WSL で `~/credentials/google-ads.yaml` に貼付（雛形は `scripts/vonds-ads-api/credentials.template.yaml`）
4. `python3 scripts/vonds-ads-api/auth_setup.py` 実行 → refresh_token 取得
5. KIRYUに「Ads API 認証通った」と一言

**これが通ればバナナが広告データを24h自動分析・週次レポ自動配信できる状態になる**。

---

### 🔥 A-0.7. HyperFrames v2 テスト動画レンダー確認（30秒）

**着手条件**: 今 bash プロンプト `ozawakiryu0902@NOYUTO2023:~/projects/vonds/video-production/projects/vonds-test$` にいる
**所要**: 30秒

1コマンド実行:
```
npx hyperframes render --output vonds-test-v2.mp4 && explorer.exe vonds-test-v2.mp4
```

Windows側で自動再生される → 20点→何点に上がったかKIRYUにフィードバック。
OKなら各クライアント案件（VONDS LP / UNRYUTO / BAR KOFU / 絆JOB）の本番動画テンプレ化に着手。

---

## A. 会社PCで30秒〜15分で済む作業

### ~~A-0. A-TRUCK 鈑金ページ改修 承認依頼メール送付~~ ✅完了（2026-04-17）

NOYUTOがA-TRUCK担当者へ送付完了。返信受領待ち。
- 返信あり次第 → KIRYUが `state/atruck-seo.md` 更新 → サムに実装発注

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

### A-2. SANKEN ストレッチゼロ KW投入 ＋ CVアクション4本作成（STATE.md #2b）

**着手条件**: 会社PC・Google広告ログイン
**所要**: 15-20分
**状態**: バナナが追加11本+除外11本のCSVを作成済、NOYUTO投入待ちで止まっている

手順:
1. Google広告 → 顧客ID: **854-911-4235** → Google広告エディタ起動
2. `ads-audit/samples/stretchzero/import/` 配下の追加KW CSV・除外KW CSV を一括インポート
3. CVアクション4本（バナナ指示書通り）を手動作成
4. KIRYUに「KW投入 + CV4本作成完了」→ バナナが即PDCA開始

---

### A-3. UNRYUTO Phase 0 外部連携 3点セット（STATE.md #3）

**着手条件**: PC（決済情報・DNS管理画面・X Developer アクセス可能）
**所要**: 合計30-40分（3件まとめて or 1件ずつ）

1. **DNS確認**: お名前.com → unryuto ドメインのAレコード・ネームサーバー確認 → KIRYUに値を教える
2. **Stripe 開設**: https://stripe.com/jp → 個人事業主として登録（UNRYUTO事業・法人化は後回し ref. `memory/project_unryuto_ai_biz_package.md`）→ 公開可能キー(`pk_`)と秘密キー(`sk_`)を KIRYU経由で `~/credentials/stripe-unryuto.env` へ
3. **X API 鍵発行**: https://developer.twitter.com → Basic プラン → Bearer Token と API Key を取得 → `~/credentials/x-unryuto.env` へ

これが揃えば UNRYUTO サイトが完成（DNS切替→Stripe決済→X自動投稿）。

---

### A-4. VONDS SEO 8URL 手動インデックス登録（STATE.md #4 — 観測2週間後）

**着手条件**: GSC vonds.co.jp プロパティログイン
**所要**: 20分（8URL × 2-3分）
**発火条件**: 2026-05-01 以降（権威ページ実装4/17から2週間観測後）

現在 11本中8本が Unknown/Discovered 状態。権威ページ→コラム文脈リンク効果を待ってから手動index。
対象URLリスト: `state/vonds-seo.md` 参照。

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

### B-4. 絆バニラ 画像素材提供（STATE.md #6）

**着手条件**: スマホ・カメラロール
**所要**: 5-10分
**状態**: 6/7ページ更新済、残り1枠は画像素材待ちで止まっている

手順:
1. 店舗外観 or 内装 or 在籍女性バナー（営業中断にならない範囲）の高解像度画像をKIRYU/サムに共有
2. サムが指定枠に配置 → 絆バニラ7/7ページ更新完了

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

### ~~C-2. UNRYUTO X Cookie方式セットアップ~~ (→ 🔥 A-0.5 に統合)

---

### C-3. 4/23(木)13:00 Kayoko Ando氏MTG 事前質問項目準備（STATE.md #10）

**着手条件**: 椅子に座って30分集中できる時間
**所要**: 30-60分
**期限**: 2026-04-22（前日まで）

MTGテーマ: Google Ads API Basic Access審査期間中の戦略相談・MCC 709-306-3546 の運用方針。
詳細: `memory/project_vonds_ads_mcc.md`

準備物:
1. 広告代理店としてAPI統合で実現したい機能リスト（5-10項目）
2. 現在の3クライアント × 各案件の広告運用実績サマリ（バナナに依頼すれば自動生成可能）
3. Basic Access→Standard Access昇格に必要な要件の確認事項

**KIRYUに「MTG準備したい」と言えば**、バナナ実績サマリ生成＋質問項目雛形の作成を自動で回せる。

---

## 運用

- 1件終わるごとに `[x]` に変更
- KIRYUが状態確認して STATE.md 更新
- 完了したら削除
