# NOYUTO X Cookie 再取得 1分手順（2アカウント分）

最終更新: 2026-04-17 / 作成: KIRYU

> rina (@rina_xxxfree) と unryuto_ai の両アカウントが **Cookie期限切れで投稿停止中**。
> 以下の手順で1アカウント30秒・合計1分でストック55+6=**61本の再開が可能**。

---

## 事実確認

| アカウント | 現在状態 | 未投稿ストック |
|---|---|---|
| @rina_xxxfree | 401 Unauthorized（X API期限切れ） | **55本** |
| @unryuto_ai | 401 Unauthorized（Cookie期限切れ） | **6本** |

rinaは本日からX API方式→Cookie方式に切り替え完了。初回Cookie登録が必要。
unryuto_aiは既にCookie方式。再取得のみで復活。

---

## 手順（各アカウント共通・30秒）

### Step 1: Chrome で該当アカウントにログイン済み状態にする

- WindowsのChrome で https://x.com にアクセス
- 対象アカウントでログインされていることを確認（右上のアイコンで確認）
- **別アカウントでログインしてる場合は一度ログアウト→対象アカウントでログイン**

### Step 2: DevTools を開いて Cookie を2つコピー

- キーボード `F12` → DevToolsが開く
- 上部タブ `Application` をクリック（なければ `»` メニューから選ぶ）
- 左メニュー `Cookies` → `https://x.com` をクリック
- 以下の2つの Value をコピー:
  - `auth_token`（40文字程度のhex文字列）
  - `ct0`（160文字程度のhex文字列）

### Step 3: WSL Ubuntu でコマンド実行して入力

---

## アカウント A: rina (@rina_xxxfree)

WSL Ubuntu で以下を実行:

```bash
cd ~/projects/vonds
node rina/x-cookie-post.js --setup
```

プロンプトに順に貼り付け:
```
auth_token の値: <貼り付け>
ct0 の値: <貼り付け>
```

認証成功メッセージ: `認証成功！ ユーザー: @rina_xxxfree` が出れば完了。

---

## アカウント B: @unryuto_ai

WSL Ubuntu で以下を実行:

```bash
cd ~/projects/vonds
node unryuto/x-posts/x-cookie-post.js --setup
```

同様に auth_token と ct0 を貼り付け。
`認証成功！ ユーザー: @unryuto_ai` が出れば完了。

---

## 完了後（KIRYU/サム側の処理）

両方完了したらKIRYUに「Cookie両方入れた」と一言ください。以下を即実行します:

1. テスト投稿（--dry-run で検証後、1本投稿）
2. 投稿頻度 3倍化 の crontab 更新（承認後）
3. ストック枯渇検知（残5本で自動通知）
4. 週次の Cookie 健康診断 cron 追加

---

## 投稿頻度 3倍化 の提案

現状: 1日1投稿 → 55本消化に55日
加速: 1日3投稿（朝8・昼13・夜19） → 約18日で消化

スパム判定リスクも考慮してrinaは**朝8・夜20**の **2回/日** が無難。30日で消化。

| 案 | 投稿時刻 | 消化日数 | スパムリスク |
|---|---|---|---|
| 現状 | 朝8 | 55日 | 極低 |
| **推奨** | **朝8・夜20** | **28日** | **低** |
| 加速 | 朝8・昼13・夜20 | 19日 | 中 |
| 超加速 | 朝8・昼12・夕17・夜21 | 14日 | 高 |

NOYUTO判断ください。

---

## Cookie有効期限の目安

- X の auth_token は **約 1〜3ヶ月** で自動失効
- ct0 は短命（1週間〜1ヶ月）
- 今回の401は約1週間で切れた可能性 → **週1回のCookie再取得サイクル** を前提に運用する

KIRYU が週次健康診断cronを入れれば、切れる前に検知して Slack/Notion 通知可能。これは別途提案。
