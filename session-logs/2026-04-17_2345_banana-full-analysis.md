# セッションログ: 2026-04-17 23:45 バナナ全監査・自律実行

- 担当: バナナ君（マーケティング部長）
- 方針: NOYUTO手作業ゼロ / 止まった時はKIRYU非同期依頼

## 完了タスク（NOYUTO操作ゼロで完結）

### 本日朝〜午後
- ストレッチゼロKW CSV 3種作成（Tier1-2 x 11 / 除外 x 11 / Tier3-5 x 14）+ Ads Editor CSV形式
- 本気ストレッチ CV設計書 + GTM整理指示書
- GTM API経由で本気ストレッチGTM整理を自動実行・V5 Publish完了
- セキュリティフレームワーク（pre-commit hook / SECURITY.md / 履歴浄化手順書）
- SANKEN 3ブランド計測状況監査レポ
- ストレッチゼロ本番LPドメイン誤認（stretchlabo→stretchzero）訂正 + memory修正

### 本日夜（GA4+GSC API自主監査）
- SANKEN週次レポ自動生成スクリプト + 2026-W16初回レポ生成
- Notion「SANKEN週次レポ 2026-W16」ページ投稿
- GA4全チャネル×ページCVR分析（/shop/が全チャネルで勝ちページと判明）
- GSC API経由で本気ストレッチ・A-TRUCK・BAR KOFU・絆JOB・vonds.co.jp の自然検索状況把握
- KW別最終URL戦略v2策定（指名→TOP / 店舗エリア→店舗ページ / その他→/shop/）
- A-TRUCK SEO Phase次施策具体URL特定（積載車レンタル等で月130-300cl増見込み）
- Google Ads API実行スクリプト2本準備（承認後即稼働）

## KIRYU依頼中（tasks/kiryu-queue.md 冒頭A-E）

| # | 内容 | 次のアクション |
|---|---|---|
| A | GA4 property 530819340 SA権限昇格（Viewer→Editor） | 俺が幽霊CV削除+正CV設定自動実行 |
| B | GTM-PKQDTD2Q（ストレッチゼロ）SA追加 | 俺がgtag直書き×GTM重複整理自動実行 |
| C | Google Ads API Basic Access 承認状況確認 | 承認次第 URL変更+KW投入自動実行 |
| D | A-TRUCK SEO Phase次施策提案（3URL・月130-300cl増見込み） | サムに改修依頼 or クライアント承認必要か判断 |
| E | 本気ストレッチ ブランド名#1取得戦略・GBP整備確認 | 施策の優先度判断 |

## 主要発見（売上直結）

### 🔥 ストレッチゼロ /shop/ 一極集中施策

GA4全チャネル30日データ:
| チャネル | /shop/ CVR | /(TOP) CVR |
|---|---:|---:|
| Paid Search | 38.5% | 0% |
| Organic Search | 49.1% | 0% |
| Direct | 36.4% | 0% |

→ 広告最終URLを KW別に分岐（指名=TOP / エリア店舗KW=店舗URL / その他=/shop/）で **CPA 2-3分の1**可能性

### 🔴 本気ストレッチ 広告もSEOも死亡状態

- GA4 Paid Search 7sess/30日 / CV 0（GTM発火イベントとGA4 CV属性不整合）
- GSC 28日 総クリック20件 / ブランド名「本気ストレッチ」#3.6
- 施策: GA4 CV属性修正（KIRYU依頼A）+ ブランド指名KW死守 + GBP整備

### 🟢 A-TRUCK SEO引き上げ余地大

- 28日 総クリック1,100+件（A-TRUCKの資産力大）
- 「積載車 レンタル」Imp 1,826 / Position #8.4 → #5で月66-155cl増
- 「トラックレンタル」Imp 541 / Position #9.3 → #5で月35-90cl増
- **合計月130-300cl増（SEO改修だけで）** ← KIRYU判断次第

## 自動化基盤

- `scripts/ads-ops/sanken_weekly_report.py` 週次レポ生成（cron化候補）
- `scripts/ads-ops/stretchzero_final_url_update.py` KW別URL最適化（API承認後即稼働）
- `scripts/ads-ops/majistretch_import_keywords.py` 本気ST KW一括投入（API承認後即稼働）
- `scripts/gtm-ops/majistretch_cleanup.py` GTM自動整理（完了・運用中）

## 次の自律アクション

- KIRYU通知待ちの間、他クライアント（vonds.co.jp自社SEO等）のGSC分析続行
- Notion週次レポDB化（構造化蓄積基盤）
- A-TRUCK GA4権限付与依頼メール文面 NOYUTO送信待ち
