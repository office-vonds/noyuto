#!/usr/bin/env python3
"""全ページのWCAGコントラスト問題を一括修正（267箇所）"""

import xmlrpc.client

wp = xmlrpc.client.ServerProxy('https://kizuna-job.com/xmlrpc.php')
USER = 'link-group'
PASS = 'pjj9khxxrypm'

def fix_all_contrast(html):
    """全コントラスト問題を修正"""

    # === B1: #999 → #555（薄すぎるグレー） ===
    html = html.replace('color:#999', 'color:#555')
    html = html.replace('color: #999', 'color: #555')

    # === B2: #aaa → #666 ===
    html = html.replace('color:#aaa', 'color:#666')
    html = html.replace('color: #aaa', 'color: #666')

    # === B4: LINE green buttons - darken bg ===
    html = html.replace('background:#06C755', 'background:#047a3a')
    html = html.replace('background:#06c755', 'background:#047a3a')
    html = html.replace('color:#06C755', 'color:#047a3a')
    html = html.replace('color:#06c755', 'color:#047a3a')

    # === B7: #ffe0eb on pink gradient → make whiter ===
    html = html.replace('color:#ffe0eb', 'color:#fff')

    # === B8: #666 in CTA dark sections → light ===
    # Only fix #666 that's inside dark bg CTAs (with specific context)
    html = html.replace(
        'color:#666;">匿名OK',
        'color:rgba(255,255,255,.7);">匿名OK'
    )
    html = html.replace(
        'color:#666;">24時間',
        'color:rgba(255,255,255,.7);">24時間'
    )

    # === C1: #d4488e pink text → darken to #b03070 for better contrast ===
    html = html.replace('color:#d4488e', 'color:#b03070')
    html = html.replace('color: #d4488e', 'color: #b03070')

    # === C3: Red/pink text colors → darken ===
    html = html.replace('color:#e8345e', 'color:#c42040')
    html = html.replace('color:#e94560', 'color:#c42040')
    html = html.replace('color:#e91e8c', 'color:#b03070')
    html = html.replace('color:#ff6bb5', 'color:#b03070')

    # Background versions of those reds - darken for white text
    html = html.replace('background:#e94560', 'background:#c42040')
    html = html.replace('background:#e8345e', 'background:#c42040')
    html = html.replace('background:#e91e8c', 'background:#b03070')
    html = html.replace('background:#ff6b9d', 'background:#c44070')

    # === C4: Colored text on matching tinted backgrounds ===
    html = html.replace('color:#16a34a', 'color:#0f7b36')  # green
    html = html.replace('color:#ca8a04', 'color:#9a6a04')  # gold
    html = html.replace('color:#a855f7', 'color:#7c3acd')  # purple
    html = html.replace('color:#ea580c', 'color:#b8440a')  # orange
    html = html.replace('color:#d4880f', 'color:#9a6a04')  # gold variant

    # === C5: #888 → #666 ===
    html = html.replace('color:#888', 'color:#666')
    html = html.replace('color: #888', 'color: #666')

    # === C6: Blue email button → darken ===
    html = html.replace('background:#4a90d9', 'background:#3568a8')

    # === Keep backgrounds as-is (only darken text/foreground) ===
    # Don't change background:#d4488e (buttons/badges where white text is on pink bg)
    # Those need pink bg darkened instead
    html = html.replace('background:#d4488e', 'background:#b03070')
    # But restore the CSS variable version (in theme, not inline)

    return html


# === 全ページ更新 ===
pages = [30, 32, 34, 36, 28, 38, 124, 220, 40]

print('=== WCAGコントラスト一括修正 v2 ===\n')

for pid in pages:
    post = wp.wp.getPost(0, USER, PASS, pid, ['post_content', 'post_name'])
    content = post['post_content']
    slug = post['post_name']
    old = content

    content = fix_all_contrast(content)

    if content != old:
        wp.wp.editPost(0, USER, PASS, pid, {'post_content': content})
        # Count changes
        changes = sum(1 for a, b in zip(old, content) if a != b)
        print(f'  OK: {slug:<15} ({changes} chars changed)')
    else:
        print(f'  --: {slug:<15} (変更なし)')

print('\n=== 完了 ===')
