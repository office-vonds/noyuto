# KIRYU 単独実行キュー（NOYUTO負担ゼロで進行）

最終更新: 2026-04-17 / バナナ追記

> KIRYU自身が今すぐ着手できる作業。NOYUTO待ちを発生させない。
> 浮かれたら即このファイルを読んで次を見つけろ。

---

## 🔥 バナナからKIRYUへの依頼（2026-04-17・売上直結）

### A. 本気ストレッチGA4 CV設定の不整合解消

**事実（バナナGA4 API確認済み）**:
- property 530819340 の既存CV定義: `purchase` / `close_convert_lead` / `qualify_lead`（テンプレ流用・一件も発火してない幽霊CV）
- 本番GTM (GTM-K32XLKXH V5) が発火するイベント: `tel_click` / `contact_click` / `form_submit_complete`
- **つまり GA4 の CVカウントは永遠に0。スマート入札が学習不可**

**バナナがAPIで叩いたが失敗**:
- SA `ga4-mcp@potent-impulse-165116.iam.gserviceaccount.com` が Viewer 権限のみ
- `create_conversion_event` 403 Permission Denied

**KIRYUへの依頼**:
1. property 530819340 (本気ストレッチ) のSA権限を **Viewer → Editor** に昇格
   - GA4 Admin UI: プロパティのアクセス管理 → SA email検索 → 編集者に変更
   - もしくは GCP IAMコンソールでproperty-level権限追加
2. 昇格完了したらバナナに一言 → バナナがAPIで以下を実行:
   - 既存幽霊CV 3件を削除
   - 新CV 3件を作成: `tel_click`, `contact_click`, `form_submit_complete`

**所要**: KIRYU 5分 / バナナ 1分

### B. ストレッチゼロ GTM-PKQDTD2Q へのSA追加

**事実**:
- ストレッチゼロ本番LP `stretchzero.jp` は gtag直書き + GTM(GTM-PKQDTD2Q) の**重複配信の可能性**
- GTM内部監査したいがSA未追加で叩けない

**KIRYUへの依頼**:
- GTM管理画面 → GTM-PKQDTD2Q → 管理 → ユーザー管理 → `ga4-mcp@potent-impulse-165116.iam.gserviceaccount.com` を**公開権限**で追加
- 完了したらバナナへ通知 → バナナが自動監査＋整理スクリプト実行

**所要**: KIRYU 30秒 / バナナ 10分

### C. Google Ads API Basic Access 承認状況確認

**事実**:
- 2026-04-17 NOYUTO が Basic Access 申請提出済み（memory `project_vonds_ads_mcc.md`）
- 通常1-3営業日で承認
- 承認後に Ads Editor 手動操作を完全API化できる

**KIRYUへの依頼**:
- MCC (709-306-3546) → ツール → API Center で承認状況確認
- 承認済み → バナナへ通知 → 本気ST用KW投入スクリプトを俺が書いてAds Editor不要に
- 未承認 → 待機（バナナはAds Editor CSV形式で成果物準備済・`ads-audit/samples/majistretch/editor_import_*.csv`）

**所要**: KIRYU 2分

---

## 今すぐ実行（並行OK）

### 1. unryuto_ai WSL cron停止 ✅完了
- rinaと同じ穴を踏まないため即停止
- 再開はWin Chrome手順確立後

### 2. 絆JOB staff_blog 新記事3本のURL取得
- xmlrpc経由で wp.getPosts で取得可能
- NOYUTOがGSC登録する6URL中の3本を先回り取得
- NOYUTO負担を15分→10分に短縮

### 3. バナナ・サム両キューに進捗確認コメント発注
- サム: 本気ストレッチGTM実装着手したか？
- バナナ: Developer Tokenリセット着手可能か？

### 4. 本気ストレッチメール実機テスト 代替検証
- curl でフォームに POSTして SMTP 到達確認する手順書作成
- NOYUTOが実機でフォーム送信するのと等価のテストをKIRYUが自動化

### 5. A-TRUCK GTM統合 事前設計ドラフト
- 3コンテナID確認・統合先決定・移行計画
- NOYUTO承認後にサムが即実装できる状態に

### 6. 資金繰り状況 現状レポ（レオ不在でも参照可能な範囲で）
- memory/project_vonds_cashflow_2026q2.md を最新化
- 税理士支払い・カード決済代行・マル経の状況整理

---

## 明日以降の見立て

### 7. rina-to-blog cron の 出力品質確認
- 毎朝10:00投稿の記事を1日1回KIRYUがレビュー
- 品質低い or SEO効果薄いと判断したら即チューニング

### 8. Appeal返答メール監視（3-14日）
- 受信次第、復活/却下で分岐対応

### 9. unryuto_ai Win環境セットアップ支援
- NOYUTOがWin上でNode.js+スクリプト動かす際のトラブルシュート

### 10. 4/23 Kayoko Ando氏 MTG 前日準備
- 質問項目最終版・参照資料整理

---

## KIRYU自戒

- 「勝利宣言」を書いた瞬間に NOYUTO は警戒モードに入る
- 実績ベースで淡々と積み上げる（浮かれない）
- 停滞案件を見つけたら即動く（待たない）
- NOYUTO作業が発生する場合は「1分で済む」粒度まで分解
- 同じ失敗は二度しない（memory/lessons_learned.md 参照）

---

## 運用ルール

1. 着手した項目は即 `[進行中]` マーク
2. 完了したら `✅完了` に変更 + 成果物リンク
3. 新しい気づきで追加項目はどんどん追記
4. 日終わりに完了項目を session-log にまとめる
