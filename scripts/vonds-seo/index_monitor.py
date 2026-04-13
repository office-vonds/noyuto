#!/usr/bin/env python3
"""
GSCインデックス状態モニタリング
- sitemapの全URLをURL検査APIでチェック
- 未インデックスのURLがあればログに記録
- 毎日1回catchup.shから呼ばれる（記事生成後）
"""
import json
import os
import sys
import time
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta

JST = timezone(timedelta(hours=9))
BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent.parent
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_DIR / "index_monitor.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)

GSC_SITE = "https://vonds.co.jp/"
GSC_CRED_PATH = Path.home() / "credentials" / "ga4-mcp.json"

# 監視対象URL（サービスページ + コラム一覧）
CORE_URLS = [
    "https://vonds.co.jp/",
    "https://vonds.co.jp/works/seo/",
    "https://vonds.co.jp/works/web/",
    "https://vonds.co.jp/works/ads/",
    "https://vonds.co.jp/works/ai/",
    "https://vonds.co.jp/company/",
    "https://vonds.co.jp/column/",
]


def get_column_urls():
    """state.jsonからコラム記事URLを取得"""
    state_path = BASE_DIR / "state.json"
    if not state_path.exists():
        return []
    with open(state_path, "r", encoding="utf-8") as f:
        state = json.load(f)
    return [f"https://vonds.co.jp/column/{p['slug']}/" for p in state.get("published", [])]


def check_all():
    """全URLのインデックス状態をチェック"""
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except ImportError:
        logger.error("google-api-python-client未インストール")
        return

    if not GSC_CRED_PATH.exists():
        logger.error(f"認証ファイルなし: {GSC_CRED_PATH}")
        return

    creds = service_account.Credentials.from_service_account_file(
        str(GSC_CRED_PATH),
        scopes=["https://www.googleapis.com/auth/webmasters.readonly"]
    )
    svc = build("searchconsole", "v1", credentials=creds, cache_discovery=False)

    urls = CORE_URLS + get_column_urls()
    logger.info(f"=== インデックス状態チェック開始: {len(urls)}URL ===")

    indexed = 0
    not_indexed = []
    results = []

    for url in urls:
        try:
            r = svc.urlInspection().index().inspect(body={
                "inspectionUrl": url,
                "siteUrl": GSC_SITE,
            }).execute()
            idx = r.get("inspectionResult", {}).get("indexStatusResult", {})
            verdict = idx.get("verdict", "?")
            cov = idx.get("coverageState", "?")
            crawl = (idx.get("lastCrawlTime") or "NEVER")[:10]

            status = "OK" if verdict == "PASS" else "NG"
            if verdict == "PASS":
                indexed += 1
            else:
                not_indexed.append(url)

            logger.info(f"  [{status}] {verdict:<7} {cov:<40} crawl={crawl} {url}")
            results.append({"url": url, "verdict": verdict, "coverage": cov, "crawl": crawl})
        except Exception as e:
            logger.warning(f"  [ERR] {url}: {str(e)[:100]}")
            results.append({"url": url, "error": str(e)[:200]})
        time.sleep(0.5)

    logger.info(f"=== 結果: {indexed}/{len(urls)} インデックス済み ===")
    if not_indexed:
        logger.warning(f"未インデックス: {', '.join(not_indexed)}")

    # 結果をJSONで保存（直近分のみ上書き）
    out_path = PROJECT_DIR / "data" / "gsc" / "index_status_latest.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({
            "checked_at": datetime.now(JST).isoformat(),
            "total": len(urls),
            "indexed": indexed,
            "not_indexed": not_indexed,
            "results": results,
        }, f, ensure_ascii=False, indent=2)
    logger.info(f"結果保存: {out_path}")


if __name__ == "__main__":
    check_all()
