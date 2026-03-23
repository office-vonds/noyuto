import smtplib
import os
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

def send_notify(subject, body):
    gmail_user = os.getenv("GMAIL_USER", "office.vonds@gmail.com")
    gmail_password = os.getenv("GMAIL_APP_PASSWORD")

    if not gmail_password:
        print("[ERROR] GMAIL_APP_PASSWORD が .env に設定されていません")
        return False

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = gmail_user
    msg["To"] = gmail_user

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(gmail_user, gmail_password)
            smtp.send_message(msg)
        print("[OK] 通知送信成功: " + subject)
        return True
    except Exception as e:
        print("[ERROR] 送信失敗: " + str(e))
        return False

if __name__ == "__main__":
    send_notify("【noyuto】テスト通知", "notify.py の動作確認です。")
