# ストレッチゼロ GSC/GA4 統合分析 → KW別最終URL戦略 確定版

作成: 2026-04-17 / 分析: バナナ（GSC API + GA4 API）
対象期間: 2026-03-20 〜 2026-04-17（28日）

---

## GSC実データから見えた真実

### TOP (/) は指名KWで機能している

| KW | Impressions | Clicks | CTR | Position |
|---|---:|---:|---:|---:|
| ストレッチゼロ | 179 | 49 | 27.4% | #1.4 |
| ストレッチゼロ 山梨 | 60 | 18 | 30.0% | #1.8 |
| ストレッチラボ | 102 | 14 | 13.7% | #3.9 |
| ストレッチラボ 山梨 | 41 | 11 | 26.8% | #1.1 |
| 山梨 ストレッチ | 51 | 8 | 15.7% | #2.2 |
| ストレッチゼロ 韮崎 | 42 | 6 | 14.3% | #1.7 |

→ **TOP は指名KW・半指名KWでの流入窓口として稼働中**（安易に `/shop/` 送りに変えたら指名流入を壊す）

### /shop/ は指名KW窓口としても弱く、非指名KWでも沈んでいる

| KW | Page | Imp | Cl | Position |
|---|---|---:|---:|---:|
| ストレッチゼロ | /shop/ | 129 | 5 | #3.7 |
| ストレッチ 山梨 | /shop/ | 12 | 0 | #29.3 |
| 山梨 マッサージ | /shop/shop-minami-alps/ | 1 | 1 | #1.0 |
| 甲斐市 マッサージ | /shop/shop-kai-hibikigaoka/ | 1 | 1 | #1.0 |

→ `/shop/` はSEOで弱いが**CVR 49%**（GA4）と**変換力は最強**

## 俺の前提修正（重要）

### 古い結論（前レポ）: 全KW一律 `/shop/` 送り

### 新しい結論: **KW別に最終URL分岐**

| KW分類 | 最終URL | 理由 |
|---|---|---|
| 指名KW（「ストレッチゼロ」「ストレッチラボ」含む） | **`/` (TOP)** | 指名検索でCTR 20-30% / Position #1 を既に獲得・流入ラインを壊すな |
| エリア×悩み系（「甲府 マッサージ」「山梨 整体」など） | **`/shop/`** | CVR 38-49% の勝ちページに集中 |
| 店舗名×エリア（「ストレッチゼロ 韮崎」「ストレッチゼロ 南アルプス」） | **`/shop/shop-{area}/`** | 店舗個別ページに直送 |

### 本日投入したKW 11本の最終URL再設定

| KW | 新URL |
|---|---|
| 甲府 マッサージ | /shop/ |
| 整体 山梨 | /shop/ |
| マッサージ 山梨 | /shop/ |
| 山梨 整体 おすすめ | /shop/ |
| 甲府 整体 口コミ | /shop/ |
| 南アルプス 整体 | **/shop/shop-minami-alps/** |
| 南アルプス マッサージ | **/shop/shop-minami-alps/** |
| 中央市 整体 | /shop/ |
| 中央市 マッサージ | /shop/ |
| 甲斐市 整体 | **/shop/shop-kai-hibikigaoka/** |
| 甲斐市 マッサージ | **/shop/shop-kai-hibikigaoka/** |

→ エリア一致する店舗ページがある場合はそこに直送 / 無い場合は `/shop/` 一覧

## TOP (/) の課題

- 指名KW流入 522sess/Org Search / CVR **0%**
- 指名で来て予約せず離脱している = 予約動線が弱い
- **改善案（サイト改修・サム案件化）**: TOPのファーストビューに「店舗を選んで予約する」CTAボタン配置（/shop/ への誘導強化）

## 俺が次に書くスクリプト

- `scripts/ads-ops/stretchzero_final_url_update.py` をKW別分岐版に改修
- KW文字列パターンマッチング → URL分岐

## 関連

- 親レポ: `ads-audit/weekly-reports/sanken-2026-W16.md`
- チャネル×ページ分析: `ads-audit/weekly-reports/stretchzero-channel-page-cvr-20260417.md`
- GSC APIは `ga4-mcp@potent-impulse-165116` に siteFullUser 権限で登録済み（6サイト: vonds/kizuna-job/stretchzero/bar-kofu/a-truck.jp/majistretch）
