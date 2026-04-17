# サム作業キュー

最終更新: 2026-04-17 12:30 / 発注者: KIRYU

> サムが即起動して上から順に片付ける作業キュー。
> 完了したら `[x]` に変更、`state/*.md` も同時更新。

---

## P0（今日中・クライアント信用に直結）

### 1. A-TRUCK 鈑金ページデプロイ

- [ ] `seo/atruck-repair-content.php` の内容を本番 `functions.php` の末尾に追記
- [ ] 事前バックアップ: `functions.php.bak-before-repair-YYYYMMDD` を作成
- [ ] FTP: 新サーバー IP 218.216.115.31 / WPXサーバー
- [ ] デプロイ後検証:
  - [ ] `/repair/` にアクセスして対応車種・料金表・FAQが画面表示される
  - [ ] Google構造化データテストでFAQPage(8問)発火
  - [ ] h1が「トラック鈑金塗装・修理 | A-TRUCK 市川R&Cセンター」
- [ ] 完了したら `state/atruck-seo.md` 更新＋session-log記録

**何故今か**: コンテンツ(210行)は作成済。デプロイさえ済めば鈑金KW流入が動き出す。クライアント収益直結。

---

### 2. A-TRUCK GTM 3重読込統合

- [ ] Google Tag Manager 管理画面で3コンテナ中身確認
  - GTM-5X6GWL4 / GTM-PG3FF87 / GTM-5PNW7CC3
- [ ] どれが本番運用中か特定 → 残り2本を削除対象に
- [ ] UA-47832247-1（UA・2024/7終了済）をHTML直書きから削除
- [ ] AW-817161945（Google Ads）の重複CV発火（`q3qDCIrW9_cBENnN04UD`）を1回に修正
- [ ] GA4新規発行 → GTM経由配信
- [ ] 完了判定: HTML直書きタグ 0本・GTM 1本運用

**越権注意**: GTM統合方針は KIRYU/NOYUTO 承認済。実装のみサム。

---

### 3. A-TRUCK header.php `<title>` ハードコード削除

- [ ] テーマの header.php から `<title>...</title>` を削除
- [ ] AIOSEO の title 出力に委譲されていることを確認
- [ ] `/rental/` `/repair/` `/company/` などの各ページで title がページ固有になっているか確認

---

## P1（今週中）

### 4. 自動投稿パイプライン棚卸し（`state/sam-automation.md` 記載）

- [ ] dto / vanilla / girlsheaven / kizuna-job / x-cookie-post の cron 生死確認
- [ ] 認証切れ検知の共通モジュール化
- [ ] 画像素材プール残数可視化（dto-variations / vanilla画像）

### 5. ILゲーム v5 Firestoreログ件数確認

- [ ] Firestore コンソールで `rina_sessions` コレクション件数確認
- [ ] 100件到達していればKIRYUに通知 → 月次レビュー起動

---

## P2（余裕があれば）

### 6. A-TRUCK SSL証明書期限切れ対応

- [ ] 相沢さんに更新依頼メール送付（文面はKIRYUドラフト済 `seo/a-truck-php-fpm-restart-request.md` 形式で）

### 7. A-TRUCK LocalBusiness重複最適化（軽微）

- [ ] 拠点ページは当該拠点のみ出力するよう `functions.php` の該当関数を修正
- [ ] `/rental/` のFAQ重複解消（トップと重複）

---

## サムへのルール

- 上から順に処理。飛ばすならKIRYUに理由報告
- 越権範囲（契約・財務・戦略）は触るな
- デプロイ前に必ずバックアップ（`feedback_server_deploy.md`）
- テストは `/tmp/` で実施
