## 目的
絆求人サイト（kizuna-job.com）のWordPressカスタムテーマ構築・SEO最適化・コンテンツ投入

## サイト概要
- URL: https://kizuna-job.com
- ターゲットKW: 「山梨 風俗 求人」3位以内
- WordPress 6.6.5 / WPXサーバー
- カスタムテーマ: kizuna-job-theme

## プロジェクトディレクトリ
~/projects/vonds/kizuna-job/（メイン開発リポジトリ）
~/noyuto/scripts/kizuna-job/（スクリプト同期先）

## 実行コマンド

### テーマデプロイ
```bash
cd ~/projects/vonds/kizuna-job
FTP_PASS=kiryu0902 python3 scripts/deploy-theme-ftp.py
```

### 固定ページ更新（XML-RPC）
```bash
python3 scripts/update-pages-xmlrpc.py
```

### コントラスト修正
```bash
python3 scripts/fix-contrast-v2.py
```

### ギャラリー画像生成
```bash
python3 scripts/generate-gallery-images.py
```

## 依存関係・前提条件
- Python 3.12+
- Pillow（画像生成用）
- NotoSansCJKjp-Bold.otf（~/.local/share/fonts/）
- FTP: sv1092.wpx.ne.jp / kizuna-job.com / kiryu0902
- WordPress: link-group / pjj9khxxrypm

## 構成ページ（11ページ + ブログ）
| slug | ID | 内容 |
|------|-----|------|
| home | 90 | トップLP（front-page.php） |
| salary | 30 | お給料 |
| guarantee | 32 | 保証制度 |
| flow | 36 | 入店の流れ |
| security | 34 | 安心・安全 |
| beginner | 28 | 未経験の方 |
| mature | 38 | 30代以上 |
| dormitory | 124 | 寮 |
| qa | 220 | Q&A |
| contact | 40 | お問い合わせ |
| privacy | 310 | プライバシーポリシー |
| blog | -- | スタッフブログ（staff_blog CPT） |

## 連絡先導線
- 電話: 080-6636-0902
- LINE: http://line.me/ti/p/iZbLQQ9CbO
- メール: kizuna0511@au.com
