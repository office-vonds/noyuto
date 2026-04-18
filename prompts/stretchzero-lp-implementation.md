# ストレッチゼロ LP 実装指示書
## Claude Code（NOYUTO）向け

---

## 1. 概要

SakuDesignのFigmaデザインをベースに、ストレッチゼロ広告LPをHTML/CSSでコーディングし、stretchzero.jp/lp/ に実装する。

---

## 2. FigmaデザインソースURL

### SakuDesign納品ファイル（デザインベース）
- ファイルキー: `rHTH8GSS47grFlwMqPtWJ3`
- SP版ノード: `61:415`（ストレッチゼロ LP_SP / 375px / 高さ11281px）
- PC版ノード: `61:12`（ストレッチゼロ LP / 1280px / 高さ4489px）
- FV 3パターン: `61:281`（メインビジュアル PC） / `61:675`（メインビジュアル SP）
- ハンバーガーメニュー: `61:808`

### たたき台ワイヤーフレーム（構造・テキスト参照用）
- ファイルキー: `kQfXvYyUXz873eleTtFcop`
- SP版: `4:245`
- PC版: `132:2`
- FC加盟ページ SP: `123:2` / PC: `133:2`
- サンクスページ: `114:68`
- 予約モーダル: `114:4`

---

## 3. URL設計

| ページ | URL | 実装方法 |
|---|---|---|
| 既存ブランドサイト | stretchzero.jp/ | 触らない |
| 広告LP | stretchzero.jp/lp/ | functions.php readfileルーティング |
| FC加盟ページ | stretchzero.jp/fc/ | functions.php readfileルーティング |
| サンクスページ | stretchzero.jp/lp/thanks/ | functions.php readfileルーティング |

---

## 4. デザイントークン

### カラー
- メインカラー: `#FF8C00`（ダークオレンジ）
- 背景ダーク: `#0f0f0f`
- 背景ダーク2: `#1a1a1a`
- 背景ダーク3: `#141414`
- 背景ライト: `#FFF5E6`
- テキスト白: `#ffffff`
- テキストダーク: `#333333` / `#1a1a1a`
- テキストグレー: `#999999`
- グレー（NG比較用）: `#787878`
- FVオーバーレイ: `rgba(0,0,0,0.35)`

### フォント
- 日本語: `Noto Sans JP`（Regular / Medium / Bold / Black）
- 英語ラベル: `Roboto Bold`（セクションラベル用）
- Google Fonts読み込み

### セクションラベル
- 英語・大文字・letterSpacing: 2-3px・カラー: #FF8C00・fontSize: 11-12px

---

## 5. セクション構成（SP版 全19セクション）

### SakuDesignデザインをそのまま使うセクション（14セクション）
1. **FV ヒーロー** - 3パターンカルーセル、バッジ、CTA2つ
2. **誤解払拭** - MOST IMPORTANT、NG/OK比較カード
3. **お悩みチェック** - SYMPTOM CHECK、6項目チェックリスト
4. **通っても戻る理由** - WHY、STEP1/2/3（写真付き）
5. **選ばれる3つの理由** - WHY STRETCH ZERO、01/02/03カード
6. **監修者紹介** - MEDICAL SUPERVISOR、岸先生プロフィール（写真は後日）
7. **ご来店の流れ** - HOW IT WORKS、STEP1-4
8. **料金** - PRICE、初回4,980円、3コース
9. **お客様の声** - REVIEWS、3件カード（テキストはダミー→後日差替）
10. **FAQ** - 5件アコーディオン
11. **店舗情報** - AREA、4店舗（写真・TEL）
12. **最終CTA** - オレンジ背景、電話/Web予約
13. **FC加盟バナー** - フッター前の帯
14. **フッター** - ロゴ、ナビ、コピーライト

### こちらで再設計するセクション（5セクション）
SakuDesignのデザイントークン（色・フォント・余白）に完全に合わせつつ、レイアウト・ビジュアルクオリティを向上させる。

15. **Before & After** - 4枚カードグリッド、写真プレースホルダー
16. **Road Map** - タイムラインUI、1回目/2-3回/4-5回/6-8回、85%継続率バッジ
17. **Price Simulation** - 年間コスト比較（もみほぐし144,000円 vs ゼロ56,000円）
18. **返金保証** - バッジ（3回目終了時点）+ 説明テキスト
19. **打消し表示** - 景表法対応注記テキスト

### 追加UI
- **追従バナー** - 画面下部固定、電話/Web予約ボタン（SP版のみ）
- **予約モーダル** - 全CTAから起動、フォーム項目はワイヤー参照（114:4）

---

## 6. 画像素材

