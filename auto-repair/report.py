"""
レポート生成+フィードバックスクリプト
Claude Codeの実行結果をNotionに書き戻し、Gmail通知を送信する
"""

import os
import smtplib
import logging
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# 環境変数
load_dotenv(Path(__file__).parent / ".env")
NOTION_API_KEY = os.getenv("NOTION_API_KEY", "")
NOTION_API_URL = "https://api.notion.com/v1"
NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
}

GMAIL_ADDRESS = os.getenv("GMAIL_ADDRESS", "")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))


def update_notion(page_id, result, status="完了"):
    """Notionレコードに結果を書き戻す"""
    url = f"{NOTION_API_URL}/pages/{page_id}"

    # Rich Textの最大長制限（Notion API: 2000文字）
    summary = (result.get("summary", "") or "")[:2000]
    changed_files = (result.get("changed_files", "") or "")[:2000]

    payload = {
        "properties": {
            "ステータス": {"select": {"name": status}},
            "対応内容": {
                "rich_text": [{"text": {"content": summary}}] if summary else []
            },
            "変更ファイル": {
                "rich_text": [{"text": {"content": changed_files}}] if changed_files else []
            },
            "完了日時": {
                "date": {"start": datetime.now().isoformat()}
            },
        }
    }

    resp = requests.patch(url, headers=NOTION_HEADERS, json=payload, timeout=30)
    resp.raise_for_status()
    logger.info(f"Notion更新完了: {page_id} → {status}")
    return resp.json()


def send_gmail(to_addresses, subject, html_body):
    """Gmail送信"""
    if not GMAIL_ADDRESS or not GMAIL_APP_PASSWORD:
        logger.error("Gmail認証情報が未設定")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"オフィスVONDS <{GMAIL_ADDRESS}>"
    msg["To"] = ", ".join(to_addresses)

    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        logger.info(f"メール送信完了: {to_addresses}")
        return True
    except Exception as e:
        logger.error(f"メール送信エラー: {e}")
        return False


def build_email_html(request_data, result):
    """完了通知メールのHTML本文を生成"""
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Hiragino Sans','Noto Sans JP',sans-serif;color:#333;line-height:1.8;max-width:600px;margin:0 auto;padding:20px;">

<div style="background:#E51F5E;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0;">
  <h2 style="margin:0;font-size:18px;">改修完了のお知らせ</h2>
</div>

<div style="background:#fff;border:1px solid #ddd;border-top:none;padding:24px;border-radius:0 0 8px 8px;">

<p>いつもお世話になっております。<br>ご依頼いただきました改修が完了いたしました。</p>

<h3 style="color:#E51F5E;border-bottom:2px solid #E51F5E;padding-bottom:4px;font-size:15px;">ご依頼内容</h3>
<p style="background:#f9f9f9;padding:12px;border-radius:4px;">{request_data.get('request_content', '')}</p>

<h3 style="color:#E51F5E;border-bottom:2px solid #E51F5E;padding-bottom:4px;font-size:15px;">実施内容</h3>
<p style="background:#f9f9f9;padding:12px;border-radius:4px;white-space:pre-wrap;">{result.get('summary', '')}</p>

<h3 style="color:#E51F5E;border-bottom:2px solid #E51F5E;padding-bottom:4px;font-size:15px;">変更ファイル</h3>
<p style="background:#f9f9f9;padding:12px;border-radius:4px;font-family:monospace;font-size:13px;white-space:pre-wrap;">{result.get('changed_files', 'なし')}</p>

<h3 style="color:#E51F5E;border-bottom:2px solid #E51F5E;padding-bottom:4px;font-size:15px;">確認URL</h3>
<p><a href="{request_data.get('target_url', '#')}" style="color:#E51F5E;">{request_data.get('target_url', '未指定')}</a></p>

{"<h3 style='color:#E51F5E;border-bottom:2px solid #E51F5E;padding-bottom:4px;font-size:15px;'>確認事項</h3><p style='background:#fff3cd;padding:12px;border-radius:4px;'>" + result.get('notes', '') + "</p>" if result.get('notes') else ""}

<hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
<p>ご確認をお願いいたします。<br>何かございましたら、改修依頼フォームより再度ご連絡ください。</p>

