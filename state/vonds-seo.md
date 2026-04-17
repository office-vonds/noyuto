# VONDS SEO最適化

## 現在地（2026-04-17 23:40更新）

- **状態**: 18 URL中 7 Indexed / 8コラム「Discovered or Unknown」/ /company/ Duplicate canonical
- **最終施策日**: 2026-04-17（権威ページ→コラム文脈リンク実装）
- **経過**: 2-4週間のクロール待ち

## 4/17 実施内容（最新）

- `/works/seo/` → SEO系コラム4本（seo-howto/what-is-seo/yamanashi/local-seo）への文脈リンク
- `/works/web/` → Web制作系コラム5本（web-design/cost/lp/renewal/no-traffic-fix）
- `/works/ads/` → google-ads-guide + lp-design-tips
- `/works/ai/` → ai-business-guide
- sitemap.xml 再生成（lastmod 2026-04-17統一・32URL）

**狙い**: 8本コラム「Discovered/Unknown to Google」状態から脱却。
Indexed & 順位10-30位の権威ページからリンクエクイティを流入させ、
Googleのクロール優先度を上げる。

## インデックス状態（4/15 KIRYU検証・4/11から大幅改善）

| URL | 4/11 | 4/15 | 表示(7d) | 順位 |
|-----|------|------|---------|------|
| / | Indexed | **Indexed** | 203 | 5.3 |
| /works/seo/ | Crawled | **Indexed** | 52 | 10.5 |
| /works/web/ | Crawled | **Indexed** | 8 | 52.6 |
| /works/ads/ | Crawled | **Indexed** | 4 | 31.5 |
| /works/ai/ | Crawled | **Indexed** | 7 | 4.9 |
| /works/ | Crawled | **Indexed** | 0 | - |
| /works/seo/auto-plan/ | Crawled | **Indexed** | 1 | 5.0 |
| /column/ | Crawled | **Indexed** | 4 | 6.2 |
| /column/yamanashi-seo/ | Crawled | **Indexed** | 28 | 17.8 |
| /company/ | Dup canonical | **Dup canonical** | - | - |

**主要KW順位変動:**
- 「seo会社 山梨」: 25.4 → **10.9**（目標15以下を達成）
- 「山梨 ホームページ制作」: **1.0-1.7位**（クリック0 → CTR改善余地）
- 「seo対策 山梨」: **9.9位**（表示30）
- 「山梨 seo」: **4.2位**（表示30）

## 実施済み施策

- 全22HTMLのfooter-nav置換（4サービス直接リンク・被リンク3-4→22ページ）
- sitemap.xml lastmod統一 + 再送信
- /works/seo/ /ads/ /ai/ キーワード密度・タイトル強化
- NOYUTO手動: GSCで10URL「インデックス登録をリクエスト」

## 観測ポイント

- 8本全部 indexed → 「seo会社 山梨」順位 25.4→15以下を目標
- /works/web/ /ads/ /ai/ の表示回数出現

## 次のアクション

- ✅ GSCインデックス状態確認（4/15完了: 9/10 indexed）
- 「山梨 ホームページ制作」順位1位だがCTR 0% → meta description改善
- /company/ canonical重複: 301リダイレクト（/company → /company/）で解消可能
- 「seo対策 山梨」9.9位 → 5位以内を目指す次フェーズ

## 関連ファイル

- scripts/vonds-seo/ — 監視スクリプト群
- data/gsc/ — GSCスナップショット
- session-logs/2026-04-11_1500_vonds-seo-optimization-v2.md
