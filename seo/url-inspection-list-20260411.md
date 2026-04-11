# GSC URL検査・インデックス登録リクエスト リスト

**作成: 2026-04-11 / 対象: vonds.co.jp**

## なぜ必要か
GSCに「サイトマップ送信」しても、Googleが新規URLをインデックスするまで2〜4週間かかる。URL検査ツールから「インデックス登録をリクエスト」を1本ずつクリックすると、優先クロール待ち列に入り、通常 数時間〜数日 で反映される。**唯一の手動加速手段**（GoogleはURL登録APIを一般公開していない）。

## 操作手順
1. https://search.google.com/search-console を開く
2. プロパティ「https://vonds.co.jp/」を選択
3. 上部の検索バー（URL検査）にURLを貼り付け → Enter
4. 「インデックス登録をリクエスト」をクリック → 1〜2分待つ → 完了
5. 次のURLへ。1日あたりの上限は約10〜12本（それを超えるとクォータエラー）

## 優先順URL（10本・所要15分）

### S-tier（最優先・新規ページで未インデックス）
| 順 | URL | 現状 | 期待 |
|---|---|---|---|
| 1 | https://vonds.co.jp/works/seo/ | Discovered, not indexed | 「seo会社 山梨」「seo対策 山梨」（imp 272/月）の本命LP |
| 2 | https://vonds.co.jp/works/web/ | URL unknown to Google | 「ホームページ制作 山梨」の本命LP |
| 3 | https://vonds.co.jp/works/ads/ | Discovered, not indexed | 「Google広告 山梨」の本命LP |
| 4 | https://vonds.co.jp/works/ai/ | Discovered, not indexed | 「AI導入 山梨」の本命LP（新規開拓） |
| 5 | https://vonds.co.jp/company/ | Discovered, not indexed | 会社概要（E-E-A-T信号源） |
| 6 | https://vonds.co.jp/works/ | 未確認 | サービスハブページ |

### A-tier（コンテンツ系・既存だが再評価したい）
| 順 | URL | 期待 |
|---|---|---|
| 7 | https://vonds.co.jp/works/seo/auto-plan/ | SEO自動プラン LP |
| 8 | https://vonds.co.jp/column/ | コラム ハブ |
| 9 | https://vonds.co.jp/column/yamanashi-seo/ | 「山梨 SEO」純コンテンツ記事 |
| 10 | https://vonds.co.jp/ | 内部リンク更新の再認識用（フッター追加4本を即発見させる） |

## 並行してやること（NOYUTO・任意）
- GSC「サイトマップ」 → `sitemap.xml` の右側「︙」 → 「テスト」 → 「再送信」を押す（lastmod更新を即座に反映）
- 同 → 「カバレッジ」レポートで「ページがインデックスに登録されない理由」を24時間後に再確認

## 1〜2週間後の観測ポイント
GSC「検索パフォーマンス」 → 「ページ」フィルタで:
- /works/seo/ のクリック・表示回数が増えているか
- 「seo会社 山梨」「seo対策 山梨」のクエリ別順位が 25.4 → 15以下に下がっているか
- /works/web/ /works/ads/ /works/ai/ が出現しているか

復旧目安: **2-4週間で順位改善・4-8週間でクリック増**。
