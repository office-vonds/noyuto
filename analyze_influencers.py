#!/usr/bin/env python3
"""インフルエンサーの投稿を取得・構造分析し、NOYUTOの投稿生成に活かすエッセンスを抽出する。

思想はコピーしない。器の設計だけを学ぶ。

使い方:
  python3 analyze_influencers.py                    # 全監視アカウントを分析
  python3 analyze_influencers.py --account CS60osaka1  # 特定アカウントだけ
  python3 analyze_influencers.py --update-prompt     # 分析結果をプロンプトに反映
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import tweepy
from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR / ".env")

ANALYSIS_DIR = BASE_DIR / "influencer_analysis"
PROMPT_PATTERNS_FILE = BASE_DIR / "prompts" / "learned_patterns.txt"

# ============================================================
# 監視アカウント定義
# ============================================================
WATCH_ACCOUNTS = {
    "CS60osaka1": {
        "name": "東大阪健康サロン@健康オタク",
        "domain": "健康・自然療法",
        "why_watch": "10万フォロワー。ブクマ率24.8%。リスト型・常識破壊型の構造が秀逸",
    },
    "ujontaka": {
        "name": "うじょん",
        "domain": "自己成長・図解",
        "why_watch": "12Kフォロワー。ブクマ率35.9%（最高値）。シンプル図解×対比型の構造。三流vs一流フォーマット",
    },
    "chokki_hansei": {
        "name": "チョッキ",
        "domain": "AI×哲学・逆転起業",
        "why_watch": "16.5Kフォロワー。ブクマ率25.3%。不要なものを手放す系の切り口。NOYUTOの執着論と共鳴",
    },
    "thug_business": {
        "name": "サグ",
        "domain": "自己啓発・マインド",
        "why_watch": "12.5Kフォロワー。ブクマ率18.3%。死に物狂い系の覚悟論。NOYUTOの行動至上主義と共鳴",
    },
    "oshige_writing": {
        "name": "おしげ（耕納茂彰）",
        "domain": "メンタル・人間関係",
        "why_watch": "61Kフォロワー。ブクマ率17.8%。信用・誠実さの切り口。NOYUTOの信頼経済と共鳴",
    },
    "fit_masa110": {
        "name": "筋トレ作家 正人",
        "domain": "覚悟・孤独・習慣",
        "why_watch": "3.4Kフォロワーだが平均いいね292と異常に高い。ブクマ率7.6%。リスト型×自己責任論。NOYUTOの覚悟論と共鳴",
    },
    "naomicoach7": {
        "name": "安保 奈緒美",
        "domain": "経営コーチ・組織開発",
        "why_watch": "37Kフォロワー。経営者伴走12年。幼少期の親子関係×対人関係の切り口。NOYUTOの父親論と接点あり",
    },
}


def get_client() -> tweepy.Client:
    bearer = os.getenv("X_BEARER_TOKEN")
    if not bearer:
        print("エラー: X_BEARER_TOKENが.envに設定されていません")
        sys.exit(1)
    return tweepy.Client(bearer_token=bearer)


def fetch_top_posts(client: tweepy.Client, username: str, count: int = 50) -> list[dict]:
    """アカウントの直近投稿を取得し、ブックマーク数順で返す。"""
    user = client.get_user(username=username, user_fields=["public_metrics"])
    if not user.data:
        print(f"ユーザー @{username} が見つかりません")
        return []

    tweets = client.get_users_tweets(
        id=user.data.id,
        max_results=min(count, 100),
        tweet_fields=["public_metrics", "created_at"],
        exclude=["retweets", "replies"],
    )

    if not tweets.data:
        return []

    results = []
    for t in tweets.data:
        m = t.public_metrics or {}
        results.append({
            "text": t.text,
            "likes": m.get("like_count", 0),
            "retweets": m.get("retweet_count", 0),
            "replies": m.get("reply_count", 0),
            "bookmarks": m.get("bookmark_count", 0),
            "quotes": m.get("quote_count", 0),
            "chars": len(t.text),
            "created_at": t.created_at.isoformat() if t.created_at else "",
        })

    results.sort(key=lambda x: x["bookmarks"], reverse=True)
    return results


def detect_format(text: str) -> list[str]:
    """投稿のフォーマットパターンを検出。"""
    patterns = []

    # リスト型（①②③ or ・ or 数字.）
    if re.search(r"[①②③④⑤⑥⑦⑧⑨⑩]", text):
        patterns.append("numbered_circle_list")
    if text.count("・") >= 3:
        patterns.append("bullet_list")
    if re.search(r"\d+[.．]", text) and text.count("\n") >= 3:
        patterns.append("numbered_list")

    # 対話劇型
    if re.search(r"[「」].*[「」].*[「」]", text):
        patterns.append("dialogue")

    # 矢印フロー型
    if text.count("→") >= 2 or text.count("↓") >= 2:
        patterns.append("flow_arrow")

    # 対比型（〜する人・〜しない人、○○ vs △△）
    if re.search(r"(する人|しない人|良くなる人|悪くなる人)", text):
        patterns.append("comparison")

    # 常識破壊型
    if re.search(r"(は嘘|は間違い|本当は|実は|騙されないで|恐ろしい)", text):
        patterns.append("myth_busting")

    # 権威引用型
    if re.search(r"(さんが|先生が|によると|研究では)", text):
        patterns.append("authority_cite")

    # パンチライン着地
    last_line = text.strip().split("\n")[-1] if "\n" in text else text[-30:]
    if len(last_line) < 30 and re.search(r"(恐ろしい|やめよう|やろう|騙されないで|大事|必要|ばかり|いる)", last_line):
        patterns.append("punchline_ending")

    if not patterns:
        patterns.append("standard")

    return patterns


def detect_hook(text: str) -> str:
    """冒頭のフック手法を判定。"""
    first_line = text.split("\n")[0].strip()

    if re.search(r"(は嘘|は間違い|は本当か)", first_line):
        return "myth_bust_hook"
    if re.search(r"[「」]", first_line):
        return "dialogue_hook"
    if re.search(r"(知っていますか|ご存知|知ってました)", first_line):
        return "question_hook"
    if re.search(r"(実は|本当は|驚くべき)", first_line):
        return "revelation_hook"
    if len(first_line) < 20 and not first_line.endswith("。"):
        return "short_impact_hook"
    return "statement_hook"


def analyze_account(client: tweepy.Client, username: str) -> dict:
    """アカウントの投稿を構造分析する。"""
    posts = fetch_top_posts(client, username)
    if not posts:
        return {"error": f"@{username}の投稿を取得できませんでした"}

    account_info = WATCH_ACCOUNTS.get(username, {"name": username, "domain": "不明", "why_watch": ""})

    # 全投稿の構造を分析
    format_counts = {}
    hook_counts = {}
    char_lengths = []
    high_bm_formats = {}  # ブクマ上位の構造

    for post in posts:
        formats = detect_format(post["text"])
        hook = detect_hook(post["text"])
        char_lengths.append(post["chars"])

        for fmt in formats:
            format_counts[fmt] = format_counts.get(fmt, 0) + 1
        hook_counts[hook] = hook_counts.get(hook, 0) + 1

    # ブクマ上位10件の構造傾向
    top_bm = posts[:10]
    for post in top_bm:
        for fmt in detect_format(post["text"]):
            high_bm_formats[fmt] = high_bm_formats.get(fmt, 0) + 1

    # 平均エンゲージメント
    avg_likes = sum(p["likes"] for p in posts) / len(posts)
    avg_bm = sum(p["bookmarks"] for p in posts) / len(posts)
    avg_rt = sum(p["retweets"] for p in posts) / len(posts)

    # ブクマ率（ブクマ/いいね比）が高い＝「保存したい」コンテンツ
    bm_ratios = []
    for p in posts:
        if p["likes"] > 0:
            bm_ratios.append(p["bookmarks"] / p["likes"])
    avg_bm_ratio = sum(bm_ratios) / len(bm_ratios) if bm_ratios else 0

    analysis = {
        "account": username,
        "info": account_info,
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "total_posts_analyzed": len(posts),
        "metrics": {
            "avg_likes": round(avg_likes, 1),
            "avg_bookmarks": round(avg_bm, 1),
            "avg_retweets": round(avg_rt, 1),
            "avg_bookmark_ratio": round(avg_bm_ratio, 3),
            "avg_chars": round(sum(char_lengths) / len(char_lengths)),
        },
        "format_distribution": dict(sorted(format_counts.items(), key=lambda x: x[1], reverse=True)),
        "hook_distribution": dict(sorted(hook_counts.items(), key=lambda x: x[1], reverse=True)),
        "high_bookmark_formats": dict(sorted(high_bm_formats.items(), key=lambda x: x[1], reverse=True)),
        "top_posts": [
            {
                "text": p["text"][:200],
                "bookmarks": p["bookmarks"],
                "likes": p["likes"],
                "formats": detect_format(p["text"]),
                "hook": detect_hook(p["text"]),
            }
            for p in posts[:5]
        ],
    }

    return analysis


def extract_learnings(analyses: list[dict]) -> str:
    """分析結果から投稿生成に使える構造パターンを抽出。"""
    lines = []
    lines.append("# 学習済み構造パターン（インフルエンサー分析から自動生成）")
    lines.append(f"# 最終更新: {datetime.now().strftime('%Y/%m/%d %H:%M')}")
    lines.append("#")
    lines.append("# ※ 思想はコピーしない。器の設計だけを学ぶ。")
    lines.append("# ※ このファイルは analyze_influencers.py --update-prompt で自動更新される")
    lines.append("")

    # 全アカウントのフォーマット傾向を集約
    all_formats = {}
    all_hooks = {}
    all_high_bm = {}

    for a in analyses:
        if "error" in a:
            continue
        for fmt, cnt in a.get("format_distribution", {}).items():
            all_formats[fmt] = all_formats.get(fmt, 0) + cnt
        for hook, cnt in a.get("hook_distribution", {}).items():
            all_hooks[hook] = all_hooks.get(hook, 0) + cnt
        for fmt, cnt in a.get("high_bookmark_formats", {}).items():
            all_high_bm[fmt] = all_high_bm.get(fmt, 0) + cnt

    lines.append("## ブックマークされやすい構造（上位）")
    format_labels = {
        "numbered_circle_list": "リスト型（①②③...）→ 保存性が高い。具体的な行動リスト",
        "myth_busting": "常識破壊型（「○○は嘘」「本当は」）→ 拡散力が高い",
        "flow_arrow": "フロー型（→や↓で因果関係を示す）→ 構造が見えて納得感",
        "dialogue": "対話劇型（「〜」「〜」の会話形式）→ 共感を呼ぶ",
        "bullet_list": "箇条書き型（・で並べる）→ スキャンしやすい",
        "comparison": "対比型（する人/しない人）→ 自分事化しやすい",
        "punchline_ending": "パンチライン着地（短い一文で刺す）→ 余韻が残る",
        "authority_cite": "権威引用型（○○さんが言った）→ 説得力",
        "standard": "標準型（特殊フォーマットなし）",
    }

    sorted_bm = sorted(all_high_bm.items(), key=lambda x: x[1], reverse=True)
    for fmt, cnt in sorted_bm:
        label = format_labels.get(fmt, fmt)
        lines.append(f"- {label}")

    lines.append("")
    lines.append("## フック手法（冒頭の引き込み方）")
    hook_labels = {
        "myth_bust_hook": "常識破壊（「○○は嘘」で始める）",
        "dialogue_hook": "対話（「」で会話を再現）",
        "question_hook": "質問（「知っていますか？」）",
        "revelation_hook": "暴露（「実は」「本当は」）",
        "short_impact_hook": "短文インパクト（20文字以下の断言）",
        "statement_hook": "ストレート断言",
    }

    sorted_hooks = sorted(all_hooks.items(), key=lambda x: x[1], reverse=True)
    for hook, cnt in sorted_hooks:
        label = hook_labels.get(hook, hook)
        lines.append(f"- {label}")

    lines.append("")
    lines.append("## NOYUTOへの適用ルール")
    lines.append("- リスト型は週1〜2回使う（テーマ例：「些事に気を込める7つの習慣」）")
    lines.append("- 常識破壊型はフック（1本目）で使う（「○○は嘘です」→体験で証明）")
    lines.append("- 対話劇型は共鳴型引用リポストで使う")
    lines.append("- パンチライン着地は4本目で使う（問いかけ + 短い一撃）")
    lines.append("- フロー型は根拠（3本目）で因果関係を示す時に使う")

    # 各アカウントの詳細
    lines.append("")
    lines.append("## アカウント別分析")
    for a in analyses:
        if "error" in a:
            continue
        info = a.get("info", {})
        metrics = a.get("metrics", {})
        lines.append(f"\n### @{a['account']}（{info.get('domain', '')}）")
        lines.append(f"- 平均いいね: {metrics.get('avg_likes', 0)}")
        lines.append(f"- 平均ブクマ: {metrics.get('avg_bookmarks', 0)}")
        lines.append(f"- ブクマ率: {metrics.get('avg_bookmark_ratio', 0):.1%}")
        lines.append(f"- 平均文字数: {metrics.get('avg_chars', 0)}")
        lines.append(f"- 注目理由: {info.get('why_watch', '')}")

    return "\n".join(lines)


def save_analysis(analysis: dict):
    """分析結果をJSONで保存。"""
    ANALYSIS_DIR.mkdir(exist_ok=True)
    filename = f"{analysis['account']}_{datetime.now().strftime('%Y%m%d')}.json"
    filepath = ANALYSIS_DIR / filename
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(analysis, f, ensure_ascii=False, indent=2)
    print(f"分析結果保存: {filepath}")


def main():
    parser = argparse.ArgumentParser(description="インフルエンサー構造分析")
    parser.add_argument("--account", type=str, help="特定アカウントだけ分析")
    parser.add_argument("--update-prompt", action="store_true", help="分析結果をプロンプトファイルに反映")
    parser.add_argument("--json", action="store_true", help="JSON形式で出力")
    args = parser.parse_args()

    client = get_client()

    # 分析対象の決定
    if args.account:
        targets = [args.account]
    else:
        targets = list(WATCH_ACCOUNTS.keys())

    if not targets:
        print("監視アカウントが登録されていません。WATCH_ACCOUNTSに追加してください。")
        sys.exit(1)

    # 分析実行
    analyses = []
    for username in targets:
        print(f"\n分析中: @{username}...")
        analysis = analyze_account(client, username)
        analyses.append(analysis)
        save_analysis(analysis)

        if args.json:
            print(json.dumps(analysis, ensure_ascii=False, indent=2))
        else:
            # サマリー表示
            if "error" in analysis:
                print(f"  エラー: {analysis['error']}")
                continue
            m = analysis["metrics"]
            print(f"  投稿数: {analysis['total_posts_analyzed']}")
            print(f"  平均いいね: {m['avg_likes']} / 平均ブクマ: {m['avg_bookmarks']} / ブクマ率: {m['avg_bookmark_ratio']:.1%}")
            print(f"  ブクマ上位の構造: {', '.join(analysis['high_bookmark_formats'].keys())}")
            print(f"  主なフック: {', '.join(list(analysis['hook_distribution'].keys())[:3])}")

    # プロンプト更新
    if args.update_prompt:
        learnings = extract_learnings(analyses)
        with open(PROMPT_PATTERNS_FILE, "w", encoding="utf-8") as f:
            f.write(learnings)
        print(f"\nプロンプト更新完了: {PROMPT_PATTERNS_FILE}")
    else:
        print(f"\n※ --update-prompt をつけると分析結果がプロンプトに反映されます")


if __name__ == "__main__":
    main()
