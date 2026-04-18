# A-TRUCK GTM 3重読込 統合計画（実装指示書・完全版）

作成: 2026-04-17 / KIRYU
更新: 2026-04-19 / KIRYU（サム即実装レベルへ拡充）
承認フロー: CLAUDE.md #8 準拠（クライアント事前承認必須）

関連:
- 承認依頼メール: `seo/a-truck-gtm-consolidation-approval-email.md`（NOYUTO送付待ち）
- サムキュー: `tasks/sam-queue.md` #2
- 現状: `state/atruck-seo.md`

---

## 現状（state/atruck-seo.md より）

| # | ID | 種別 | 状態 |
|---|---|---|---|
| 1 | GTM-5X6GWL4 | GTMコンテナ | 稼働中（役割不明） |
| 2 | GTM-PG3FF87 | GTMコンテナ | 稼働中（役割不明） |
| 3 | GTM-5PNW7CC3 | GTMコンテナ | 稼働中（役割不明） |
| 4 | UA-47832247-1 | Universal Analytics | **2024/7終了済・要削除** |
| 5 | AW-817161945 | Google Ads | **CV重複あり**（`q3qDCIrW9_cBENnN04UD` 2回発火）|
| 6 | G-?????? | GA4 | **未導入** |

## 問題点

1. 3GTMコンテナ並列 → ページ速度低下・計測データ分散
2. UA直書きが終了済みなのにHTMLにゴミとして残存
3. AW直書き＋GTM内CVで重複発火 → CV水増し → スマート入札が誤学習
4. GA4未導入 → 2025年以降の標準解析データ蓄積ゼロ

---

## 統合方針（NOYUTO承認済・2026-04-15）

1. GTM管理画面で3コンテナの中身を確認→1つに統合
2. UA/AWの直書きタグを削除→GTM内で一元管理
3. GA4新規設定→GTM経由で配信
4. CV重複修正

---

## Phase 1: 監査・メインコンテナ決定（KIRYU+バナナ作業・承認依頼前）

### 1-A. SA読み取り権限付与をNOYUTOへ依頼

**依頼先タスク**: `tasks/noyuto-1min-actions.md` A-6（既存・90秒作業）

3コンテナ全てに `ga4-mcp@potent-impulse-165116.iam.gserviceaccount.com` を **読み取り**権限で追加してもらう。これでPhase 1-Bの自動監査が可能になる。

### 1-B. 自動監査スクリプト実行（バナナ担当）

SA付与後、以下コマンドで3コンテナ一括監査:

```bash
cd ~/projects/vonds/scripts/gtm-audit/  # 未整備の場合は新規作成
python3 audit_container.py --container GTM-5X6GWL4
python3 audit_container.py --container GTM-PG3FF87
python3 audit_container.py --container GTM-5PNW7CC3
```

出力項目（コンテナ毎）:
- タグ数・発火トリガー数・変数数
- 作成日・最終更新日・最終バージョン番号
- Google Ads CVタグの有無・発火条件
- GA4設定タグの有無
- カスタムHTML/カスタムJS一覧
- 直近30日のタグ発火実績（GTM Insights API）

### 1-C. メインコンテナ判定ロジック

以下の重み付けスコアで判定。スコア最高のコンテナを**メイン採用**:

| 項目 | 配点 |
|---|---:|
| タグ数 | 30 |
| 最終更新日が30日以内 | 25 |
| Google Ads CVタグ設定あり | 25 |
| GTM内のバージョン数が10以上（運用履歴） | 10 |
| カスタムタグが実装されている | 10 |

スコア同点の場合 → NOYUTOヒアリング（3コンテナの作成経緯を知っている可能性）

### 1-D. 監査結果レポート作成

`seo/a-truck-gtm-audit-report-20260419.md` に以下を記録:
- 3コンテナのスコアリング表
- メインコンテナ決定と理由
- 削除対象2コンテナの棚卸し（重複タグ・移行不要タグの整理）
- GA4未導入の影響試算（2024/7〜現在の機会損失）

---

## Phase 2: クライアント承認取得（NOYUTO作業）

### 2-A. 承認依頼メール送付

`seo/a-truck-gtm-consolidation-approval-email.md` をそのままコピペしてA-TRUCK担当へ送付。

### 2-B. 承認受領後の判断分岐

| 返信内容 | 次のアクション |
|---|---|
| **承認（即時可）** | Phase 3着手・作業日程調整 |
| **承認（特定日指定）** | 指定日まで待機・当日Phase 3 |
| **GAアカウント所有者不明と返答** | SANKEN本社へ確認 or A-TRUCK単独アカウント新規作成の可否確認 |
| **保留** | 1週間後追い連絡・返信なければ `state/atruck-seo.md` に保留記録 |
| **却下** | Phase凍結・`state/atruck-seo.md` に記録 |

