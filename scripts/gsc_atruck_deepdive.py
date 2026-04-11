#!/usr/bin/env python3
"""A-TRUCK 深堀り: 地域KW捕捉状況＋デバイス別KPI＋インデックス検査"""
import os, sys, json
from datetime import date, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
SITE = "https://www.a-truck.jp/"

# エリアLP戦略のターゲット地域（提案書SLIDE 9より）
REGIONS = ["東京", "千葉", "神奈川", "埼玉", "大阪", "名古屋", "愛知", "福岡", "北海道", "兵庫", "京都"]
SERVICE_TEMPLATES = [
    "トラック レンタル {}",
    "トラックレンタル {}",
    "冷凍車 レンタル {}",
    "冷蔵車 レンタル {}",
    "4t トラック レンタル {}",
    "2t トラック レンタル {}",
    "トラック レンタカー {}",
]
FAQ_QUERIES = [
    "トラック レンタル 料金",
    "冷凍車 レンタル 免許",
    "トラック レンタル 個人",
    "トラック レンタル 日帰り",
    "レンタルトラック 長距離",
    "トラック リース 中古",
]

def main():
    creds = service_account.Credentials.from_service_account_file(
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"], scopes=SCOPES)
    svc = build("searchconsole", "v1", credentials=creds, cache_discovery=False)

    end = date.today() - timedelta(days=3)
    start = end - timedelta(days=27)

    def qry(dimensions, filters=None, row_limit=100):
        body = {
            "startDate": start.isoformat(), "endDate": end.isoformat(),
            "dimensions": dimensions, "rowLimit": row_limit,
        }
        if filters:
            body["dimensionFilterGroups"] = [{"filters": filters}]
        return svc.searchanalytics().query(siteUrl=SITE, body=body).execute().get("rows", [])

    out = {"period": {"start": start.isoformat(), "end": end.isoformat()}}

    # 1. 地域KW捕捉状況
    print("=== 地域×サービス KW 捕捉状況 ===", file=sys.stderr)
    region_data = []
    for region in REGIONS:
        for tmpl in SERVICE_TEMPLATES:
            q = tmpl.format(region)
            rows = qry(["query"], filters=[{"dimension":"query","operator":"equals","expression":q}], row_limit=1)
            if rows:
                r = rows[0]
                region_data.append({
                    "query": q, "region": region, "template": tmpl,
                    "clicks": r.get("clicks",0),
                    "impressions": r.get("impressions",0),
                    "ctr": round(r.get("ctr",0)*100, 2),
                    "position": round(r.get("position",0), 1),
                    "captured": True,
                })
            else:
                region_data.append({
                    "query": q, "region": region, "template": tmpl,
                    "captured": False,
                })
    out["region_queries"] = region_data
    captured = [r for r in region_data if r.get("captured")]
    print(f"  {len(captured)}/{len(region_data)} captured", file=sys.stderr)

    # 2. FAQ系KW
    print("=== FAQ系 KW ===", file=sys.stderr)
    faq_data = []
    for q in FAQ_QUERIES:
        rows = qry(["query"], filters=[{"dimension":"query","operator":"equals","expression":q}], row_limit=1)
        if rows:
            r = rows[0]
            faq_data.append({
                "query": q,
                "clicks": r.get("clicks",0),
                "impressions": r.get("impressions",0),
                "ctr": round(r.get("ctr",0)*100,2),
                "position": round(r.get("position",0),1),
                "captured": True,
            })
        else:
            faq_data.append({"query": q, "captured": False})
    out["faq_queries"] = faq_data

    # 3. デバイス別KPI
    print("=== デバイス別 ===", file=sys.stderr)
    dev_rows = qry(["device"], row_limit=10)
    out["by_device"] = [{
        "device": r["keys"][0],
        "clicks": r.get("clicks",0),
        "impressions": r.get("impressions",0),
        "ctr": round(r.get("ctr",0)*100,2),
        "position": round(r.get("position",0),1),
    } for r in dev_rows]
    for d in out["by_device"]:
        print(f"  {d['device']}: clicks={d['clicks']} imp={d['impressions']} ctr={d['ctr']}% pos={d['position']}", file=sys.stderr)

    # 4. 国別（日本以外の流入があれば海外SEO機会）
    country_rows = qry(["country"], row_limit=5)
    out["by_country"] = [{
        "country": r["keys"][0],
        "clicks": r.get("clicks",0),
        "impressions": r.get("impressions",0),
    } for r in country_rows]

    # 5. 日次推移（伸びているか減っているか）
    daily_rows = qry(["date"], row_limit=500)
    out["daily"] = [{
        "date": r["keys"][0],
        "clicks": r.get("clicks",0),
        "impressions": r.get("impressions",0),
        "ctr": round(r.get("ctr",0)*100,2),
        "position": round(r.get("position",0),1),
    } for r in daily_rows]

    # 6. 車種別ページの上位50（/rental/list/配下）
    page_rows = qry(["page"], row_limit=100)
    vehicle_pages = [r for r in page_rows if "/rental/list/" in r["keys"][0]]
    out["vehicle_pages"] = [{
        "page": r["keys"][0].replace(SITE[:-1], ""),
        "clicks": r.get("clicks",0),
        "impressions": r.get("impressions",0),
        "position": round(r.get("position",0),1),
        "ctr": round(r.get("ctr",0)*100,2),
    } for r in vehicle_pages[:20]]

    # 7. 拠点別ページ
    office_pages = [r for r in page_rows if "/offices/" in r["keys"][0]]
    out["office_pages"] = [{
        "page": r["keys"][0].replace(SITE[:-1], ""),
        "clicks": r.get("clicks",0),
        "impressions": r.get("impressions",0),
        "position": round(r.get("position",0),1),
        "ctr": round(r.get("ctr",0)*100,2),
    } for r in office_pages]

    print(json.dumps(out, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
