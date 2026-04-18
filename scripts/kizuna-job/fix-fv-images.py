#!/usr/bin/env python3
"""
絆JOB各固定ページのFV画像を絆純正素材に置換。

既存HTMLの<img src="...">部分のみ書き換え、レイアウト・周辺構造は一切触らない。
姉妹店バニラ流用画像(vanilla-*)や汎用(official-*, hitoduma-*)を絆素材に置換する。

安全: 実行前に全HTMLをbackups/配下にバックアップ
"""
import json
import time
import xmlrpc.client
from pathlib import Path

WP = xmlrpc.client.ServerProxy('https://kizuna-job.com/xmlrpc.php')
USER = 'link-group'
PASS = 'pjj9khxxrypm'

SCRIPT_DIR = Path(__file__).resolve().parent
IMAGES_JSON = SCRIPT_DIR / 'kizuna-uploaded-images.json'
BACKUP_ROOT = SCRIPT_DIR / 'backups'

with IMAGES_JSON.open() as f:
    IMG = json.load(f)

def url(key):
    return IMG[key]['url']

# ページ単位の置換マッピング: { page_id: { 既存ファイル名片(部分一致可): 新画像key }}
PAGE_REPLACEMENTS = {
    220: {  # qa
        'vanilla-sub.jpeg': 'GF049_350A.jpg',
    },
    32: {   # guarantee
        'vanilla-main.jpeg': 'hoayo800-450.png',
    },
    34: {   # security
        'vanilla-sub.jpeg': 'ansin310-214.png',
    },
    30: {   # salary
        'official-hero.jpg': 'kyuryo800-450.png',
    },
    38: {   # mature
        'hitoduma-main.jpg': 'shiori-600-800-4.jpg',
    },
    28: {   # beginner
        'vanilla-taiken.jpg': 'S_4740109362377.jpg',
    },
    36: {   # flow
        'official-hero.jpg': 'GF059_350A.jpg',
        'vanilla-interview.jpg': 'S_4740109362377.jpg',
        'vanilla-sub4.jpeg': 'GF049_350A.jpg',
    },
}

TS = time.strftime('%Y%m%d_%H%M')
BACKUP_DIR = BACKUP_ROOT / f'fv_fix_{TS}'
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

SLUGS = {40:'contact', 220:'qa', 32:'guarantee', 34:'security',
         30:'salary', 38:'mature', 28:'beginner', 36:'flow', 124:'dormitory'}

print(f'=== FV画像置換 ({TS}) ===')
print(f'バックアップ: {BACKUP_DIR}\n')

for pid, repl_map in PAGE_REPLACEMENTS.items():
    slug = SLUGS.get(pid, str(pid))
    post = WP.wp.getPost(0, USER, PASS, pid, ['post_content'])
    content = post['post_content']
    (BACKUP_DIR / f'{pid}_{slug}.html').write_text(content, encoding='utf-8')

    changes = []
    for old_fragment, new_key in repl_map.items():
        if old_fragment in content:
            new_url = url(new_key)
            # src内の該当部分を絆素材URL丸ごとに置換（周辺HTML構造は触らない）
            # 既存は themes/kizuna-job-theme/images/{old_fragment} 形式
            old_theme_path = f'wp-content/themes/kizuna-job-theme/images/{old_fragment}'
            if old_theme_path in content:
                # スキーム有り/無し両対応で置換
                for prefix in ('https://kizuna-job.com/', '//kizuna-job.com/', ''):
                    target = prefix + old_theme_path
                    if target in content and target != new_url:
                        content = content.replace(target, new_url)
                        changes.append(f'{old_fragment} → {new_key}')
                        break
            else:
                # 画像パスが他パターンの場合も念のため名前単位で試す
                # (安全側: 何もしない)
                pass
        else:
            pass

    if not changes:
        print(f'  SKIP: {slug:<12} id={pid}  (対象画像なし)')
        continue

    try:
        WP.wp.editPost(0, USER, PASS, pid, {'post_content': content})
        print(f'  OK: {slug:<12} id={pid}')
        for ch in changes:
            print(f'    · {ch}')
    except Exception as e:
        print(f'  NG: {slug:<12} id={pid}  {e}')

print('\n=== 完了 ===')
print(f'ロールバック: python3 rollback-recruit-images.py fv_fix_{TS}')
