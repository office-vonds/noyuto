# Claude Code セットアップ手順

## 新しい環境でセットアップするとき
git clone https://github.com/office-vonds/noyuto.git ~/noyuto
cp ~/noyuto/CLAUDE.md ~/.claude/CLAUDE.md

## CLAUDE.mdを更新したとき（GitHubに同期）
cd ~/noyuto && git add CLAUDE.md && git commit -m "更新" && git push

## Windowsドライブのマウント（必要な場合）
sudo mkdir /mnt/c && sudo mount -t drvfs C: /mnt/c
# Windows側のDownloadsは /mnt/c/Users/ozawa/Downloads/
