#!/usr/bin/env python3
"""
kizuna-job テーマをFTPでWordPressにデプロイ
"""

import os
import ftplib
import sys

FTP_HOST = os.getenv('FTP_HOST', 'sv1092.wpx.ne.jp')
FTP_USER = os.getenv('FTP_USER', 'kizuna-job.com')
FTP_PASS = os.getenv('FTP_PASS', '')

THEME_LOCAL = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'wordpress-theme', 'kizuna-job-theme')
THEME_REMOTE = '/wp-content/themes/kizuna-job-theme'

if not FTP_PASS:
    FTP_PASS = input('FTPパスワードを入力: ')

def ensure_remote_dir(ftp, path):
    """リモートディレクトリを再帰的に作成"""
    dirs = path.strip('/').split('/')
    current = ''
    for d in dirs:
        current += f'/{d}'
        try:
            ftp.cwd(current)
        except ftplib.error_perm:
            ftp.mkd(current)
            ftp.cwd(current)

def upload_dir(ftp, local_dir, remote_dir):
    """ディレクトリを再帰的にアップロード"""
    ensure_remote_dir(ftp, remote_dir)

    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = f'{remote_dir}/{item}'

        if os.path.isdir(local_path):
            upload_dir(ftp, local_path, remote_path)
        else:
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {remote_path}', f)
                print(f'  UP: {remote_path}')

def main():
    print(f'FTP接続中: {FTP_HOST}')
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, 21, timeout=30)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.encoding = 'utf-8'
    print(f'接続成功: {ftp.getwelcome()}')

    print(f'\nテーマをアップロード中...')
    upload_dir(ftp, THEME_LOCAL, THEME_REMOTE)

    ftp.quit()
    print('\nアップロード完了！')
    print('次のステップ:')
    print('  1. https://kizuna-job.com/wp-admin/themes.php でテーマを有効化')
    print('  2. 表示設定でフロントページを固定ページに設定')

if __name__ == '__main__':
    main()
