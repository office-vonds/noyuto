#!/usr/bin/env python3
"""
KIRYU 毎朝ブリーフィング — Gmail自動配信
cron: 0 9 * * * cd ~/noyuto && python3 kiryu_briefing.py
"""

import os
import glob
import subprocess
import json
from datetime import datetime, timedelta
from notify import send_notify

def get_session_logs(max_files=5):
    """session-logs/ から最新のログを取得"""
    log_dir = os.path.join(os.path.dirname(__file__), "session-logs")
    files = sorted(glob.glob(os.path.join(log_dir, "*.md")), reverse=True)

    logs = []
    for f in files[:max_files]:
        filename = os.path.basename(f)
        if filename == ".gitkeep":
            continue
        with open(f, "r", encoding="utf-8") as fh:
            content = fh.read()

        # 状態と次のアクションを抽出
        status = ""
        next_action = ""
        for line in content.split("\n"):
            if "現在の状態:" in line:
                status = line.split("現在の状態:")[-1].strip()
            if "次にやること:" in line:
                next_action = line.split("次にやること:")[-1].strip()

        project_name = filename.replace(".md", "").split("_", 2)[-1] if "_" in filename else filename
        logs.append({
            "file": filename,
            "project": project_name,
            "status": status or "不明",
            "next": next_action or "（ログ参照）",
        })

    return logs


def get_today_events():
    """Google Calendar の今日の予定を取得（gcalcli使用）"""
    today = datetime.now().strftime("%Y-%m-%d")
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

    try:
        result = subprocess.run(
            ["gcalcli", "agenda", today, tomorrow, "--tsv"],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    return None


def build_briefing():
    """ブリーフィング本文を組み立て"""
    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d (%a)")

    lines = []
    lines.append(f"KIRYU ブリーフィング {date_str}")
    lines.append("=" * 40)
    lines.append("")

    # --- スケジュール ---
    lines.append("[ 今日のスケジュール ]")
    events = get_today_events()
    if events:
        for event_line in events.split("\n"):
            lines.append(f"  {event_line}")
    else:
        lines.append("  ※ gcalcli未設定のためカレンダー取得不可")
        lines.append("  → Claude Code で /kiryu を実行して確認してください")
    lines.append("")

    # --- プロジェクト進捗 ---
    lines.append("[ プロジェクト現在地 ]")
    logs = get_session_logs()
    if logs:
        for log in logs:
            lines.append(f"  {log['project']}")
            lines.append(f"    状態: {log['status']}")
            lines.append(f"    次: {log['next']}")
    else:
        lines.append("  ※ session-logs/ にログなし")
    lines.append("")

    # --- おすすめアクション ---
    lines.append("[ 今日のアクション ]")
    lines.append("  → Claude Code で /kiryu を実行すると詳細確認＋スケジュール調整できます")
    lines.append("")
    lines.append("---")
    lines.append("KIRYU（COO・秘書） / 自動配信")

    return "\n".join(lines)


if __name__ == "__main__":
    briefing = build_briefing()
    subject = f"【KIRYU】{datetime.now().strftime('%m/%d')} 朝ブリーフィング"

    success = send_notify(subject, briefing)
    if success:
        print("ブリーフィング送信完了")
    else:
        print("送信失敗 — .env の GMAIL_APP_PASSWORD を確認してください")
