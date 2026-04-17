#!/usr/bin/env python3
"""本気ストレッチ KW + 除外KW 一括投入

CSV読み込み:
  ads-audit/samples/majistretch/editor_import_keywords.csv (15本)
  ads-audit/samples/majistretch/editor_import_negatives.csv (15本)

前提: ~/credentials/google-ads.yaml 配置済

実行:
  python scripts/ads-ops/majistretch_import_keywords.py --dry-run
  python scripts/ads-ops/majistretch_import_keywords.py --commit
"""

import csv
import sys
import argparse
from pathlib import Path

MAJISTRETCH_CUSTOMER_ID = '6811105790'  # 681-110-5790
CAMPAIGN_NAME = '本気ストレッチ検索キャンペーン'
YAML_PATH = str(Path.home() / 'credentials' / 'google-ads.yaml')

KW_CSV = Path('/home/ozawakiryu0902/projects/vonds/ads-audit/samples/majistretch/editor_import_keywords.csv')
NEG_CSV = Path('/home/ozawakiryu0902/projects/vonds/ads-audit/samples/majistretch/editor_import_negatives.csv')

MATCH_TYPE_MAP = {
    'Broad': 'BROAD',
    'Phrase': 'PHRASE',
    'Exact': 'EXACT',
}


def load_csv(p):
    with open(p) as f:
        return list(csv.DictReader(f))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--commit', action='store_true')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    if not args.commit:
        args.dry_run = True

    kws = load_csv(KW_CSV)
    negs = load_csv(NEG_CSV)
    print(f"追加KW: {len(kws)}本 / 除外KW: {len(negs)}本")

    try:
        from google.ads.googleads.client import GoogleAdsClient
    except ImportError:
        print("❌ google-ads SDK 未インストール")
        sys.exit(1)

    if not Path(YAML_PATH).exists():
        print(f"❌ {YAML_PATH} がない")
        sys.exit(1)

    client = GoogleAdsClient.load_from_storage(YAML_PATH)

    if args.dry_run:
        print("\n--- DRY RUN ---")
        print("追加KW:")
        for k in kws:
            print(f"  {k['Keyword']} [{k['Match type']}]")
        print("\n除外KW:")
        for n in negs:
            print(f"  {n['Keyword']} [{n['Match type']}]")
        print(f"\n--commit で本番実行")
        return

    # 1. キャンペーンID特定
    ga_service = client.get_service("GoogleAdsService")
    q = f"""
        SELECT campaign.id, campaign.name, ad_group.id, ad_group.name
        FROM ad_group
        WHERE campaign.name = '{CAMPAIGN_NAME}'
          AND campaign.status = 'ENABLED'
    """
    rows = list(ga_service.search_stream(customer_id=MAJISTRETCH_CUSTOMER_ID, query=q))
    ag_map = {}
    campaign_id = None
    for batch in rows:
        for r in batch.results:
            campaign_id = r.campaign.id
            ag_map[r.ad_group.name] = r.ad_group.id

    if not campaign_id:
        print(f"❌ キャンペーン '{CAMPAIGN_NAME}' 見つからない")
        sys.exit(1)

    print(f"✅ Campaign ID: {campaign_id} / AdGroups: {list(ag_map.keys())}")

    # 2. 追加KW投入
    agc_service = client.get_service("AdGroupCriterionService")
    operations = []
    for k in kws:
        ag_id = ag_map.get(k.get('Ad group') or '広告グループ 1')
        if not ag_id:
            print(f"⚠️ AdGroup未検出 skip: {k['Keyword']}")
            continue
        op = client.get_type("AdGroupCriterionOperation")
        crit = op.create
        crit.ad_group = client.get_service("AdGroupService").ad_group_path(MAJISTRETCH_CUSTOMER_ID, ag_id)
        crit.status = client.enums.AdGroupCriterionStatusEnum.ENABLED
        crit.keyword.text = k['Keyword']
        crit.keyword.match_type = getattr(client.enums.KeywordMatchTypeEnum, MATCH_TYPE_MAP.get(k['Match type'], 'BROAD'))
        operations.append(op)

    if operations:
        resp = agc_service.mutate_ad_group_criteria(customer_id=MAJISTRETCH_CUSTOMER_ID, operations=operations)
        print(f"✅ 追加KW {len(resp.results)}本投入")

    # 3. 除外KW投入 (キャンペーンレベル)
    cnc_service = client.get_service("CampaignCriterionService")
    neg_ops = []
    for n in negs:
        op = client.get_type("CampaignCriterionOperation")
        c = op.create
        c.campaign = client.get_service("CampaignService").campaign_path(MAJISTRETCH_CUSTOMER_ID, campaign_id)
        c.negative = True
        c.keyword.text = n['Keyword']
        c.keyword.match_type = getattr(client.enums.KeywordMatchTypeEnum, MATCH_TYPE_MAP.get(n['Match type'], 'PHRASE'))
        neg_ops.append(op)

    if neg_ops:
        resp = cnc_service.mutate_campaign_criteria(customer_id=MAJISTRETCH_CUSTOMER_ID, operations=neg_ops)
        print(f"✅ 除外KW {len(resp.results)}本投入")


if __name__ == '__main__':
    main()
