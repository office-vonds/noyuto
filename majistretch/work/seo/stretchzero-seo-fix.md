# ストレッチゼロ（stretchzero.jp）SEO緊急改善指示書

**作成日**: 2026年4月9日
**対象サイト**: https://stretchzero.jp（WordPress）
**現状**: Googleインデックス1ページのみ / 主要KW圏外

---

## 1. 【最優先】インデックス問題の修正

### 1-1. Google Search Console 確認・設定

```
1. https://search.google.com/search-console にアクセス
2. プロパティ追加 → URLプレフィックス → https://stretchzero.jp
3. 所有権確認（HTMLタグ方式推奨 → WordPress <head>にメタタグ貼付）
4. 「ページ」→ インデックス未登録ページを確認
5. 「URL検査」→ 主要ページのインデックス登録をリクエスト
```

### 1-2. サイトマップ送信

WordPressプラグイン「XML Sitemap Generator for Google」をインストール:

```
1. WP管理画面 → プラグイン → 新規追加
2. 「XML Sitemap Generator for Google」を検索・インストール・有効化
3. 設定 → XML-Sitemap で生成確認
4. Search Console → サイトマップ → https://stretchzero.jp/sitemap.xml を送信
```

### 1-3. robots.txt 確認・修正

WordPress管理画面のYoast SEOまたはAll in One SEOで確認。以下が理想:

```
User-agent: *
Allow: /
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php
Sitemap: https://stretchzero.jp/sitemap.xml
```

**注意**: `Disallow: /` が設定されていないか必ず確認。これが原因でインデックスされていない可能性大。

### 1-4. noindex確認

```
WP管理画面 → 設定 → 表示設定
→ 「検索エンジンがサイトをインデックスしないようにする」のチェックが外れていることを確認
```

各ページの個別noindex設定も確認（Yoast SEO → 各ページ編集画面 → 詳細設定）

---

## 2. ブランド移行（ストレッチラボ → ストレッチゼロ）

### 2-1. 301リダイレクト設定

旧ドメイン stretchlabo.jp を所有している場合、.htaccess に以下を追加:

```apache
# stretchlabo.jp の .htaccess
RewriteEngine On
RewriteCond %{HTTP_HOST} ^(www\.)?stretchlabo\.jp$ [NC]
RewriteRule ^(.*)$ https://stretchzero.jp/$1 [R=301,L]
```

### 2-2. Search Console「アドレス変更」

```
1. Search Console で stretchlabo.jp のプロパティを選択
2. 設定 → アドレス変更
3. 新しいサイト: stretchzero.jp を指定
4. 確認・申請
```

### 2-3. 旧ブランド名の残存チェック

サイト全体で「ストレッチラボ」「stretchlabo」の残存を確認し、全て「ストレッチゼロ」「stretchzero」に置換:
- titleタグ
- meta description
- h1/h2/h3見出し
- 画像alt属性
- Schema.org構造化データ
- OGPタグ
- SNSプロフィール（X、Instagram、LINE、Googleビジネスプロフィール）

---

## 3. タイトルタグ・メタディスクリプション最適化

### トップページ
```html
<title>ストレッチゼロ｜山梨初のストレッチ専門店《公式》</title>
<meta name="description" content="山梨県のストレッチ専門店ストレッチゼロ。理学療法士・鍼灸師など国家資格保有トレーナーが1対1で施術。リピート率80%以上。甲府・南アルプス・韮崎に4店舗展開。">
```

### 症状別ページ
```html
<!-- 肩こり -->
<title>甲府の肩こり改善ストレッチ｜国家資格保有トレーナーが施術｜ストレッチゼロ</title>
<meta name="description" content="甲府市で肩こりにお悩みの方へ。ストレッチゼロでは理学療法士が原因を特定し、1対1の完全個室でパーソナルストレッチを提供。根本改善をサポートします。">

<!-- 腰痛 -->
<title>甲府の腰痛改善ストレッチ｜1対1完全個室｜ストレッチゼロ</title>
<meta name="description" content="甲府市で腰痛にお悩みの方へ。ストレッチゼロでは国家資格保有トレーナーが腰痛の原因を分析し、あなた専用のストレッチプログラムで根本改善を目指します。">

<!-- 首こり -->
<title>甲府の首こり・スマホ首改善ストレッチ｜ストレッチゼロ</title>
<meta name="description" content="首こり・スマホ首・ストレートネックでお悩みの方へ。甲府のストレッチ専門店ストレッチゼロが、首周りの筋肉を丁寧にほぐし根本改善をサポートします。">

<!-- 骨盤矯正 -->
<title>甲府の骨盤矯正ストレッチ｜産後ケアにも対応｜ストレッチゼロ</title>
<meta name="description" content="甲府市で骨盤の歪みが気になる方へ。ストレッチゼロでは骨盤周りの筋肉バランスを整えるパーソナルストレッチで、姿勢改善・産後ケアをサポートします。">
```

### 店舗ページ
```html
<!-- 甲府上石田店 -->
<title>ストレッチゼロ 甲府上石田店｜甲府市のストレッチ専門店</title>
<meta name="description" content="ストレッチゼロ甲府上石田店。山梨県甲府市上石田3丁目12-12。国家資格保有トレーナーによる1対1のパーソナルストレッチ。60分〜120分コースをご用意。">
```

