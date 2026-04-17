# NOYUTO 30秒：SMTP App Password 再発行

目的: Gmail SMTP が 535認証失敗中。再発行してKIRYUが毎朝ダイジェストメールを送信できるようにする。

---

## 手順（30秒）

1. https://myaccount.google.com/apppasswords にアクセス
2. office.vonds@gmail.com でログイン状態確認
3. 「アプリ パスワード」→ アプリ名「Claude Code SMTP」で**新規作成**
4. 表示された16文字の英数字をKIRYU経由で `~/credentials/gmail-app-password.txt` に貼る:

```bash
# WSL Ubuntu で:
echo "新16文字パスワード" > ~/credentials/gmail-app-password.txt
chmod 600 ~/credentials/gmail-app-password.txt
```

5. 完了したらKIRYUに「SMTP更新済」と一言

---

## 復旧後にKIRYUが自動実行

- 毎朝7:00 NOYUTOのGmail宛に朝のダイジェスト配信
- スマホGmail通知 → NOYUTO寝起きで前夜成果確認
- 重大アラート時（401連発・認証切れ・ディスクフル）に即時メール

## 現在の代替手段（SMTP復旧まで）

- Google Calendar event に埋込（手動登録）
- Notion 朝レポDB に append（MCP経由）
- `scripts/daily-digest-archive/digest-YYYY-MM-DD.md` にファイル保存（vc起動で確認可）
