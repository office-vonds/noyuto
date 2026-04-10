---
name: catchup
description: セッション再開時に現在のプロジェクト状態を自動把握する。セッション開始時、「続きやって」「前回の続き」「catchup」等の指示時に使用。
argument-hint: "[対象プロジェクトパス（省略時はカレントディレクトリ）]"
---

# セッション復帰（/catchup）

以下の情報を取得し、箇条書きで簡潔に報告せよ。10行以内で終わらせること。

## 取得する情報

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

## 出力フォーマット

```
📍 現在地: [ブランチ名] @ [最新コミットハッシュ]
📝 直近の作業: [最新コミットメッセージ3つ]
🔧 未コミット変更: [変更ファイル数と一覧]
📦 stash: [あり/なし（ある場合は内容）]
⚠️ 未解決: [TODO/FIXME数]
📄 前回の続き: [session-logsから抽出した次タスク]

▶️ 推奨アクション: [状況に応じた次のステップ提案]
```

報告は簡潔に。前置きや説明は不要。
