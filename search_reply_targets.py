#!/usr/bin/env python3
"""大型アカウントの投稿に対するリプライ候補を生成し、Gmail通知する。

引用リポスト候補（search_quotes.py）と並ぶ、リーチ拡大のもう一つの装置。
候補を提示するだけで、自動リプライは行わない。

使い方:
  python3 search_reply_targets.py              # 検索→生成→Gmail通知
  python3 search_reply_targets.py --json       # JSON形式で出力（連携用）
  python3 search_reply_targets.py --top 5      # 上位5件だけ処理
  python3 search_reply_targets.py --no-email   # Gmail送信しない（テスト用）
  python3 search_reply_targets.py --no-ai      # リプライ生成なし（投稿情報だけ）
"""

import argparse
import json
import logging
import os
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import tweepy
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
# リプライ用キーワード（10個、1日3〜4個ローテーション）
# ============================================================
REPLY_KEYWORDS = [
    # 6軸テーマに準拠（2026-04-10刷新）
    "眠れない 不安",       # 健康
    "身体 不調 原因不明",  # 健康
    "お金 足りない",       # 金
    "貯金 できない",       # 金
    "人間関係 疲れた",     # 人間関係
    "友達 離れた",         # 人間関係
    "親 感謝 伝えられない", # 家族
    "子供 笑顔",           # 家族
    "完璧主義 疲れた",     # 精神
    "心 貧しい",           # 精神
    "夢 諦めた",           # 理想
    "いつかやろう",        # 理想
]

# ============================================================
# フィルタ設定
# ============================================================
MIN_FOLLOWERS = 10_000
MIN_LIKES = 100
MY_USERNAME = "noyuto0902"
MAX_CANDIDATES = 10

# ============================================================
# リプライ生成システムプロンプト
# ============================================================
REPLY_SYSTEM_PROMPT = """\
あなたはNOYUTO（@noyuto0902）です。
以下の思想に基づいてリプライを生成してください。

【NOYUTOの思想】
- 答えは渡さない。判断の基準だけ置いていく
- 人間は矛盾でできている。矛盾したまま前に進めるのが強さ
- 毒にも薬にもならない思考はクソ
- 人ではなく構造を切る
- 正しさは自分にだけ課す。人に課すなら楽しさを課す

【リプライルール】
- 必ず敬語（です・ます調）
- 絵文字不使用、ハッシュタグ不使用
- 文字数60〜140文字
- 相手の投稿内容に必ず言及（空虚な褒め禁止）
- 宣伝・誘導は一切含めない
- 構造的な視点を1つ入れる

【2パターン生成する】
パターンA：思考起動型（問いを投げる。相手に考えさせる）
パターンB：共鳴＋深掘り型（共感しつつ、一段深い視点を添える）

以下のJSON形式で出力してください:
{"pattern_a": "パターンAのリプライ文", "pattern_b": "パターンBのリプライ文"}
"""


def get_client() -> tweepy.Client:
    bearer = os.getenv("X_BEARER_TOKEN")
    if not bearer:
        log.error("X_BEARER_TOKENが.envに設定されていません")
        sys.exit(1)
    return tweepy.Client(bearer_token=bearer)


def get_todays_keywords() -> list[str]:
    """日付ベースで10個のキーワードから3〜4個をローテーション選出。"""
    day_of_year = datetime.now().timetuple().tm_yday
    total = len(REPLY_KEYWORDS)
    per_day = 4
    start = (day_of_year * per_day) % total
    indices = [(start + i) % total for i in range(per_day)]
    return [REPLY_KEYWORDS[i] for i in indices]


