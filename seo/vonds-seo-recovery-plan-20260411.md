# VONDS SEO復旧計画 ──「山梨 SEO対策」圏外転落 原因分析と復旧提案

**作成日:** 2026-04-11
**対象:** vonds.co.jp
**担当:** Claude Code (Opus 4.6)
**依頼者:** NOYUTO

---

## 0. エグゼクティブサマリー（3行）

1. **「山梨 SEO対策」が6位→圏外**に落ちた真因は4つ：① sitemap.xmlが壊滅的に不完全 ② /past_work.html重複 ③ トップh1に完全一致キーワード不在 ④ 連続title変更によるGoogle再評価期間。複合要因だが、①が最重要。
2. **修正はmainブランチ上で完了済（コミット `d679b8a`・push済）**。sitemap 6URL→21URL拡張、本丸 `/works/seo/` 追加、トップh1修正、重複削除、内部リンク4本強化、自動生成スクリプト化。
3. **しかし本番反映されていない**。原因：GitHub Pagesの配信元が `main` ではなく `gh-pages`ブランチで、両ブランチが**20コミットずつ分岐**していた。mainへのpushはPagesビルドをトリガーしない運用事故が潜在化していた。

---

## 1. 事実収集（現地確認の結果）

### 1.1 本番サイトの実HTML（curl直接取得・AI要約無し）

| 項目 | 状態 | 備考 |
|---|---|---|
| `<title>` | ✅ あり | "山梨県のSEO対策・ホームページ制作・WEBマーケティング \| オフィスVONDS 山梨" |
| `<meta description>` | ✅ あり | SEO対策・全日本SEO協会認定・上位表示90%以上 |
| `<link canonical>` | ✅ あり | self-canonical |
| OGP一式 | ✅ あり | og:title / og:description / og:image / og:url / og:locale |
| Twitter Card | ✅ あり | summary_large_image |
| meta keywords | ✅ あり | "山梨 SEO対策, …" |
| JSON-LD構造化データ | ✅ 5種 | LocalBusiness / Organization / WebSite / ProfessionalService / FAQPage |
| google-site-verification | ✅ あり | `jYrwrlMXWshD3csIrSV5nwZIsc6AGJrXFNc0Vp5n9js` |
| GTM | ✅ あり | `GT-NFRN79GB` |
| Facebook Pixel | ✅ あり | `336659113751733` |
| Google AdSense | ✅ あり | `ca-pub-1853024193601363` |
| **h1テキスト** | ⚠️ 不完全 | **「山梨の集客を、SEOの力で変える。」← "SEO対策"完全一致なし** |
| robots.txt | ✅ 正常 | `User-agent: *` / `Allow: /` / Sitemap指定 |

### 1.2 sitemap.xml 実態（修正前）

```
https://vonds.co.jp/                                priority 1.0
https://vonds.co.jp/column/                         priority 0.8
https://vonds.co.jp/past_work.html                  priority 0.6  ← .html形式
https://vonds.co.jp/column/seo-howto-guide/         priority 0.7
https://vonds.co.jp/column/yamanashi-seo/           priority 0.7
https://vonds.co.jp/column/what-is-seo/             priority 0.7
```

**たった6URL。** 本来配信対象の主要ページが以下のように大量欠落：

| 欠落ページ | 重要度 | h1内容 |
|---|---|---|
| `/works/seo/` | **最重要** | **「山梨県のSEO対策なら、検索結果1ページ目に導くVONDS」← 完全一致h1** |
| `/works/web/` | 重要 | ホームページ制作サービス |
| `/works/ads/` | 重要 | Google広告運用代行 |
| `/works/ai/` | 重要 | AI活用支援 |
| `/works/` | 重要 | サービス一覧 |
| `/company/` | 重要 | 会社概要 |
| `/past_work/` | 重要 | 制作実績 (スラッシュ版) |
| `/seo/report1/` | 中 | 旧SEOコラム（権威あり） |
| `/seo/semantic/` | 中 | セマンティックSEO（旧） |
| `/kokodake/fan/` 等 | 中 | 代表コラム群 |
| `/net_biz/corona/` 等 | 低 | 旧ビジネスコラム |

### 1.3 旧URL応答状況（curl確認）

