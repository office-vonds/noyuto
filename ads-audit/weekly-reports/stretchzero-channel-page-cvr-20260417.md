# ストレッチゼロ 全チャネル × ページ別 CVR 深掘り分析

作成: 2026-04-17 / 分析: バナナ（GA4 API）
対象期間: 過去30日

---

## 🎯 結論: 流入の87%がTOPに着地しているが、CVはほぼ全て `/shop/` で発生

### 全チャネル横断表

| チャネル | `/shop/` Sess | `/shop/` CV | `/shop/` CVR | `/` (TOP) Sess | TOP CV | TOP CVR |
|---|---:|---:|---:|---:|---:|---:|
| Paid Search | 182 | **70** | **38.5%** | 830 | **0** | 0% |
| Organic Search | 167 | **82** | **49.1%** | 522 | **0** | 0% |
| Direct | 88 | **32** | **36.4%** | 201 | **0** | 0% |
| Organic Social | 19 | **20** | 105% | 49 | **0** | 0% |
| Paid Social | 6 | 0 | - | **358** | **0** | 0% |

**全チャネルで TOP CVR = 0%。CVは全て `/shop/` で発生**

## 即実行すべき施策（チャネル別）

### 🟥 Paid Social（Meta広告）: 損切り案件

- 30日358セッション / Engagement **9%** / CV **0件**
- ほぼ即離脱の無駄撃ち
- **改善案**:
  - A. 配信一時停止（損切り）
  - B. 最終URLを `/shop/` or `/shop/shop-kofu/` に変更
  - C. リターゲ広告に絞る（CV経験ユーザーのみ）

### 🟡 Paid Search（Google広告）: URL集中で倍増狙い

- 既レポ通り、全KWの最終URLを `/shop/` に変更
- 実行スクリプト: `scripts/ads-ops/stretchzero_final_url_update.py`（API承認待ち）

### 🟢 Organic Search: `/shop/` SEO強化が最大ROI

- `/shop/` 167sess / 82CV / CVR 49.1% = **自然検索の勝ちページ**
- **改善案**:
  - `/shop/` の中身をSEO最適化（店舗一覧・エリア別見出し・検索流入KWに沿ったコンテンツ追加）
  - 各店舗個別ページ（`/shop/shop-kofu/` 18sess など）へ内部リンク強化
  - 狙うKW例: 「甲府 ストレッチ 店舗」「山梨 ストレッチ 予約」「甲斐市 整体 店舗」

### 🟢 Organic Social: リンクを `/shop/` に固定

- Instagram等から19セッション / 20CV（CVR 105%）= **予約直結の動線**
- **改善案**: 全SNS投稿のBio/Story/Postリンクを `/shop/` に統一
- Instagram投稿のCTA文言も「ご予約はプロフィールリンクから →店舗一覧」

### 🟡 Direct流入: 既存顧客リピート

- `/shop/` 88sess / 32CV / CVR 36.4%
- 既存顧客や紙広告からの直接URL入力と推測
- **改善案**: 名刺・チラシ・店舗内POPのQRコードを `/shop/` に

## 俺で即実行可能（バナナ追加作業）

- [ ] GSC API経由で `/shop/` のランクインKW確認 → SEO改善提案書
- [ ] Organic Social 各投稿リンク現状確認
- [ ] Paid Social（Meta広告）運用状況監査（Marketing API必要）

## NOYUTO / KIRYU作業不要

上記 GSC分析と Organic Social 監査は俺が ga4-mcp 権限で叩けるはず。即試行する。

---

## 関連

- 親レポ: `ads-audit/weekly-reports/sanken-2026-W16.md`
- データ分析: `ads-audit/samples/stretchzero-majistretch-data-insights-20260417.md`
