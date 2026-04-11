# セッションログ: 2026-04-11 VONDS SEO復旧

- **セッションID**: -
- **担当**: Claude Opus 4.6 (Claude Code)
- **ブランチ**: main
- **作業内容**: 「山梨 SEO対策」圏外転落の原因分析と修正実装・本番反映ブロッカー発覚
- **現在の状態**: **判断待ち**（資料化フェーズ完了・実行未承認）
- **次にやること**: NOYUTO に `seo/vonds-seo-recovery-plan-20260411.md` のオプションA/B判断を仰ぐ

## やったこと

1. GA4設定の問題提起 → 実は完璧に動いていたことを確認（9プロパティ権限OK）
2. `scripts/ga4_snapshot.py` を新規作成 → 7プロパティの28日KPI/Channel/TopPages/Sources取得成功
3. 全サイトの GA4 横断分析レポート作成
4. NOYUTOから「VONDSサイト『山梨 SEO対策』6位→圏外の深掘り」依頼
5. 徹底的事実収集（WebFetch, curl生HTML, robots.txt, sitemap.xml, site:検索, リポジトリ全体構造, git log）
6. 真因特定（sitemap壊滅・past_work重複・h1キーワード欠如・title連続変更）
7. 修正実装（index.html h1＋アンカー4本、sitemap.xml 6→21URL、past_work.html削除、noindex2ファイル、scripts/generate_sitemap.py新規）
8. main へ commit＋push（`d679b8a`）
9. **本番反映確認で運用事故発覚**: Pages配信元が `gh-pages` ブランチで、mainと20コミットずつ分岐
10. **資料化**: `seo/vonds-seo-recovery-plan-20260411.md` に全情報集約

## 重要ファイル

- `seo/vonds-seo-recovery-plan-20260411.md` — **メイン資料**（診断・修正・オプションA/B/C・GSC作業指示）
- `scripts/ga4_snapshot.py` — GA4 9プロパティ一括取得（new）
- `scripts/generate_sitemap.py` — sitemap.xml自動生成＋noindex自動除外（new）
- `/tmp/vonds_backup_20260411_1305/` — 編集前バックアップ

## 発覚した運用事故

- GitHub Pages の source = `gh-pages` ブランチ（`gh api repos/office-vonds/noyuto/pages` 確認済）
- main と gh-pages が**20コミットずつ分岐**
- gh-pages側にしかないもの: `works/seo/auto-plan/`、補助金書類4点（subsidy/docs/）
- main側にしかないもの: 今日の全Claude作業（SEO修正・本気ストレッチLP・ads-audit・majistretchCSV等）
- Pages最終ビルド: 2026-04-10 08:50 UTC で凍結

## 判断待ちの質問（NOYUTO宛）

1. オプションA（今日中の緊急 cherry-pick 反映）実行していいか？
2. オプションB（main統合＋Pages source切替）はいつ着手？
3. gh-pages側の `works/seo/auto-plan/` はmainに取り込むか？
4. 補助金書類（gh-pages側 subsidy/docs）はmainマージOKか？
5. ブランチ統合は俺主導 or 社長主導？

## 次セッション冒頭でやること

- `seo/vonds-seo-recovery-plan-20260411.md` を読んでNOYUTOの判断を確認
- 承認されたオプションを実行
- 実行後、GSC作業指示をNOYUTOに渡す