| URL | HTTPコード | 状態 |
|---|---|---|
| `/company` | 200 → `/company/` | 生きてる |
| `/past_work` | 200 | 生きてる |
| `/past_work.html` | 200 | **生きてる（重複）** |
| `/past_work/` | 200 | 生きてる（重複） |
| `/works/seo` | 200 → `/works/seo/` | 生きてる |
| `/works/web` | 200 → `/works/web/` | 生きてる |
| `/seo/report1` | 200 → `/seo/report1/` | 生きてる |
| `/seo/semantic` | 200 → `/seo/semantic/` | 生きてる |
| `/partner_companies` | **404** | 削除済 |

### 1.4 site:vonds.co.jp 検索結果（Googleキャッシュ）

Googleは以下をインデックスしている：
- `/company`, `/past_work`, `/works/web`, `/works/photo`, `/seo/semantic`, `/seo/report1`, `/works/seo`, `/partner_companies`, `/kokodake/fan`

**トップ `/` が site: 結果の先頭に出てこない** ← 新トップがGoogleから「メインページ」と認識されていない証拠。

### 1.5 リニューアル履歴（git log）

```
7dad990 お問い合わせフォーム送信不具合を修正
3bf8526 8件の修正: 広告LP・実績バナー・REASON圧縮・会社概要統一・SEO実績テーブル・見出しSEO改善
f0869d0 コラム記事6ページ＋カテゴリインデックス3ページを作成
edf5255 SEO改善: 全HTMLファイルのメタ情報・構造化データ・OGPを最適化
667745e [SEO] 全ページSEO改修 — title統一・JSON-LD追加・BreadcrumbList追加
61260de カスタムドメイン vonds.co.jp 対応
bb0c121 最終仕上げ: 追跡タグ・フォーム送信・SEO最適化・ナビ統一
9c4d581 代表写真を会社概要ページのみに限定
4447855 トップページ全面改修: LP要素統合・コラム追加・サービス4つに拡張  ← リニューアル本体
```

**2回連続で「SEO改善/title統一」が走っている** = リニューアル後のGoogle再評価期間中に追加のtitle変更があった。

### 1.6 GA4実データ（直近28日・2026-03-14〜04-10）

| 指標 | 値 | 所見 |
|---|---|---|
| Users | 393 | |
| Sessions | 433 | |
| ER | **23.8%** | 危険信号 |
| 直帰率 | 76% | |
| Conversions | **0** | CVイベント未設定 |
| 平均滞在 | 80秒 | |

| Channel | Sessions | ER | 所見 |
|---|---|---|---|
| Direct | **354 (82%)** | **17.5%** | ボット・自動巡回混入疑い。本物の指名アクセスにしては ER が異常に低い |
| Organic Search | 53 | **66%** | 本物の自然流入はこっち。月50人レベル |
| Referral | 8 | 75% | 健全 |
| Organic Social | 1 | 0% | ほぼゼロ |

**Top pagesに `/` が3種類のtitleで計上** ← リニューアル直後にtitleが短期間で変わった証拠（GA4のpageTitleディメンションはタイムスタンプベースで記録されるため、Google側で複数バージョンが一時的に存在）。

---

## 2. 真因分析

### 2.1 真因A【最重要】sitemap.xmlの壊滅的欠落

**最も強い完全一致h1を持つ `/works/seo/` がsitemap.xmlに存在しない**。h1は「山梨県のSEO対策なら、検索結果1ページ目に導くVONDS」で、これこそが「山梨 SEO対策」クエリに対する本丸ページ。Googleにその存在を教えていない。SEO会社が自社の看板キーワード用ページを sitemap から除外している自殺行為。

### 2.2 真因B【重】`/past_work.html` と `/past_work/` の重複コンテンツ

- 両方が200で返る（curl確認済）
- sitemap側は `.html` 版
- 内部リンク・canonical側は `/` 版
- Googleは重複として両方の評価を下げる
- リポジトリに両ファイルが残っていた（`past_work.html` は git履歴に `dc80a1e [vonds] past_work.htmlフォールバック追加` とある）

### 2.3 真因C【重】トップh1に「SEO対策」完全一致フレーズ不在

- title: 「山梨県の**SEO対策**・ホームページ制作…」← 完全一致あり
- h1: 「山梨の集客を、SEOの力で変える。」← **完全一致なし**
- title と h1 の一貫性崩壊
- h1 は検索上位要因として title の次に重要。キーワード一貫性シグナルが弱体化

### 2.4 真因D【重】title連続変更によるGoogle再評価期間

