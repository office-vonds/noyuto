#!/usr/bin/env python3
"""Claude Codeが生成したコンテンツを受け取り、承認待ちとして保存する。

使い方:
  python3 generate_post.py --topic "テーマ" --text "投稿文"
  python3 generate_post.py --note --topic "テーマ" --text "note記事本文"
  python3 generate_post.py --full --topic "テーマ" --json '{"thread":[...], "note":"..."}'
  echo "投稿文" | python3 generate_post.py --topic "テーマ"
"""

import argparse
import glob
import json
import os
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).parent
POSTS_DIR = BASE_DIR / "posts"
NOTES_DIR = BASE_DIR / "pending_notes"
ENGAGEMENT_DIR = BASE_DIR / "engagement"
HISTORY_FILE = Path.home() / "projects" / "noyuto" / "post_history.jsonl"
REJECTED_LOG = BASE_DIR / "rejected_posts.log"

SIMILARITY_THRESHOLD = 0.85

# スレッド構成は2026-04-10に廃止。現在は単発1投稿×1日2本の新戦略。
# 後方互換のため空リストで保持（参照箇所があっても落ちないように）
THREAD_LABELS = []

# テーマツリー定義（auto_generate.pyからも参照される）
# 【方針】5年・10年経っても不変なテーマのみ扱う。時報ネタ（AI/技術トレンド/経営論）は扱わない。
# 主役は常に「読者の内面」。「どこの誰か知らない奴が偉そうに語る」のは禁止。
THEME_TREE = {
    "健康": [
        "薬を飲めば治ると信じた日から不調は始まる",
        "身体のサインを聞き流した代償はいつか必ず来る",
        "健康は取り戻すものであって管理するものではない",
        "医者の言うことを守る人ほど自分の身体を知らない",
        "眠れない夜が続いているのに、気のせいにしていませんか",
    ],
    "金": [
        "お金が足りないのではなく、信頼の残高が足りていない",
        "お金で買える自由と、お金では買えない自由がある",
        "節約で人生を縮める人、投資で人生を拡げる人",
        "銀行口座の数字より、心の口座の残高を見たことがあるか",
        "給料日のホッとする瞬間だけで生きていませんか",
    ],
    "人間関係": [
        "本音を言えない関係を「優しさ」と呼んで安心していませんか",
        "裏切られた経験があるのに、まだ人を信じられる自分を誇っていい",
        "距離を詰めすぎる愛情は、相手の輪郭を消してしまう",
        "「いい人」を演じ続けて、誰に好かれたいのか見失っていませんか",
        "許せない相手がいる夜、本当に許したいのは自分のほうだったりする",
    ],
    "家族": [
        "家族だからこそ、最後まで言えない本音がある",
        "親の顔色を見て生きてきた子供は、自分の顔色の変え方を知らない",
        "子供に伝えたい言葉と、伝えられない言葉の間にあるもの",
        "感謝を伝えられる時間は、思っているより短い",
        "家族の前で笑っている自分と、ひとりで泣いている自分は別人ですか",
    ],
    "精神": [
        "完璧であろうとする人ほど、自分を一番壊している",
        "矛盾を抱えたまま前に進める人間のほうがよほど強い",
        "心が貧しくなる瞬間は、お金がない時ではなく、比較を始めた時",
        "「忙しい」と言い続けているうちに、心を亡くしていませんか",
        "感謝できない夜にこそ、感謝できるものを探す意味がある",
    ],
    "理想": [
        "諦めるという選択肢を持たない人生は、実は自由じゃない",
        "叶えたい夢と、叶えなきゃいけない夢は違う",
        "「いつかやろう」と言い続けた10年で、何が残りましたか",
        "小さな一歩を踏み出せない理由は、だいたい見栄か恐れ",
        "子供の頃の自分が今の自分を見たら、誇れますか",
    ],
}

# カテゴリ逆引き辞書
THEME_TO_CATEGORY = {}
for _cat, _themes in THEME_TREE.items():
    for _t in _themes:
        THEME_TO_CATEGORY[_t] = _cat


# ============================================================
# 類似度チェック
# ============================================================

def _char_bigrams(text: str) -> set[str]:
    """テキストから文字バイグラムの集合を返す"""
    text = text.replace(" ", "").replace("\n", "")
    return {text[i:i + 2] for i in range(len(text) - 1)} if len(text) >= 2 else {text}


