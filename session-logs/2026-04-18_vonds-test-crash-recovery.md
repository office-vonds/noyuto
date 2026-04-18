# 2026-04-18 vonds-test クラッシュ復旧記録

## 事象
HyperFrames動画レンダ中にWSL2クラッシュ、Claude Code・ターミナル強制終了。

## 原因
- 主犯：.wslconfig未設定でWSL2メモリ無制限 → Vmmem暴走
- 共犯：index.html 11:55リライトで負荷2倍（filter 2→5段、Duration 15→20秒）
- 引き金：Puppeteer 2インスタンス並行稼働（work-* が2個の物的証拠）

## 対策済み
- .wslconfig作成（memory=8GB / swap=4GB）
- .gitignoreに work-*/ 追加（二重化：root + video-production）
- auto-save hook制御機構新設（フラグファイル方式）
  - 停止：touch ~/.claude/no-autosave
  - 再開：rm ~/.claude/no-autosave

## 関連コミット
- 14a170a：クラッシュ対応の正式記録
- その他auto-save：hook動作検証、tmp削除、本ログ追加

## 教訓
1. 重要git操作前は必ず hook停止
2. レンダ前に free -h で available 2GB以上確認
3. HyperFrames出力は既にh264圧縮済み、二重圧縮禁止
4. 重いフィルタ（5段以上、mix-blend-mode）は負荷倍増
5. Puppeteer 2インスタンス並行は絶対禁止

## 残タスク
- 第3フェーズ：CLAUDE.mdにHyperFrames運用ルール追記
- 新構成（20秒版）の軽量化・再レンダは後日