def search_reply_targets(client: tweepy.Client, keywords: list[str]) -> list[dict]:
    """キーワードでX API v2検索し、大型アカウントの投稿を収集。"""
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    all_tweets = []
    seen_ids = set()

    for keyword in keywords:
        query = f"{keyword} lang:ja -is:reply -is:retweet"
        log.info(f"検索中: {keyword}")

        for attempt in range(3):
            try:
                response = client.search_recent_tweets(
                    query=query,
                    max_results=50,
                    start_time=since.isoformat(),
                    tweet_fields=["public_metrics", "created_at", "author_id"],
                    user_fields=["public_metrics", "name", "username"],
                    expansions=["author_id"],
                    sort_order="relevancy",
                )
                break
            except tweepy.TooManyRequests:
                if attempt < 2:
                    wait = 15 * 60
                    log.warning(f"レートリミット。{wait}秒待機してリトライ ({attempt + 1}/2)")
                    time.sleep(wait)
                else:
                    log.error(f"レートリミット超過（リトライ上限）: {keyword}")
                    response = None
            except tweepy.Forbidden as e:
                log.warning(f"403エラー（スキップ）: {keyword} - {e}")
                response = None
                break
            except tweepy.TweepyException as e:
                log.error(f"API エラー: {keyword} - {e}")
                response = None
                break

        if not response or not response.data:
            continue

        users = {}
        if response.includes and "users" in response.includes:
            for user in response.includes["users"]:
                user_metrics = user.public_metrics or {}
                users[user.id] = {
                    "username": user.username,
                    "name": user.name,
                    "followers": user_metrics.get("followers_count", 0),
                }

        for tweet in response.data:
            if str(tweet.id) in seen_ids:
                continue
            seen_ids.add(str(tweet.id))

            metrics = tweet.public_metrics or {}
            user_info = users.get(tweet.author_id, {})

            # フィルタリング
            followers = user_info.get("followers", 0)
            likes = metrics.get("like_count", 0)
            username = user_info.get("username", "")

            if followers < MIN_FOLLOWERS:
                continue
            if likes < MIN_LIKES:
                continue
            if username.lower() == MY_USERNAME.lower():
                continue

            score = likes * followers

            all_tweets.append({
                "id": str(tweet.id),
                "text": tweet.text,
                "likes": likes,
                "retweets": metrics.get("retweet_count", 0),
                "replies": metrics.get("reply_count", 0),
                "bookmarks": metrics.get("bookmark_count", 0),
                "score": score,
                "username": username,
                "name": user_info.get("name", ""),
                "followers": followers,
                "url": f"https://x.com/{username}/status/{tweet.id}",
                "created_at": tweet.created_at.isoformat() if tweet.created_at else "",
                "keyword": keyword,
            })

    all_tweets.sort(key=lambda t: t["score"], reverse=True)
    return all_tweets[:MAX_CANDIDATES]


def generate_replies(candidates: list[dict]) -> list[dict]:
    """Claude APIでリプライ候補を生成。"""
    try:
        import anthropic
    except ImportError:
        log.error("anthropicライブラリが未インストール: pip install anthropic")
        return candidates

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        log.warning("ANTHROPIC_API_KEYが未設定。リプライ生成をスキップ")
        return candidates

    # noyuto_persona.txt があればシステムプロンプトに追加
    persona_path = BASE_DIR / "prompts" / "noyuto_persona.txt"
    system_prompt = REPLY_SYSTEM_PROMPT
    if persona_path.exists():
        persona = persona_path.read_text(encoding="utf-8")
        system_prompt = f"{REPLY_SYSTEM_PROMPT}\n\n【参考: NOYUTOペルソナ詳細】\n{persona}"

    client = anthropic.Anthropic(api_key=api_key)

    for candidate in candidates:
        user_prompt = (
            f"以下の投稿に対してリプライ候補を2パターン生成してください。\n\n"
            f"投稿者: @{candidate['username']}（フォロワー{candidate['followers']:,}人）\n"
            f"投稿内容:\n{candidate['text']}\n\n"
            f"JSON形式で出力してください。"
        )

        try:
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=512,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )
            reply_text = response.content[0].text

            # JSONを抽出
            try:
                # ```json ... ``` ブロック対応
                if "```" in reply_text:
                    start = reply_text.find("{")
                    end = reply_text.rfind("}") + 1
                    reply_text = reply_text[start:end]
                replies = json.loads(reply_text)
                candidate["reply_a"] = replies.get("pattern_a", "")
                candidate["reply_b"] = replies.get("pattern_b", "")
            except (json.JSONDecodeError, ValueError):
                log.warning(f"JSON解析失敗: @{candidate['username']} - レスポンスをそのまま保存")
                candidate["reply_a"] = reply_text
                candidate["reply_b"] = ""

        except Exception as e:
            log.error(f"Claude APIエラー（スキップ）: @{candidate['username']} - {e}")
            candidate["reply_a"] = ""
            candidate["reply_b"] = ""

    return candidates