---

## Phase 3: メインコンテナ統合（サム作業）

### 3-A. 作業前バックアップ（必須・省略禁止）

```bash
# サーバー側バックアップ
ssh a-truck-server
cd /var/www/a-truck.jp/wp-content/themes/atruck
cp functions.php functions.php.bak-before-gtm-20260419
cp header.php header.php.bak-before-gtm-20260419
cp footer.php footer.php.bak-before-gtm-20260419

# ローカルにも保存
cd ~/projects/vonds/seo/a-truck-backup-20260419/
# FTPで該当3ファイルDL
```

バックアップ確認コマンド:
```bash
ls -la /var/www/a-truck.jp/wp-content/themes/atruck/*.bak-before-gtm-*
# 3ファイル表示されればOK
```

### 3-B. メインコンテナへのタグ集約（GTM UI作業）

削除対象2コンテナから以下を**メインにコピー**（直接エクスポート→インポートで安全）:

1. **エクスポート**: 削除対象コンテナ → 管理 → コンテナのエクスポート → JSON保存
2. **インポート**: メインコンテナ → 管理 → コンテナのインポート → マージ
3. **重複削除**: 同一タグ・トリガー・変数の重複をメインコンテナ側で手動整理

対象タグリスト（Phase 1監査結果から自動生成・ここは1-B結果で埋める）:
- [ ] Google Ads CVタグ（メイン化・重複解消）
- [ ] [その他タグ1]
- [ ] [その他タグ2]

### 3-C. GA4プロパティ新規発行

**GAアカウント特定**: Phase 2で確認済（SANKEN or A-TRUCK単独）。

GA4新規プロパティ作成手順:
1. https://analytics.google.com → 管理 → アカウント選択 → プロパティ作成
2. プロパティ名: `A-TRUCK（a-truck.jp）`
3. レポートのタイムゾーン: `日本 (GMT+09:00)`
4. 通貨: `円 (JPY)`
5. 業種: `自動車` or `ビジネス・産業市場`
6. ビジネス規模: `小規模（従業員1-10）`← 要NOYUTO確認
7. 利用目的: `顧客の利用状況を分析` / `広告費用を最適化` / `マーケティング効果を検証`
8. データストリーム作成: ウェブ → URL `https://www.a-truck.jp` → ストリーム名 `a-truck.jp`
9. **測定ID `G-XXXXXXXXXX` を記録** → `state/atruck-seo.md` へ保存

拡張計測（推奨ON）:
- ページビュー・スクロール・離脱クリック・サイト内検索・動画エンゲージメント・ファイルダウンロード

### 3-D. GTMメインコンテナへGA4タグ追加

1. メインコンテナ → タグ → 新規 → **Google アナリティクス: GA4 設定**
2. 測定ID: `G-XXXXXXXXXX`（3-Cで取得）
3. トリガー: `All Pages`
4. タグ名: `GA4 Config - a-truck.jp`
5. 保存

### 3-E. CV重複修正（AW-817161945）

1. GTMメイン → タグ → 既存の `q3qDCIrW9_cBENnN04UD` CVタグを検索
2. 発火条件を確認 → `All Pages` など誤設定になっていないかチェック
3. 正しい発火条件（例: フォーム送信成功時・電話クリック時）に修正
4. Google Ads管理画面 → 目標 → コンバージョン → `q3qDCIrW9_cBENnN04UD` 編集
5. 「重複の計上」設定を `1回のみ` に変更

### 3-F. SA追加（バナナ監査用）

メインコンテナ → 管理 → ユーザー管理 → ユーザー追加:
- Email: `ga4-mcp@potent-impulse-165116.iam.gserviceaccount.com`
- 権限: **公開**（監査＋修正実行のため）

---

## Phase 4: HTML側修正（サム作業）

### 4-A. header.php から直書き削除

対象ファイル: `/var/www/a-truck.jp/wp-content/themes/atruck/header.php`

**削除対象ブロック**:

```html
<!-- 削除1: UA-47832247-1 直書き -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-47832247-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'UA-47832247-1');
</script>

<!-- 削除2: AW-817161945 直書き -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-817161945"></script>
<script>
  gtag('config', 'AW-817161945');
</script>

<!-- 削除3: 削除対象GTMコンテナ2本（IDは Phase 1-C 決定後に確定） -->
<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-PG3FF87');</script>
<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-5PNW7CC3');</script>
```

※ GTM-5X6GWL4がメインと決まった場合の例。メインが違えばそれ以外の2つを削除。

### 4-B. 残すGTMスニペット（メインコンテナ1本のみ）

