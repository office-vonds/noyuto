#!/bin/bash
# 本気ストレッチLP — PC対応＋アニメーション追加
# メインPCで実行: bash ~/noyuto/majistretch_lp_update.sh

set -e

FTP_HOST="sv1092.wpx.ne.jp"
FTP_USER="majistretch.com"
FTP_PASS="uv3ihpxcmhlg"
FTP_OPTS="set ftp:ssl-force true; set ssl:verify-certificate false"
LP_DIR=~/noyuto/majistretch/lp
PUBLIC_HTML="majistretch.com/public_html/lp"

echo "=========================================="
echo "本気ストレッチLP — PC対応＋アニメーション"
echo "=========================================="

mkdir -p "$LP_DIR"

# 1. ダウンロード
echo "[1/5] LPファイルをダウンロード中..."
lftp -u "$FTP_USER","$FTP_PASS" -e "$FTP_OPTS; mirror $PUBLIC_HTML/ $LP_DIR/; quit" "$FTP_HOST"
echo "  ダウンロード完了"
echo "  ファイル一覧:"
find "$LP_DIR" -type f | sort

# 2. 構造確認
echo ""
echo "[2/5] ファイル構造を確認中..."
echo "  HTML:"
find "$LP_DIR" -name "*.html" | sort
echo "  CSS:"
find "$LP_DIR" -name "*.css" | sort
echo "  JS:"
find "$LP_DIR" -name "*.js" | sort

echo ""
echo "ダウンロード完了。構造を確認してから修正スクリプトを実行してください。"
echo "構造確認: find $LP_DIR -type f | sort"
