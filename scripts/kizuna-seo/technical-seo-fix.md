# 絆JOB (kizuna-job.com) テクニカルSEO緊急修正ガイド

**作成日:** 2026-04-09
**現状:** Googleインデックス2ページのみ（/over30/、/biginer/）。トップページ未インデックス。ブランド検索で競合サイト（kizunajob.net）が上位表示。

---

## 1. インデックス緊急対応（最優先 - 今週中に実施）

### 1-1. robots.txt の監査

```
# 確認手順
1. https://kizuna-job.com/robots.txt にアクセス
2. 以下が含まれていないか確認：
   - Disallow: /  ← 全ページブロック（致命的）
   - User-agent: Googlebot ... Disallow ← Google専用ブロック
3. Google Search Console > 設定 > クロール > robots.txt でテスト
```

**正しい robots.txt の例:**
```
User-agent: *
Allow: /
Sitemap: https://kizuna-job.com/sitemap.xml
```

**注意:** 風俗求人サイトでは、制作会社が意図的にrobots.txtでブロックしているケースがある。これがインデックスされない最大の原因である可能性が高い。

### 1-2. noindex メタタグの確認

```html
<!-- 全ページのソースコードで以下を検索 -->
<meta name="robots" content="noindex">
<meta name="robots" content="noindex, nofollow">
<meta name="googlebot" content="noindex">
```

**確認方法:**
1. 各ページでCtrl+U（ソース表示）→「noindex」で検索
2. Chrome DevTools > Elements > `<head>` 内を確認
3. JavaScript で動的に挿入されている場合もあるため、「検証」でレンダリング後のHTMLも確認

**WordPress の場合:**
- 設定 > 表示設定 >「検索エンジンがサイトをインデックスしないようにする」がオンになっていないか確認
- Yoast SEO / All in One SEO のページ個別設定で noindex になっていないか確認

### 1-3. sitemap.xml の作成と送信

**sitemap.xml が存在しない場合は即座に作成する。**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://kizuna-job.com/</loc>
    <lastmod>2026-04-09</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://kizuna-job.com/over30/</loc>
    <lastmod>2026-04-09</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://kizuna-job.com/biginer/</loc>
    <lastmod>2026-04-09</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- 新規作成するページも随時追加 -->
</urlset>
```

**送信手順:**
1. Google Search Console にログイン
2. サイトマップ > `https://kizuna-job.com/sitemap.xml` を入力して送信
3. ステータスが「成功しました」になるまで確認

### 1-4. Google Search Console の設定

```
1. Search Console にサイトを登録（未登録の場合）
   - URL プレフィックス: https://kizuna-job.com/
   - DNS認証 または HTMLファイル認証
2. サイトマップを送信（上記 1-3）
3. URL検査ツールで以下のページを手動リクエスト：
   - https://kizuna-job.com/（トップページ ← 最優先）
   - https://kizuna-job.com/over30/
   - https://kizuna-job.com/biginer/
   - その他全ページ
4. 「インデックス登録をリクエスト」ボタンを押す
5. カバレッジレポートでエラーを確認
```

### 1-5. JavaScript レンダリング問題の確認

```
1. Google Search Console > URL検査 > 対象URLを入力
2. 「ライブURLをテスト」をクリック
3. 「テスト済みのページを表示」>「スクリーンショット」タブ
4. ページが正しく描画されているか確認
5. 真っ白 or コンテンツ欠落 → JSレンダリング問題あり
```

**対処法:**
- サーバーサイドレンダリング（SSR）の導入
- 重要なコンテンツはHTMLに直接記述する
- Dynamic Rendering の導入を検討

---

## 2. 基本SEOインフラ整備（1-2週間以内）

### 2-1. タイトルタグの最適化

**全ページに一意のタイトルタグを設定する。**

| ページ | 現状（推定） | 改善案 |
|--------|-------------|--------|
| トップ | 不明/未設定 | `絆JOB（きずなジョブ）｜山梨県の高収入女性求人サイト【公式】` |
| /over30/ | 不明 | `30代からの風俗求人｜年齢を強みに変える働き方【絆JOB山梨】` |
| /biginer/ | 不明 | `風俗未経験の方へ｜初めてでも安心して働ける【絆JOB山梨】` |

