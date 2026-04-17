# NOYUTO: 絆JOB GSC インデックス登録 6URL（15分作業）

作成: 2026-04-17 / KIRYU

> NOYUTO本人しかできない作業（GSC API は「インデックス登録をリクエスト」を提供していない）。
> 15分で6URL・完了すればSEOインデックス基盤が加速する。

---

## 手順（各URL 2-3分）

### Step 1: GSC ログイン

https://search.google.com/search-console

プロパティ選択: `sc-domain:kizuna-job.com` or `https://kizuna-job.com/`

### Step 2: 各URL「URL検査」→「インデックス登録をリクエスト」

画面上部の検索バーにURL貼り付け → 検査実行 → 「インデックス登録をリクエスト」クリック → 完了

以下6URLを順に:

1. `https://kizuna-job.com/mature/`
2. `https://kizuna-job.com/guarantee/`
3. `https://kizuna-job.com/blog/`
4. 新記事3本（wp-admin → 投稿 → staff_blog から直近3本のURL取得）

### 新記事3本のURL取得方法

wp-admin (https://kizuna-job.com/wp-admin) ログイン → 投稿 → **staff_blog** → 直近3本（2026-04-12 / 2026-04-14 / 2026-04-15 投稿分）の「表示」リンクからURLコピー

KIRYUが先回りで取得しておきたい場合は、xmlrpc経由で直近3本の ID→URL を取得するスクリプト即作成可能。NOYUTO負担ゼロ希望なら言ってください。

### Step 3: 完了報告

6URL全て「インデックス登録をリクエスト済み」が表示されたら KIRYUに「絆JOBインデックス登録完了」と一言。

---

## 所要時間内訳

- GSCログイン: 30秒
- URL検査×6: 各90秒 = 9分
- 合計約10-15分

## GSCインデックス登録の限界（memory/reference_gsc_api_limits.md）

GSC APIでは「インデックス登録をリクエスト」機能は提供されていない。
**NOYUTO手動15分が唯一の最適解**。
（Web APIでの代替は不可・SEO業者の自動化ツールは規約違反）

## この作業の重要性

- 絆JOB SEO Phase2で meta/canonical/OGP/記事8本 全て整備済み
- あとは Google にインデックスされるかどうかだけ
- 手動登録で2-24時間でインデックス化・オーガニック流入開始
- これを放置すると絆JOB SEOは**完成8割のまま眠る**
