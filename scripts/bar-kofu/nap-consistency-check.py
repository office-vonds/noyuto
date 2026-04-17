#!/usr/bin/env python3
"""BAR KOFU NAP整合性チェッカー — 自サイト＋外部サイトのNAP情報が一致しているかを監視

自サイトは正確に一致していることを前提に、
- 外部サイト（食べログ・Retty等）が登録されているか
- 登録されている場合、NAP情報が一致しているか
を確認する。

使い方:
  python3 nap-consistency-check.py        # 一括チェック
  python3 nap-consistency-check.py --json  # JSON出力

cron 月次実行推奨:
  0 4 1 * * /usr/bin/python3 /path/to/nap-consistency-check.py >> ... 2>&1
"""

import re, sys, json, urllib.request, urllib.parse
from datetime import datetime

# ── 正規NAP ──
NAP = {
    'name': 'BAR KOFU',
    'name_alt': ['バー・コウフ', 'バーコウフ', 'バー コウフ'],
    'postal': '400-0041',
    'address_full': '山梨県甲府市上石田4丁目8-28 ゆうきタウン2F 207',
    'address_patterns': [
        '上石田4丁目8-28',
        '上石田4-8-28',
        '上石田4-8-28 ゆうきタウン',
    ],
    'phone': '055-287-6458',
    'phone_patterns': ['055-287-6458', '055 287 6458', '0552876458', '05528766458'],
    'url': 'https://bar-kofu.com',
}

TARGETS = [
    # (name, search_url, check_url_template)
    ('自サイト',  'https://bar-kofu.com/',  'https://bar-kofu.com/'),
    ('Google Maps',  'https://www.google.com/maps/search/?api=1&query=BAR+KOFU+甲府',  None),
    ('食べログ',  'https://tabelog.com/rstLst/?LstPrf=SA19&SrtT=rt&search_word=BAR+KOFU',  None),
    ('Retty',  'https://retty.me/search/?keyword=BAR+KOFU+甲府',  None),
    ('ホットペッパー',  'https://beauty.hotpepper.jp/CSP/...',  None),
    ('ぐるなび',  'https://r.gnavi.co.jp/eki/jr_kofu/rs/?&fw=BAR+KOFU',  None),
    ('エキテン',  'https://www.ekiten.jp/search_all_bar-kofu',  None),
    ('Yahoo!ロコ',  'https://loco.yahoo.co.jp/search?p=BAR+KOFU+甲府',  None),
]

def fetch(url, timeout=10):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read().decode('utf-8', errors='ignore')
    except Exception as e:
        return f'ERROR: {e}'

def check_nap(html, target_name):
    if html.startswith('ERROR:'):
        return {'status': 'error', 'detail': html, 'name_found': False, 'phone_found': False, 'address_found': False}

    result = {
        'status': 'ok',
        'name_found': NAP['name'] in html or any(n in html for n in NAP['name_alt']),
        'phone_found': any(p in html.replace('-', '').replace(' ', '') or p in html for p in NAP['phone_patterns']),
        'address_found': any(a in html for a in NAP['address_patterns']),
    }
    result['consistency'] = all([result['name_found'], result['phone_found'], result['address_found']])
    return result

def main():
    json_mode = '--json' in sys.argv
    results = []

    for name, search_url, _ in TARGETS:
        print(f'Checking: {name} ... ', end='', flush=True)
        html = fetch(search_url)
        r = check_nap(html, name)
        r['target'] = name
        r['checked_at'] = datetime.now().isoformat()
        results.append(r)
        if r['status'] == 'error':
            print(f'ERROR')
        elif r.get('consistency'):
            print('✅ NAP一致')
        else:
            missing = [k for k in ['name_found','phone_found','address_found'] if not r.get(k)]
            print(f'⚠️ 不整合/未掲載 (missing: {missing})')

    print('\n─── サマリ ───')
    listed = sum(1 for r in results if r.get('consistency'))
    total = len(results)
    print(f'NAP一致: {listed}/{total}')

    if json_mode:
        print(json.dumps(results, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