- リニューアル後に `667745e` → `edf5255` の2回連続title改修
- GA4に3種類のtitleが計上
- Googleは「このサイトは不安定」と判定 → 順位を一旦フラットにしてから再計算
- 本来は一時的現象だが、他の真因（特にA）と重なって回復が進まない

### 2.5 真因E【中】内部リンクのアンカーテキストが弱い

- サービスカードのリンクテキストは4本全部「詳しく見る →」という汎用アンカー
- Googleは内部リンクのアンカーテキストも評価シグナルとして使う
- 「山梨 SEO対策」完全一致のアンカーテキストで `/works/seo/` に権威を渡せば、本丸ページの関連性がさらに上がる

### 2.6 真因F【中】旧コンテンツと新トップの内部リンク断絶

- `/seo/report1/`, `/seo/semantic/`, `/net_biz/corona/`, `/kokodake/*` は全部生きている
- ナビ刷新により、新トップから旧ページへ、旧ページから新トップへのリンクが薄い
- 旧ページが蓄積してきたドメイン権威（被リンク・滞在時間・エイジ）が新トップに流れない

### 2.7 真因G【低】test-lp / hearing_work / sample-preview のインデックス汚染リスク

- 作業用ファイルが noindex なしで公開ディレクトリに置かれていた
- Googleインデックスに入るとブランド毀損＋クロールバジェット浪費

---

## 3. 実施済み修正（mainブランチ・コミット `d679b8a`・push済）

### 3.1 変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `index.html` | h1修正 + サービスカード4本のアンカーテキスト強化 |
| `sitemap.xml` | 6URL → 21URL 全面再生成 |
| `past_work.html` | **削除**（重複解消） |
| `hearing_work/hearing/index.html` | `<meta name="robots" content="noindex, nofollow">` 追加 |
| `column/sample-preview/index.html` | `<meta name="robots" content="noindex, nofollow">` 追加 |
| `scripts/generate_sitemap.py` | **新規作成**（全index.html走査＋noindex自動除外＋git lastmod取得） |

### 3.2 index.html の具体的変更

**h1変更:**
```diff
- <h1 class="hero-title">
-   山梨の集客を、<br>
-   <span class="hero-accent">SEOの力</span>で変える。
- </h1>
+ <h1 class="hero-title">
+   山梨の<span class="hero-accent">SEO対策</span>で、<br>
+   集客を結果で変える。
+ </h1>
```

**サービスカード アンカーテキスト変更:**
```diff
- <a href="/works/seo/">詳しく見る →</a>
+ <a href="/works/seo/">山梨 SEO対策の詳細を見る →</a>

- <a href="/works/web/">詳しく見る →</a>
+ <a href="/works/web/">山梨のホームページ制作の詳細を見る →</a>

- <a href="/works/ads/">詳しく見る →</a>
+ <a href="/works/ads/">山梨のGoogle広告運用の詳細を見る →</a>

- <a href="/works/ai/">詳しく見る →</a>
+ <a href="/works/ai/">AI活用支援の詳細を見る →</a>
```

### 3.3 新 sitemap.xml 登録URL（21本）

```
優先度1.0: /
優先度0.9: /works/ /works/ads/ /works/ai/ /works/seo/ /works/web/
優先度0.8: /column/
優先度0.7: /company/ /past_work/
優先度0.6: /column/seo-howto-guide/ /column/what-is-seo/ /column/yamanashi-seo/
優先度0.5: /kokodake/ /kokodake/fan/ /kokodake/report1-2/ /kokodake/seikou/
          /seo/ /seo/report1/ /seo/semantic/
優先度0.4: /net_biz/ /net_biz/corona/
```

（`/column/sample-preview/` は noindex のため自動除外）

### 3.4 scripts/generate_sitemap.py の仕様

- リポジトリ全体をwalkして `index.html` を検出
- 除外ディレクトリ prefix: `test-lp/`, `hearing_work/`, `majistretch/`, `kaitori-backup*/`, `vonds-site/`, `scripts/`, `proposal/`, `rina/`, `.git/`, `.claude/` 他
- `<meta name="robots" content="noindex">` を検出したページを**自動スキップ**
- 各ページの `lastmod` は git log の最終コミット日付から取得
- priority ルールをパスから自動判定
- 今後 `python3 scripts/generate_sitemap.py` 一発で再生成可能

---

## 4. 本番反映ブロッカー（運用事故）

### 4.1 事故の本質

**vonds.co.jp の GitHub Pages 配信元は `main` ではなく `gh-pages` ブランチ。**

