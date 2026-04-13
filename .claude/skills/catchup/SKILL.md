---
name: catchup
description: セッション再開時に現在のプロジェクト状態を自動把握する。セッション開始時、「続きやって」「前回の続き」「catchup」等の指示時に使用。
argument-hint: "[対象プロジェクトパス（省略時はカレントディレクトリ）]"
---

# セッション復帰（/catchup）

以下の情報を取得し、箇条書きで簡潔に報告せよ。10行以内で終わらせること。

## 取得する情報

### 0. origin を必ず最初に fetch（最重要・事故防止）
**catchup の第一ステップは必ず `git fetch` から始めること。** ローカル HEAD だけで判断するとブランチが遅れていても「最新」と誤判定する（2026-04-13 事故で 25 コミット見落とし）。

```bash
git fetch origin --quiet
git rev-list --count HEAD..origin/main  # 0でなければ遅延
git log HEAD..origin/main --oneline | head -10  # 遅延内容
```

**遅延が検出されたら、catchup の出力冒頭で必ず警告すること。**「origin/main が N コミット先行・作業前に merge 必須」と明示する。

### 1. Git状態
```bash
git branch --show-current
git log --oneline -5
git diff --stat
git stash list
```

### 2. 変更中のファイル
```bash
git diff --name-only
git diff --cached --name-only
```

### 3. 直近の作業内容
```bash
git log --oneline -10 --all --decorate
```

### 4. 未解決の問題
TODO/FIXME/HACKコメントを検索：
```bash
grep -rn "TODO\|FIXME\|HACK" --include="*.py" --include="*.js" --include="*.html" --include="*.md" . | head -20
```

### 5. セッションログ
`session-logs/` ディレクトリがあれば最新ファイルを読み、前回の「次にやること」を確認する。

### 6. 宣言ファイル実在検証（同期ズレ自動検知）
前回のsession-logが「新規追加」「作成した」「commit済」と主張しているファイルが**実在するか**を必ず検証する。KIRYU/サム等の並列エージェントが書いたつもりで消失しているケースが発生する。

**検証対象（正規表現で抽出）:**
- `project_*.md` / `feedback_*.md` / `reference_*.md` / `user_*.md`（memory系）
- `*.html` / `*.py` / `*.js` / `*.sh` / `*.md`（実装ファイル）
- サービスアカウント鍵ファイル（`*.sa_key*` / `*-credentials.json`）

**検証ロジック:**
```bash
LATEST_LOG=$(ls -t session-logs/*.md 2>/dev/null | head -1)
grep -oE '[a-z_0-9-]+\.(md|html|py|js|json|sh)' "$LATEST_LOG" | sort -u | while read f; do
  if ! find ~/.claude/projects/*/memory /home/ozawakiryu0902/projects/vonds -name "$f" 2>/dev/null | grep -q .; then
    echo "⚠️ 宣言されているが不在: $f"
  fi
done
```

**さらにチェック:**
- untracked embedded git repo（`git status` に `?? xxx/` で出るディレクトリ）があれば独立サブリポジトリの可能性を警告
- `.gitignore` の行数が前コミットから大幅減（80%以上の削除）なら警告（過去に5行に戻された事故あり）
- `.env` / `credentials` / `sa_key` の命名パターンが untracked に出ていれば秘密漏洩警告
- memory配下に対応ファイルのない MEMORY.md エントリがあれば警告

## 出力フォーマット

```
🚨 origin遅延: [origin/main より N コミット遅延 / 同期済み]
📍 現在地: [ブランチ名] @ [最新コミットハッシュ]
📝 直近の作業: [最新コミットメッセージ3つ（origin/main 最新を含む）]
🔧 未コミット変更: [変更ファイル数と一覧]
📦 stash: [あり/なし（ある場合は内容）]
⚠️ 未解決: [TODO/FIXME数]
📄 前回の続き: [session-logsから抽出した次タスク]
🚨 同期ズレ: [宣言されているが不在のファイル / 埋め込みサブリポ / .gitignore破損 / 秘密漏洩リスク]

▶️ 推奨アクション: [状況に応じた次のステップ提案]
```

同期ズレが1件でも出たら、セッション開始時点で**必ず**NOYUTOに報告してから作業に入ること。「毎回1時間吸われる」原因はここ。

報告は簡潔に。前置きや説明は不要。
