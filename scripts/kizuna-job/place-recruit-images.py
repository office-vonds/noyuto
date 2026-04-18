#!/usr/bin/env python3
"""
WPメディアライブラリにアップ済みの絆求人素材を各固定ページに配置する。

前提: scripts/kizuna-job/kizuna-uploaded-images.json に画像URLが保存されていること
挙動: ページHTMLの先頭にヒーロー画像、中盤に補助画像を挿入
安全: 既にその画像URLが含まれているページはスキップ（二重挿入防止）
バックアップ: 実行時にscripts/kizuna-job/backups/YYYYMMDD_HHMM/ に現HTMLを保存
"""
import json
import os
import sys
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

def u(name):
    if name not in IMG:
        print(f'  !! 画像URLが無い: {name}', file=sys.stderr)
        sys.exit(1)
    return IMG[name]['url']

def hero(img_name, alt, caption=''):
    src = u(img_name)
    cap = f'<p style="text-align:center;font-size:.85rem;color:#888;margin-top:10px;">{caption}</p>' if caption else ''
    return (f'<div style="margin:0 0 32px;text-align:center;">'
            f'<img src="{src}" alt="{alt}" '
            f'style="width:100%;max-width:950px;border-radius:16px;'
            f'box-shadow:0 6px 24px rgba(0,0,0,.12);">'
            f'{cap}</div>')

def section(img_name, alt, caption=''):
    src = u(img_name)
    cap = f'<p style="text-align:center;font-size:.8rem;color:#999;margin-top:8px;">{caption}</p>' if caption else ''
    return (f'<div style="margin:32px 0;text-align:center;">'
            f'<img src="{src}" alt="{alt}" '
            f'style="width:100%;max-width:700px;border-radius:12px;'
            f'box-shadow:0 4px 20px rgba(0,0,0,.1);">'
            f'{cap}</div>')

# ページ配置プラン (id, slug, hero画像, 追加画像リスト)
PLAN = [
    (40,  'contact',    'babelロゴ.png',          [('biginer633-533.png', '絆 未経験OK', '')]),
    (220, 'qa',         'GF049_350A.jpg',        []),
    (32,  'guarantee',  'hoayo800-450.png',      [('kyuryo800-450.png', '絆 給料・保証額イメージ', '')]),
    (34,  'security',   'ansin310-214.png',      []),
    (30,  'salary',     'heikin800-350.png',     [('kyuryo800-450.png', '絆 日給・月収モデル', '')]),
    (38,  'mature',     'GF103_350A.jpg',        []),
    (28,  'beginner',   'biginer633-533.png',    []),
    (36,  'flow',       'S_4740109362377.jpg',   []),
    (124, 'dormitory',  'kyubo_img_1_20240718152424_50162.jpg',  []),
]

TS = time.strftime('%Y%m%d_%H%M')
BACKUP_DIR = BACKUP_ROOT / TS
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

print(f'=== 絆JOB 画像配置 ({TS}) ===')
print(f'バックアップ先: {BACKUP_DIR}\n')

for pid, slug, hero_img, extra_imgs in PLAN:
    try:
        post = WP.wp.getPost(0, USER, PASS, pid, ['post_content', 'post_name', 'post_title'])
    except Exception as e:
        print(f'  !! ID {pid}: getPost失敗 {e}')
        continue

    content = post['post_content']
    title = post['post_title']
    old_len = len(content)

    # バックアップ
    (BACKUP_DIR / f'{pid}_{slug}.html').write_text(content, encoding='utf-8')

    hero_url = u(hero_img)
    already_hero = hero_url in content
    hero_alt = IMG[hero_img]['alt']

    changed = False

    # ヒーロー画像を先頭に追加
    if not already_hero:
        content = hero(hero_img, hero_alt) + content
        changed = True

    # 追加画像（ページ末尾付近に挿入、CTAブロックの前）
    for img_name, alt, cap in extra_imgs:
        src = u(img_name)
        if src in content:
            continue
        sec_html = section(img_name, alt, cap)
        # CTAブロックの前に入れる（"まずはお気軽" 前）、無ければ末尾
        if 'まずはお気軽' in content:
            content = content.replace('まずはお気軽', sec_html + '\n<p style="margin:0">まずはお気軽', 1)
        else:
            content += '\n' + sec_html
        changed = True

    new_len = len(content)
    if not changed:
        print(f'  SKIP: {slug:<12} (既に配置済み) img:{content.count("<img")}')
        continue

    try:
        WP.wp.editPost(0, USER, PASS, pid, {'post_content': content})
        img_count = content.count('<img')
        diff = new_len - old_len
        print(f'  OK: {slug:<12} {old_len:>6} → {new_len:>6} (+{diff:>4})  img:{img_count}')
    except Exception as e:
        print(f'  NG: {slug:<12} {e}')

print('\n=== 完了 ===')
print(f'バックアップ: {BACKUP_DIR}')
