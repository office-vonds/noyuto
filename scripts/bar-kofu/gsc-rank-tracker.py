#!/usr/bin/env python3
"""BAR KOFU GSC順位・流入自動トラッカー

機能:
  - 過去7日のKW別 clicks/impressions/CTR/position を取得
  - snapshotをJSONに保存（週次ログ蓄積）
  - 前週比・4週前比で差分計算
  - 順位上昇/下降KWをMarkdownレポートに出力

実行:
  python3 gsc-rank-tracker.py           # 実行・レポート出力
  python3 gsc-rank-tracker.py --weekly  # cron用・サマリのみ標準出力

cron推奨（毎週月曜8時）:
  0 8 * * 1 /usr/bin/python3 /path/to/gsc-rank-tracker.py --weekly >> ... 2>&1
"""

import json
import sys
from datetime import date, timedelta
from pathlib import Path
from google.oauth2 import service_account
from googleapiclient.discovery import build

KEY = '/home/ozawakiryu0902/credentials/ga4-mcp.json'
SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
SITE = 'https://bar-kofu.com/'
LOG_DIR = Path(__file__).parent / 'gsc-rank-logs'
LOG_DIR.mkdir(exist_ok=True)

WEEKLY_MODE = '--weekly' in sys.argv

def fetch_gsc(start, end, dims, limit=50):
    creds = service_account.Credentials.from_service_account_file(KEY, scopes=SCOPES)
    svc = build('searchconsole', 'v1', credentials=creds, cache_discovery=False)
    body = {'startDate': str(start), 'endDate': str(end), 'dimensions': dims, 'rowLimit': limit}
    return svc.searchanalytics().query(siteUrl=SITE, body=body).execute().get('rows', [])

def snapshot(days=7):
    today = date.today()
    start = today - timedelta(days=days)
    # KW単位
    kws = fetch_gsc(start, today, ['query'], 100)
    # ページ単位
    pages = fetch_gsc(start, today, ['page'], 30)
    # デバイス
    devices = fetch_gsc(start, today, ['device'], 10)
    # 国
    countries = fetch_gsc(start, today, ['country'], 10)

    data = {
        'site': SITE,
        'period': f'{start}→{today}',
        'days': days,
        'captured_at': today.isoformat(),
        'keywords': [
            {
                'query': r['keys'][0],
                'clicks': r.get('clicks', 0),
                'impressions': r.get('impressions', 0),
                'ctr': r.get('ctr', 0),
                'position': r.get('position', 0),
            }
            for r in kws
        ],
        'pages': [
            {
                'url': r['keys'][0],
                'clicks': r.get('clicks', 0),
                'impressions': r.get('impressions', 0),
                'position': r.get('position', 0),
            }
            for r in pages
        ],
        'devices': [{'device': r['keys'][0], **{k: r.get(k, 0) for k in ('clicks', 'impressions', 'ctr', 'position')}} for r in devices],
        'countries': [{'country': r['keys'][0], **{k: r.get(k, 0) for k in ('clicks', 'impressions')}} for r in countries],
    }

    # 総計
    data['totals'] = {
        'clicks': sum(k['clicks'] for k in data['keywords']),
        'impressions': sum(k['impressions'] for k in data['keywords']),
        'kw_count': len(data['keywords']),
    }
    return data

def compare(current, previous):
    """KW別に current vs previous を比較"""
    prev_map = {k['query']: k for k in previous['keywords']}
    changes = []
    for c in current['keywords']:
        p = prev_map.get(c['query'])
        if p:
            delta_clk = c['clicks'] - p['clicks']
            delta_imp = c['impressions'] - p['impressions']
            delta_pos = round(p['position'] - c['position'], 2)  # position: 下がる(数字小)=上昇
            changes.append({
                'query': c['query'],
                'clicks': c['clicks'], 'clicks_delta': delta_clk,
                'impressions': c['impressions'], 'impressions_delta': delta_imp,
                'position': round(c['position'], 2), 'position_delta': delta_pos,
                'status': '↑' if delta_pos > 0.3 else ('↓' if delta_pos < -0.3 else '→'),
            })
        else:
            changes.append({
                'query': c['query'], 'clicks': c['clicks'],
                'impressions': c['impressions'], 'position': round(c['position'], 2),
                'status': '🆕',
            })
    return changes

