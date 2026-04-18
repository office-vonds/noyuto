# state/stretchzero-lp.md — ストレッチゼロ広告LP実装

最終更新: 2026-04-18 22:42 / 担当: KIRYU

## 概要
SakuDesign納品Figmaをベースに stretchzero.jp/lp/ を新規実装する。
既存ブランドサイト（stretchzero.jp/）は触らず、WPXのfunctions.phpによる readfile ルーティング方式で併設。

指示書: `prompts/stretchzero-lp-implementation.md`

## Figmaソース
| 用途 | fileKey | SP | PC |
|------|---------|----|----|
| SakuDesign納品（デザインベース） | rHTH8GSS47grFlwMqPtWJ3 | 61:415 | 61:12 |
| たたき台ワイヤー（構造・テキスト参照） | kQfXvYyUXz873eleTtFcop | 4:245 | 132:2 |
| FC加盟ページ（ワイヤー） | kQfXvYyUXz873eleTtFcop | 123:2 | 133:2 |
| サンクスページ | kQfXvYyUXz873eleTtFcop | 114:68 | - |
| 予約モーダル | kQfXvYyUXz873eleTtFcop | 114:4 | - |
| FV 3パターン | rHTH8GSS47grFlwMqPtWJ3 | 61:675 | 61:281 |
| ハンバーガーメニュー | rHTH8GSS47grFlwMqPtWJ3 | 61:808 | - |

## URL設計
| URL | 方式 |
|-----|------|
| stretchzero.jp/ | 既存ブランドサイト（触らない） |
| stretchzero.jp/lp/ | functions.php readfileルーティング |
| stretchzero.jp/fc/ | functions.php readfileルーティング |
| stretchzero.jp/lp/thanks/ | functions.php readfileルーティング |

## デザイントークン
- メインカラー: `#FF8C00`（ダークオレンジ）
- 背景ダーク: `#0f0f0f` / `#1a1a1a` / `#141414`
- 背景ライト: `#FFF5E6`
- テキスト: `#ffffff` / `#333333` / `#999999`
- フォント: `Noto Sans JP`(JP) + `Roboto Bold`(EN-label)
- セクションラベル: EN・大文字・letterSpacing 2–3px・#FF8C00・11–12px

## セクション構成（19）
**SakuDesign忠実再現 14セクション:**
FV / 誤解払拭 / お悩みチェック / 通っても戻る理由 / 選ばれる3つの理由 / 監修者 / ご来店の流れ / 料金 / お客様の声 / FAQ / 店舗 / 最終CTA / FC加盟帯 / フッター

**再設計 5セクション（SakuDesignトークンで統一）:**
Before&After / Road Map(タイムライン+85%継続) / 価格シミュレーション / 返金保証 / 打消し表示

**追加UI:** 追従バナー(SPのみ) / 予約モーダル(全CTA起動) / FVカルーセル(3パターン) / FAQアコーディオン / ハンバーガー(SP)

## 画像素材
- 本番サイト(stretchzero.jp)から取得可: FV背景・宣材10枚・店舗写真4枚・ロゴ
- 未取得: 岸先生写真（中込社長経由）・Before&After写真4枚

## NGワード / 代替
- NG: 「根本改善」「治療」「腰痛が改善」（本気ストレッチとのカニバリ防止）
- OK: 「ケア」「コンディショニング」「ゼロの状態へ」

## 実装サーバー
- WPXサーバー sv1092.wpx.ne.jp / 183.181.91.93
- .htaccess無視 → functions.phpのPHPフックでルーティング（本気ストレッチ同方式）
- FTP: Python ftplibのみ使用（curl禁止 = !importantエスケープ事故対策）

## GTM/CV
- GTM: `GTM-PKQDTD2Q` / GA4: `G-FN41FNZK8V` / Google Ads: `AW-17857466060`
- TELタップCV: `B-njCNDG15gcEMydjcNC`
- フォーム送信CV: `nHhKCNvz8ZgcEMydjcNC`
- TEL: `href="tel:0552427011"`（ハイフンなし）
- サンクス: `/lp/thanks/`

## 実装Step（進捗管理）
- [ ] Step1: Figma SP版(61:415) get_design_context取得 → HTML/CSS変換
- [ ] Step2: 再設計5セクション追加コーディング
- [ ] Step3: PC版(61:12)レスポンシブ対応
- [ ] Step4: インタラクション(追従バナー/FAQ/モーダル/カルーセル/ハンバーガー)
- [ ] Step5: WPXデプロイ + functions.phpルーティング
- [ ] Step6: GTM・CV計測実装＋プレビュー確認
- [ ] Step7: 岸先生写真・Before&After写真・お客様の声テキスト差替え
- [ ] Step8: FC加盟ページ(/fc/)実装
- [ ] Step9: Google Ads配信開始

## 残タスク（LP実装後）
- 岸先生写真入手（中込社長経由）
- Before&After写真4枚入手
- お客様の声テキスト実データ差替え
- FC加盟ページコーディング
- Google Ads配信開始

## 作業ディレクトリ
`/home/ozawakiryu0902/projects/vonds/stretchzero/lp/`
- `css/` / `js/` / `assets/images/` / `assets/icons/` / `figma-refs/`

## 本番前チェック
- CLAUDE.md ルール8（クライアント案件の本番改修は事前承認必須）
- サンプル/プレビューURLで承認取得 → デプロイ
