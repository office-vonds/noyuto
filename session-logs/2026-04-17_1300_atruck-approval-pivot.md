# セッションログ: 2026-04-17 13:00 A-TRUCK承認プロセス修正

- ブランチ: main
- 指示元: NOYUTO
- 指揮: KIRYU

## NOYUTO指摘（重要）

> A-TRUCK板金塗装ページだが、A-TRUCKさんに改修前にPDFか何かでサンプルを見せつつ、
> なぜ改修するのかという意図を伝える前に作業してはいけない。
> 段階分けするなら、今は確認フェーズ。担当者に送るメール文面（丁寧）を作成すべき。

## KIRYUの構造的ミス

- `tasks/sam-queue.md` P0#1 で「A-TRUCK鈑金ページデプロイ」をサムに発注していた
- クライアント承認なしで本番改修を指示するのは業務ルール違反
- 新デザインツール導入後に同じ構造で動かすと事故が大規模化する

## 対応（今回）

### 1. sam-queue.md P0#1 を停止・承認待ちに格下げ

サムの着手可能範囲を以下に限定:
- コンテンツは既に作成済み（`seo/atruck-repair-content.php` 210行）
- プレビューHTMLは新規作成（`seo/atruck-repair-preview.html`）
- **NOYUTO**: A-TRUCK担当者へ意図説明メール送付（`seo/a-truck-repair-approval-request.md`）
- 承認後のみデプロイ着手

### 2. 承認依頼メール文面作成

`seo/a-truck-repair-approval-request.md`:
- 現状課題の具体化（1,200字・h1英語のみ等）
- 改修内容の明示（対応車種・料金・保険・エリア・FAQ 8問）
- 文字数ビフォーアフター（1,200→3,200字）
- 既存要素は一切削除しない旨の明記
- 料金目安は市場相場ベース案・貴社確定必須であること
- ご確認3点（承認/料金修正/公開タイミング）
- 返信パターン別対応フロー

既存 `seo/a-truck-php-fpm-restart-request.md` のトーン＆フォーマットに揃えた。

### 3. プレビューHTML作成

`seo/atruck-repair-preview.html`:
- atruck-repair-content.php の HTML部分を独立HTMLに抽出
- noindex,nofollow
- 社外秘ヘッダーに「サンプル」「外部非公開」「既存削除なし」を明記
- 料金表に「市場相場ベース案・修正可能」の注記追加
- メール添付で担当者がブラウザで開ける形式

### 4. CLAUDE.md 絶対遵守ルール #8 追加

> クライアント案件の本番サーバー改修は事前承認必須。
> サンプル（HTML/PDF/プレビューURL）と改修意図の説明文をクライアント担当者に送付
> → 書面（メール）で承認を得てからのみ着手。
> UNRYUTO等の自社案件はこの制約対象外。
> 承認内容は session-log に記録すること。

### 5. NOYUTOへの追加アクション差し込み

`tasks/noyuto-1min-actions.md` に A-0 として最優先で配置:
- 承認依頼メール送付（5-10分）
- 送信後KIRYUに通知

## KIRYU 新デザインツール導入についての見解（NOYUTOから求められた）

- UNRYUTO.jp試走は戦略的に正しい（自社案件・失敗責任自社完結・営業素材化の二重メリット）
- ただし**承認プロセス欠陥のまま新ツールを導入すれば事故が大規模化**
- 優先順位: ①A-TRUCK原状復帰（今やった） → ②CLAUDE.md絶対ルール化（今やった）
  → ③ポチ3質問回答でUNRYUTO構想言語化 → ④新ツール到着後 skills/creative-production/ 新設
- 外注デザイナー50%削減は「量産系」に限定。ブランド設計/体験設計は内製化が逆にコストになる

## 現在の状態

- サム作業キュー P0#1 は承認待ちでストップ
- NOYUTO がメール送付すればフローが再開する状態
- CLAUDE.md で今後の同種事故を構造防止

## 次にやること

- **NOYUTO**: `tasks/noyuto-1min-actions.md` A-0 実行（5-10分）
- 承認返信受領後 → KIRYUが state/atruck-seo.md 更新 → サム着手
- （並行）UNRYUTO.jp ポチ3質問への回答準備

## 関連ファイル

- tasks/sam-queue.md（P0#1 停止化）
- tasks/noyuto-1min-actions.md（A-0 追加）
- seo/a-truck-repair-approval-request.md（新規・メール文面）
- seo/atruck-repair-preview.html（新規・プレビューHTML）
- CLAUDE.md（絶対遵守ルール #8 追加）
- state/atruck-seo.md（フェーズ修正）
