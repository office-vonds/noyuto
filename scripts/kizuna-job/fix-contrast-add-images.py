#!/usr/bin/env python3
"""
全ページの色コントラスト修正 + 画像・ビジュアル要素追加
"""

import re
import xmlrpc.client

wp = xmlrpc.client.ServerProxy('https://kizuna-job.com/xmlrpc.php')
USER = 'link-group'
PASS = 'pjj9khxxrypm'
IMG = 'https://kizuna-job.com/wp-content/themes/kizuna-job-theme/images'

def fix_contrast(html):
    """色コントラスト問題を一括修正"""

    # パターン1: <th> に color:#fff があるが background がない → background追加
    html = re.sub(
        r'<th\s+style="([^"]*?)padding:([^"]*?)color:\s*#fff([^"]*?)"',
        r'<th style="\1padding:\2background:#d4488e;color:#fff\3"',
        html
    )

    # パターン2: <tr> に background があるが <th> に background がない
    # tr style="background:#1a1a2e" の中の th に background を追加
    html = re.sub(
        r'(<tr[^>]*style="[^"]*background:\s*#1a1a2e[^"]*"[^>]*>)\s*(<th\s+style=")(padding)',
        r'\1\2background:#1a1a2e;\3',
        html
    )
    html = re.sub(
        r'(<tr[^>]*style="[^"]*background:\s*#d4488e[^"]*"[^>]*>)\s*(<th\s+style=")(padding)',
        r'\1\2background:#d4488e;\3',
        html
    )

    # パターン3: color:#fff が background なしで使われている箇所に背景追加
    # ただし既に background がある場合はスキップ
    def fix_white_text(match):
        style = match.group(1)
        if 'background' not in style and 'color:#fff' in style.replace(' ', ''):
            style = 'background:#1a1a2e;' + style
        return f'style="{style}"'

    # th/td で color:#fff が背景なしの箇所を修正
    html = re.sub(
        r'<(th|td)\s+style="((?:(?!background)[^"])*color:\s*#fff[^"]*)"',
        lambda m: f'<{m.group(1)} style="background:#1a1a2e;{m.group(2)}"'
            if 'background' not in m.group(2) else m.group(0),
        html
    )

    # パターン4: div内のcolor:#fffで背景がないもの
    html = re.sub(
        r'<div\s+style="((?:(?!background)[^"])*color:\s*#fff[^"]*)"',
        lambda m: f'<div style="background:#1a1a2e;{m.group(1)}"'
            if 'background' not in m.group(1) else m.group(0),
        html
    )

    # パターン5: span/p内のcolor:#fffで背景がないもの → 色をvar(--dark)/#1a1a2eに変更
    html = re.sub(
        r'<(span|p|h[1-6])\s+style="((?:(?!background)[^"])*?)color:\s*#fff(;?[^"]*)"',
        lambda m: f'<{m.group(1)} style="{m.group(2)}color:#1a1a2e{m.group(3)}"'
            if 'background' not in m.group(2) else m.group(0),
        html
    )

    return html


# ===== 各ページ用の画像・ビジュアル要素 =====

# SVGアイコンをインライン化（セクション区切りに使用）
def icon_box(emoji, title, color='#d4488e'):
    return f'''<div style="display:flex;align-items:center;gap:16px;margin:32px 0 20px;padding:20px 24px;background:linear-gradient(135deg,{color}08,{color}15);border-left:4px solid {color};border-radius:0 12px 12px 0;">
<span style="font-size:2rem;">{emoji}</span>
<h2 style="margin:0;font-size:1.3rem;color:#1a1a2e;">{title}</h2>
</div>'''

def section_image(img_file, alt, caption=''):
    cap = f'<p style="text-align:center;font-size:.8rem;color:#999;margin-top:8px;">{caption}</p>' if caption else ''
    return f'''<div style="margin:30px 0;text-align:center;">
<img src="{IMG}/{img_file}" alt="{alt}" style="width:100%;max-width:700px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.1);">
{cap}
</div>'''

def stat_cards(items):
    """統計カード群を生成"""
    cards = ''
    for num, label, color in items:
        cards += f'''<div style="flex:1;min-width:140px;text-align:center;padding:24px 16px;background:linear-gradient(135deg,{color}10,{color}20);border-radius:12px;">
<div style="font-size:2rem;font-weight:900;color:{color};">{num}</div>
<div style="font-size:.85rem;color:#555;margin-top:4px;">{label}</div>
</div>'''
    return f'<div style="display:flex;flex-wrap:wrap;gap:16px;margin:24px 0;">{cards}</div>'

def cta_block():
    return f'''<div style="margin:40px 0;padding:32px;background:linear-gradient(135deg,#1a1a2e,#2d1b4e);border-radius:16px;text-align:center;">
<p style="color:#fff;font-size:1.2rem;font-weight:700;margin:0 0 8px;">まずはお気軽にご相談ください</p>
<p style="color:rgba(255,255,255,.7);font-size:.9rem;margin:0 0 20px;">24時間受付・匿名OK・秘密厳守</p>
<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">
<a href="tel:08066360902" style="display:inline-block;padding:14px 28px;background:#d4488e;color:#fff;border-radius:50px;font-weight:700;text-decoration:none;">電話する 080-6636-0902</a>
<a href="http://line.me/ti/p/iZbLQQ9CbO" style="display:inline-block;padding:14px 28px;background:#06c755;color:#fff;border-radius:50px;font-weight:700;text-decoration:none;" target="_blank" rel="noopener">LINEで相談</a>
</div>
</div>'''


# ===== ページ更新 =====
pages_to_update = [30, 32, 34, 36, 28, 38, 124, 220, 40]

print('=== 色コントラスト修正 + 画像追加 ===\n')

