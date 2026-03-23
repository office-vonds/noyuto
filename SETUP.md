# Claude Code セットアップコマンド

> Ubuntu + GitHub連携で、どの環境でも同じコンテキストを維持するための手順書

---

## 新しい環境でセットアップするとき（毎回これだけ）

```bash
git clone https://github.com/office-vonds/noyuto.git ~/noyuto
cp ~/noyuto/CLAUDE.md ~/.claude/CLAUDE.md
```

---

## CLAUDE.md を更新したとき（GitHubに同期）

```bash
cd ~/noyuto && git add CLAUDE.md && git commit -m "更新" && git push
```

---

## 構成メモ

- GitHubリポジトリ: https://github.com/office-vonds/noyuto（Private）
- CLAUDE.mdの元データ: CONTEXT_minimal.md（62KB / Claude.aiエクスポートから生成）
- 配置場所: `~/.claude/CLAUDE.md`（Claude Code起動時に自動読み込み）

---

## Windowsドライブのマウント（必要な場合）

WSL2でCドライブが見えないときに実行：

```bash
sudo mkdir /mnt/c && sudo mount -t drvfs C: /mnt/c
```

Windows側のDownloadsはこのパスで参照可能：

```
/mnt/c/Users/<ユーザー名>/Downloads/
```
