#!/usr/bin/env python3
"""
place-recruit-images.py で行った変更をバックアップHTMLから完全ロールバック。
使い方: python3 rollback-recruit-images.py [backup_dir_name]
省略時は最新の backups/ サブディレクトリを使用。
"""
import sys
import xmlrpc.client
from pathlib import Path

WP = xmlrpc.client.ServerProxy('https://kizuna-job.com/xmlrpc.php')
USER = 'link-group'
PASS = 'pjj9khxxrypm'

SCRIPT_DIR = Path(__file__).resolve().parent
BACKUP_ROOT = SCRIPT_DIR / 'backups'

if len(sys.argv) >= 2:
    backup_dir = BACKUP_ROOT / sys.argv[1]
else:
    dirs = sorted([d for d in BACKUP_ROOT.iterdir() if d.is_dir()])
    if not dirs:
        print('バックアップが見つかりません', file=sys.stderr)
        sys.exit(1)
    backup_dir = dirs[-1]

print(f'=== ロールバック from {backup_dir} ===\n')

for html_file in sorted(backup_dir.glob('*.html')):
    stem = html_file.stem  # 例: 40_contact
    pid_str, slug = stem.split('_', 1)
    pid = int(pid_str)
    content = html_file.read_text(encoding='utf-8')
    try:
        WP.wp.editPost(0, USER, PASS, pid, {'post_content': content})
        print(f'  OK: {slug:<12} id={pid}  {len(content)}字 復元')
    except Exception as e:
        print(f'  NG: {slug:<12} id={pid}  {e}')

print('\n=== 完了 ===')