### 本番サイトから取得（期限なし）
- FV背景: `https://stretchzero.jp/wp-content/uploads/2026/02/260205-1790-scaled.jpg`
- 宣材①: `https://stretchzero.jp/wp-content/uploads/2026/02/260205-1351-scaled.jpg`
- 宣材②: `https://stretchzero.jp/wp-content/uploads/2026/02/260205-1901-scaled.jpg`
- 宣材③: `https://stretchzero.jp/wp-content/uploads/2026/02/260205-1102-scaled.jpg`
- 宣材④: `https://stretchzero.jp/wp-content/uploads/2026/02/260205-1623-scaled.jpg`
- 宣材⑤: `https://stretchzero.jp/wp-content/uploads/2026/02/260205-1238-scaled.jpg`
- 宣材⑥: `https://stretchzero.jp/wp-content/uploads/2026/02/260205-1218-1-scaled.jpg`
- 宣材⑦: `https://stretchzero.jp/wp-content/uploads/2026/02/260205-0231-scaled.jpg`
- 宣材⑧: `https://stretchzero.jp/wp-content/uploads/2026/02/260205-0038-scaled.jpg`
- 宣材⑨: `https://stretchzero.jp/wp-content/uploads/2026/02/260205-1762-1-scaled.jpg`
- 宣材⑩: `https://stretchzero.jp/wp-content/uploads/2026/02/260205-1514-scaled.jpg`
- 甲府上石田店: `https://stretchzero.jp/wp-content/uploads/2024/10/201535.jpg`
- 甲斐響が丘店: `https://stretchzero.jp/wp-content/uploads/2024/12/206336.jpg`
- 南アルプス店: `https://stretchzero.jp/wp-content/uploads/2025/08/221681.jpg`
- 韮崎店: `https://stretchzero.jp/wp-content/uploads/2025/08/TOP③-scaled.jpg`
- ロゴ: `https://stretchzero.jp/wp-content/uploads/2025/10/StretchZERO_WideVerB_OL-scaled.png`
- ロゴ白: SakuDesignのFigmaから取得（StretchZERO_WideVerW_OL）

### 未取得（後日）
- 岸先生プロフィール写真 → 中込社長経由
- Before & After写真4枚 → 本気ストレッチ流用 or 新規

---

## 7. 実装手順

### Step 1: SakuDesignのFigmaからget_design_contextでSP版コードを取得
- `Figma:get_design_context` fileKey=`rHTH8GSS47grFlwMqPtWJ3` nodeId=`61:415`
- 返ってきたReact+TailwindコードをHTML/CSSに変換
- SakuDesignのビジュアルを忠実に再現

### Step 2: 5セクションを追加コーディング
- Before & After / Road Map / Price Simulation / 返金保証 / 打消し表示
- SakuDesignのデザイントークンに合わせる
- たたき台ワイヤー（kQfXvYyUXz873eleTtFcop）の108:2〜108:77を参照

### Step 3: PC版レスポンシブ対応
- SakuDesignのPC版（61:12）のレイアウトを参照
- SP版の全19セクションをPC幅（1280px）に展開
- PC版に不足していた10セクションをSP版ベースで追加

### Step 4: インタラクション実装
- 追従バナー（SP版のみ）
- FAQアコーディオン
- 予約モーダル（全CTAから起動）
- FV 3パターンカルーセル
- ハンバーガーメニュー（SP版）

### Step 5: WordPress実装
- WPXサーバー（sv1092.wpx.ne.jp / 183.181.91.93）
- FTPアカウント: stretchzero.jp
- functions.phpにreadfileルーティング追加（/lp/、/fc/、/lp/thanks/）
- 本気ストレッチ（majistretch.com）と同じ方式

### Step 6: GTM・CV計測
- GTMコンテナ: GTM-PKQDTD2Q
- GA4測定ID: G-FN41FNZK8V
- Google Ads CV ID: AW-17857466060
- TELタップCV: ラベル B-njCNDG15gcEMydjcNC
- フォーム送信CV: ラベル nHhKCNvz8ZgcEMydjcNC
- TEL番号形式: `href="tel:0552427011"`（ハイフンなし）
- サンクスページ: /lp/thanks/

---

## 8. 重要な制約

- **NGワード**: 「根本改善」「治療」「腰痛が改善」は使用禁止（本気ストレッチとのカニバリ防止）
- **代替ワード**: 「ケア」「コンディショニング」「ゼロの状態へ」
- **WPXサーバー**: .htaccessは無視される → ルーティングは全てfunctions.phpのPHPフック
- **FTP操作**: Python ftplibのみ使用（curlはbashの!importantエスケープ問題あり）
- **GTM確認手順**: プレビュー＋実CV操作でタグ発火確認必須。推測での「大丈夫」断言は禁止

---

## 9. 残タスク（LP実装後）

- [ ] 岸先生写真入手 → 監修者セクションに差し込み
- [ ] Before & After写真4枚入手 → カードに差し込み
- [ ] お客様の声テキスト → 実データに差し替え
- [ ] FC加盟ページ（stretchzero.jp/fc/）コーディング・実装
- [ ] Google Ads広告配信開始
