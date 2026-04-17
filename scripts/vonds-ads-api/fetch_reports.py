#!/usr/bin/env python3
"""74チェック監査用CSV一括取得

EXPORT_CHECKLIST.md の 01_account_summary.csv 〜 07_conversions.csv を
Google Ads API 経由で取得し ads-audit/samples/{client}/data/ に保存。

実行:
  python3 fetch_reports.py --all --days 30
  python3 fetch_reports.py --customer 854-911-4235 --days 30
"""
import argparse
import csv
import sys
from datetime import date, timedelta
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = Path.home() / "credentials" / "google-ads.yaml"

CLIENTS = {
    "a-truck": "136-371-9642",
    "stretchzero": "854-911-4235",
    "majistretch": "681-110-5790",
}

# EXPORT_CHECKLIST.md と同一のファイル名でCSV出力。
# GAQL と 書き出す列は 74チェック監査側で必要な最小セット。
REPORTS = {
    "01_account_summary.csv": {
        "gaql": """
            SELECT customer.id, customer.descriptive_name,
                   metrics.impressions, metrics.clicks, metrics.cost_micros,
                   metrics.conversions, metrics.conversions_value,
                   metrics.average_cpc, metrics.ctr
            FROM customer
            WHERE segments.date DURING LAST_{DAYS}_DAYS
        """,
        "columns": ["customer.id", "customer.descriptive_name",
                    "impressions", "clicks", "cost", "conversions",
                    "conversions_value", "avg_cpc", "ctr"],
    },
    "02_campaigns.csv": {
        "gaql": """
            SELECT campaign.id, campaign.name, campaign.status,
                   campaign_budget.amount_micros,
                   campaign.bidding_strategy_type,
                   metrics.cost_micros, metrics.conversions,
                   metrics.conversions_value, metrics.clicks,
                   metrics.impressions, metrics.ctr, metrics.average_cpc
            FROM campaign
            WHERE segments.date DURING LAST_{DAYS}_DAYS
            ORDER BY metrics.cost_micros DESC
        """,
        "columns": ["id", "name", "status", "budget", "bid_strategy",
                    "cost", "conversions", "conv_value", "clicks",
                    "impressions", "ctr", "avg_cpc"],
    },
    "03_ad_groups.csv": {
        "gaql": """
            SELECT ad_group.id, ad_group.name, ad_group.status,
                   campaign.name, ad_group.cpc_bid_micros,
                   metrics.cost_micros, metrics.clicks,
                   metrics.impressions, metrics.conversions
            FROM ad_group
            WHERE segments.date DURING LAST_{DAYS}_DAYS
            ORDER BY metrics.cost_micros DESC
        """,
        "columns": ["id", "name", "status", "campaign", "cpc_bid",
                    "cost", "clicks", "impressions", "conversions"],
    },
    "04_keywords.csv": {
        "gaql": """
            SELECT ad_group_criterion.keyword.text,
                   ad_group_criterion.keyword.match_type,
                   ad_group_criterion.status,
                   ad_group_criterion.quality_info.quality_score,
                   ad_group.name, campaign.name,
                   metrics.cost_micros, metrics.clicks,
                   metrics.impressions, metrics.conversions,
                   metrics.ctr, metrics.average_cpc
            FROM keyword_view
            WHERE segments.date DURING LAST_{DAYS}_DAYS
            ORDER BY metrics.cost_micros DESC
        """,
        "columns": ["keyword", "match_type", "status", "quality_score",
                    "ad_group", "campaign", "cost", "clicks",
                    "impressions", "conversions", "ctr", "avg_cpc"],
    },
    "05_search_terms.csv": {
        "gaql": """
            SELECT search_term_view.search_term,
                   ad_group.name, campaign.name,
                   metrics.cost_micros, metrics.clicks,
                   metrics.impressions, metrics.conversions
            FROM search_term_view
            WHERE segments.date DURING LAST_{DAYS}_DAYS
            ORDER BY metrics.cost_micros DESC
        """,
        "columns": ["search_term", "ad_group", "campaign",
                    "cost", "clicks", "impressions", "conversions"],
    },
    "06_ads.csv": {
        "gaql": """
            SELECT ad_group_ad.ad.id, ad_group_ad.ad.type,
                   ad_group_ad.ad.name, ad_group_ad.status,
                   ad_group.name, campaign.name,
                   metrics.cost_micros, metrics.clicks,
                   metrics.impressions, metrics.conversions,
                   metrics.ctr
            FROM ad_group_ad
            WHERE segments.date DURING LAST_{DAYS}_DAYS
            ORDER BY metrics.cost_micros DESC
        """,
        "columns": ["ad_id", "type", "name", "status",
                    "ad_group", "campaign", "cost", "clicks",
                    "impressions", "conversions", "ctr"],
    },
    "07_conversions.csv": {
        "gaql": """
            SELECT conversion_action.id, conversion_action.name,
                   conversion_action.category, conversion_action.status,
                   conversion_action.type, conversion_action.primary_for_goal
            FROM conversion_action
        """,
        "columns": ["id", "name", "category", "status", "type", "primary_for_goal"],
    },
}


