# 絆JOB SEO全滅 復旧作業記録（2026-04-11）

担当: Claude Opus 4.6
対象: https://kizuna-job.com/
依頼: 「SEO対策が全滅。今すぐ最適解で調べ最適解で実行せよ」

---

## 現状KPI（GSC 28日実測）

| 指標 | 値 |
|---|---|
| クリック | 1 |
| 表示回数 | 128 |
| 平均順位 | 27.9 |
| sitemap submitted | 18 |
| sitemap indexed | 0 |

## 真因5点

1. **sitemap二重稼働** — `wp-sitemap.xml`（WP標準）と `sitemap.xml`（旧プラグイン `google-sitemap-generator 4.1.0`）が両方 robots.txt に宣言されていた。旧プラグイン版は2URLしか吐けない壊れた状態。
2. **4日前の全site slug リネーム後、Google未再クロール** — biginer→beginner, over30→mature, hosyo→guarantee, fllow→flow。`.htaccess` に301設定済みで動作確認済みだが、Google は新slugを一度もインデックスしていない（URL検査で `NEUTRAL / URL is unknown to Google`）。
3. **コンテンツ薄弱** — pages 11本、staff_blog 5本（全部2026-04-08同日投稿）、posts 0本。
4. **メインキーワード未カバー** — 「甲府 ナイトワーク 求人」「山梨 高収入 求人 女性」 impressions=0。HTMLに該当キーワードが不在。
5. **旧slug にインデックス滞留** — Google は `/biginer/` `/over30/` を現在も `Submitted and indexed` としている。301 通過後の canonical 伝播が遅れている。

## 実行した復旧作業

### Phase 1 — GSC API側（非破壊・完了）
- `sitemap.xml` を GSC から delete
- `wp-sitemap.xml` + `wp-sitemap-posts-page-1.xml` + `wp-sitemap-posts-staff_blog-1.xml` を submit

### Phase 2 — 本番ファイル改修（FTP経由・完了）
- FTPバックアップ: `~/projects/vonds/kizuna-backup/_backup_20260411/`（gitignore）
- `wp-content/plugins/google-sitemap-generator/` を `_disabled_google-sitemap-generator_20260411/` にリネーム → robots.txt から `Sitemap: sitemap.xml` 行が消滅
- `kizuna-job-theme/front-page.php` H1 改修:
  - Before: `山梨・甲府の高収入風俗求人 絆 -きずな-`
  - After: `山梨・甲府の女性高収入求人・ナイトワークなら風俗求人 絆 -きずな-`
- `kizuna-job-theme/footer.php` に **SEOフッターナビ** 追加:
  - 働き方 × 4リンク（beginner/mature/dormitory/flow）
  - お金・保証 × 4リンク（salary/guarantee + 「山梨 高収入 求人 女性」「甲府 ナイトワーク 求人」のアンカー付きhomeリンク）
  - 安心 × 4リンク（security/qa/contact/blog）
  - エリア（甲府/南アルプス/笛吹/富士吉田/河口湖 等11エリア列挙）
  - 全ページに自動挿入されるため、16ページ間で互いにキーワードリッチな内部リンクを持つ状態に。

### Phase 3 — タイトル/メタ（`kizuna-override-titles.php` で既に最適化済み確認）
- 追加改修なし。既存mu-pluginが11ページ全部にキーワードリッチなdocument_title_partsフィルタを適用中。

### Phase 4 — NOYUTO 手動URL登録（このドキュメント）

---

## NOYUTO 手動作業（15分・必須）

Google Search Console で https://kizuna-job.com/ プロパティを開く:

### 1. sitemap 再送信（1分）
「サイトマップ」→ `wp-sitemap.xml` の「︙」→ 「テスト」→ 問題なければ「再送信」

### 2. URL検査 → インデックス登録をリクエスト（各URL 1〜2分 × 8本 = 15分）

上から順に貼り付け → 「公開URLをテスト」→ 「インデックス登録をリクエスト」:

**優先A — 新slug 3本（現在 Google が未認知）:**
1. `https://kizuna-job.com/beginner/`
2. `https://kizuna-job.com/mature/`
3. `https://kizuna-job.com/guarantee/`

**優先B — 新規 staff_blog 5本:**
4. `https://kizuna-job.com/blog/35歳離婚貯金ゼロ子供を守るために私が選んだ/`
5. `https://kizuna-job.com/blog/コンビニ時給の5倍私が山梨の風俗で働くことを/`
6. `https://kizuna-job.com/blog/スーツケース1つで山梨に来た寮生活のリアルと/`
7. `https://kizuna-job.com/blog/体験入店の全記録朝電話してその日の夜には/`
8. `https://kizuna-job.com/blog/身バレが怖いその気持ち、よくわかる。だから/`

※ staff_blog のURLは日本語スラッグでエンコードされているため、GSC貼付時は WordPress の投稿一覧からコピーすると確実（wp-admin → 投稿 → staff_blog）。

### 3. 完了後の確認方法
2026-04-14 朝に以下を俺（Claude）に言ってくれれば GSC API で indexed 状態を自動確認する:
```
「絆JOBのGSC再確認」
```

---

## 復旧タイムライン予測

| 時期 | 期待される変化 |
|---|---|
| 24-72時間後 | 新slug 3本が「Crawled - currently not indexed」に遷移 |
| 3-7日後 | 3本のうち少なくとも2本が「Indexed」 |
| 1-2週間後 | sitemap indexed が 0 → 10+ に回復 |
| 2-4週間後 | 「山梨 風俗 求人」順位 30.8 → 20以下 |
| 4-8週間後 | 「甲府 ナイトワーク 求人」「山梨 高収入 求人 女性」が初出現 |

---

## 次フェーズ（本セッション対象外・中期）

1. **staff_blog 追加投稿（週2本）** — 同日5本ドカ入れのスパムシグナル希釈
2. **エリア特化LP** — `/kofu/` `/fujiyoshida/` `/kawaguchiko/` 個別ページ作成
3. **職種特化LP** — `/deliheru/` `/soapland/` `/pinsaro/` 個別ページ作成
4. **外部SEO** — バニラ・ガールズヘブン求人サイトからの被リンク強化
5. **staff_blog投稿日の分散** — 既存5本の publish_date を手動で過去分散に更新（SEO上のクリーン化）
