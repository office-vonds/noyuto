#!/usr/bin/env python3
"""Google Business Profile の改善タスクと外部監視。

GBPは直接API操作できないため、以下を行う:
1. 外部から確認できるNAP一貫性チェック
2. 改善タスクリストの生成
3. Gmail通知

使い方:
  python3 gbp_audit.py              # 監査実行→Gmail通知
  python3 gbp_audit.py --no-email   # 通知なし（確認用）
  python3 gbp_audit.py --check-nap  # NAP一貫性チェックのみ
"""

import argparse
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger(__name__)

# ============================================================
# VONDS 正規情報（NAP: Name, Address, Phone）
# ============================================================
CANONICAL_NAP = {
    "name": "株式会社オフィスVONDS",
    "address": "〒400-0041 山梨県甲府市上石田4-17-7 コーポ河井202",
    "phone": "055-269-7220",
    "website": "https://vonds.co.jp",
    "hours": "10:00〜20:00（日曜定休）",
    "category_primary": "SEOコンサルタント",
    "category_secondary": ["ホームページ制作会社", "ウェブマーケティング会社", "Google広告代理店"],
}

# NAP掲載先（定期確認対象）
NAP_SOURCES = [
    {"name": "自社サイト", "url": "https://vonds.co.jp/company"},
    {"name": "Google Business Profile", "url": "https://vonds.business.site/"},
    {"name": "Web幹事", "url": "https://web-kanji.com/companies/vonds"},
    {"name": "アイミツ", "url": "https://imitsu.jp/service/150791/"},
    {"name": "優良WEB", "url": "https://yuryoweb.com/company_info/株式会社オフィスvonds/"},
    {"name": "イプロス", "url": "https://www.ipros.com/company/detail/2099440/"},
    {"name": "マイベストプロ山梨", "url": "https://mbp-japan.com/yamanashi/137000034/"},
    {"name": "Facebook", "url": "https://www.facebook.com/office.vonds/"},
    {"name": "全日本SEO協会", "url": "https://www.ajsa-seo.org/ozawamunehiro/"},
]

