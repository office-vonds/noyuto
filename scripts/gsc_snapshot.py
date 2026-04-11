#!/usr/bin/env python3
"""GSC snapshot: 全プロパティの直近28日データを一括取得してJSON保存。

取得内容（サイトごと）:
  - KPI サマリー（clicks / impressions / ctr / avg position）
  - 上位クエリ（50件）
  - 上位ページ（50件）
  - 日次推移（28日分）
  - サイトマップ一覧と検出URL数
  - 主要ターゲットURLのインデックス検査（設定があれば）

サービスアカウント:
  ga4-mcp@potent-impulse-165116.iam.gserviceaccount.com

環境変数:
  GOOGLE_APPLICATION_CREDENTIALS=/home/ozawakiryu0902/credentials/ga4-mcp.json
"""
import os, sys, json
from datetime import date, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]

TARGET_SITES = [
    "https://vonds.co.jp/",
    "https://stretchzero.jp/",
    "https://majistretch.com/",
    "https://kizuna-job.com/",
    "https://www.a-truck.jp/",
]

# 各サイトの重要ターゲットクエリ(参考記録用・分析時に使う)
TARGET_QUERIES = {
    "https://vonds.co.jp/": ["山梨 SEO対策", "山梨 ホームページ制作", "甲府 SEO", "山梨 WEBマーケティング", "山梨 Google広告"],
    "https://stretchzero.jp/": ["山梨 ストレッチ", "甲府 ストレッチ", "山梨 ストレッチ専門店", "甲府 肩こり ストレッチ", "甲府 腰痛 ストレッチ", "ストレッチゼロ"],
    "https://majistretch.com/": ["本気ストレッチ", "甲府上阿原 ストレッチ", "甲府 ストレッチ", "甲府 パーソナルストレッチ"],
    "https://kizuna-job.com/": ["山梨 風俗 求人", "甲府 ナイトワーク 求人", "山梨 高収入 求人 女性", "甲府 デリヘル 求人"],
    "https://www.a-truck.jp/": ["冷凍車 レンタル", "中古トラック", "トラック 鈑金塗装", "冷凍車 リース"],
}

DAYS = 28

def client():
    creds = service_account.Credentials.from_service_account_file(
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"], scopes=SCOPES
    )
    return build("searchconsole", "v1", credentials=creds, cache_discovery=False)

def dates():
    end = date.today() - timedelta(days=3)  # GSCは2-3日の遅延
    start = end - timedelta(days=DAYS - 1)
    return start.isoformat(), end.isoformat()

def query_sa(svc, site_url, dimensions, row_limit=50, extra=None):
    start, end = dates()
    body = {
        "startDate": start,
        "endDate": end,
        "dimensions": dimensions,
        "rowLimit": row_limit,
    }
    if extra:
        body.update(extra)
    try:
        r = svc.searchanalytics().query(siteUrl=site_url, body=body).execute()
        return r.get("rows", [])
    except HttpError as e:
        return {"error": str(e)[:300]}

def summarize_rows(rows, dim_keys):
    if isinstance(rows, dict) and "error" in rows:
        return rows
    result = []
    for r in rows:
        item = {dim_keys[i]: r["keys"][i] for i in range(len(dim_keys))}
        item.update({
            "clicks": r.get("clicks", 0),
            "impressions": r.get("impressions", 0),
            "ctr": round(r.get("ctr", 0) * 100, 2),
            "position": round(r.get("position", 0), 1),
        })
        result.append(item)
    return result

def get_sitemaps(svc, site_url):
    try:
        r = svc.sitemaps().list(siteUrl=site_url).execute()
        return [{
            "path": s.get("path"),
            "lastSubmitted": s.get("lastSubmitted"),
            "lastDownloaded": s.get("lastDownloaded"),
            "isPending": s.get("isPending"),
            "isSitemapsIndex": s.get("isSitemapsIndex"),
            "type": s.get("type"),
            "contents": s.get("contents", []),
            "errors": s.get("errors", 0),
            "warnings": s.get("warnings", 0),
        } for s in r.get("sitemap", [])]
    except HttpError as e:
        return {"error": str(e)[:300]}

