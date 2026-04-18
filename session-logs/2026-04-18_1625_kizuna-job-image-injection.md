# セッションログ: 2026-04-18 絆JOB画像流し込み Phase 1

- 担当: サム
- ブランチ: main

## 作業内容

NOYUTO提供の絆求人素材（`~/vonds-assets/kizuna-recruit-source/`）から厳選17枚を
絆JOB（kizuna-job.com）に流し込み、画像不足ページ9枚を一気に強化。

### 手順
1. 17枚を `~/vonds-assets/kizuna-job-staging/` にピックアップ
2. `scripts/kizuna-job/upload-recruit-assets.js` でWPメディアライブラリに一括UP
   - 17/17成功・IDs 432〜448・合計約7.8MB
   - 結果: `scripts/kizuna-job/kizuna-uploaded-images.json`
3. `scripts/kizuna-job/place-recruit-images.py` で9固定ページに配置
   - 実行前に `scripts/kizuna-job/backups/20260418_1629/` にHTML全件バックアップ
   - XML-RPCでpost_content更新

### 配置結果（before → after）

| ID | slug | before | after |
|----|------|--------|-------|
| 40 | contact | 0 | 2 |
| 220 | qa | 1 | 2 |
| 32 | guarantee | 1 | 3 |
| 34 | security | 1 | 2 |
| 30 | salary | 2 | 4 |
| 38 | mature | 2 | 3 |
| 28 | beginner | 3 | 4 |
| 36 | flow | 3 | 4 |
| 124 | dormitory | 5 | 6 |

### 公開検証
- `GET https://kizuna-job.com/wp-content/uploads/2026/04/main950-250-1.png` → 200 OK
- `GET https://kizuna-job.com/contact/` → 新規画像参照 2件配信中

## Phase 2 スコープ（未着手・KIRYU相談領域）

1. **home (ID 90) 画像0のまま** — len:32しかなくテーマテンプレで描画。
   XML-RPC経由のHTML追記では反映されない可能性大。
   → テーマファイル編集またはウィジェット経由が必要。FTPパス or 管理画面操作要。
2. **残り105枚分の素材** — 今回アップしたのは17枚。
   配置計画の精緻マッピングはバナナ/KIRYU領域（コンテンツ戦略判断）。
3. **動画4本 (mp4)** — 特に `待機寮動画.mp4` (84MB) は重いので
   YouTube/Vimeo埋め込み方式推奨。
4. **PDF/.docx/.psd/.ai 原本** — 内部管理用。Web公開対象外。

## 配置方針（使った原則）

- WPメディアライブラリ（`/wp-content/uploads/`）に集約。
  テーマ `images/` 直置き方式より管理容易・FTPパス不要。
- 既存スクリプト (`fix-contrast-add-images.py`) のヒーロー+セクション画像パターン踏襲。
- 二重挿入防止: 既にURLが含まれているページはスキップ。
- ヒーロー画像: ページ先頭に `max-width:950px/border-radius:16px`
- セクション画像: ページ中盤〜末尾 `max-width:700px/border-radius:12px`

## 現在の状態
Phase 1 完了（9ページ全件画像追加成功・本番反映済み）

## 次にやること
- NOYUTO目視確認: https://kizuna-job.com/{contact,qa,guarantee,security,salary,mature,beginner,flow,dormitory}/
- NGなら `backups/20260418_1629/*.html` から復元スクリプト実行
- OKならPhase 2（home対応・全量アップ・動画対応）をKIRYUと擦り合わせ

## 関連ファイル
- `scripts/kizuna-job/upload-recruit-assets.js` (新規)
- `scripts/kizuna-job/place-recruit-images.py` (新規)
- `scripts/kizuna-job/kizuna-uploaded-images.json` (新規)
- `scripts/kizuna-job/backups/20260418_1629/` (復旧用HTMLバックアップ)
- `~/vonds-assets/kizuna-job-staging/` (ステージング17枚・git外)