# ============================================================
# GBP改善タスク（優先度順）
# ============================================================
GBP_TASKS = [
    {
        "priority": "CRITICAL",
        "task": "GBPのウェブサイトURLをvonds.business.siteからvonds.co.jpに変更",
        "reason": "business.siteは2024年にGoogle廃止予定だった旧サービス。正規ドメインに変更必須",
        "action": "Google Business Profile Manager → 情報 → ウェブサイト → https://vonds.co.jp に変更",
        "time": "1分",
    },
    {
        "priority": "CRITICAL",
        "task": "口コミを獲得する仕組みを作る",
        "reason": "口コミ0件はローカルSEOで致命的。『山梨 SEO対策』で検索した見込み客が競合に流れる",
        "action": "①既存クライアント（SANKEN、A-TRUCK）に直接依頼 ②口コミ投稿用の短縮URLを作成 ③名刺・メール署名にQRコード追加",
        "time": "1週間で5件目標",
    },
    {
        "priority": "HIGH",
        "task": "GBPカテゴリを最適化",
        "reason": "メインカテゴリが適切でないと検索露出が減る",
        "action": "メイン: SEOコンサルタント or インターネットマーケティングサービス → サブ: ホームページ制作会社, ウェブデザイナー, 広告代理店 を追加",
        "time": "5分",
    },
    {
        "priority": "HIGH",
        "task": "GBP投稿を週1回更新する",
        "reason": "GBP投稿はローカル検索ランキング要因。放置=非アクティブと判断される",
        "action": "毎週月曜: SEO豆知識 or 実績紹介 or キャンペーン情報を投稿。写真付き。200〜300文字。CTAボタン（詳細/ウェブサイト）を設定",
        "time": "週10分",
    },
    {
        "priority": "HIGH",
        "task": "写真を追加（最低20枚）",
        "reason": "写真が多いGBPは検索表示率が高い（Google公式データ）",
        "action": "①オフィス外観・内観 ②代表写真（小沢宗弘） ③チーム写真 ④制作実績のスクリーンショット ⑤クライアントとの打合せ風景 ⑥甲府のロケーション写真",
        "time": "1時間",
    },
    {
        "priority": "HIGH",
        "task": "サービスメニューを登録",
        "reason": "GBPのサービス欄が未登録だと検索マッチが減る",
        "action": "以下を登録: ①SEOコンサルティング ②Google広告運用代行 ③ホームページ制作 ④LP制作 ⑤写真撮影 ⑥GTM設計・実装",
        "time": "15分",
    },
    {
        "priority": "MEDIUM",
        "task": "ビジネスの説明文を最適化",
        "reason": "GBPの説明文はローカルSEOのキーワードシグナル",
        "action": (
            "以下のテンプレートで記載:\n"
            "「株式会社オフィスVONDSは、山梨県甲府市のSEO対策・ホームページ制作・Google広告運用の専門会社です。"
            "全日本SEO協会認定コンサルタントが在籍し、検索上位表示率90%以上の実績があります。"
            "SEOを軸としたWeb集客で、地元企業の売上アップに貢献します。"
            "ホームページ制作、LP制作、Google広告運用代行、写真撮影まで一貫対応。"
            "まずはお気軽にご相談ください。」"
        ),
        "time": "10分",
    },
    {
        "priority": "MEDIUM",
        "task": "Q&Aセクションに先回り回答を投稿",
        "reason": "GBPのQ&Aはオーナーが先に回答を入れておくと検索露出に貢献",
        "action": (
            "自分で質問→自分で回答:\n"
            "Q: SEO対策の費用はいくらですか？\n"
            "Q: ホームページ制作にかかる期間は？\n"
            "Q: 山梨県外からの依頼も対応していますか？\n"
            "Q: Google広告の運用代行だけでも依頼できますか？\n"
            "Q: 無料相談はできますか？"
        ),
        "time": "30分",
    },
    {
        "priority": "MEDIUM",
        "task": "NAP情報の一貫性を全掲載先で確認",
        "reason": "NAP不一致はローカルSEO順位低下の直接要因",
        "action": "以下の全サイトで社名・住所・電話番号が完全一致しているか確認",
        "time": "30分",
    },
    {
        "priority": "LOW",
        "task": "Facebookページを活性化 or リンク整理",
        "reason": "放置SNSは信頼性を下げる",
        "action": "facebook.com/office.vonds を更新するか、GBPからのリンクを外す",
        "time": "判断次第",
    },
]


