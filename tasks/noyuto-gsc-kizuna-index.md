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

以下 **7URL をそのままコピペ**して順に登録（KIRYU先回りで全URL取得済・NOYUTO作業は貼り付けるだけ）:

### 未indexed 固定ページ 3本
1. `https://kizuna-job.com/mature/`
2. `https://kizuna-job.com/guarantee/`
3. `https://kizuna-job.com/blog/`

### staff_blog 新記事 4本（Phase2以降）
4. ID 414 / 2026-04-15「東京から山梨に出稼ぎ風俗」
   `https://kizuna-job.com/blog/%e6%9d%b1%e4%ba%ac%e3%81%8b%e3%82%89%e5%b1%b1%e6%a2%a8%e3%81%ab%e5%87%ba%e7%a8%bc%e3%81%8e%e9%a2%a8%e4%bf%97%e3%80%82%e7%94%b2%e5%ba%9c%e3%83%bb%e5%af%8c%e5%a3%ab%e5%90%89%e7%94%b0%e3%82%a8%e3%83%aa/`

5. ID 413 / 2026-04-14「40代・人妻でも需要あり」
   `https://kizuna-job.com/blog/40%e4%bb%a3%e3%83%bb%e4%ba%ba%e5%a6%bb%e3%81%a7%e3%82%82%e9%9c%80%e8%a6%81%e3%81%82%e3%82%8a%e3%80%82%e5%b1%b1%e6%a2%a8%e3%81%ae%e9%a2%a8%e4%bf%97%e6%b1%82%e4%ba%ba%e3%81%a7%e3%80%8c%e5%b9%b4%e9%bd%a2/`

6. ID 412 / 2026-04-12「山梨のデリヘル求人、未経験でも本当に稼げる？」
   `https://kizuna-job.com/blog/%e5%b1%b1%e6%a2%a8%e3%81%ae%e3%83%87%e3%83%aa%e3%83%98%e3%83%ab%e6%b1%82%e4%ba%ba%e3%80%81%e6%9c%aa%e7%b5%8c%e9%a8%93%e3%81%a7%e3%82%82%e6%9c%ac%e5%bd%93%e3%81%ab%e7%a8%bc%e3%81%92%e3%82%8b%ef%bc%9f/`

7. ID 431 / 2026-04-17「夜中に一人で天井を見ていた日々の話」（本日rina→ブログ変換1本目）
   `https://kizuna-job.com/blog/%e5%a4%9c%e4%b8%ad%e3%81%ab%e4%b8%80%e4%ba%ba%e3%81%a7%e5%a4%a9%e4%ba%95%e3%82%92%e8%a6%8b%e3%81%a6%e3%81%84%e3%81%9f%e6%97%a5%e3%80%85%e3%81%ae%e8%a9%b1/`

### 追加（毎朝10:00でrina→ブログcronが1本ずつ増やす）

明日以降の新規記事URLはKIRYUが自動で取得・翌朝にこのドキュメントを更新します。**今回は上記7URLまでで登録完了してOK**。

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
