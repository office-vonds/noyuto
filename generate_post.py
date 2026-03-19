#!/usr/bin/env python3
"""Claude Codeが生成したコンテンツを受け取り、承認待ちとして保存する。

使い方:
  python3 generate_post.py --topic "テーマ" --text "投稿文"
  python3 generate_post.py --note --topic "テーマ" --text "note記事本文"
  python3 generate_post.py --full --topic "テーマ" --json '{"thread":[...], "note":"..."}'
  echo "投稿文" | python3 generate_post.py --topic "テーマ"
"""

import argparse
import json
import sys
import time
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).parent
POSTS_DIR = BASE_DIR / "posts"
NOTES_DIR = BASE_DIR / "pending_notes"

THREAD_LABELS = ["スレッド1/4：フック", "スレッド2/4：煽り", "スレッド3/4：根拠", "スレッド4/4：着地"]


def save_post(text: str, topic: str | None = None) -> Path:
    POSTS_DIR.mkdir(exist_ok=True)
    now = datetime.now()
    filename = now.strftime("%Y%m%d_%H%M%S") + ".json"
    filepath = POSTS_DIR / filename

    data = {
        "timestamp": now.isoformat(),
        "text": text,
        "topic": topic,
        "status": "pending",
        "posted_at": None,
        "tweet_id": None,
    }

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

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


def main():
    parser = argparse.ArgumentParser(description="投稿文・note記事を保存する")
    parser.add_argument("--topic", type=str, default=None, help="テーマ")
    parser.add_argument("--text", type=str, default=None, help="本文（省略時はstdinから読み取り）")
    parser.add_argument("--note", action="store_true", help="note記事モード")
    parser.add_argument("--full", action="store_true", help="一括生成モード（スレッド4本+note）")
    parser.add_argument("--json", type=str, default=None, help="一括生成用JSON（--fullと併用）")
    args = parser.parse_args()

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
        print(f"--- 保存された投稿文 ---")
        print(text)
        print(f"--- ({len(text)}文字) ---")
        print(f"保存先: {filepath}")
        print("状態: pending（承認待ち）")


if __name__ == "__main__":
    main()
