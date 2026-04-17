# Git履歴 秘密情報浄化手順

最終更新: 2026-04-17 / 作成: バナナ
対象事故: commit `0b9a5f5` に Google Ads Developer Token `{LEAKED_TOKEN_STRING}` 露出

---

## 前提

**この手順は force push を伴う破壊的操作**。以下3条件全てクリアしてから実行:

1. ✅ **Token/Key側の無効化が完了している**（漏洩Tokenは既に無効化済み = 履歴に残っていても実害なし）
2. ✅ NOYUTO明示承認
3. ✅ 他のローカルcloneで未pushの作業がないこと（別PC・会社PC・クラウドワーカー全員確認）

---

## 判断基準: 実行すべきか？

### 実行不要なケース（推奨）

- Tokenが無効化済み = 攻撃者が拾っても使えない = **履歴クリーンアップは優先度低**
- GitHubリポジトリが**Private**で、かつ外部者のアクセスログに異常なし
- push直後に除去 commit を push 済みで、GitHub の最新HEADにはToken無し

→ **今回のケースはこれ**。Token無効化すれば履歴浄化は不要。

### 実行すべきケース

- リポジトリが **Public** でクローン数が多く、外部bot収集のリスク大
- 規制業界（医療/金融/行政）でコンプライアンス監査あり
- 外部委託先に渡すタイミングで履歴にPII含む

---

## 実行手順（必要な場合のみ）

### 手順A: `git filter-repo` 使用（推奨・安全）

```bash
# 1. バックアップブランチ作成
git branch backup-before-cleanup

# 2. git-filter-repo インストール
pip install git-filter-repo

# 3. 置換リストファイル作成
cat > /tmp/replace.txt <<'EOF'
{LEAKED_TOKEN_STRING}==>***REDACTED***
EOF

# 4. 履歴書き換え実行（全commitのファイル内容から対象文字列を置換）
git filter-repo --replace-text /tmp/replace.txt --force

# 5. リモートに force push (NOYUTO承認後のみ)
git push origin main --force-with-lease

# 6. 全メンバーに通知: 各ローカルで以下実行
#    git fetch origin
#    git reset --hard origin/main
```

### 手順B: BFG Repo-Cleaner（代替・より高速）

```bash
# 1. BFG ダウンロード
curl -L -o /tmp/bfg.jar https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# 2. 別ディレクトリで bare clone
git clone --mirror https://github.com/office-vonds/noyuto.git /tmp/noyuto-clean.git

# 3. 置換パターンファイル作成
echo '{LEAKED_TOKEN_STRING}' > /tmp/patterns.txt

# 4. BFG実行
java -jar /tmp/bfg.jar --replace-text /tmp/patterns.txt /tmp/noyuto-clean.git

# 5. git gc で履歴整理
cd /tmp/noyuto-clean.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# 6. force push
git push --force
```

---

## force push 後の副作用対応

### 他PCローカルの影響

**他PC(会社PC/別ワーカー)でpullされていると、次回pullで衝突 or 過去commitが孤立する**

通知テンプレート:
```
【緊急】VONDSリポジトリ履歴浄化のためforce push実施 (日時: YYYY-MM-DD HH:MM)

各ローカル作業中の場合、以下を実行してください:

  1. 現在の作業ブランチをstash
     git stash
  2. リモートと同期
     git fetch origin
     git reset --hard origin/main
  3. stash 復元
     git stash pop

未pushのローカルcommitがある場合は個別対応してください。
質問は バナナ まで。
```

### GitHub側のキャッシュ

force pushしても **GitHub内部のcommit object** は一定期間保持される。完全削除するには:

1. GitHub Support へ「force pushによる機密情報含むcommit削除」をリクエスト
2. https://support.github.com/contact/private-information
3. 対象commit SHA（`0b9a5f5`）を明記

---

## 今回の判定（2026-04-17 バナナ）

- Token無効化済み（NOYUTOがリセット完了次第）→ **履歴浄化は優先度低**
- 新Token は Notion「各種アカウント」ページのみに保管
- pre-commit hook で再発防止済み

**→ 履歴浄化は保留**。重要イベント（外部監査 / Public化等）が発生したら本手順で対応。

---

## 関連

- セキュリティルール: `SECURITY.md`
- pre-commit hook: `.githooks/pre-commit`
- memory: `feedback_secret_handling.md`