**ルール:**
- 30〜35文字以内（全角）
- ブランド名「絆JOB」を必ず含める
- 対象キーワードを前方に配置
- 各ページで重複しない

### 2-2. メタディスクリプションの最適化

```html
<!-- トップページ例 -->
<meta name="description" content="絆JOB（きずなジョブ）は山梨県に特化した高収入女性求人サイト。甲府・富士吉田エリアのナイトワーク・風俗求人を厳選掲載。未経験歓迎・日払い対応・寮完備。">
```

**ルール:**
- 80〜120文字以内（全角）
- 行動喚起を含める（「今すぐ応募」「詳しくはこちら」など）
- ターゲットキーワードを自然に含める
- 各ページで重複しない

### 2-3. canonical URL の設定

```html
<!-- 全ページの <head> 内に設定 -->
<link rel="canonical" href="https://kizuna-job.com/（そのページの正規URL）">
```

**注意点:**
- http と https の重複を防ぐ
- www あり/なし の統一
- 末尾スラッシュの統一
- パラメータ付きURL の正規化

### 2-4. OGP（Open Graph）タグの設定

```html
<meta property="og:title" content="絆JOB｜山梨県の高収入女性求人サイト">
<meta property="og:description" content="山梨県に特化した高収入女性求人サイト。未経験歓迎・日払い対応。">
<meta property="og:type" content="website">
<meta property="og:url" content="https://kizuna-job.com/">
<meta property="og:image" content="https://kizuna-job.com/ogp.jpg">
<meta property="og:site_name" content="絆JOB">
<meta property="og:locale" content="ja_JP">
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="絆JOB｜山梨県の高収入女性求人サイト">
<meta name="twitter:description" content="山梨県に特化した高収入女性求人サイト。">
<meta name="twitter:image" content="https://kizuna-job.com/ogp.jpg">
```

### 2-5. 見出し階層（H1/H2/H3）の最適化

```
正しい構造:
<h1>ページの主題（1ページに1つだけ）</h1>
  <h2>セクション見出し</h2>
    <h3>サブセクション</h3>
  <h2>次のセクション見出し</h2>
    <h3>サブセクション</h3>

間違い:
- H1 が複数ある
- H1 が存在しない
- H2 を飛ばして H3 を使用
- 見出しタグを装飾目的で使用
```

**各ページのH1例:**
- トップ: `山梨県の高収入女性求人なら絆JOB`
- /over30/: `30代以上歓迎の高収入求人`
- /biginer/: `風俗未経験でも安心して働けるお店`

---

## 3. コンテンツ戦略（1ヶ月以内に着手）

### 3-1. キーワード別ランディングページの作成

**keywords.json に基づき、以下のページを優先的に作成する。**

**第1優先（1-2週間）:**
1. `/yamanashi-koushunyu-kyujin/` - 山梨 高収入 求人 女性
2. `/kofu-nightwork-kyujin/` - 甲府 ナイトワーク 求人
3. `/yamanashi-delivery-kyujin/` - 山梨 デリヘル 求人
4. `/kizuna-group-yamanashi/` - きずなグループ 山梨

**第2優先（2-4週間）:**
5. `/fuzoku-mikeiken-fuan/` - 風俗 未経験 不安
6. `/taiken-nyuten-nagare/` - 体験入店 流れ
7. `/fuzoku-hibarai-kyujin/` - 風俗 日払い 求人
8. `/fuzoku-barenai-houhou/` - 風俗 バレない 方法

### 3-2. ブログコンテンツ計画（月間スケジュール）

| 月 | テーマ | 記事タイトル例 | ターゲットKW |
|----|--------|---------------|-------------|
| 4月 | 未経験向け | 風俗未経験で不安な方へ｜初めてでも安心の理由 | 風俗 未経験 不安 |
| 4月 | FAQ | 風俗で働いていることがバレない方法 | 風俗 バレない 方法 |
| 5月 | 体験談 | 体験入店の流れを完全解説 | 体験入店 流れ |
| 5月 | 給与 | 風俗の給料相場を業種別に比較 | 風俗 給料 相場 |
| 6月 | 年齢 | 30代からの風俗求人ガイド | 30代 風俗 求人 |
| 6月 | 手続き | 風俗で働く女性の確定申告ガイド | 風俗 確定申告 やり方 |
| 7月 | 退店 | 風俗の正しい辞め方 | 風俗 辞め方 |
| 7月 | 業種比較 | 未経験におすすめの業種ランキング | 風俗 未経験 おすすめ 業種 |