<p style="color:#888;font-size:13px;margin-top:24px;">
株式会社オフィスVONDS<br>
TEL: 050-8884-8993<br>
MAIL: office.vonds@gmail.com
</p>

</div>
</body>
</html>"""


def build_inquiry_email_html(request_data, result):
    """情報不足時の確認依頼メールHTML本文を生成"""
    missing_info = result.get("missing_info", "")
    notes = result.get("notes", "")

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Hiragino Sans','Noto Sans JP',sans-serif;color:#333;line-height:1.8;max-width:600px;margin:0 auto;padding:20px;">

<div style="background:#F59E0B;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0;">
  <h2 style="margin:0;font-size:18px;">改修依頼の確認をお願いいたします</h2>
</div>

<div style="background:#fff;border:1px solid #ddd;border-top:none;padding:24px;border-radius:0 0 8px 8px;">

<p>いつもお世話になっております。<br>
ご依頼いただきました改修について、<strong>情報が不足しているため対応を保留</strong>しております。<br>
お手数ですが、以下の情報をご確認のうえ、改修依頼フォームより再度ご連絡ください。</p>

<h3 style="color:#F59E0B;border-bottom:2px solid #F59E0B;padding-bottom:4px;font-size:15px;">ご依頼内容</h3>
<p style="background:#f9f9f9;padding:12px;border-radius:4px;">{request_data.get('request_content', '')}</p>

<h3 style="color:#F59E0B;border-bottom:2px solid #F59E0B;padding-bottom:4px;font-size:15px;">不足している情報</h3>
<p style="background:#FEF3C7;padding:12px;border-radius:4px;white-space:pre-wrap;">{missing_info}</p>

{"<h3 style='color:#F59E0B;border-bottom:2px solid #F59E0B;padding-bottom:4px;font-size:15px;'>確認事項</h3><p style='background:#FEF3C7;padding:12px;border-radius:4px;white-space:pre-wrap;'>" + notes + "</p>" if notes else ""}

<hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
<p>上記の情報を添えて、改修依頼フォームより再度ご依頼ください。<br>
ご不明点がございましたら、お電話でもお気軽にご連絡ください。</p>

<p style="color:#888;font-size:13px;margin-top:24px;">
株式会社オフィスVONDS<br>
TEL: 050-8884-8993<br>
MAIL: office.vonds@gmail.com
</p>

</div>
</body>
</html>"""


def run(request_data, result, is_error=False):
    """メイン処理: Notion書き戻し + Gmail通知"""
    page_id = request_data["page_id"]
    site_name = request_data.get("site_name", "")
    request_content = request_data.get("request_content", "")

    # ステータス判定: 情報不足 / エラー / 完了
    result_status = result.get("status", "").strip()
    is_missing_info = "情報不足" in result_status or "情報不足" in result.get("summary", "")

    if is_missing_info:
        status = "確認待ち"
    elif is_error:
        status = "エラー"
    else:
        status = "完了"

    # Notion書き戻し
    try:
        # 情報不足時はsummaryに不足情報を含める
        if is_missing_info:
            result_for_notion = dict(result)
            result_for_notion["summary"] = f"【情報不足】\n{result.get('missing_info', '')}\n\n{result.get('notes', '')}"
        else:
            result_for_notion = result
        update_notion(page_id, result_for_notion, status)
    except Exception as e:
        logger.error(f"Notion書き戻し失敗: {e}")

    # Gmail送信
    to_list = [GMAIL_ADDRESS]  # 自社は常にCC
    client_email = request_data.get("client_email", "")
    if client_email:
        to_list.insert(0, client_email)

    if is_missing_info:
        subject = f"【確認依頼】{site_name} - {request_content[:30]}"
        html_body = build_inquiry_email_html(request_data, result)
    elif is_error:
        subject = f"【改修エラー】{site_name} - {request_content[:30]}"
        html_body = build_email_html(request_data, result)
    else:
        subject = f"【改修完了】{site_name} - {request_content[:30]}"
        html_body = build_email_html(request_data, result)

    try:
        send_gmail(to_list, subject, html_body)
    except Exception as e:
        logger.error(f"Gmail送信失敗: {e}")


if __name__ == "__main__":
    print("report.py は main.py から呼び出されます")
