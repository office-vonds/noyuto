#!/usr/bin/env python3
"""汎用Gmail送信モジュール

使用:
  from scripts.send_gmail import send_mail
  send_mail(subject="件名", body="本文(markdown/text)", to="office.vonds@gmail.com")

または CLI:
  cat body.md | python3 scripts/send-gmail.py --subject "朝のダイジェスト" --to office.vonds@gmail.com

認証: ~/credentials/gmail-app-password.txt (Gmail App Password 16桁)
送信元: office.vonds@gmail.com
"""

import smtplib, sys, argparse, os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from pathlib import Path

SENDER = 'office.vonds@gmail.com'
APP_PW_PATH = Path.home() / 'credentials' / 'gmail-app-password.txt'


def _load_app_password() -> str:
    if not APP_PW_PATH.exists():
        raise RuntimeError(f'App password not found: {APP_PW_PATH}')
    pw = APP_PW_PATH.read_text().strip()
    if len(pw) != 16:
        raise RuntimeError(f'Invalid app password length: {len(pw)} (expected 16)')
    return pw


def send_mail(subject: str, body: str, to: str = SENDER, sender_name: str = 'VONDS KIRYU',
              html_body: str | None = None) -> bool:
    pw = _load_app_password()
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = formataddr((sender_name, SENDER))
    msg['To'] = to

    msg.attach(MIMEText(body, 'plain', 'utf-8'))
    if html_body:
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))

    with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=30) as s:
        s.login(SENDER, pw)
        s.send_message(msg)
    return True


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--subject', required=True)
    ap.add_argument('--to', default=SENDER)
    ap.add_argument('--from-name', default='VONDS KIRYU')
    ap.add_argument('--body-file', help='本文ファイル(省略時 stdin)')
    args = ap.parse_args()

    if args.body_file:
        body = Path(args.body_file).read_text(encoding='utf-8')
    else:
        body = sys.stdin.read()

    if not body.strip():
        print('ERROR: body is empty', file=sys.stderr)
        sys.exit(1)

    try:
        send_mail(subject=args.subject, body=body, to=args.to, sender_name=args.from_name)
        print(f'OK: sent to {args.to} ({len(body)} chars)')
    except Exception as e:
        print(f'ERROR: {e}', file=sys.stderr)
        sys.exit(2)
