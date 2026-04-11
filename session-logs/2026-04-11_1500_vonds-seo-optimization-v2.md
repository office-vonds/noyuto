# セッションログ: 2026-04-11 15:00 vonds-seo-optimization-v2

- **ブランチ:** main
- **担当:** Claude Opus 4.6
- **目的:** GA4/GSC実データに基づきVONDSのSEO最適化を最適解で一括実行

## 入力データ（GSC 28d 実測 / 2026-04-11取得）
- KPI: 17 clicks / 886 imp / pos 14.1
- Sitemap: submitted=22 / **indexed=0**（"/" のみ）
- インデックス検査:
  - / : indexed
  - /works/seo/ : Discovered, not indexed
  - /works/web/ : URL unknown to Google
  - /works/ads/ /works/ai/ /company/ : Discovered, not indexed
- 最大impクエリ: `seo会社 山梨` imp125 pos25.4 / `seo対策 山梨` imp147 pos18.6

## 真因（3点）
1. クロール待ち（時間で解決）
2. **内部リンク不平等**: /works/seo/ /works/web/ /works/ads/ /works/ai/ が3-4ページからしか被リンクされてない（フッター不在）
3. **クエリ-ページ意味のズレ**: ターゲットクエリは「SEO会社」だがH1は「SEO対策」のみ

## 実行（commit 21a536a）
1. **全22HTMLのfooter-nav置換**（scripts/seo_footer_update.py）
   - 4サービス直接リンクを追加 → 被リンク数 3-4 → 22 ページ
2. **sitemap.xml lastmod 全URL → 2026-04-11**
3. **/works/seo/ キーワード強化**
   - title: 「山梨のSEO会社・SEO対策コンサルティング」
   - description: 「山梨のSEO会社ならVONDS」
   - h1: 「山梨のSEO会社・SEO対策」
   - FAQ追加（visible HTML + JSON-LD両方）「山梨でSEO会社を選ぶ際の基準は？」
   - 山梨×36→45・甲府×10→13・SEO会社×0→7
4. **/works/ads/** title/description/h1/h2に「山梨」「リスティング広告」追記（山梨×8→13）
5. **/works/ai/** title/description/h1/h2に「山梨」「AI導入支援」追記（山梨×8→12）
6. **seo/url-inspection-list-20260411.md** 新規 — NOYUTO手動GSC作業手順書（10URL/15分）

## NOYUTO手動タスク（必須）
1. GSC URL検査ツールで以下10本を順次「インデックス登録をリクエスト」
   - /works/seo/ /works/web/ /works/ads/ /works/ai/ /company/ /works/
   - /works/seo/auto-plan/ /column/ /column/yamanashi-seo/ /
   - 詳細手順: `seo/url-inspection-list-20260411.md`
2. GSC「サイトマップ」→ sitemap.xml 「︙」→ 「テスト」→ 「再送信」

## 次にやること
- [ ] 1週間後（2026-04-18）: GSC再取得 → /works/* のインデックス状態確認
- [ ] 2週間後（2026-04-25）: 「seo会社 山梨」の順位推移確認・25.4 → 15以下が目標
- [ ] /works/seo/ にローカル(甲府/中央市/南アルプス市)別の小セクション追加検討（更なる地域SEO強化）

## 関連ファイル
- 27 files changed (commit 21a536a)
- データ: data/gsc/vonds_snapshot_20260411.json / data/ga4/snapshot_20260411.json
- 手順書: seo/url-inspection-list-20260411.md