def calc_similarity(a: str, b: str) -> float:
    """2つのテキストの類似度をSørensen-Dice係数で算出する（0.0〜1.0）"""
    bg_a = _char_bigrams(a)
    bg_b = _char_bigrams(b)
    if not bg_a or not bg_b:
        return 0.0
    return 2 * len(bg_a & bg_b) / (len(bg_a) + len(bg_b))


def load_history(limit=100) -> list[dict]:
    """post_history.jsonlから直近N件の履歴を読み込む"""
    if not HISTORY_FILE.exists():
        return []
    lines = HISTORY_FILE.read_text(encoding="utf-8").strip().splitlines()
    entries = []
    for line in lines[-limit:]:
        try:
            entries.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return entries


def append_history(text: str, topic: str | None, category: str | None):
    """post_history.jsonlに履歴を追記する"""
    HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
    entry = {
        "timestamp": datetime.now().isoformat(),
        "text": text,
        "topic": topic,
        "category": category or THEME_TO_CATEGORY.get(topic, "不明"),
    }
    with open(HISTORY_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def check_similarity(text: str) -> tuple[bool, float, str]:
    """過去100件との類似度チェック。
    Returns: (is_rejected, max_similarity, most_similar_text)
    """
    history = load_history(limit=100)
    if not history:
        return False, 0.0, ""

    max_sim = 0.0
    most_similar = ""
    for entry in history:
        sim = calc_similarity(text, entry.get("text", ""))
        if sim > max_sim:
            max_sim = sim
            most_similar = entry.get("text", "")[:80]

    rejected = max_sim >= SIMILARITY_THRESHOLD
    if rejected:
        with open(REJECTED_LOG, "a", encoding="utf-8") as f:
            f.write(f"[{datetime.now().isoformat()}] REJECTED (sim={max_sim:.3f})\n")
            f.write(f"  新規: {text[:80]}\n")
            f.write(f"  類似: {most_similar}\n\n")
        print(f"[REJECTED] 類似度 {max_sim:.3f} >= {SIMILARITY_THRESHOLD} — 過去投稿と酷似のため棄却")

    return rejected, max_sim, most_similar


# ============================================================
# テーマローテーション
# ============================================================

def get_recent_categories(n=3) -> list[str]:
    """直近N件で使用したテーマカテゴリを返す"""
    history = load_history(limit=n)
    return [e.get("category", "") for e in history if e.get("category")]


def pick_rotated_theme() -> tuple[str, str]:
    """直近3件で使ったカテゴリを回避してテーマを選択する。
    Returns: (theme, category)
    """
    from auto_generate import load_weights

    recent_cats = get_recent_categories(n=3)
    weights = load_weights()

    # カテゴリを回避してテーマ候補を絞る
    available = []
    available_weights = []
    for cat, themes in THEME_TREE.items():
        if cat in recent_cats:
            continue
        for t in themes:
            available.append((t, cat))
            available_weights.append(weights.get(t, 1.0))

    # 全カテゴリが直近で使われている場合はフォールバック（最も古いカテゴリを許可）
    if not available:
        fallback_cat = recent_cats[0] if recent_cats else list(THEME_TREE.keys())[0]
        for t in THEME_TREE[fallback_cat]:
            available.append((t, fallback_cat))
            available_weights.append(weights.get(t, 1.0))

    import random
    chosen = random.choices(available, weights=available_weights, k=1)[0]
    return chosen


def save_post(text: str, topic: str | None = None, skip_similarity=False) -> Path | None:
    """投稿を保存する。類似度チェックに引っかかった場合はNoneを返す。"""
    if not skip_similarity:
        rejected, sim, _ = check_similarity(text)
        if rejected:
            return None

    POSTS_DIR.mkdir(exist_ok=True)
    now = datetime.now()
    filename = now.strftime("%Y%m%d_%H%M%S") + ".json"
    filepath = POSTS_DIR / filename

    category = THEME_TO_CATEGORY.get(topic, "不明") if topic else "不明"
    data = {
        "timestamp": now.isoformat(),
        "text": text,
        "topic": topic,
        "category": category,
        "status": "pending",
        "posted_at": None,
        "tweet_id": None,
    }

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # 履歴に追記
    append_history(text, topic, category)

    return filepath


def save_note(text: str, topic: str | None = None) -> Path:
    NOTES_DIR.mkdir(exist_ok=True)
    now = datetime.now()
    filename = now.strftime("%Y%m%d_%H%M%S") + ".json"
    filepath = NOTES_DIR / filename

    data = {
        "timestamp": now.isoformat(),
        "title": topic or "無題",
        "body": text,
        "topic": topic,
        "status": "pending",
        "published_at": None,
        "note_url": None,
    }

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return filepath


def full_mode(topic: str, json_str: str):
    """Xスレッド4本 + note記事を一括保存する。"""
    payload = json.loads(json_str)
    thread = payload["thread"]
    note_body = payload["note"]

    if len(thread) != 4:
        print(f"エラー: スレッドは4本必要です（{len(thread)}本渡されました）")
        sys.exit(1)

    # スレッド4本を保存（タイムスタンプをずらす）
    thread_files = []
    for i, text in enumerate(thread):
        label = THREAD_LABELS[i]
        filepath = save_post(text, f"{topic}（{label}）")
        thread_files.append((filepath, text))
        time.sleep(1)  # ファイル名の重複回避

    # note記事を保存
    note_filepath = save_note(note_body, topic)

    # サマリー表示
    print(f"=== 一括生成完了 ===")
    print(f"テーマ: {topic}\n")
    print(f"【Xスレッド 4本】")
    for i, (fp, text) in enumerate(thread_files):
        print(f"  {THREAD_LABELS[i]}: {text[:20]}... ({len(text)}文字) → {fp.name}")
    print(f"\n【note記事】")
    print(f"  {note_body[:30]}... ({len(note_body)}文字) → {note_filepath.name}")
    print(f"\n全5件をpending保存しました。")


def fetch_engagement_data():
    """X APIで前日投稿のインプレッション・エンゲージメントを取得し、posts/内のJSONに追記する。

    前提: .envに X_BEARER_TOKEN が設定されていること（X API v2 OAuth 2.0）
    """
    from dotenv import load_dotenv

    load_dotenv(BASE_DIR / ".env")
    bearer_token = os.getenv("X_BEARER_TOKEN")
    if not bearer_token:
        print("[SKIP] X_BEARER_TOKEN が .env に未設定のためエンゲージメント取得をスキップ")
        return []

    import requests

    ENGAGEMENT_DIR.mkdir(exist_ok=True)

    # 前日に投稿された（posted状態の）投稿を取得
    yesterday = datetime.now() - timedelta(days=1)
    yesterday_str = yesterday.strftime("%Y%m%d")
    results = []

    for filepath in sorted(POSTS_DIR.glob("*.json")):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, ValueError):
            continue

        if data.get("status") != "posted" or not data.get("tweet_id"):
            continue

        posted_at = data.get("posted_at", "")
        if not posted_at or not posted_at.startswith(yesterday.strftime("%Y-%m-%d")):
            continue

        tweet_id = data["tweet_id"]

        # X API v2でツイートメトリクスを取得
        url = f"https://api.twitter.com/2/tweets/{tweet_id}"
        params = {"tweet.fields": "public_metrics,non_public_metrics,organic_metrics"}
        headers = {"Authorization": f"Bearer {bearer_token}"}

        try:
            resp = requests.get(url, params=params, headers=headers, timeout=10)
            if resp.status_code != 200:
                print(f"[WARN] tweet {tweet_id}: API応答 {resp.status_code}")
                continue

            tweet_data = resp.json().get("data", {})
            public = tweet_data.get("public_metrics", {})
            non_public = tweet_data.get("non_public_metrics", {})

            engagement = {
                "tweet_id": tweet_id,
                "fetched_at": datetime.now().isoformat(),
                "impressions": non_public.get("impression_count", public.get("impression_count", 0)),
                "likes": public.get("like_count", 0),
                "retweets": public.get("retweet_count", 0),
                "replies": public.get("reply_count", 0),
                "bookmarks": public.get("bookmark_count", 0),
                "quote_count": public.get("quote_count", 0),
            }

            # posts/のJSONにエンゲージメントデータを追記
            data["engagement"] = engagement
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            # engagement/にも保存
            eng_file = ENGAGEMENT_DIR / f"{yesterday_str}_{tweet_id}.json"
            with open(eng_file, "w", encoding="utf-8") as f:
                json.dump(engagement, f, ensure_ascii=False, indent=2)

            results.append(engagement)
            print(f"[OK] tweet {tweet_id}: imp={engagement['impressions']} likes={engagement['likes']} rt={engagement['retweets']} bm={engagement['bookmarks']}")

        except requests.RequestException as e:
            print(f"[ERROR] tweet {tweet_id}: {e}")
            continue

    print(f"エンゲージメント取得完了: {len(results)}件")
    return results


