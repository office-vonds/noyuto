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

## NOYUTO手動タスク（実施完了 16:40）
1. ✅ GSC URL検査ツールで10本「インデックス登録をリクエスト」実施完了
2. ✅ サイトマップ再送信（API側でも実施済）

## NOYUTO手動クリック後の状態変化（実測 / commit 8de9971時点）
| URL | Before | After |
|---|---|---|
| /works/seo/ | Discovered, NEVER | **Crawled** 2026-04-11 |
| /works/web/ | URL unknown | **Crawled** 2026-04-11 |
| /works/ads/ | Discovered, NEVER | **Crawled** 2026-04-11 |
| /works/ai/ | Discovered, NEVER | **Crawled** 2026-04-11 |
| /works/ | (未) | **Crawled** 2026-04-11 |
| /works/seo/auto-plan/ | (未) | **Crawled** 2026-04-11 |
| /column/ | (未) | **Crawled** 2026-04-11 |
| /column/yamanashi-seo/ | (未) | **Crawled** 2026-04-11 |
| /company/ | Discovered | ⚠️ Duplicate canonical |
| / | indexed | indexed |

→ **Discovered → Crawled の最大の山は突破**（手動クリックでしか起こせないジャンプ）。
あとはGoogleの判定待ち（通常24-72h）。

## 残課題1個: /company/ canonical重複
- googleCanonical=`/company`（slashなし）/ userCanonical=`/company/`
- 過去履歴の引きずり。リダイレクト・内部リンクは全部正しい
- 追加対策: AboutPage JSON-LDに `@id` + `mainEntityOfPage` 明示（commit 8de9971）
- NOYUTO任意タスク: GSC URL検査で `https://vonds.co.jp/company` (slashなし) を「ライブテスト」のみ実行 → Googleに「これは旧URL」と再学習させる

## 次にやること
- [ ] **24時間後（4/12 朝）**: gsc_force_index.py Step 3 を再実行 → Crawled → Indexed の遷移確認
- [ ] **72時間後（4/14）**: 8本全部 indexed 想定
- [ ] **2週間後（4/25）**: 「seo会社 山梨」順位 25.4 → 15以下を目標に観測
- [ ] /works/seo/ にローカル(甲府/中央市/南アルプス市)別の小セクション追加検討

## 関連ファイル
- HTML: 27 files changed (commit 21a536a) + company canonical対策 (commit 8de9971)
- スクリプト: scripts/seo_footer_update.py / scripts/gsc_force_index.py
- データ: data/gsc/vonds_snapshot_20260411.json / data/gsc/force_index_20260411.json / data/ga4/snapshot_20260411.json
- 手順書: seo/url-inspection-list-20260411.md

## 主要コミット
- 21a536a — SEO最適化第2弾本体（HTML 22 + sitemap + script）
- 43b3fc5 — session log + CLAUDE.md
- 2a25233 — gsc_force_index.py（API強制試行・sitemap再送信成功・Indexing API 403）
- 8de9971 — /company/ canonical重複対策

## 学んだこと（メモリ追記候補）
- GSC「インデックス登録をリクエスト」相当のAPIは**Google公式が世界中の誰にも提供していない**
- searchanalytics / sitemaps / urlInspection.inspect(read-only) のみ
- Indexing API はJobPosting/BroadcastEvent専用・一般Webページ非対応
- → サイト改修はAPI、最終的なインデックス登録はNOYUTOの15分手動が最適解