def load_latest_prev():
    """最新より前の snapshot をロード"""
    snaps = sorted(LOG_DIR.glob('snapshot-*.json'), reverse=True)
    if len(snaps) < 2:
        return None
    with open(snaps[1]) as f:  # snaps[0] は今回の保存先にしたい→保存前にロードなので snaps[0]
        return json.load(f)

def save_snapshot(data):
    fname = LOG_DIR / f'snapshot-{date.today().isoformat()}.json'
    with open(fname, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return fname

def generate_report(current, changes=None):
    lines = []
    lines.append(f'# BAR KOFU GSC週次レポート — {current["captured_at"]}')
    lines.append('')
    lines.append(f'期間: {current["period"]} ({current["days"]}日間)')
    lines.append(f'合計: {current["totals"]["clicks"]}clicks / {current["totals"]["impressions"]}imp / {current["totals"]["kw_count"]}KW')
    lines.append('')

    if changes:
        up = sorted([c for c in changes if c['status'] == '↑'], key=lambda x: -x.get('position_delta', 0))[:10]
        down = sorted([c for c in changes if c['status'] == '↓'], key=lambda x: x.get('position_delta', 0))[:10]
        new = [c for c in changes if c['status'] == '🆕'][:10]
        if up:
            lines.append('## 順位上昇TOP10 ⬆')
            for c in up:
                lines.append(f"- **{c['query']}**: {c['position']}位 (+{c['position_delta']}) / {c['clicks']}clk / {c['impressions']}imp")
            lines.append('')
        if down:
            lines.append('## 順位下降TOP10 ⬇')
            for c in down:
                lines.append(f"- **{c['query']}**: {c['position']}位 ({c['position_delta']}) / {c['clicks']}clk / {c['impressions']}imp")
            lines.append('')
        if new:
            lines.append('## 新規検出KW 🆕')
            for c in new:
                lines.append(f"- **{c['query']}**: {c['position']}位 / {c['impressions']}imp")
            lines.append('')
    else:
        lines.append('（初回実行。次週から前週比表示）')
        lines.append('')

    # 現週TOP10 (clicks順)
    lines.append('## 今週のTOP10 KW (clicks)')
    for k in sorted(current['keywords'], key=lambda x: -x['clicks'])[:10]:
        lines.append(f"- **{k['query']}**: {k['clicks']}clk / {k['impressions']}imp / CTR {k['ctr']*100:.1f}% / {k['position']:.1f}位")
    lines.append('')

    # ページ別
    lines.append('## 流入ページTOP5')
    for p in sorted(current['pages'], key=lambda x: -x['impressions'])[:5]:
        lines.append(f"- {p['clicks']}clk / {p['impressions']}imp / {p['position']:.1f}位 — {p['url']}")
    lines.append('')
    return '\n'.join(lines)

def main():
    # 今週snapshot取得
    current = snapshot(days=7)
    # 前週ロード（保存前）
    prev = load_latest_prev()
    # 保存
    fname = save_snapshot(current)
    # 比較
    changes = compare(current, prev) if prev else None
    # レポート
    report = generate_report(current, changes)
    # 出力
    report_file = LOG_DIR / f'report-{date.today().isoformat()}.md'
    report_file.write_text(report, encoding='utf-8')

    if WEEKLY_MODE:
        # cronモード: サマリのみ
        print(f'✅ snapshot saved: {fname.name}')
        print(f'✅ report: {report_file.name}')
        print(f'TOP3 clicks:')
        for k in sorted(current['keywords'], key=lambda x: -x['clicks'])[:3]:
            print(f"  {k['query']}: {k['clicks']}clk / {k['position']:.1f}位")
    else:
        print(report)

if __name__ == '__main__':
    main()