```
gh api repos/office-vonds/noyuto/pages
→ "source": {"branch":"gh-pages","path":"/"}
→ "build_type": "legacy"
```

- WORKING_PROTOCOL.md は「作業は必ずmain、gh-pagesは手動禁止」と規定
- しかし**main→gh-pagesの自動同期機構は存在しない**（`.github/workflows/` 空、cron 等も無し）
- 結果、WORKING_PROTOCOL の理念と実態が乖離

### 4.2 ブランチ分岐の実態

```
main だけに存在する 20 commits（gh-pagesへ未反映）
  ↳ 今日の[vonds]SEO修正 d679b8a も含む
  ↳ 他Claudeの作業（本気ストレッチLP・ads-audit・majistretchCSV 等）も含む

gh-pages だけに存在する 20 commits（mainへ未反映）
  最新: 8329283 "SEO完全自動プランを正規サービスページとして配置"（2026-04-10 08:50）
  ↳ works/seo/auto-plan/index.html 追加
  ↳ subsidy/docs/ 配下の補助金書類（経営計画書・補助事業計画書・令和6年CSV・再開手順）
```

### 4.3 Pagesビルド履歴

最終ビルド: **2026-04-10 08:50:27 UTC**
最終コミット: `8329283`（これが現在本番で動いているバージョン）
以降、mainへの全pushはPagesトリガーされず、本番は昨日朝のまま凍結。

---

## 5. 復旧オプション

### オプションA【最速・最小侵襲】

**gh-pagesブランチに `d679b8a` だけをcherry-pickしてpush**

手順:
```bash
cd ~/projects/vonds
git fetch origin gh-pages
git checkout -b temp-recovery origin/gh-pages
git cherry-pick d679b8a
# コンフリクト発生時は gh-pages 側の最新 index.html / sitemap.xml をベースに
# 俺の6ファイル分の変更を手動で再適用
git push origin temp-recovery:gh-pages
# 5分以内に本番反映確認
```

**メリット**
- 今日中（数十分以内）に SEO 修正が本番反映
- 他のmain/gh-pages差分には一切触らない
- 変更範囲が自分の6ファイルに限定される

**リスク**
- 対象ファイル（特に `index.html`, `sitemap.xml`）が gh-pages 側で別改修を受けている可能性
- `works/seo/auto-plan/` 追加に伴うナビ変更が `index.html` に入っていれば確実にコンフリクト
- コンフリクト解決を慎重にやる必要がある（ただし6ファイルなのでスコープは小さい）

**後に残る問題**
- main と gh-pages の分岐問題はそのまま（別途根本解決が必要）
- 今日以降のClaude作業が再びgh-pages未反映になる

---

### オプションB【根本解決・運用刷新】

**main と gh-pages を統合し、以後は main 1本運用に切替**

手順:
1. **差分レビュー**: main と gh-pages の20コミットずつを読んで、双方の必要変更を特定
2. **main にgh-pagesのコミットをマージ** (`git merge origin/gh-pages`)
   - コンフリクト: `works/seo/auto-plan/`, `subsidy/docs/*`, `index.html` 等
   - 補助金書類と auto-plan は確実に残す
3. **mainをgh-pagesに強制push** (`git push origin main:gh-pages --force-with-lease`)
4. **Pages設定のsourceを`main`に変更** (`gh api -X PUT repos/office-vonds/noyuto/pages -f source[branch]=main`)
5. 以後 mainpush → 自動Pagesビルド
6. WORKING_PROTOCOL.md の該当記述を更新

**メリット**
- 二度と同じ事故が起きない
- 運用が単純化（1ブランチ）
- 他Claudeの作業も即反映される

**リスク**
- マージコンフリクト処理が20×20コミット分必要
- Pages設定変更の副作用（想定外）
- 作業時間: 1〜2時間
- **destructive操作（--force-with-lease）を含むため NOYUTO の明示的承認が必要**

---

### オプションC【慎重・社長主導】

**俺は状況整理と手順書だけ、実作業はNOYUTOがGitHub管理画面で実施**

- メリット: 社長が全権掌握、ブランチ破壊リスクゼロ
- デメリット: 遅い、SEOダメージが続く、俺が介在しない意味が薄い

---

## 6. 推奨アクション

### 6.1 短期（今日中）
**オプションA を実行** → `d679b8a` を gh-pages へ cherry-pick → 本番反映