def format_email(candidates: list[dict], date_str: str) -> tuple[str, str]:
    """メール件名と本文を生成。"""
    subject = f"【NOYUTO】本日のリプライ候補 {date_str}"

    if not candidates:
        body = (
            f"━━━━━━━━━━━━━━━━━━\n"
            f"📌 リプライ候補\n"
            f"━━━━━━━━━━━━━━━━━━\n\n"
            f"本日はリプライ候補が見つかりませんでした。\n"
        )
        return subject, body

    lines = []
    lines.append("━━━━━━━━━━━━━━━━━━")
    lines.append(f"📌 リプライ候補（{len(candidates)}件）")
    lines.append("━━━━━━━━━━━━━━━━━━")

    for i, c in enumerate(candidates, 1):
        lines.append("")
        lines.append(f"[{i}] @{c['username']}（{c['followers']:,}フォロワー）")
        lines.append(f"♥{c['likes']} RT{c['retweets']}")
        lines.append(f"投稿: {c['text'][:100]}")
        lines.append(f"URL: {c['url']}")

        if c.get("reply_a"):
            lines.append("")
            lines.append(f"→ パターンA（思考起動型）:")
            lines.append(c["reply_a"])

        if c.get("reply_b"):
            lines.append("")
            lines.append(f"→ パターンB（共鳴＋深掘り型）:")
            lines.append(c["reply_b"])

        lines.append("")
        lines.append("---")

    lines.append("")
    lines.append("━━━━━━━━━━━━━━━━━━")
    lines.append("使い方：")
    lines.append("1. 候補を1〜3件選ぶ")
    lines.append("2. URLをタップして元投稿を開く")
    lines.append("3. リプライ欄にパターンA or Bをコピペ（必要なら微調整）")
    lines.append("4. 送信")
    lines.append("━━━━━━━━━━━━━━━━━━")

    return subject, "\n".join(lines)


def format_email_section(candidates: list[dict]) -> str:
    """日報統合用のセクション文字列を返す。"""
    if not candidates:
        return (
            "━━━━━━━━━━━━━━━━━━\n"
            "■ リプライ候補\n"
            "━━━━━━━━━━━━━━━━━━\n"
            "本日はリプライ候補が見つかりませんでした。\n"
        )

    lines = []
    lines.append("━━━━━━━━━━━━━━━━━━")
    lines.append(f"■ リプライ候補（{len(candidates)}件）")
    lines.append("━━━━━━━━━━━━━━━━━━")

    for i, c in enumerate(candidates, 1):
        lines.append("")
        lines.append(f"[{i}] @{c['username']}（{c['followers']:,}フォロワー）")
        lines.append(f"♥{c['likes']} RT{c['retweets']}")
        lines.append(f"投稿: {c['text'][:100]}")
        lines.append(f"URL: {c['url']}")

        if c.get("reply_a"):
            lines.append(f"→ A（思考起動型）: {c['reply_a']}")
        if c.get("reply_b"):
            lines.append(f"→ B（共鳴＋深掘り型）: {c['reply_b']}")

    lines.append("")
    return "\n".join(lines)


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
    parser = argparse.ArgumentParser(description="リプライ候補を検索・生成")
    parser.add_argument("--json", action="store_true", help="JSON形式で出力")
    parser.add_argument("--top", type=int, default=MAX_CANDIDATES, help="上位N件だけ処理")
    parser.add_argument("--no-email", action="store_true", help="Gmail送信しない")
    parser.add_argument("--no-ai", action="store_true", help="リプライ生成しない（投稿情報だけ）")
    parser.add_argument("--section", action="store_true", help="日報統合用セクション出力")
    args = parser.parse_args()

    date_str = datetime.now().strftime("%Y/%m/%d")
    keywords = get_todays_keywords()
    log.info(f"本日のキーワード: {keywords}")

    client = get_client()
    candidates = search_reply_targets(client, keywords)
    log.info(f"フィルタ後の候補数: {len(candidates)}")

    if args.top < MAX_CANDIDATES:
        candidates = candidates[:args.top]

    if not args.no_ai and candidates:
        candidates = generate_replies(candidates)

    if args.json:
        print(json.dumps(candidates, ensure_ascii=False, indent=2))
        return

    if args.section:
        print(format_email_section(candidates))
        return

    subject, body = format_email(candidates, date_str)

    if not args.no_email:
        success = send_notification(subject, body)
        if not success:
            log.error("Gmail送信失敗。結果を標準出力に表示します")
            print(body)
    else:
        print(body)


if __name__ == "__main__":
    main()
