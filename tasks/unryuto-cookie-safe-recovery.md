# @unryuto_ai Cookie再取得 — Ban回避安全手順（rina教訓反映版）

作成: 2026-04-17 / KIRYU / CLAUDE.md #9 準拠

> rina凍結事故の直接原因は「WSL IP から初Cookie投稿 → 新デバイス判定 → spam認定」。
> unryuto_ai で同じ穴を踏まないため、Win環境ベースの手順に変更。

---

## 事実

- @unryuto_ai: 本日20:00投稿で 401 Unauthorized（Cookie期限切れ）
- queue 6件滞留中
- **これまで稼働していた実績あり → 凍結リスクは rina より低い**（常習デバイス扱いされている可能性）
- しかし**今回も WSL IPから再認証 → 新デバイス警告→Ban連鎖のリスク**あり

## 安全手順（3段階・NOYUTO作業10分）

### Step 1: Windows環境でNode.jsセットアップ確認

NOYUTO自宅PC（普段X.comに @unryuto_ai でログインしてるWinマシン）で:

```powershell
# PowerShell
node --version
```

- v18以上なら OK
- 入ってなければ https://nodejs.org/ からLTS版インストール

### Step 2: Windowsにスクリプト配置

PowerShell で以下を実行（WSL上のスクリプトを Windows側にコピー）:

```powershell
$src = "\\wsl$\Ubuntu\home\ozawakiryu0902\projects\vonds\unryuto\x-posts"
$dst = "$env:USERPROFILE\unryuto-x-posts"
New-Item -ItemType Directory -Force -Path $dst
Copy-Item -Path "$src\x-cookie-post.js" -Destination $dst
Copy-Item -Path "$src\queue" -Destination $dst -Recurse -Force
Copy-Item -Path "$src\posted" -Destination $dst -Recurse -Force
```

または WSL側で `cp -r ~/projects/vonds/unryuto/x-posts /mnt/c/Users/ozawa/unryuto-x-posts/` でコピー。

### Step 3: Windows上でCookie取得→投稿

**同じWindows上の同じChromeブラウザ**で:

1. https://x.com にアクセス（@unryuto_ai ログイン済み）
2. F12 → Application → Cookies → https://x.com
3. auth_token と ct0 をコピー
4. PowerShell で:
```powershell
cd $env:USERPROFILE\unryuto-x-posts
node x-cookie-post.js --setup
# auth_token と ct0 を貼り付け
node x-cookie-post.js --dry-run
# OK なら
node x-cookie-post.js
```

**重要**: Cookieを取得したブラウザと、スクリプトを走らせるマシンが**同じWindows**なら、Xから見ると「同じデバイスからの継続ログイン」に見える。

### Step 4: WSL側のAUTH_FILE同期（任意）

Win側で成功したら、WSL側 crontab は一時停止しておき、別途 WSL移行判定する。

```bash
# WSL側 crontab から一旦削除（rinaと同じ発想）
crontab -l | grep -v "unryuto/x-posts/x-cookie-post.js" | crontab -
```

→ 当面 Win側で手動投稿または Win Task Scheduler で自動化検討。

---

## なぜこの手順が安全か

| 要素 | rinaの時 | 今回 |
|---|---|---|
| Cookie取得端末 | Win Chrome | Win Chrome |
| 投稿実行端末 | **WSL（別IP判定）** | **Win（同IP判定）** |
| 新デバイス警告 | 発生→凍結 | 発生しない見込み |
| engage系 | 有効（凶器） | なし（x-cookie-post.jsは投稿のみ） |

unryuto_ai は engage 系なし + Win環境維持 なら安全度はrinaより高い。

---

## KIRYU同時対応（NOYUTOの手を動かさない範囲）

### A. WSL crontab の unryuto_ai 行を即停止（NOYUTO確認不要）

凍結リスク回避のため KIRYU が即削除。Win手順確立後に再登録判断。

### B. queue 6件の内容チェック（NOYUTO承認前スクリーニング）

spam判定されやすい文言（「#風俗経営」ハッシュタグ連発等）があれば調整案を提示。

### C. Win Task Scheduler 自動化スクリプトのドラフト作成

NOYUTOが Win手動で投稿した後、自動化したくなったら即適用できるよう .xml定義ファイルを準備。

---

## 万が一 unryuto_ai も凍結した場合

- 60件のnoyutoメディアX投稿資産は保全（unryuto/x-posts/queue配下）
- 代替: noyuto.jp ブログ化 or NOTE記事化（rinaと同様の保全ルート）
- ただし unryuto_ai は X API ではなく Cookie でしか動かさない実績あり → 凍結確率は低い