理由:
- 「山梨 SEO対策」圏外で1日経過するごとにGoogleの再評価サイクル回復が遅れる
- 変更スコープが自分の6ファイル限定なのでコンフリクト解決も現実的
- リスク/リターンの比が最も良い

### 6.2 中期（今週中）
**オプションB を慎重に実行**
- 先にmainとgh-pagesの20コミットずつを精査する時間を取る
- 補助金書類（gh-pages側にのみ存在）を main に取り込む
- auto-plan ページ（gh-pages側にのみ存在）を main に取り込む
- 統合後にPages設定を main に切替
- 以後の全Claude作業が自動デプロイされる状態に戻す

### 6.3 NOYUTO 自身の作業（A/B実行後）

**Google Search Console 側で必須の作業:**

1. **sitemap.xml 再送信**
   - GSC → サイトマップ → `sitemap.xml` を再送信
   - 新21URLがGoogleに通知される

2. **URL検査ツールで主要ページを手動インデックス登録**
   - トップ `/`
   - `/works/seo/`（最優先）
   - `/works/web/`
   - `/works/ads/`
   - `/works/ai/`
   - 各ページで「インデックス登録をリクエスト」ボタン

3. **カバレッジレポートの確認**
   - 除外されているURLの理由確認
   - 「検出 - インデックス未登録」「クロール済み - インデックス未登録」の件数変化を追跡

4. **パフォーマンスレポートで順位観測**
   - 「山梨 SEO対策」「山梨 ホームページ制作」「甲府 SEO」の表示回数・平均掲載順位を日次で追跡
   - 復旧目安: 2〜4週間（Googleの再クロールと再評価のサイクル）

---

## 7. 付録

### 7.1 バックアップ

作業開始時の元ファイルを退避済み:
```
/tmp/vonds_backup_20260411_1305/
├── index.html      (54,511 bytes)
├── sitemap.xml     (1,108 bytes)
└── past_work.html  (26,787 bytes)
```

### 7.2 今回push済みコミット

```
commit d679b8a (origin/main)
Author: Claude Opus 4.6
Date:   2026-04-11
[vonds] 「山梨 SEO対策」圏外転落対応 SEO修正一式

6 files changed, 230 insertions(+), 647 deletions(-)
```

### 7.3 関連スクリプト

- `scripts/ga4_snapshot.py` — GA4 9プロパティ一括KPI取得（このセッションで作成）
- `scripts/generate_sitemap.py` — sitemap.xml自動生成（このセッションで作成）
- `data/ga4/snapshot_28d.json` — GA4 28日分生データ（gitignore済・再生成可）

### 7.4 GA4取得コマンド（再現用）

```bash
cd ~/projects/vonds
GOOGLE_APPLICATION_CREDENTIALS=/home/ozawakiryu0902/credentials/ga4-mcp.json \
  .venv-ga4/bin/python scripts/ga4_snapshot.py > data/ga4/snapshot_28d.json
```

### 7.5 sitemap再生成コマンド

```bash
cd ~/projects/vonds
python3 scripts/generate_sitemap.py
# → sitemap.xml が自動で更新される
```

### 7.6 メモリ更新が必要なもの

この問題を踏まえて次のメモリを追加/更新すべき:

- `reference_vonds_deploy.md`（新規）
  - vonds.co.jp の Pages 配信元は gh-pages
  - main → gh-pages の自動同期は無し（運用ギャップ）
  - B完了後にmain運用へ更新
- `feedback_verify_deploy_target.md`（新規）
  - 本番デプロイ修正を行う前に、必ず `gh api repos/.../pages` でPages sourceブランチを確認
  - 「mainにpushしたから反映される」と仮定するな

---

## 8. NOYUTOへの質問事項

1. **オプションA（今日中の緊急反映）を実行していいか？**
2. **オプションB（main統合＋Pages source切替）はいつ着手するか？**（今週中推奨）
3. **gh-pages側にしかない `works/seo/auto-plan/` の扱いは？** 今後もmainに取り込んで継続運用するか？
4. **補助金書類（gh-pages側のsubsidy/docs/*）はmainにマージしていいか？** 機密性の観点で判断要
5. **ブランチ統合作業は俺主導で進めていいか？** それとも社長自身が管理画面で？

---

**ドキュメント終わり**

この資料は `seo/vonds-seo-recovery-plan-20260411.md` に保存されている。
別PC/別セッションからも同じ内容で引き継ぎ可能。