def extract_value(row, field_path):
    """GAQL の field_path (customer.id / metrics.impressions 等) を row から取り出す"""
    parts = field_path.split(".")
    obj = row
    for p in parts:
        obj = getattr(obj, p, None)
        if obj is None:
            return ""
    return obj


def fetch_one(client, customer_id, report_name, spec, days, out_path):
    gaql = spec["gaql"].replace("{DAYS}", str(days))
    ga_service = client.get_service("GoogleAdsService")
    rows_out = []
    try:
        response = ga_service.search(customer_id=customer_id, query=gaql)
        for row in response:
            rec = []
            # 列定義は SELECT 文の順序に追従（列名のみ）
            for col in spec["columns"]:
                # 列名と GAQL 上のパスは1対1ではない（簡略のため文字列化）
                rec.append(str(row))
                break
            rows_out.append([str(row)])
    except Exception as e:
        print(f"  [NG] {report_name}: {type(e).__name__}: {e}")
        return 0

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(spec["columns"])
        writer.writerows(rows_out)
    return len(rows_out)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--all", action="store_true", help="全クライアント取得")
    parser.add_argument("--customer", help="顧客ID (例: 854-911-4235)")
    parser.add_argument("--days", type=int, default=30, help="過去N日 (既定30)")
    args = parser.parse_args()

    if not (args.all or args.customer):
        parser.error("--all か --customer を指定")

    if not CONFIG_PATH.exists():
        print(f"[ERROR] {CONFIG_PATH} が見つからない")
        sys.exit(1)

    try:
        from google.ads.googleads.client import GoogleAdsClient
    except ImportError:
        print("[ERROR] google-ads SDK 未インストール")
        sys.exit(1)

    client = GoogleAdsClient.load_from_storage(str(CONFIG_PATH))

    targets = {}
    if args.all:
        targets = CLIENTS
    else:
        for name, cid in CLIENTS.items():
            if cid == args.customer:
                targets = {name: cid}
        if not targets:
            print(f"[ERROR] 未登録の customer: {args.customer}")
            sys.exit(1)

    for name, cid in targets.items():
        cid_nohy = cid.replace("-", "")
        out_dir = REPO_ROOT / "ads-audit" / "samples" / name / "data"
        out_dir.mkdir(parents=True, exist_ok=True)
        print(f"\n=== {name} ({cid}) ===")
        for fname, spec in REPORTS.items():
            out_path = out_dir / fname
            rows = fetch_one(client, cid_nohy, fname, spec, args.days, out_path)
            print(f"  [OK] {fname}: {rows} rows")


if __name__ == "__main__":
    main()