**月2本のペースで最低半年間継続する。**

### 3-3. 内部リンク構造

```
トップページ
├── 地域別求人
│   ├── 甲府エリア求人
│   ├── 富士吉田エリア求人
│   └── その他山梨エリア求人
├── 業種別求人
│   ├── デリヘル求人
│   ├── ヘルス求人
│   └── ナイトワーク求人
├── お役立ちコラム（ブログ）
│   ├── 未経験向け記事群
│   ├── FAQ記事群
│   └── 給与・待遇記事群
├── 絆JOBについて（会社紹介）
└── よくある質問（FAQ一覧）
```

**内部リンクルール:**
- 全ページからトップページへリンク（グローバルナビ）
- 関連記事同士を相互リンク
- ブログ記事から求人ランディングページへ誘導リンクを設置
- パンくずリストを全ページに実装
- アンカーテキストにキーワードを含める（自然な形で）

### 3-4. Schema.org 構造化データ（JobPosting）

```json
{
  "@context": "https://schema.org/",
  "@type": "JobPosting",
  "title": "【山梨・甲府】デリヘルスタッフ募集｜未経験歓迎",
  "description": "山梨県甲府市のデリヘルスタッフ募集。未経験歓迎、日払い対応、寮完備。",
  "datePosted": "2026-04-09",
  "validThrough": "2026-07-09",
  "employmentType": "PART_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "絆JOB（きずなグループ）",
    "sameAs": "https://kizuna-job.com/",
    "logo": "https://kizuna-job.com/logo.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "甲府市",
      "addressRegion": "山梨県",
      "addressCountry": "JP"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "JPY",
    "value": {
      "@type": "QuantitativeValue",
      "value": 35000,
      "unitText": "DAY"
    }
  }
}
```

**注意:** 各求人ページにJobPosting構造化データを実装することで、Google求人検索への掲載が期待できる。

---

## 4. ブランド名SEO対策（並行して実施）

### 4-1. 「絆JOB」検索で競合サイトが上位表示される原因

**原因分析:**
1. **ドメインパワーの差:** kizunajob.net の方がドメイン歴・被リンク数で上回っている可能性
2. **トップページ未インデックス:** kizuna-job.com のトップページがGoogleに認識されていない
3. **タイトルタグにブランド名が含まれていない（推定）:** Googleがサイトとブランド名を紐づけられない
4. **コンテンツ量の差:** インデックス2ページでは情報量が圧倒的に不足
5. **被リンクゼロ（推定）:** 外部サイトから一切リンクされていない

### 4-2. ブランド指名検索を奪還する戦略

**即座に実施:**
1. トップページのタイトルタグに「絆JOB」を最前方に配置
   ```html
   <title>絆JOB（きずなジョブ）｜山梨県の高収入女性求人サイト【公式】</title>
   ```
2. 全ページのタイトルタグ末尾に「絆JOB」を追加
   ```html
   <title>ページ固有のタイトル｜絆JOB</title>
   ```
3. OGPタグのサイト名に「絆JOB」を設定
4. フッターに「絆JOB」を含む著作権表記を追加

**1ヶ月以内に実施:**
5. 「絆JOBについて」会社紹介ページを作成
6. 「絆JOB 口コミ・評判」ページを作成（体験談を掲載）
7. Google ビジネスプロフィールを作成し「絆JOB」をビジネス名に設定
8. SNS公式アカウント（Twitter/X）を「@kizunajob」で作成

**3ヶ月以内に実施:**
9. プレスリリース配信（PR TIMES等）で被リンク獲得
10. 地域メディア・地元ブログからの紹介リンク獲得
11. 求人ポータルサイトにブランド名入りで掲載

### 4-3. ドメインオーソリティ構築

- Google ビジネスプロフィール登録
- SNS プロフィールにURL記載（Twitter/X、LINE公式）
- 業界ディレクトリサイトへの登録
- 地域ポータルサイトへの掲載
- コンテンツマーケティングによる自然リンク獲得

---

## 5. 競合分析と差別化戦略

### 5-1. 主要競合サイト

