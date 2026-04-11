#!/usr/bin/env python3
"""GA4 snapshot fetcher: pulls 28d KPIs + channels + top pages for given properties."""
import os, sys, json
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, OrderBy
)

PROPERTIES = {
    "vonds.co.jp": "515353443",
    "stretchzero.jp": "518746457",
    "kizuna-job.com": "531632184",
    "本気ストレッチ甲府上阿原店": "530819340",
    "買取コンシェルジュ": "529351449",
    "絆ILゲーム": "527930114",
    "il-game": "532427135",
}

DATE_RANGE = DateRange(start_date="28daysAgo", end_date="yesterday")

def kpis(client, pid):
    req = RunReportRequest(
        property=f"properties/{pid}",
        date_ranges=[DATE_RANGE],
        metrics=[
            Metric(name="totalUsers"),
            Metric(name="sessions"),
            Metric(name="screenPageViews"),
            Metric(name="engagementRate"),
            Metric(name="averageSessionDuration"),
            Metric(name="bounceRate"),
            Metric(name="conversions"),
        ],
    )
    r = client.run_report(req)
    if not r.rows:
        return None
    row = r.rows[0]
    keys = ["totalUsers","sessions","screenPageViews","engagementRate","avgSessionDuration","bounceRate","conversions"]
    return {k: row.metric_values[i].value for i,k in enumerate(keys)}

def channels(client, pid):
    req = RunReportRequest(
        property=f"properties/{pid}",
        date_ranges=[DATE_RANGE],
        dimensions=[Dimension(name="sessionDefaultChannelGroup")],
        metrics=[Metric(name="sessions"), Metric(name="totalUsers"), Metric(name="engagementRate")],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="sessions"), desc=True)],
    )
    r = client.run_report(req)
    return [
        {
            "channel": row.dimension_values[0].value,
            "sessions": row.metric_values[0].value,
            "users": row.metric_values[1].value,
            "engagementRate": row.metric_values[2].value,
        }
        for row in r.rows
    ]

def top_pages(client, pid, limit=10):
    req = RunReportRequest(
        property=f"properties/{pid}",
        date_ranges=[DATE_RANGE],
        dimensions=[Dimension(name="pagePath"), Dimension(name="pageTitle")],
        metrics=[Metric(name="screenPageViews"), Metric(name="totalUsers"), Metric(name="engagementRate")],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="screenPageViews"), desc=True)],
        limit=limit,
    )
    r = client.run_report(req)
    return [
        {
            "path": row.dimension_values[0].value,
            "title": row.dimension_values[1].value,
            "views": row.metric_values[0].value,
            "users": row.metric_values[1].value,
            "engagementRate": row.metric_values[2].value,
        }
        for row in r.rows
    ]

def sources(client, pid, limit=10):
    req = RunReportRequest(
        property=f"properties/{pid}",
        date_ranges=[DATE_RANGE],
        dimensions=[Dimension(name="sessionSource"), Dimension(name="sessionMedium")],
        metrics=[Metric(name="sessions"), Metric(name="totalUsers")],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="sessions"), desc=True)],
        limit=limit,
    )
    r = client.run_report(req)
    return [
        {
            "source": row.dimension_values[0].value,
            "medium": row.dimension_values[1].value,
            "sessions": row.metric_values[0].value,
            "users": row.metric_values[1].value,
        }
        for row in r.rows
    ]

def main():
    client = BetaAnalyticsDataClient()
    out = {}
    for name, pid in PROPERTIES.items():
        try:
            out[name] = {
                "property_id": pid,
                "kpis": kpis(client, pid),
                "channels": channels(client, pid),
                "top_pages": top_pages(client, pid),
                "sources": sources(client, pid),
            }
            k = out[name]["kpis"]
            print(f"[{name}] users={k['totalUsers'] if k else 'NO_DATA'}", file=sys.stderr)
        except Exception as e:
            out[name] = {"property_id": pid, "error": f"{type(e).__name__}: {str(e)[:200]}"}
            print(f"[{name}] ERROR: {e}", file=sys.stderr)
    print(json.dumps(out, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
