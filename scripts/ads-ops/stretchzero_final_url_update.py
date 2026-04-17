#!/usr/bin/env python3
"""ストレッチゼロ KW別 最終ページURL 最適化 (v2)

方針 (2026-04-17 GSC+GA4 統合分析):
  指名KW (ストレッチゼロ/ストレッチラボ 含む)     -> / (TOP)
  店舗エリアKW (南アルプス/韮崎/甲斐響が丘 含む)   -> /shop/shop-{area}/
  上記以外 (エリア×悩み/一般整体・マッサージ系)   -> /shop/

GSC実データで指名KWはTOPでCTR20-30%/position#1-2 取得済み → TOP維持
非指名KWは /shop/ CVR 38-49% の勝ちページへ集中

前提:
  ~/credentials/google-ads.yaml 配置済 (サムPhase2完了後)
  Google Ads API Basic Access 承認済

実行:
  python scripts/ads-ops/stretchzero_final_url_update.py --dry-run
  python scripts/ads-ops/stretchzero_final_url_update.py --commit
"""

import sys
import argparse
from pathlib import Path

STRETCHZERO_CUSTOMER_ID = '8549114235'
YAML_PATH = str(Path.home() / 'credentials' / 'google-ads.yaml')

URL_TOP = 'https://stretchzero.jp/'
URL_SHOP = 'https://stretchzero.jp/shop/'

# エリア別店舗URLマッピング (GSCで確認したURL)
AREA_SHOP_MAP = [
    (['南アルプス', 'みなみアルプス'], 'https://stretchzero.jp/shop/shop-minami-alps/'),
    (['韮崎', 'にらさき'], 'https://stretchzero.jp/shop/shop-nirasaki/'),
    (['甲斐響が丘', '甲斐市', '響が丘'], 'https://stretchzero.jp/shop/shop-kai-hibikigaoka/'),
    (['甲府', 'こうふ', '上石田'], 'https://stretchzero.jp/shop/shop-kofu/'),
]

# 指名KW判定パターン
BRAND_KEYWORDS = ['ストレッチゼロ', 'ストレッチラボ', 'stretchzero', 'stretchlabo']


def classify_kw(kw):
    """KW文字列から最終URLを決定"""
    # 1. 指名KW -> TOP
    for bk in BRAND_KEYWORDS:
        if bk in kw.lower() or bk in kw:
            return URL_TOP
    # 2. 店舗エリア -> 各店舗ページ
    for areas, url in AREA_SHOP_MAP:
        for a in areas:
            if a in kw:
                return url
    # 3. その他 -> /shop/
    return URL_SHOP


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--commit', action='store_true')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    if not args.commit:
        args.dry_run = True

    try:
        from google.ads.googleads.client import GoogleAdsClient
    except ImportError:
        print("❌ google-ads SDK 未インストール")
        sys.exit(1)

    if not Path(YAML_PATH).exists():
        print(f"❌ {YAML_PATH} がない (サムPhase2完了待ち)")
        sys.exit(1)

    client = GoogleAdsClient.load_from_storage(YAML_PATH)

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
            kw = row.ad_group_criterion.keyword.text
            new_url = classify_kw(kw)
            cur = list(row.ad_group_criterion.final_urls)
            if cur == [new_url]:
                continue
            targets.append({
                'resource_name': row.ad_group_criterion.resource_name,
                'kw': kw,
                'new_url': new_url,
                'current': cur,
            })

    print(f"KW総数: 変更対象 {len(targets)}本\n")
    from collections import Counter
    url_counts = Counter(t['new_url'] for t in targets)
    for u, c in url_counts.most_common():
        print(f"  → {u}: {c}本")
    print()
    for t in targets[:20]:
        print(f"  [{t['kw']}] {t['current'] or '(未設定)'} → {t['new_url']}")
    if len(targets) > 20:
        print(f"  ... 残 {len(targets)-20}本")

    if args.dry_run:
        print(f"\n--dry-run完了 (本番適用は --commit)")
        return

    agc_service = client.get_service("AdGroupCriterionService")
    operations = []
    for t in targets:
        op = client.get_type("AdGroupCriterionOperation")
        crit = op.update
        crit.resource_name = t['resource_name']
        crit.final_urls.clear()
        crit.final_urls.append(t['new_url'])
        client.copy_from(
            op.update_mask,
            client.get_type("FieldMask", value={"paths": ["final_urls"]})
        )
        operations.append(op)

    if not operations:
        print("✅ 全KW既に最適URL設定済み")
        return

    resp = agc_service.mutate_ad_group_criteria(
        customer_id=STRETCHZERO_CUSTOMER_ID, operations=operations
    )
    print(f"\n✅ {len(resp.results)}本のKWを更新完了")


if __name__ == '__main__':
    main()
