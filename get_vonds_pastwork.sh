#!/bin/bash
# VONDS past_workページ取得
set -e
FTP_HOST="sv1092.wpx.ne.jp"
FTP_USER="vonds.co.jp"
FTP_PASS="kiryu0902"
FTP_OPTS="set ftp:ssl-force true; set ssl:verify-certificate false"
WORK_DIR=~/noyuto/vonds-site/past_work

mkdir -p "$WORK_DIR"

echo "VONDS past_work ページ取得中..."

# past_workディレクトリがあるか確認してダウンロード
lftp -u "$FTP_USER","$FTP_PASS" -e "$FTP_OPTS; \
  ls past_work/ 2>/dev/null; \
  ls vonds.co.jp/public_html/past_work/ 2>/dev/null; \
  ls wp-content/themes/ 2>/dev/null; \
  quit" "$FTP_HOST" 2>&1 | tee ~/noyuto/vonds_ftp_structure.txt

echo ""
echo "ルートディレクトリ構造:"
lftp -u "$FTP_USER","$FTP_PASS" -e "$FTP_OPTS; ls; quit" "$FTP_HOST" 2>&1 | tee -a ~/noyuto/vonds_ftp_structure.txt

echo "完了。構造を確認: cat ~/noyuto/vonds_ftp_structure.txt"
