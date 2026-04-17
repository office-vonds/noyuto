#!/usr/bin/env python3
"""ストレッチゼロ 全KWの最終ページURLを /shop/ に一括変更

GA4実データ(2026-04-17分析): Paid Search /shop/ CVR=38.5% vs /(TOP)=0%
全KWを/shop/に向けるだけで CPA大幅改善期待

前提:
  ~/credentials/google-ads.yaml に有効な Developer Token + OAuth refresh_token が配置済
  Google Ads API Basic Access 承認済

実行:
  source ~/projects/vonds/.venv-ads/bin/activate
  python scripts/ads-ops/stretchzero_final_url_update.py --dry-run
  python scripts/ads-ops/stretchzero_final_url_update.py --commit
"""

import sys
import argparse
from pathlib import Path

STRETCHZERO_CUSTOMER_ID = '8549114235'  # 854-911-4235
NEW_FINAL_URL = 'https://stretchzero.jp/shop/'
YAML_PATH = str(Path.home() / 'credentials' / 'google-ads.yaml')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--commit', action='store_true', help='本番適用')
    parser.add_argument('--dry-run', action='store_true', help='変更予定のみ表示')
    args = parser.parse_args()

    if not args.commit and not args.dry_run:
        args.dry_run = True

    try:
        from google.ads.googleads.client import GoogleAdsClient
    except ImportError:
        print("❌ google-ads SDK 未インストール")
        print("   .venv-ads環境を作成:")
        print("     python3 -m venv ~/projects/vonds/.venv-ads")
        print("     source ~/projects/vonds/.venv-ads/bin/activate")
        print("     pip install google-ads")
        sys.exit(1)

    if not Path(YAML_PATH).exists():
        print(f"❌ {YAML_PATH} がない。サムに配置依頼 (google_ads_api_setup_20260417.md)")
        sys.exit(1)

    client = GoogleAdsClient.load_from_storage(YAML_PATH)

    # 現状KW取得
    ga_service = client.get_service("GoogleAdsService")
    query = """
        SELECT
          ad_group_criterion.criterion_id,
          ad_group_criterion.keyword.text,
          ad_group_criterion.final_urls,
          ad_group_criterion.status,
          ad_group.name,
          campaign.name
        FROM ad_group_criterion
        WHERE ad_group_criterion.type = 'KEYWORD'
          AND ad_group_criterion.status != 'REMOVED'
          AND campaign.status = 'ENABLED'
    """
    response = ga_service.search_stream(
        customer_id=STRETCHZERO_CUSTOMER_ID, query=query
    )

    targets = []
    for batch in response:
        for row in batch.results:
            cur = list(row.ad_group_criterion.final_urls)
            if cur == [NEW_FINAL_URL]:
                continue
            targets.append({
                'resource_name': row.ad_group_criterion.resource_name,
                'kw': row.ad_group_criterion.keyword.text,
                'campaign': row.campaign.name,
                'ad_group': row.ad_group.name,
                'current': cur,
            })

    print(f"対象KW: {len(targets)}本 (新URL: {NEW_FINAL_URL})\n")
    for t in targets[:30]:
        print(f"  [{t['campaign']}/{t['ad_group']}] {t['kw']}")
        print(f"    現: {t['current'] or '(未設定)'}")

    if args.dry_run:
        print(f"\n--dry-run完了 (本番適用は --commit)")
        return

    # 本番適用
    agc_service = client.get_service("AdGroupCriterionService")
    operations = []
    for t in targets:
        op = client.get_type("AdGroupCriterionOperation")
        crit = op.update
        crit.resource_name = t['resource_name']
        crit.final_urls.append(NEW_FINAL_URL)
        # field_mask update
        client.copy_from(
            op.update_mask,
            client.get_type("FieldMask", value={"paths": ["final_urls"]})
        )
        operations.append(op)

    if not operations:
        print("✅ 全KW既に新URL設定済み")
        return

    resp = agc_service.mutate_ad_group_criteria(
        customer_id=STRETCHZERO_CUSTOMER_ID, operations=operations
    )
    print(f"\n✅ {len(resp.results)}本のKWを更新完了")


if __name__ == '__main__':
    main()
