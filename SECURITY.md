# VONDS セキュリティ運用ルール

最終更新: 2026-04-17 / 作成: バナナ

---

## 秘密情報の取り扱い鉄則

**以下を絶対にリポジトリへcommitしない**:
- API Key（Anthropic / OpenAI / Google / Stripe 等）
- Google Ads Developer Token
- OAuth `client_secret` / `refresh_token`
- Personal Access Token（GitHub / GitLab）
- PEM 秘密鍵 / SSH 秘密鍵
- DBパスワード / SMTP認証情報
- クライアントアカウントのパスワード

## 保管場所

| 種類 | 保管先 |
|---|---|
| Webサービス系 Key/Token | Notion「各種アカウント」ページ |
| 自動化スクリプト用 認証ファイル | `~/credentials/` 配下（`.gitignore`済み） |
| 本番サーバー SMTP/DB認証 | `mail-config.php` 等（`.gitignore`済み） |

## pre-commit hook（自動防止）

このリポジトリには `.githooks/pre-commit` が配置されており、秘密情報らしき文字列を含むcommitを自動拒否する。

### セットアップ（**別PC clone時に必ず実行**）

```bash
cd ~/projects/vonds
git config core.hooksPath .githooks
```

### 検出パターン

- `sk-ant-api03-...`（Anthropic）
- `ghp_...` / `gho_...` / `ghs_...`（GitHub）
- `AKIA...`（AWS）
- `AIza...`（Google API Key）
- `xoxb-...`（Slack）
- `sk_live_...`（Stripe）
- `developer_token:` / `refresh_token:` / `client_secret:` 直書き（YAML）
- `-----BEGIN ... PRIVATE KEY-----`（PEM）
- 既漏洩済みトークン文字列（再コピペ防止）

### 緊急回避（非推奨）

```bash
git commit --no-verify
```

**この操作は監査ログに残すこと**。NOYUTO承認なしで使わない。

## Claude Code セッション内での扱い

NOYUTOから秘密情報を受け取った各エージェント（バナナ/サム/KIRYU等）:

1. 文字列をチャットに書き戻さない
2. ファイル（session-log / task-queue / memory）に転記しない
3. 「Notion『各種アカウント』に追記してください」と返す
4. スクリプトで必要なら `~/credentials/` 配置指示のみ

**受け取った時点でそのClaude会話contextに記録される**ことを前提に動く。

## 漏洩時の対応フロー

1. **即Token/Key無効化**（発行元サービス管理画面で実行）
2. **新Token発行** → Notion「各種アカウント」に記録
3. **リポジトリHEADから文字列除去**（Edit / `sed`）→ commit
4. **必要なら git履歴浄化**（`docs/git-history-cleanup.md` 参照・force push要でNOYUTO承認必須）
5. **GitHub の露出期間を確認**（Public/Privateで影響度変わる）
6. **監視**: GCP / Google Ads / GitHub の Audit Log で不審利用確認

## 関連

- pre-commit hook: `.githooks/pre-commit`
- 履歴浄化手順: `docs/git-history-cleanup.md`
- memory: `feedback_secret_handling.md`
- .gitignore: 秘密情報拡張子・パス除外済み