for pid in pages_to_update:
    post = wp.wp.getPost(0, USER, PASS, pid, ['post_content', 'post_name'])
    content = post['post_content']
    slug = post['post_name']
    old_len = len(content)

    # 1. 色コントラスト修正
    content = fix_contrast(content)

    # 2. ページごとの画像・ビジュアル追加
    if slug == 'salary':
        # 給料ページ: 統計カードとCTA追加
        if stat_cards([]) not in content:
            stats = stat_cards([
                ('60,000+', '日給（10h）', '#d4488e'),
                ('90%', '採用率', '#06c755'),
                ('12部屋', '寮完備', '#4a90d9'),
                ('0円', 'ノルマ・罰金', '#c9a84c'),
            ])
            content = stats + content
        if 'まずはお気軽' not in content[-500:]:
            content += cta_block()

    elif slug == 'guarantee':
        # 保証ページ
        if f'{IMG}/' not in content:
            content = section_image('vanilla-main.jpeg', '絆の保証制度', '安心の保証システムであなたの収入を守ります') + content
        stats = stat_cards([
            ('100%', '全員に保証適用', '#d4488e'),
            ('差額補填', '届かなくても安心', '#06c755'),
            ('相談OK', '希望額を設定', '#4a90d9'),
        ])
        if '全員に保証適用' not in content:
            content = content.replace('<h2', stats + '<h2', 1)
        if 'まずはお気軽' not in content[-500:]:
            content += cta_block()

    elif slug == 'flow':
        # 入店の流れ
        if f'{IMG}/' not in content:
            content = section_image('official-hero.jpg', '入店までの流れ', '応募から最短即日で体験入店できます') + content
        if f'{IMG}/vanilla-interview' not in content:
            # 面接セクションの後に画像追加
            content = content.replace(
                'STEP 3',
                f'{section_image("vanilla-interview.jpg", "面接イメージ", "カフェなどリラックスできる場所で")}STEP 3'
            )
        if 'まずはお気軽' not in content[-500:]:
            content += cta_block()

    elif slug == 'security':
        # 安心安全: 既に1画像あるが追加
        stats = stat_cards([
            ('0%', '身バレリスク', '#d4488e'),
            ('24h', 'スタッフ待機', '#06c755'),
            ('GPS', '安全管理', '#4a90d9'),
            ('顧問', '弁護士対応', '#c9a84c'),
        ])
        if '身バレリスク' not in content:
            # 最初のh2の前に統計カード
            content = content.replace('<h2', stats + '<h2', 1)
        if 'まずはお気軽' not in content[-500:]:
            content += cta_block()

    elif slug == 'beginner':
        # 未経験: 既に2画像あるが追加
        stats = stat_cards([
            ('90%+', '未経験採用率', '#d4488e'),
            ('35,000円', '体験入店日給', '#06c755'),
            ('0人', '男性講習なし', '#4a90d9'),
        ])
        if '未経験採用率' not in content:
            content = content.replace('<h2', stats + '<h2', 1)
        if f'{IMG}/kizuna-photo' not in content:
            content = content.replace(
                '先輩キャスト',
                f'{section_image("kizuna-photo-3.jpg", "先輩キャストのサポート", "困ったことはいつでも相談OK")}先輩キャスト'
            )
        if 'まずはお気軽' not in content[-500:]:
            content += cta_block()

    elif slug == 'mature':
        # 30代以上: 1画像 → 追加
        stats = stat_cards([
            ('90%', '採用率', '#d4488e'),
            ('30〜50代', '活躍中', '#06c755'),
            ('不問', '容姿・体型', '#4a90d9'),
        ])
        if '活躍中' not in content[:2000]:
            content = content.replace('<h2', stats + '<h2', 1)
        if f'{IMG}/kizuna-photo' not in content:
            content = content.replace(
                'こんな方に選ばれ',
                f'{section_image("kizuna-photo-2.jpg", "30代以上のキャストが活躍中", "年齢を気にせず高収入を得られます")}こんな方に選ばれ'
            )
        if 'まずはお気軽' not in content[-500:]:
            content += cta_block()

    elif slug == 'dormitory':
        # 寮: 0画像 → 追加
        if f'{IMG}/' not in content:
            content = section_image('kizuna-photo-1.jpeg', '絆の寮・住環境', '個室ワンルームで快適な暮らし') + content
        stats = stat_cards([
            ('12部屋', '個室ワンルーム', '#d4488e'),
            ('即入寮', '面接当日から', '#06c755'),
            ('全部屋', '家具家電付き', '#4a90d9'),
            ('無料', 'バニラ経由の寮費', '#c9a84c'),
        ])
        if '個室ワンルーム' not in content[:3000]:
            content = content.replace('<h2', stats + '<h2', 1)
        if 'まずはお気軽' not in content[-500:]:
            content += cta_block()

    elif slug == 'qa':
        # Q&A: 0画像 → ヘッダー画像追加
        if f'{IMG}/' not in content:
            content = section_image('vanilla-sub.jpeg', 'よくある質問', 'あなたの疑問・不安にお答えします') + content
        if 'まずはお気軽' not in content[-500:]:
            content += cta_block()

    elif slug == 'contact':
        # お問い合わせ: 0画像
        if f'{IMG}/' not in content:
            content = section_image('logo.png', '絆にお問い合わせ') + content

    # 更新
    try:
        wp.wp.editPost(0, USER, PASS, pid, {'post_content': content})
        new_len = len(content)
        img_count = content.count('<img')
        print(f'  OK: {slug:<15} {old_len:>6} → {new_len:>6}字  img:{img_count}枚')
    except Exception as e:
        print(f'  NG: {slug:<15} {e}')

print('\n=== 完了 ===')
