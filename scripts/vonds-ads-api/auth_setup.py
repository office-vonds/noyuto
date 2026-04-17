#!/usr/bin/env python3
"""OAuth 2.0 Refresh Token 取得スクリプト

前提:
  - Google Cloud で OAuth 2.0 Client ID (Desktop app) 作成済み
  - client_id / client_secret は環境変数 OR prompt 入力

出力:
  - refresh_token をターミナルに表示
  - これを ~/credentials/google-ads.yaml の refresh_token に手動でコピー

実行:
  python3 auth_setup.py
"""
import os
import sys
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/adwords"]


def main():
    client_id = os.environ.get("GOOGLE_ADS_OAUTH_CLIENT_ID")
    client_secret = os.environ.get("GOOGLE_ADS_OAUTH_CLIENT_SECRET")

    if not client_id:
        client_id = input("OAuth Client ID: ").strip()
    if not client_secret:
        client_secret = input("OAuth Client Secret: ").strip()

    if not client_id or not client_secret:
        print("[ERROR] client_id / client_secret が空", file=sys.stderr)
        sys.exit(1)

    client_config = {
        "installed": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost"],
        }
    }

    flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
    credentials = flow.run_local_server(port=0, prompt="consent")

    print("\n" + "=" * 60)
    print("Refresh Token 取得成功")
    print("=" * 60)
    print(f"\nrefresh_token: {credentials.refresh_token}")
    print("\n↑ この値を ~/credentials/google-ads.yaml の refresh_token に貼る")
    print("  （チャット・リポジトリには書かない）")


if __name__ == "__main__":
    main()
