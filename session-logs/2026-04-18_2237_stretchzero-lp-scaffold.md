# セッションログ: 2026-04-18 22:37 ストレッチゼロLP実装着手

- セッションID: -（ローカル）
- ブランチ: main
- 担当: KIRYU
- トリガー: NOYUTOが `C:\Users\ozawa\Downloads\stretchzero_lp_implementation_guide.md` を共有

## 作業内容
1. 実装指示書を `prompts/stretchzero-lp-implementation.md` に永続化（8,299 bytes）
2. STATE.mdアクティブ表に「#10 ストレッチゼロ広告LP実装」を追加
3. `state/stretchzero-lp.md` を新設（Figmaソース・URL設計・トークン・19セクション・GTM・残タスクをまとめた単一真実）
4. 作業ディレクトリ作成: `stretchzero/lp/{css,js,assets/images,assets/icons,figma-refs}`
5. 本番サイト(stretchzero.jp)から画像16枚をDL: FV1枚+宣材10枚+店舗4枚+ロゴ1枚（全件成功・計4.2MB）
6. CSS基盤構築:
   - `css/tokens.css`（ブランドカラー・フォント・レイアウトトークン）
   - `css/base.css`（リセット・コンテナ・セクション・SP/PCレスポンシブ基点）
   - `css/components.css`（ボタン/バッジ/カード/チェック/FAQ/モーダル/スティッキー/タイムライン）
   - `css/style.css`（19セクション個別レイアウトの雛形・@import統合）
7. `js/script.js` — FVカルーセル・FAQアコーディオン・モーダル・TEL tap GTM push・ハンバーガー
8. `index.html` — 19セクション＋追従バナー＋予約モーダル＋GTMコンテナ(GTM-PKQDTD2Q)をフル実装

## 現在の状態: 進行中（雛形完了・Figma納品詳細待ち）

## Figma MCP状況（要対応）
- Starterプラン上限到達で get_metadata / get_design_context が弾かれる
- 翌日クォータ回復後に SakuDesign (rHTH8GSS47grFlwMqPtWJ3 / SP=61:415, PC=61:12) を取得予定
- それまではダミーテキスト＋本番画像でレイアウトだけ先行

## 次にやること（優先順）
1. Figma MCPリセット後に get_design_context で SP版(61:415) を取得 → 雛形にビジュアル反映
2. 同様に PC版(61:12) を取得 → レスポンシブ詳細詰め
3. FV 3パターン詳細(61:281 / 61:675) → カルーセルに差し込み
4. 予約モーダルのデザイン(114:4) / サンクス(114:68) / FC加盟(123:2, 133:2)
5. コピーを指示書の「ケア・コンディショニング・ゼロの状態へ」で再校正（NGワード除去）
6. functions.php readfileルーティングを本気ストレッチ方式で準備 → サンプルURLで中込社長承認 → デプロイ
7. GTMプレビュー＋TELタップ・フォーム送信の実CV確認

## 重要制約（本番デプロイ前）
- CLAUDE.mdルール8：クライアント案件本番改修は事前承認必須 → サンプルURL提示 → メール承認 → デプロイ
- NGワード：「根本改善」「治療」「腰痛が改善」 → 使用禁止（本気ストレッチとのカニバリ防止）
- WPX .htaccess無視 → functions.phpのPHPフック必須
- FTPはPython ftplibのみ（curl禁止）

## 関連ファイル
- prompts/stretchzero-lp-implementation.md（受領指示書）
- state/stretchzero-lp.md（プロジェクト単一真実）
- STATE.md（#10行を追加）
- stretchzero/lp/ 以下 一式
