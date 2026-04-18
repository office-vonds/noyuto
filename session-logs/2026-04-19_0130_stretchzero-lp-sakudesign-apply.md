# セッションログ: 2026-04-19 01:30 ストレッチゼロLP SakuDesign確定反映

- ブランチ: main
- 担当: KIRYU（NOYUTO就寝中・委任作業）

## トリガー
NOYUTO「君ができることはやってくれ。俺は寝る」指示。
Figmaファイル複製（`fnvoryJ7p7Vtuvhmy65Cqi`）を小沢宗弘のチーム(Proプラン)に移動済みで MCP rate limit 突破。

## 作業内容
1. **Figma MCP認証確認**: `office.vonds@gmail.com` / 小沢宗弘のチーム / Pro / Full seat
2. **get_metadata**: SP版(61:415) 375x11281px 全セクション構造取得成功
3. **get_screenshot**: SP版全体ビジュアル取得・ダーク基調+オレンジアクセント確認
4. **HTML全書き換え** (`stretchzero/lp/index.html`):
   - SakuDesign確定コピー全19セクション反映
   - NGワード「根本からの改善」→「再現性のあるコンディショニング」に置換（ルール8カニバリ防止）
   - 4店舗TEL個別化（甲府/甲斐/南ア/韮崎）
   - 初回60分体験 4,980円・通常7,980円・3,000円OFF・WEB予約限定バッジ
   - 岸邦彦先生（国際資格保有トレーナー第一人者）プロフィール構造
   - WHY施術フロー(STEP1-3): カウンセリング→オーダーメイド施術→セルフケア指導
   - WHY STRETCH ZERO(01/02/03): 理学療法士監修 / 再現性コンディショニング / 4店舗
   - HOW IT WORKS(STEP1-4): ご予約→カウンセリング→パーソナル施術→セルフケア指導
   - REVIEWS: 3件カード（仮コピー・あとで実データ差替え）
   - FAQ: 6項目（Q/Aマーク付き）
   - Before&After: 4枚（写真プレースホルダー）
   - ROAD MAP: 1回目/2-3回/4-5回/6-8回 + 85%継続バッジ
   - PRICE SIM: 144,000円/年 VS 56,000円
   - 返金保証: 3回目終了時点・全額返金シール
   - FC加盟: 神奈川・静岡・長野・山梨
   - 打消し: 延べ数千人実績注記・個人差あり注記・税込・個人の感想
   - フッター: SANKEN株式会社 2026 / プライバシーポリシー・特商法・運営会社リンク
   - 追従バナー: 電話で予約 / Webで予約（特別価格）
   - 予約モーダル: 7項目フォーム（お名前/フリガナ/電話/メール/店舗/日/メモ）

5. **CSS全書き換え** (`stretchzero/lp/css/components.css`):
   - SVGマスクチェックアイコン（オレンジ丸地に白チェック）
   - FVバッジ2種（fill / outline）
   - NG vs OK compare カード
   - 3つの理由レイアウト（偶数番は画像左右反転・PC）
   - 監修者プロフィール（写真+名前+役職+タグ+本文）
   - HOW IT WORKS 2x2グリッド（SP）/ 1x4グリッド（PC）
   - PRICE: 初回体験ヒーローカード + 3コースカード + 返金保証バッジ
   - ROAD MAP: 左オレンジバー+番号バッジ+タイトル+説明 + 85%グラデバッジ
   - PRICE SIM: 3カラム対比（もみほぐし / VS / ゼロ）
   - Guarantee: 円形シール（ラジアルグラデ + 回転）
   - FC: オレンジ帯
   - Footer: 黒背景・ナビ・ロゴ・法的リンク
   - Sticky CTA: SP固定2ボタン
   - Modal: 下からスライドアップ（SP）/ センター（PC）
   - Form: ラベル・入力欄・必須バッジ

6. **style.css 整理**: 個別セクション定義を components.css に集約 → @import 3本のみ

7. **健全性検証**:
   - http://localhost:8088/lp/ 全アセット200応答
   - HTML 32,532 bytes
   - CSS/JS/画像すべて疎通OK

## 現在の状態: プレビュー可能・SakuDesign確定反映完了・NOYUTO承認待ち

## 次にやること（優先順）
1. NOYUTO確認（起床後） → http://localhost:8088/lp/ でプレビュー
2. Figma `get_design_context` で微細なデザイントークン（正確な余白・角丸・フォントサイズ）詰め
3. PC版ノード(61:12)取得 → レスポンシブ詳細確認
4. 岸先生写真・Before&After写真・お客様の声実データ入手（中込社長/SANKEN経由）
5. たたき台ワイヤーファイル(`kQfXvYyUXz873eleTtFcop`)も小沢宗弘のチームに複製依頼 → FC加盟ページ(/fc/)・サンクスページ(/lp/thanks/)・予約モーダル詳細取得
6. WPX functions.php readfileルーティング実装（本気ストレッチ方式）
7. サンプルURL提示 → 中込社長メール承認 → 本番デプロイ
8. GTM プレビュー+ 実 CV 発火確認（TELタップ/フォーム送信）
9. Google Ads 配信開始

## 関連ファイル
- `stretchzero/lp/index.html` — 19セクション+追従+モーダル
- `stretchzero/lp/css/{tokens,base,components,style}.css`
- `stretchzero/lp/js/script.js`
- `stretchzero/lp/assets/images/` — 本番16枚DL済み
- `state/stretchzero-lp.md` — Step進捗チェックリスト
- `prompts/stretchzero-lp-implementation.md` — 受領指示書

## 重要制約リマインド
- ルール8: 本番デプロイ前に中込社長のメール承認必須
- NGワード「根本改善」「治療」「腰痛が改善」使用禁止 → 代替「ケア」「コンディショニング」「ゼロの状態へ」
- WPX .htaccess 無視 → functions.php PHPフックでルーティング
- FTP は Python ftplib のみ（curl禁止）
- 予約フォーム送信は GAS 経由（feedback_form_architecture.md 準拠・mu-plugins禁止）
