# セッションログ: 2026-04-18 22:35 vc alias 再発防止

- ブランチ: main
- 担当: KIRYU

## 背景
NOYUTOがメインPC GALLERIA XT で `vc` 起動失敗：
```
error: cannot pull with rebase: You have unstaged changes.
```
別Claude Code (Opus 4.7) が `git pull --autostash` 化で対応済（コミット 5d8bc48）。
ただし以下の構造的脆弱性が残存していたため恒久対策を実施。

## 構造的問題
1. ~/.bashrc に `alias vc=...` をハードコードしていた
2. git管理外なのでPC毎に手動更新が必要 → 別PC更新漏れの温床
3. ノートPC側 ~/.bashrc に「ハードコード行」と「source行」が二重定義状態だった

## 実施した恒久対策
1. **scripts/shell/install-vc-alias.sh** 新設（実行可能・冪等）
   - 既存ハードコードを自動削除
   - `source ~/projects/vonds/scripts/shell/vc-alias.sh` 1行を ~/.bashrc 末尾に追加
   - バックアップ自動生成（`~/.bashrc.bak.YYYYMMDD`）
   - 何度実行しても結果は同じ

2. **ノートPC側 ~/.bashrc クリーンアップ**
   - 118行目のハードコード `alias vc=...` 削除
   - 122-123行目の source 1行のみに統一
   - 動作確認済み（vc/vcexit/vc-check 全て定義される）

3. **メモリ追加**
   - `feedback_vc_alias_pull_safety.md`
   - MEMORY.md にインデックス追加

## メインPC GALLERIA XT 側の手順（NOYUTO実行）
```bash
cd ~/projects/vonds
git pull --autostash
bash scripts/shell/install-vc-alias.sh
source ~/.bashrc
vc-check   # 環境チェック
```

## 関連ファイル
- scripts/shell/vc-alias.sh（共通定義・git管理）
- scripts/shell/install-vc-alias.sh（新設・冪等セットアップ）
- ~/.bashrc（git外・各PC個別。install スクリプト経由で更新）

## 現在の状態
完了。ノートPC側は本セッションで対応済み。GALLERIA XT側はNOYUTO手動実行待ち（1コマンド）。

## 次回再発条件
- install-vc-alias.sh を経由せず ~/.bashrc を手編集した場合のみ再発し得る
- 別Claude Code が ~/.bashrc に直書きしないよう、メモリに方針記載済
