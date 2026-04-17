#!/usr/bin/env python3
"""SANKEN週次パフォーマンスレポート自動生成

対象: ストレッチゼロ / 本気ストレッチ（買取は管轄外）
GA4実データを集計してMarkdownレポ生成 → ads-audit/weekly-reports/ に保存

実行:
  source ~/projects/vonds/.venv-ga4/bin/activate
  GOOGLE_APPLICATION_CREDENTIALS=/home/ozawakiryu0902/credentials/ga4-mcp.json \\
    python scripts/ads-ops/sanken_weekly_report.py

Cron推奨: 毎週月曜 09:00 JST
"""

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, OrderBy,
    FilterExpression, Filter
)

PROPS = {
    'ストレッチゼロ': '518746457',
    '本気ストレッチ': '530819340',
}

OUT_DIR = Path('/home/ozawakiryu0902/projects/vonds/ads-audit/weekly-reports')


def kpis(client, pid, period_days):
    req = RunReportRequest(
        property=f'properties/{pid}',
        date_ranges=[DateRange(start_date=f'{period_days}daysAgo', end_date='yesterday')],
        metrics=[
            Metric(name='totalUsers'),
            Metric(name='sessions'),
            Metric(name='screenPageViews'),
            Metric(name='conversions'),
            Metric(name='engagementRate'),
        ],
    )
    r = client.run_report(req)
    if not r.rows:
        return None
    row = r.rows[0]
    return {
        'users': int(row.metric_values[0].value or 0),
        'sessions': int(row.metric_values[1].value or 0),
        'pv': int(row.metric_values[2].value or 0),
        'cv': float(row.metric_values[3].value or 0),
        'engagement': float(row.metric_values[4].value or 0),
    }


def paid_search_by_page(client, pid, period_days):
    fe = FilterExpression(filter=Filter(
        field_name='sessionDefaultChannelGroup',
        string_filter=Filter.StringFilter(value='Paid Search')
    ))
    req = RunReportRequest(
        property=f'properties/{pid}',
        date_ranges=[DateRange(start_date=f'{period_days}daysAgo', end_date='yesterday')],
        dimensions=[Dimension(name='pagePath')],
        metrics=[
            Metric(name='sessions'),
            Metric(name='conversions'),
            Metric(name='engagementRate'),
        ],
        dimension_filter=fe,
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name='sessions'), desc=True)],
        limit=10,
    )
    r = client.run_report(req)
    return [
        {
            'path': row.dimension_values[0].value,
            'sessions': int(row.metric_values[0].value or 0),
            'cv': float(row.metric_values[1].value or 0),
            'engagement': float(row.metric_values[2].value or 0),
        }
        for row in r.rows
    ]


def channels(client, pid, period_days):
    req = RunReportRequest(
        property=f'properties/{pid}',
        date_ranges=[DateRange(start_date=f'{period_days}daysAgo', end_date='yesterday')],
        dimensions=[Dimension(name='sessionDefaultChannelGroup')],
        metrics=[Metric(name='sessions'), Metric(name='conversions')],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name='sessions'), desc=True)],
    )
    r = client.run_report(req)
    return [
        {
            'channel': row.dimension_values[0].value,
            'sessions': int(row.metric_values[0].value or 0),
            'cv': float(row.metric_values[1].value or 0),
        }
        for row in r.rows
    ]


def top_events(client, pid, period_days):
    req = RunReportRequest(
        property=f'properties/{pid}',
        date_ranges=[DateRange(start_date=f'{period_days}daysAgo', end_date='yesterday')],
        dimensions=[Dimension(name='eventName')],
        metrics=[Metric(name='eventCount')],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name='eventCount'), desc=True)],
        limit=15,
    )
    r = client.run_report(req)
    return [
        (row.dimension_values[0].value, int(row.metric_values[0].value or 0))
        for row in r.rows
    ]