def get_engagement_summary(days=7):
    """直近N日間のエンゲージメントデータを要約し、投稿生成プロンプトに反映するためのテキストを返す。"""
    cutoff = datetime.now() - timedelta(days=days)
    top_posts = []

    for filepath in sorted(POSTS_DIR.glob("*.json")):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, ValueError):
            continue

        eng = data.get("engagement")
        if not eng:
            continue

        ts = datetime.fromisoformat(data.get("timestamp", "2000-01-01"))
        if ts < cutoff:
            continue

        score = (eng.get("likes", 0) + eng.get("retweets", 0) * 2
                 + eng.get("replies", 0) * 3 + eng.get("bookmarks", 0) * 3)
        top_posts.append({
            "topic": data.get("topic", ""),
            "text": data.get("text", "")[:80],
            "score": score,
            "impressions": eng.get("impressions", 0),
        })

    if not top_posts:
        return ""

    top_posts.sort(key=lambda x: x["score"], reverse=True)
    top3 = top_posts[:3]

    lines = [
        "## 直近のエンゲージメント分析（投稿生成に反映）",
        f"分析期間: 直近{days}日間 / 対象: {len(top_posts)}件",
        "",
        "### 高パフォーマンス投稿TOP3:",
    ]
    for i, p in enumerate(top3, 1):
        lines.append(f"{i}. [{p['topic'][:30]}] スコア:{p['score']} imp:{p['impressions']}")
        lines.append(f"   → {p['text']}")
    lines.append("")
    lines.append("上記の傾向を踏まえて、同様の構造・テーマを優先的に採用すること。")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="投稿文・note記事を保存する")
    parser.add_argument("--topic", type=str, default=None, help="テーマ")
    parser.add_argument("--text", type=str, default=None, help="本文（省略時はstdinから読み取り）")
    parser.add_argument("--note", action="store_true", help="note記事モード")
    parser.add_argument("--full", action="store_true", help="一括生成モード（スレッド4本+note）")
    parser.add_argument("--json", type=str, default=None, help="一括生成用JSON（--fullと併用）")
    parser.add_argument("--fetch-engagement", action="store_true", help="前日投稿のエンゲージメントを取得")
    parser.add_argument("--engagement-summary", action="store_true", help="直近のエンゲージメント要約を表示")
    args = parser.parse_args()

    if args.fetch_engagement:
        fetch_engagement_data()
        return

    if args.engagement_summary:
        summary = get_engagement_summary()
        if summary:
            print(summary)
        else:
            print("エンゲージメントデータがまだありません。")
        return

    if args.full:
        if not args.topic:
            print("エラー: --full には --topic が必須です")
            sys.exit(1)
        json_str = args.json
        if json_str is None:
            if sys.stdin.isatty():
                print("エラー: --json または標準入力でJSONを渡してください")
                sys.exit(1)
            json_str = sys.stdin.read().strip()
        full_mode(args.topic, json_str)
        return

    text = args.text
    if text is None:
        if sys.stdin.isatty():
            print("エラー: --text または標準入力で本文を渡してください")
            sys.exit(1)
        text = sys.stdin.read().strip()

    if not text:
        print("エラー: 本文が空です")
        sys.exit(1)

    if args.note:
        filepath = save_note(text, args.topic)
        print(f"--- 保存されたnote記事 ---")
        print(text)
        print(f"--- ({len(text)}文字) ---")
        print(f"保存先: {filepath}")
        print("状態: pending（承認待ち）")
    else:
        filepath = save_post(text, args.topic)
        if filepath is None:
            print("--- 投稿文は類似度チェックで棄却されました ---")
            print("別の内容で再生成してください。")
            sys.exit(1)
        print(f"--- 保存された投稿文 ---")
        print(text)
        print(f"--- ({len(text)}文字) ---")
        print(f"保存先: {filepath}")
        print("状態: pending（承認待ち）")


if __name__ == "__main__":
    main()
