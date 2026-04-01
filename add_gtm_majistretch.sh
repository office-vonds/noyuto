#!/bin/bash
# 本気ストレッチ — Google Analytics + GTM 追加スクリプト
# メインPCで実行: bash ~/noyuto/add_gtm_majistretch.sh

set -e

FTP_HOST="sv1092.wpx.ne.jp"
FTP_USER="majistretch.com"
FTP_PASS="uv3ihpxcmhlg"
FTP_OPTS="set ftp:ssl-force true; set ssl:verify-certificate false"
WORK_DIR=~/noyuto/majistretch/work
PUBLIC_HTML="majistretch.com/public_html"

echo "=========================================="
echo "本気ストレッチ — Gtag + GTM 追加"
echo "=========================================="

mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

# 1. 全HTMLファイルをダウンロード
echo "[1/3] HTMLファイルをダウンロード中..."
lftp -u "$FTP_USER","$FTP_PASS" -e "$FTP_OPTS; mirror -i '\.html$' -i '\.php$' $PUBLIC_HTML/ ./site/; quit" "$FTP_HOST"
echo "  ダウンロード完了"
echo "  ファイル一覧:"
find ./site/ -name "*.html" -o -name "*.php" | sort

# 2. 各HTMLファイルにGtag + GTMを追加
echo ""
echo "[2/3] トラッキングコードを追加中..."

GTAG_CODE='<!-- Google tag (gtag.js) -->\
<script async src="https://www.googletagmanager.com/gtag/js?id=G-93MZ8ERBW5"></script>\
<script>\
  window.dataLayer = window.dataLayer || [];\
  function gtag(){dataLayer.push(arguments);}\
  gtag('\''js'\'', new Date());\
  gtag('\''config'\'', '\''G-93MZ8ERBW5'\'');\
</script>'

GTM_HEAD='<!-- Google Tag Manager -->\
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'\''gtm.start'\'':\
new Date().getTime(),event:'\''gtm.js'\''});var f=d.getElementsByTagName(s)[0],\
j=d.createElement(s),dl=l!='\''dataLayer'\''?'\''&l='\''+l:'\'''\'';j.async=true;j.src=\
'\''https://www.googletagmanager.com/gtm.js?id='\''+i+dl;f.parentNode.insertBefore(j,f);\
})(window,document,'\''script'\'','\''dataLayer'\'','\''GTM-K32XLKXH'\'');</script>\
<!-- End Google Tag Manager -->'

GTM_BODY='<!-- Google Tag Manager (noscript) -->\
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K32XLKXH"\
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>\
<!-- End Google Tag Manager (noscript) -->'

count=0
for file in $(find ./site/ -name "*.html"); do
    # 既にgtagが入っていたらスキップ
    if grep -q "G-93MZ8ERBW5" "$file" 2>/dev/null; then
        echo "  スキップ（既存）: $file"
        continue
    fi

    # <head>の直後にGtag + GTM headを追加
    if grep -q '<head>' "$file" 2>/dev/null; then
        sed -i "/<head>/a\\
$GTAG_CODE\\
$GTM_HEAD" "$file"
    elif grep -q '<head' "$file" 2>/dev/null; then
        # <head ...>の場合
        sed -i "/<head[^>]*>/a\\
$GTAG_CODE\\
$GTM_HEAD" "$file"
    fi

    # <body>の直後にGTM noscriptを追加
    if grep -q '<body>' "$file" 2>/dev/null; then
        sed -i "/<body>/a\\
$GTM_BODY" "$file"
    elif grep -q '<body' "$file" 2>/dev/null; then
        sed -i "/<body[^>]*>/a\\
$GTM_BODY" "$file"
    fi

    echo "  追加完了: $file"
    count=$((count + 1))
done

echo "  合計 ${count} ファイルに追加"

# 3. アップロード
echo ""
echo "[3/3] サーバーにアップロード中..."
lftp -u "$FTP_USER","$FTP_PASS" -e "$FTP_OPTS; mirror -R ./site/ $PUBLIC_HTML/; quit" "$FTP_HOST"

echo ""
echo "=========================================="
echo "完了！"
echo "=========================================="
echo ""
echo "追加したコード:"
echo "  1. Google Analytics (gtag.js) — G-93MZ8ERBW5"
echo "  2. Google Tag Manager — GTM-K32XLKXH"
echo ""
echo "確認:"
echo "  https://majistretch.com/"
echo "  https://majistretch.com/privacy/"
echo "  https://majistretch.com/faq/"
echo "  https://majistretch.com/company/"
