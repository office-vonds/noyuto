#!/usr/bin/env python3
"""GSC側で実行可能な操作を全部実行する:
1. Sitemap 再送信 (Webmasters API)
2. Indexing API ダメ元送信 (公式はJobPosting/BroadcastEvent専用だが叩いてみる)
3. URL検査API で各URLの最新状態を取得 (sitemap更新後・送信後の状態確認)

サービスアカウント: ga4-mcp@potent-impulse-165116.iam.gserviceaccount.com
"""
import os, sys, json, time
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SITE = "https://vonds.co.jp/"
SITEMAP = "https://vonds.co.jp/sitemap.xml"

URLS = [
    "https://vonds.co.jp/works/seo/",
    "https://vonds.co.jp/works/web/",
    "https://vonds.co.jp/works/ads/",
    "https://vonds.co.jp/works/ai/",
    "https://vonds.co.jp/company/",
    "https://vonds.co.jp/works/",
    "https://vonds.co.jp/works/seo/auto-plan/",
    "https://vonds.co.jp/column/",
    "https://vonds.co.jp/column/yamanashi-seo/",
    "https://vonds.co.jp/",
]

CRED = os.environ["GOOGLE_APPLICATION_CREDENTIALS"]

def step1_resubmit_sitemap():
    print("\n========== STEP 1: Sitemap 再送信 ==========")
    creds = service_account.Credentials.from_service_account_file(
        CRED, scopes=["https://www.googleapis.com/auth/webmasters"]
    )
    svc = build("searchconsole", "v1", credentials=creds, cache_discovery=False)
    try:
        svc.sitemaps().submit(siteUrl=SITE, feedpath=SITEMAP).execute()
        print(f"  ✅ {SITEMAP} 再送信成功")
        return True
    except HttpError as e:
        print(f"  ❌ {e}")
        return False

def step2_indexing_api():
    print("\n========== STEP 2: Indexing API (ダメ元) ==========")
    print("  ※公式仕様: JobPosting/BroadcastEvent専用。それ以外は警告なく拒否される可能性大")
    try:
        creds = service_account.Credentials.from_service_account_file(
            CRED, scopes=["https://www.googleapis.com/auth/indexing"]
        )
        svc = build("indexing", "v3", credentials=creds, cache_discovery=False)
    except Exception as e:
        print(f"  ❌ 認証失敗: {e}")
        return []

    results = []
    for url in URLS:
        try:
            r = svc.urlNotifications().publish(body={
                "url": url,
                "type": "URL_UPDATED"
            }).execute()
            print(f"  ✅ {url}")
            print(f"     {json.dumps(r, ensure_ascii=False)[:200]}")
            results.append({"url": url, "status": "OK", "response": r})
        except HttpError as e:
            err_msg = str(e)[:300]
            print(f"  ❌ {url}")
            print(f"     {err_msg[:200]}")
            results.append({"url": url, "status": "ERROR", "error": err_msg})
        time.sleep(0.5)
    return results

def step3_verify_index_status():
    print("\n========== STEP 3: URL検査API再実行 ==========")
    creds = service_account.Credentials.from_service_account_file(
        CRED, scopes=["https://www.googleapis.com/auth/webmasters.readonly"]
    )
    svc = build("searchconsole", "v1", credentials=creds, cache_discovery=False)
    out = []
    for url in URLS:
        try:
            r = svc.urlInspection().index().inspect(body={
                "inspectionUrl": url,
                "siteUrl": SITE,
            }).execute()
            idx = r.get("inspectionResult", {}).get("indexStatusResult", {})
            verdict = idx.get("verdict", "?")
            cov = idx.get("coverageState", "?")
            crawl = (idx.get("lastCrawlTime") or "NEVER")[:10]
            print(f"  {verdict:<7} {cov:<40} crawl={crawl} {url}")
            out.append({"url": url, "verdict": verdict, "coverage": cov, "lastCrawl": crawl})
        except HttpError as e:
            print(f"  ❌ {url}: {str(e)[:200]}")
            out.append({"url": url, "error": str(e)[:200]})
        time.sleep(0.3)
    return out

def main():
    summary = {"started_at": time.strftime("%Y-%m-%d %H:%M:%S")}
    summary["sitemap_resubmit"] = step1_resubmit_sitemap()
    summary["indexing_api"] = step2_indexing_api()
    summary["url_status_after"] = step3_verify_index_status()
    summary["finished_at"] = time.strftime("%Y-%m-%d %H:%M:%S")

    out_path = "data/gsc/force_index_20260411.json"
    os.makedirs("data/gsc", exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    print(f"\n=== ログ保存: {out_path} ===")

    # 結果サマリー
    indexing_ok = sum(1 for x in summary["indexing_api"] if x.get("status") == "OK")
    indexing_ng = len(summary["indexing_api"]) - indexing_ok
    print(f"\n結論:")
    print(f"  Sitemap再送信: {'✅' if summary['sitemap_resubmit'] else '❌'}")
    print(f"  Indexing API: {indexing_ok}/{len(URLS)} OK / {indexing_ng} NG")

if __name__ == "__main__":
    main()
