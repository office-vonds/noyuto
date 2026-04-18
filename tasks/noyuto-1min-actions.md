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

### 🔥 A-0.8. GA4 property 530819340 (本気ストレッチ) SA権限 Viewer→Editor 昇格（5分）

**事実**: 本気ストレッチの既存CV定義(purchase/close_convert_lead/qualify_lead)は**全部幽霊CV**（一度も発火してない）。本番GTMが発火する実イベント (tel_click/contact_click/form_submit_complete) をGA4 CV化しないと**スマート入札が永遠に学習不可**。バナナがAPIで修正したいが **SA権限 Viewer**で403で弾かれた。

**NOYUTOの1分手順**:
1. https://analytics.google.com → プロパティ 530819340 (本気ストレッチ) 選択
2. 管理 → プロパティのアクセス管理 → 検索: `ga4-mcp@potent-impulse-165116.iam.gserviceaccount.com`
3. 役割を **編集者** に変更 → 保存
4. KIRYUに「GA4 SA昇格完了」と一言 → バナナが幽霊CV削除+実CV 3件自動作成

**所要**: NOYUTO 5分 / バナナ 1分（昇格後は全自動）

---

### 🔥 A-0.9. GTM-PKQDTD2Q (ストレッチゼロ) SA 公開権限追加（30秒）

**事実**: ストレッチゼロ本番LPは gtag直書き + GTM(GTM-PKQDTD2Q) の**重複配信の可能性**。監査・整理したいが SA未追加で GTM API が叩けない。

**NOYUTOの1分手順**:
1. https://tagmanager.google.com → アカウント → コンテナ GTM-PKQDTD2Q
2. 管理 → ユーザー管理 → `+ユーザーを追加`
3. メール: `ga4-mcp@potent-impulse-165116.iam.gserviceaccount.com`
4. 権限: **公開** → 追加
5. KIRYUに「GTM SA追加完了」→ バナナが自動監査+整理10分で完了

**所要**: NOYUTO 30秒 / バナナ 10分

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

### A-5. A-TRUCK GTM統合 承認依頼メール送付（1分）

**着手条件**: Gmail ログイン済み
**所要**: 1分（文面コピペ→送信）
**文面**: `seo/a-truck-gtm-consolidation-approval-email.md` （KIRYU作成済み・そのまま送付可）

3つのGTMコンテナ統合・UA削除・CV重複修正・GA4新規発行 の承認依頼。
費用追加なし・月次運用保守内で実施。

手順:
1. `seo/a-truck-gtm-consolidation-approval-email.md` を開く
2. 「本文」セクションの `---` から `---` までをコピー
3. Gmail で新規メール → 宛先: A-TRUCK担当者 / 件名: 「【オフィスVONDS】GTM計測基盤の整理統合に関するご提案」 / 本文貼付 → 送信
4. KIRYUに「A-TRUCK GTM統合メール送付完了」と一言

---

### A-6. A-TRUCK 3 GTMコンテナ SA 読み取り権限付与（30秒×3 = 90秒）

**着手条件**: GTM管理画面ログイン
**所要**: 90秒
**目的**: A-5承認到着前に KIRYU がメインコンテナ判定を先回り完了させる

3つのコンテナ: `GTM-5X6GWL4` / `GTM-PG3FF87` / `GTM-5PNW7CC3` それぞれに:
1. 管理 → ユーザー管理 → ユーザー追加
2. メール: `ga4-mcp@potent-impulse-165116.iam.gserviceaccount.com`
3. 権限: **読み取り**（公開権限は不要）
4. 追加

3コンテナ完了で KIRYU に「A-TRUCK GTM SA追加完了」と一言 → API監査30分で Phase 1-B 完了。

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

### C-4. A-TRUCK SEO Phase 次施策 承認判断（売上直結・バナナ分析済み）

**事実**: バナナのGSC 28日分析で具体的改修対象URL特定済。想定効果**月130-300クリック増**。

| KW | Imp/月 | 現順位 | 施策 |
|---|---:|---:|---|
| 積載車レンタル | 1,826 | #8.4 | `/rental/list/3t_wide_long_loader/` のtitle/h1強化 |
| トラックレンタル | 541 | #9.3 | `/rental/list/` title+コピー強化 |
| 冷凍車レンタル | 209 | **#2.9** | `/rental/` あと一押しで#1 |

**NOYUTOの判断事項**（口頭1分）:
1. Phase 次施策として着手 → YES/NO
2. クライアント相沢様への事前承認サンプル送付 → YES/NO（CLAUDE.md rule #8）

YESならKIRYUが即承認メール文面作成→NOYUTO送付→承認後サム実装。
詳細: `ads-audit/weekly-reports/majistretch-atruck-gsc-analysis-20260417.md`

---

### C-5. 本気ストレッチ ブランド名#1取得 戦略判断

**事実**: 「本気ストレッチ」で自ブランド名なのに **Position #3.6**（1位取れてない異常事態）。ストレッチゼロが同山梨エリアで独占してる疑い。

**NOYUTOの判断事項**（口頭2分）:
1. ブランド名#1取得を優先施策化するか
2. 手段の選択:
   - LPのtitle/h1に「本気ストレッチ 甲府上阿原店」必須明示（サム実装）
   - Google広告でブランド指名KW(「本気ストレッチ」「マジストレッチ」) tCPA超低設定で死守（バナナ実装）
   - GBP整備（別タスクで手動作業必要）

YESなら3手同時発火。

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
