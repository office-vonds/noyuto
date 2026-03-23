#!/usr/bin/env python3
"""Gmailでメール送信するユーティリティ。
cronからの自動通知に使用。Gmail MCP不要。

セットアップ:
  1. Google Account → セキュリティ → 2段階認証を有効化
  2. Google Account → セキュリティ → アプリパスワード → 生成
  3. .envに以下を追加:
     GMAIL_ADDRESS=office.vonds@gmail.com
     GMAIL_APP_PASSWORD=生成した16文字のパスワード

使い方:
  python3 send_gmail.py --to office.vonds@gmail.com --subject "件名" --body "本文"
  python3 send_gmail.py --to office.vonds@gmail.com --subject "件名" --body-file /path/to/body.txt
"""

import argparse
import os
import smtplib
import sys
from email.mime.text import MIMEText
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")


def send_email(to: str, subject: str, body: str) -> bool:
    """Gmailでメール送信。成功でTrue、失敗でFalse。"""
    address = os.getenv("GMAIL_ADDRESS")
    password = os.getenv("GMAIL_APP_PASSWORD")

    if not address or not password:
        print("エラー: GMAIL_ADDRESS / GMAIL_APP_PASSWORD が.envに設定されていません")
        print("セットアップ手順:")
        print("  1. https://myaccount.google.com/security → 2段階認証を有効化")
        print("  2. https://myaccount.google.com/apppasswords → アプリパスワードを生成")
        print("  3. .envに GMAIL_ADDRESS=xxx と GMAIL_APP_PASSWORD=xxx を追加")
        return False

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = address
    msg["To"] = to

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(address, password)
            server.send_message(msg)
        print(f"送信完了: {to}")
        return True
    except smtplib.SMTPAuthenticationError:
        print("エラー: Gmail認証失敗。アプリパスワードを確認してください")
        return False
    except Exception as e:
        print(f"エラー: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Gmail送信")
    parser.add_argument("--to", required=True, help="送信先")
    parser.add_argument("--subject", required=True, help="件名")
    parser.add_argument("--body", help="本文")
    parser.add_argument("--body-file", help="本文をファイルから読み込む")
    args = parser.parse_args()

    if args.body_file:
        body = Path(args.body_file).read_text(encoding="utf-8")
    elif args.body:
        body = args.body
    else:
        body = sys.stdin.read()

    success = send_email(args.to, args.subject, body)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