def generate_report() -> str:
    """GBP監査レポートを生成。"""
    date_str = datetime.now().strftime("%Y/%m/%d")
    lines = []

    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━")
    lines.append(f"【VONDS】Google Business Profile 改善レポート {date_str}")
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━")

    # 正規NAP情報
    lines.append("")
    lines.append("■ 正規NAP情報（これが正解）")
    lines.append(f"  社名: {CANONICAL_NAP['name']}")
    lines.append(f"  住所: {CANONICAL_NAP['address']}")
    lines.append(f"  電話: {CANONICAL_NAP['phone']}")
    lines.append(f"  URL:  {CANONICAL_NAP['website']}")
    lines.append(f"  営業: {CANONICAL_NAP['hours']}")

    # 改善タスク
    lines.append("")
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━")
    lines.append("■ 改善タスク（優先度順）")
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━")

    for i, task in enumerate(GBP_TASKS, 1):
        priority = task["priority"]
        icon = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🟢"}[priority]
        lines.append("")
        lines.append(f"[{i}] {icon} {priority}: {task['task']}")
        lines.append(f"    理由: {task['reason']}")
        lines.append(f"    手順: {task['action']}")
        lines.append(f"    所要: {task['time']}")

    # NAP確認先リスト
    lines.append("")
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━")
    lines.append("■ NAP掲載先チェックリスト")
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━")
    for src in NAP_SOURCES:
        lines.append(f"  [ ] {src['name']}: {src['url']}")

    # GBP投稿テンプレート
    lines.append("")
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━")
    lines.append("■ GBP週次投稿テンプレート（コピペ用）")
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━")
    lines.append("")
    lines.append("【Week 1: SEO豆知識】")
    lines.append("山梨でホームページを作ったけど検索に出てこない...")
    lines.append("そんなお悩みありませんか？")
    lines.append("SEO対策は「作った後」が勝負です。")
    lines.append("オフィスVONDSは検索上位表示率90%以上。")
    lines.append("まずは無料診断から始めてみませんか？")
    lines.append("→ ボタン: [詳細] https://vonds.co.jp/works/seo")
    lines.append("")
    lines.append("【Week 2: 実績紹介】")
    lines.append("クライアント様のサイトが「○○」で検索1位を達成しました。")
    lines.append("SEO対策開始から約○ヶ月での成果です。")
    lines.append("地域密着のWeb集客なら、お気軽にご相談ください。")
    lines.append("→ ボタン: [お問い合わせ] https://vonds.co.jp/contact")
    lines.append("")
    lines.append("【Week 3: サービス紹介】")
    lines.append("Google広告、なんとなく出していませんか？")
    lines.append("オフィスVONDSでは、データに基づいた広告運用で")
    lines.append("無駄な広告費を削減し、問い合わせ数を最大化します。")
    lines.append("→ ボタン: [詳細] https://vonds.co.jp/works")
    lines.append("")
    lines.append("【Week 4: 地域密着】")
    lines.append("甲府市を拠点に、山梨県内の企業様を中心にサポートしています。")
    lines.append("対面でのお打ち合わせを大切にし、")
    lines.append("事業を理解した上でのWeb戦略をご提案します。")
    lines.append("→ ボタン: [ウェブサイト] https://vonds.co.jp")

    # 口コミ獲得テンプレート
    lines.append("")
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━")
    lines.append("■ 口コミ依頼テンプレート（クライアントに送る文面）")
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━")
    lines.append("")
    lines.append("件名: Googleの口コミ投稿のお願い")
    lines.append("")
    lines.append("いつもお世話になっております。オフィスVONDSの小沢です。")
    lines.append("")
    lines.append("お手数ですが、弊社のGoogleビジネスプロフィールに")
    lines.append("口コミを投稿していただけないでしょうか。")
    lines.append("")
    lines.append("以下のURLをタップするだけで投稿画面が開きます:")
    lines.append("→ [口コミ投稿URL（GBPで生成して貼る）]")
    lines.append("")
    lines.append("一言でも大変ありがたいです。")
    lines.append("今後ともよろしくお願いいたします。")

    # フッター
    lines.append("")
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━")
    lines.append("やること:")
    lines.append("1. まずCRITICALの2件を今日中にやる")
    lines.append("2. HIGH4件を今週中にやる")
    lines.append("3. 口コミ依頼をSANKEN中込社長に今日送る")
    lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━")

    return "\n".join(lines)


def generate_nap_check_json() -> str:
    """NAP一貫性チェック用のJSONを出力。"""
    data = {
        "canonical": CANONICAL_NAP,
        "sources": NAP_SOURCES,
        "checked_at": datetime.now().isoformat(),
    }
    return json.dumps(data, ensure_ascii=False, indent=2)


def send_notification(subject: str, body: str) -> bool:
    """send_gmail.pyの関数を再利用してGmail送信。"""
    try:
        sys.path.insert(0, str(BASE_DIR))
        from send_gmail import send_email
        return send_email("office.vonds@gmail.com", subject, body)
    except ImportError:
        log.error("send_gmail.pyが見つかりません")
        return False


def main():
    parser = argparse.ArgumentParser(description="GBP監査・改善レポート")
    parser.add_argument("--no-email", action="store_true", help="Gmail送信しない")
    parser.add_argument("--check-nap", action="store_true", help="NAP情報JSONを出力")
    parser.add_argument("--json", action="store_true", help="タスクをJSON出力")
    args = parser.parse_args()

    if args.check_nap:
        print(generate_nap_check_json())
        return

    if args.json:
        print(json.dumps(GBP_TASKS, ensure_ascii=False, indent=2))
        return

    date_str = datetime.now().strftime("%Y/%m/%d")
    report = generate_report()

    if args.no_email:
        print(report)
    else:
        subject = f"【VONDS】GBP改善タスク {date_str}"
        success = send_notification(subject, report)
        if success:
            log.info("レポート送信完了")
        else:
            log.error("送信失敗。レポートを標準出力に表示:")
            print(report)


if __name__ == "__main__":
    main()