header内 `<head>` 直後:
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->
```

body直後:
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

### 4-C. デプロイ

1. 修正版 header.php を FTP でアップロード
2. WPキャッシュクリア（WP-Rocket等使っていれば）
3. CDNキャッシュパージ（使用中の場合）
4. `curl -s https://www.a-truck.jp/ | grep -E "(GTM-|UA-|AW-)"` で残存タグ確認

---

## Phase 5: 検証（サム＋KIRYU共同）

### 5-A. Tag Assistant で発火確認

Chrome拡張「Tag Assistant Legacy (by Google)」 or 「Tag Assistant Companion」で:

1. https://www.a-truck.jp/ を開く
2. Tag Assistant 起動 → 記録開始
3. ページ遷移3-5ページ実施
4. 記録停止 → 発火タグ一覧確認

**合格基準**:
- GTMコンテナ: **1本のみ** 読込
- GA4: `All Pages` で全ページ発火
- Google Ads CV: **1回のみ**（重複なし）
- UA: **0回**（完全削除）

### 5-B. Google Ads CV数の48時間監視

1. Google Ads → 目標 → コンバージョン
2. `q3qDCIrW9_cBENnN04UD` の過去7日平均CV数を記録（Before値）
3. デプロイ後48時間のCV数を同期比較（After値）

**判定**:
- After/Before ≒ 0.5 付近 → **重複解消成功**（本来の数値に戻った）
- After/Before ≒ 1.0 → 重複未解消 or 別要因のCV減少 → 再調査
- After が極端に少ない（0.1以下） → CV取り逃し → **即ロールバック検討**

### 5-C. GSC / 構造化データ影響確認

1. Google 構造化データテストツールで LocalBusiness/Service/FAQPage が引き続き出力されるか
2. GSC カバレッジレポートで急激な除外URL増加がないか（1週間観察）
3. PageSpeed Insights で速度改善が実測できるか（Before/After比較）

### 5-D. クライアント報告

デプロイから1週間後、以下を `seo/a-truck-gtm-consolidation-report-YYYYMMDD.md` にまとめて担当者へ送付:
- 作業完了報告
- Tag Assistant検証スクリーンショット
- GA4データ蓄積開始の確認
- Google Ads CV数の正常化
- ページ速度改善実測

---

## ロールバック手順（3段階）

### Level 1: GTM設定のみロールバック（10分・最軽度）

GTMメインコンテナ → 管理 → バージョン履歴 → 前バージョンに戻す → 公開

### Level 2: HTML直書き復旧（30分・中度）

```bash
ssh a-truck-server
cd /var/www/a-truck.jp/wp-content/themes/atruck
cp header.php.bak-before-gtm-20260419 header.php
# WPキャッシュクリア
```

### Level 3: 全ファイル完全復旧（60分・重度）

```bash
cp functions.php.bak-before-gtm-20260419 functions.php
cp header.php.bak-before-gtm-20260419 header.php
cp footer.php.bak-before-gtm-20260419 footer.php
# WPキャッシュ・CDNキャッシュ全クリア
```

ロールバック実施時は `state/atruck-seo.md` に記録、原因究明後に再挑戦計画。

---

## 作業所要時間見積

| Phase | 担当 | 所要時間 |
|---|---|---:|
| 1-A SA権限付与 | NOYUTO | 90秒 |
| 1-B 自動監査 | バナナ | 30分 |
| 1-C 判定 | KIRYU | 15分 |
| 1-D レポート | KIRYU | 30分 |
| 2 承認取得 | NOYUTO | 1分送付+返信待ち1-7日 |
| 3-A バックアップ | サム | 10分 |
| 3-B-F GTM統合 | サム | 90分 |
| 4 HTML修正 | サム | 30分 |
| 5 検証 | サム+KIRYU | 60分（+48時間監視） |
| **合計稼働時間** | | **約4時間**（48h待機除く） |

---

## 現在のステータス

- [x] 事前設計書作成（このファイル・2026-04-17初版）
- [x] 実装指示書レベルまで拡充（2026-04-19 KIRYU）
- [ ] NOYUTO A-6実施（SA読み取り権限付与）
- [ ] バナナ Phase 1-B 自動監査実施
- [ ] KIRYU Phase 1-C 判定・1-D レポート
- [ ] NOYUTO Phase 2 承認依頼メール送付
- [ ] A-TRUCK 承認受領
- [ ] サム Phase 3-4 実装
- [ ] サム+KIRYU Phase 5 検証

## 関連

- `state/atruck-seo.md` — A-TRUCK SEO全体状況
- `tasks/sam-queue.md` #2 — サム実装タスク
- `tasks/noyuto-1min-actions.md` A-6 — NOYUTO 90秒作業
- `seo/a-truck-gtm-consolidation-approval-email.md` — 承認依頼メール文面
- `memory/reference_atruck_server.md` — サーバー接続情報
- CLAUDE.md #8 — クライアント案件本番改修の承認必須ルール