def inspect_url(svc, site_url, inspect_url):
    try:
        r = svc.urlInspection().index().inspect(body={
            "inspectionUrl": inspect_url,
            "siteUrl": site_url,
        }).execute()
        inspection = r.get("inspectionResult", {})
        idx = inspection.get("indexStatusResult", {})
        return {
            "url": inspect_url,
            "verdict": idx.get("verdict"),
            "coverageState": idx.get("coverageState"),
            "lastCrawlTime": idx.get("lastCrawlTime"),
            "googleCanonical": idx.get("googleCanonical"),
            "userCanonical": idx.get("userCanonical"),
            "indexingState": idx.get("indexingState"),
            "robotsTxtState": idx.get("robotsTxtState"),
            "pageFetchState": idx.get("pageFetchState"),
        }
    except HttpError as e:
        return {"url": inspect_url, "error": str(e)[:200]}

def kpi_total(svc, site_url):
    """サイト全体のKPIサマリー（次元なし）"""
    rows = query_sa(svc, site_url, dimensions=[], row_limit=1)
    if isinstance(rows, dict) and "error" in rows:
        return rows
    if not rows:
        return {"clicks": 0, "impressions": 0, "ctr": 0, "position": 0}
    r = rows[0]
    return {
        "clicks": r.get("clicks", 0),
        "impressions": r.get("impressions", 0),
        "ctr": round(r.get("ctr", 0) * 100, 2),
        "position": round(r.get("position", 0), 1),
    }

def fetch_site(svc, site_url):
    print(f"\n[{site_url}]", file=sys.stderr)
    out = {"site_url": site_url}

    out["kpi_28d"] = kpi_total(svc, site_url)
    print(f"  KPI: {out['kpi_28d']}", file=sys.stderr)

    out["top_queries"] = summarize_rows(
        query_sa(svc, site_url, ["query"], row_limit=50), ["query"]
    )
    out["top_pages"] = summarize_rows(
        query_sa(svc, site_url, ["page"], row_limit=50), ["page"]
    )
    out["daily"] = summarize_rows(
        query_sa(svc, site_url, ["date"], row_limit=500), ["date"]
    )
    out["by_device"] = summarize_rows(
        query_sa(svc, site_url, ["device"], row_limit=5), ["device"]
    )
    out["by_country"] = summarize_rows(
        query_sa(svc, site_url, ["country"], row_limit=5), ["country"]
    )

    # ターゲットクエリの現在順位
    out["target_queries"] = []
    for q in TARGET_QUERIES.get(site_url, []):
        rows = query_sa(svc, site_url, ["query"], row_limit=1000, extra={
            "dimensionFilterGroups": [{
                "filters": [{"dimension": "query", "operator": "equals", "expression": q}]
            }]
        })
        if rows and not isinstance(rows, dict):
            r = rows[0]
            out["target_queries"].append({
                "query": q,
                "clicks": r.get("clicks", 0),
                "impressions": r.get("impressions", 0),
                "ctr": round(r.get("ctr", 0) * 100, 2),
                "position": round(r.get("position", 0), 1),
                "present": True,
            })
        else:
            out["target_queries"].append({"query": q, "present": False})

    out["sitemaps"] = get_sitemaps(svc, site_url)

    # 主要URLのインデックス状態（VONDSのみ詳細にやる）
    if site_url == "https://vonds.co.jp/":
        out["inspections"] = [inspect_url(svc, site_url, u) for u in [
            "https://vonds.co.jp/",
            "https://vonds.co.jp/works/seo/",
            "https://vonds.co.jp/works/web/",
            "https://vonds.co.jp/works/ads/",
            "https://vonds.co.jp/works/ai/",
            "https://vonds.co.jp/company/",
        ]]

    return out

def main():
    svc = client()
    start, end = dates()
    out = {
        "generated_at": date.today().isoformat(),
        "period": {"start": start, "end": end, "days": DAYS},
        "sites": {},
    }
    for site in TARGET_SITES:
        try:
            out["sites"][site] = fetch_site(svc, site)
        except Exception as e:
            out["sites"][site] = {"error": f"{type(e).__name__}: {e}"}
            print(f"  ERROR: {e}", file=sys.stderr)
    print(json.dumps(out, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