| サイト名 | 強み | 弱み |
|----------|------|------|
| 俺の風 | 圧倒的コンテンツ量、全国展開 | 山梨特化ではない |
| FENIXJOB | 知名度、掲載店舗数 | 地域密着感が薄い |
| Indeed | ドメインパワー最強 | 風俗専門ではない |
| バニラ | 業界最大手 | 大手向け、個別サポートなし |
| kizunajob.net | 「絆JOB」ブランド奪取 | 実態不明 |

### 5-2. 大手ポータルに勝てない検索キーワード（避けるべき）

- 「風俗 求人」（単一ワード系は全国ポータルが独占）
- 「高収入 バイト」（Indeed、タウンワーク等が独占）
- 「ナイトワーク 求人」（FENIXJOB、バニラが上位独占）

### 5-3. 絆JOBが勝てるニッチキーワード戦略

**山梨特化の強み:**
- 「山梨 デリヘル 求人」→ 大手ポータルの山梨コンテンツは薄い
- 「甲府 ナイトワーク」→ 地域名3語以上の組み合わせは隙がある
- 「富士吉田 風俗 求人」→ 小都市名は大手がカバーしきれない

**お悩み系ロングテール:**
- 「風俗 未経験 不安 30代」→ 具体的な悩みには大手の一般記事より専門記事が勝つ
- 「体験入店 持ち物 服装」→ 実用的な情報は検索意図との一致度が高い
- 「風俗 子持ち シングルマザー」→ ターゲット特化記事は競合が少ない

**ローカルSEOの活用:**
- Google ビジネスプロフィールで「山梨 風俗 求人」のローカルパック表示を狙う
- 店舗所在地情報を充実させ、Googleマップでの視認性を高める
- 地域系のキーワードでは「地元の求人サイト」としての信頼性が武器になる

---

## 6. 優先アクションチェックリスト

### 今すぐ（本日中）
- [ ] robots.txt を確認し、クロールブロックがあれば即解除
- [ ] 全ページの noindex メタタグを確認し、あれば即削除
- [ ] Google Search Console にサイトを登録（未登録の場合）

### 今週中（7日以内）
- [ ] sitemap.xml を作成しサーバーにアップロード
- [ ] Search Console でサイトマップを送信
- [ ] トップページの URL検査 → インデックス登録リクエスト
- [ ] 全既存ページの URL検査 → インデックス登録リクエスト
- [ ] トップページのタイトルタグを最適化（「絆JOB」を含める）
- [ ] 全ページのメタディスクリプションを設定

### 2週間以内
- [ ] canonical URL を全ページに設定
- [ ] OGP タグを全ページに設定
- [ ] H1/H2 見出し階層を修正
- [ ] パンくずリストを実装
- [ ] 「絆JOBについて」会社紹介ページを作成
- [ ] 「きずなグループ山梨」紹介ページを作成

### 1ヶ月以内
- [ ] 地域別ランディングページを4ページ作成（甲府、富士吉田、山梨全域、デリヘル）
- [ ] ブログ記事を2本公開（「未経験の不安解消」「バレない方法」）
- [ ] JobPosting 構造化データを全求人ページに実装
- [ ] Google ビジネスプロフィールを作成
- [ ] SNS 公式アカウントを開設

### 3ヶ月以内
- [ ] ブログ記事を計6本以上公開
- [ ] 内部リンク構造を完成させる
- [ ] 被リンク獲得活動を開始（プレスリリース、地域メディア）
- [ ] 「絆JOB」ブランド検索で1位表示を達成
- [ ] インデックスページ数を15ページ以上に増加
- [ ] Search Console データを分析し、キーワード戦略を調整

---

## 補足：技術チェックコマンド

```bash
# robots.txt の確認
curl -s https://kizuna-job.com/robots.txt

# sitemap.xml の確認
curl -s https://kizuna-job.com/sitemap.xml

# トップページの title タグ確認
curl -s https://kizuna-job.com/ | grep -i '<title>'

# noindex 確認
curl -s https://kizuna-job.com/ | grep -i 'noindex'

# レスポンスヘッダーの確認（X-Robots-Tag）
curl -sI https://kizuna-job.com/ | grep -i 'x-robots-tag'

# Google インデックス数の確認（ブラウザで実行）
# site:kizuna-job.com
```

---

**最終目標:** 3ヶ月以内に「絆JOB」ブランド検索1位、6ヶ月以内に「山梨 風俗 求人」系キーワードで上位10位以内を達成する。
