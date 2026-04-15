# VONDS SEO最適化

## 現在地（2026-04-15更新）

- **状態**: 8本のURLが「Crawled, currently not indexed」→ Indexed遷移待ち
- **最終施策日**: 2026-04-11
- **経過**: 4日目。通常2-4週間で順位改善

## インデックス状態（4/11時点）

| URL | 状態 |
|-----|------|
| / | Submitted and indexed |
| /works/seo/ /web/ /ads/ /ai/ /works/ /works/seo/auto-plan/ /column/ /column/yamanashi-seo/ | Crawled - currently not indexed |
| /company/ | Duplicate canonical（slashなし版をGoogle選択中） |

## 実施済み施策

- 全22HTMLのfooter-nav置換（4サービス直接リンク・被リンク3-4→22ページ）
- sitemap.xml lastmod統一 + 再送信
- /works/seo/ /ads/ /ai/ キーワード密度・タイトル強化
- NOYUTO手動: GSCで10URL「インデックス登録をリクエスト」

## 観測ポイント

- 8本全部 indexed → 「seo会社 山梨」順位 25.4→15以下を目標
- /works/web/ /ads/ /ai/ の表示回数出現

## 次のアクション

- GSCでインデックス状態確認（data/gsc/index_status_latest.json更新）
- indexed遷移確認後 → 順位推移観測フェーズへ

## 関連ファイル

- scripts/vonds-seo/ — 監視スクリプト群
- data/gsc/ — GSCスナップショット
- session-logs/2026-04-11_1500_vonds-seo-optimization-v2.md
