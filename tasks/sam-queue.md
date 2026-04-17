# サム作業キュー

最終更新: 2026-04-17 13:40 / 発注者: バナナ（本気ST GTM整理を追加）

> サムが即起動して上から順に片付ける作業キュー。
> 完了したら `[x]` に変更、`state/*.md` も同時更新。

---

## P0（今日中・クライアント信用に直結）

### 0. 本気ストレッチ GTM整理・CVタグ実装 — **新規・NOYUTO承認済み**

**指示書（確定版・このまま実行）**: [`majistretch/tasks/gtm_cleanup_20260417_final.md`](../majistretch/tasks/gtm_cleanup_20260417_final.md)

コンテナ: `GTM-K32XLKXH`

作業内容（4項目）:
- [ ] ① 旧タグ2本を一時停止
  - `Google 広告経由でのTELタップ`（2026/04/02・TEL二重計上原因）
  - `コンバージョン リンカー`（旧・2026/04/02）
- [ ] ② トリガー「予約ボタン_トリガー」修正
  - 誤: `Click URL 含む https://airr...`（発火ゼロ）
  - 正: リンクのみ / `Click URL 含む #reservation` ＋ `{{data-gtm-click}} 含む cta-`（AND）
- [ ] ③ 新規タグ「Google広告_メールタップ」追加
  - CV ID `18057524680` / ラベル `FpUuCN7tzp0cEMjrv6JD` / 値¥500 / JPY
  - トリガー新規「メールタップ_トリガー」: リンクのみ・`Click URL 含む mailto:`
- [ ] ④ プレビューで4CV単発発火確認 → Publish → `majistretch/gtm_container_majistretch.json` 差し替えcommit

**前提確認（NOYUTO承認済み 2026-04-17）**: 予約フローは自社`reservation.php` → `/lp/thanks.html` 完結。Airリザーブ外部遷移ではない。

**越権注意**: CV設計・タグ整理方針はバナナ決定・NOYUTO承認済。サムは実装のみ。

---

### 1. A-TRUCK 鈑金ページデプロイ — **⚠️ 停止中（クライアント承認待ち）**

**2026-04-17 NOYUTO判断で発注撤回。** クライアント承認なしで本番改修するのはNG。
現在フェーズ: **確認フェーズ**（サンプル提示＋意図説明メール送付 → 承認後デプロイ）

サムの作業は以下まで進んで待機:
- [x] コンテンツ作成済み（`seo/atruck-repair-content.php` 210行）
- [x] プレビューHTML生成（`seo/atruck-repair-preview.html`）
- [ ] **NOYUTO**: A-TRUCK担当者へ意図説明メール送付（文面は `seo/a-truck-repair-approval-request.md`）
- [ ] A-TRUCKから承認返信受領
- [ ] **承認後のみ** functions.php統合＋デプロイ着手

**絶対ルール（今後全クライアント案件）:**
- クライアント案件の本番改修は **事前承認なしで着手しない**
- サンプル or PDF or プレビューURLで意図を伝え、書面（メール）で承認を得る
- 承認内容は session-log に記録

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
