#!/usr/bin/env python3
"""MCC配下3クライアントへの疎通確認

前提:
  - ~/credentials/google-ads.yaml 配置済み
  - Basic Access 承認済み

実行:
  python3 test_connection.py
"""
import os
import sys
from pathlib import Path

CONFIG_PATH = Path.home() / "credentials" / "google-ads.yaml"

CLIENTS = {
    "A-TRUCK": "136-371-9642",
    "ストレッチゼロ": "854-911-4235",
    "本気ストレッチ": "681-110-5790",
}


def main():
    if not CONFIG_PATH.exists():
        print(f"[ERROR] {CONFIG_PATH} が見つからない", file=sys.stderr)
        print("       README.md の手順 3 に従って配置してください", file=sys.stderr)
        sys.exit(1)

    try:
        from google.ads.googleads.client import GoogleAdsClient
    except ImportError:
        print("[ERROR] google-ads SDK 未インストール。", file=sys.stderr)
        print("       pip install -r requirements.txt を実行", file=sys.stderr)
        sys.exit(1)

    client = GoogleAdsClient.load_from_storage(str(CONFIG_PATH))
    ga_service = client.get_service("GoogleAdsService")

    for name, cid in CLIENTS.items():
        cid_nohy = cid.replace("-", "")
        try:
            query = """
                SELECT customer.id, customer.descriptive_name, customer.currency_code
                FROM customer
                LIMIT 1
            """
            response = ga_service.search(customer_id=cid_nohy, query=query)
            for row in response:
                print(f"[OK] {name} ({cid}) : {row.customer.descriptive_name} / {row.customer.currency_code}")
        except Exception as e:
            print(f"[NG] {name} ({cid}) : {type(e).__name__}: {e}")


if __name__ == "__main__":
    main()