---

## 4. Schema.org 構造化データ

### 全ページ共通（LocalBusiness）

```json
{
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  "name": "ストレッチゼロ 甲府上石田店",
  "image": "https://stretchzero.jp/images/store-kamiishida.jpg",
  "url": "https://stretchzero.jp",
  "telephone": "055-XXX-XXXX",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "上石田3丁目12-12",
    "addressLocality": "甲府市",
    "addressRegion": "山梨県",
    "postalCode": "400-0041",
    "addressCountry": "JP"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 35.65,
    "longitude": 138.57
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    "opens": "10:00",
    "closes": "20:00"
  },
  "priceRange": "¥6,000〜¥12,000"
}
```

### 症状別ページ（Service）

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "肩こり改善パーソナルストレッチ",
  "provider": {
    "@type": "HealthAndBeautyBusiness",
    "name": "ストレッチゼロ"
  },
  "areaServed": {
    "@type": "City",
    "name": "甲府市"
  },
  "description": "国家資格保有トレーナーによる1対1の肩こり改善ストレッチ"
}
```

### FAQページ

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "ストレッチゼロは予約制ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "はい、完全予約制です。お電話またはWeb予約フォームからご予約ください。"
      }
    }
  ]
}
```

---

## 5. WordPress新規固定ページ作成リスト

以下の固定ページをWordPressで作成する:

| ページ名 | パーマリンク | ターゲットKW | 優先度 |
|---|---|---|---|
| 肩こり改善ストレッチ | /katakori/ | 甲府 肩こり ストレッチ | 高 |
| 腰痛改善ストレッチ | /youtsu/ | 甲府 腰痛 ストレッチ | 高 |
| 首こり改善ストレッチ | /kubikori/ | 甲府 首こり ストレッチ | 高 |
| 骨盤矯正ストレッチ | /kotsuban/ | 甲府 骨盤矯正 ストレッチ | 高 |
| パーソナルストレッチとは | /personal-stretch/ | 山梨 パーソナルストレッチ | 中 |
| 料金・コース | /price/ | ストレッチゼロ 料金 | 中 |
| お客様の声 | /voice/ | ストレッチゼロ 口コミ | 中 |
| よくある質問 | /faq/ | ストレッチ 専門店 FAQ | 中 |
| 甲斐響が丘店 | /shop/kai/ | 甲斐 ストレッチ | 低 |
| 南アルプス店 | /shop/minami-alps/ | 南アルプス ストレッチ | 低 |
| 韮崎店 | /shop/nirasaki/ | 韮崎 ストレッチ | 低 |

---

## 6. 内部リンク構造

```
トップページ
├── 症状別ページ（肩こり・腰痛・首こり・骨盤矯正）
│   └── 各ページから → 予約ページ
│   └── 各ページから → 関連する他の症状ページ
│   └── 各ページから → お客様の声
├── 店舗ページ（4店舗）
│   └── 各店舗 → Google Maps埋め込み
│   └── 各店舗 → 予約ページ
├── 料金・コース
├── お客様の声
├── FAQ
└── ブログ（月2-4記事投稿）
    └── 各記事から → 関連する症状ページへ内部リンク
```

---

## 7. Googleビジネスプロフィール最適化

### 4店舗全てで以下を実施:

1. **カテゴリ**: プライマリ「ストレッチ教室」、セカンダリ「理学療法クリニック」
2. **サービス**: 60分コース / 75分コース / 90分コース / 120分コース を登録
3. **属性**: 完全予約制、駐車場あり、女性トレーナー在籍
4. **写真**: 店内写真10枚以上 / 施術風景5枚以上 / スタッフ写真3枚以上
5. **投稿**: 週2回以上（症状別の豆知識 + 予約促進）
6. **口コミ返信**: 全口コミに24時間以内に返信（KW含める）

---

## 8. コンテンツ戦略（ブログ）

### 月間投稿カレンダー

| 週 | テーマ | キーワード例 |
|---|---|---|
| 第1週 | 症状×原因解説 | 肩こり 原因, デスクワーク 肩こり |
| 第2週 | セルフケア | 自宅 ストレッチ 肩こり |
| 第3週 | お客様事例 | ストレッチ 効果 体験談 |
| 第4週 | 専門家コラム | 理学療法士 ストレッチ 違い |

---

## 9. 優先アクションチェックリスト

| # | アクション | 所要時間 | 担当 |
|---|---|---|---|
| 1 | Search Console登録・noindex確認 | 30分 | WEB担当 |
| 2 | robots.txt修正・サイトマップ送信 | 30分 | WEB担当 |
| 3 | 旧ブランド名の残存チェック・置換 | 1時間 | WEB担当 |
| 4 | 301リダイレクト設定（stretchlabo.jp） | 30分 | サーバー担当 |
| 5 | 症状別固定ページ4ページ作成 | 4時間 | ライター+WEB |
| 6 | 全ページのtitle/meta description最適化 | 2時間 | WEB担当 |
| 7 | Schema.org構造化データ追加 | 2時間 | WEB担当 |
| 8 | GBP最適化（4店舗） | 3時間 | 店舗担当 |
| 9 | 店舗別固定ページ作成 | 2時間 | ライター+WEB |
| 10 | ブログ運用開始（月4記事） | 継続 | ライター |