def build_brand_section(client, name, pid):
    out = [f'\n## {name} (property {pid})\n']

    for period in [7, 30]:
        k = kpis(client, pid, period)
        if not k:
            out.append(f'### 過去{period}日\nデータなし\n')
            continue
        cvr = (k['cv'] / k['sessions'] * 100) if k['sessions'] else 0
        out.append(f'### 過去{period}日 サマリー\n')
        out.append(f'- Users: **{k["users"]:,}** / Sessions: **{k["sessions"]:,}** / PV: {k["pv"]:,}')
        out.append(f'- CV: **{k["cv"]:.0f}** / CVR: **{cvr:.2f}%** / Engagement: {k["engagement"]*100:.1f}%\n')

    # 過去30日 Paid Searchページ別
    pages = paid_search_by_page(client, pid, 30)
    if pages:
        out.append('### Paid Searchページ別 (30日・TOP10)\n')
        out.append('| Path | Sessions | CV | CVR | Engagement |')
        out.append('|---|---:|---:|---:|---:|')
        for p in pages:
            cvr = (p['cv'] / p['sessions'] * 100) if p['sessions'] else 0
            out.append(f'| `{p["path"]}` | {p["sessions"]} | {p["cv"]:.0f} | {cvr:.1f}% | {p["engagement"]*100:.0f}% |')
        out.append('')

    # チャネル
    chs = channels(client, pid, 30)
    if chs:
        out.append('### チャネル別 (30日)\n')
        out.append('| Channel | Sessions | CV |')
        out.append('|---|---:|---:|')
        for c in chs[:8]:
            out.append(f'| {c["channel"]} | {c["sessions"]} | {c["cv"]:.0f} |')
        out.append('')

    # イベント
    evs = top_events(client, pid, 7)
    if evs:
        out.append('### イベント別 (7日・TOP15)\n')
        out.append('| Event | Count |')
        out.append('|---|---:|')
        for e, c in evs:
            out.append(f'| `{e}` | {c:,} |')
        out.append('')

    return '\n'.join(out)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    client = BetaAnalyticsDataClient()

    now = datetime.now()
    week_label = now.strftime('%Y-W%V')
    out_file = OUT_DIR / f'sanken-{week_label}.md'

    lines = [
        f'# SANKEN週次パフォーマンスレポート {week_label}',
        f'',
        f'生成: {now.strftime("%Y-%m-%d %H:%M")} / データソース: GA4 API',
        f'対象: ストレッチゼロ / 本気ストレッチ（買取は管轄外）',
        f'',
        f'---',
    ]

    for name, pid in PROPS.items():
        try:
            lines.append(build_brand_section(client, name, pid))
        except Exception as e:
            lines.append(f'\n## {name}\n\n❌ 取得失敗: {type(e).__name__}: {str(e)[:200]}\n')

    lines.append('\n---\n\n## 自動分析コメント\n')
    # ストレッチゼロ /shop/ CVR 分析
    try:
        pages = paid_search_by_page(client, PROPS['ストレッチゼロ'], 30)
        shop = next((p for p in pages if '/shop/' == p['path'] or '/shop' in p['path']), None)
        home = next((p for p in pages if p['path'] == '/'), None)
        if shop and home:
            shop_cvr = (shop['cv'] / shop['sessions'] * 100) if shop['sessions'] else 0
            home_cvr = (home['cv'] / home['sessions'] * 100) if home['sessions'] else 0
            lines.append(f'- ストレッチゼロ: /shop/ CVR={shop_cvr:.1f}% vs /(TOP) CVR={home_cvr:.1f}%')
            if shop_cvr > home_cvr * 3:
                lines.append(f'  → **広告の最終URLを /shop/ に集中すれば CPA大幅改善期待**')
    except Exception as e:
        pass

    # 本気ストレッチ Paid Search 低迷
    try:
        k30 = kpis(client, PROPS['本気ストレッチ'], 30)
        chs = channels(client, PROPS['本気ストレッチ'], 30)
        paid = next((c for c in chs if c['channel'] == 'Paid Search'), None)
        if paid and paid['sessions'] < 50:
            lines.append(f'- 本気ストレッチ: Paid Search わずか {paid["sessions"]}sess/30日 → **広告配信がほぼ機能していない**')
            lines.append(f'  → KW追加・入札見直し・CV属性修正が必要')
    except Exception:
        pass

    out_file.write_text('\n'.join(lines), encoding='utf-8')
    print(f'✅ レポ生成: {out_file}')
    print(f'   週ラベル: {week_label}')


if __name__ == '__main__':
    main()
