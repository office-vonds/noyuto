# ストレッチゼロ 予約管理・報酬計算システム Phase 1

## 概要
CF7フォーム送信データをGoogleスプレッドシートに自動記録し、
施術者スケジュール管理・報酬計算を一元化する。

## 構成
1. CF7 → Googleスプレッドシート自動連携（mu-plugin）
2. スプレッドシート内に予約管理・スケジュール・報酬計算シートを構築
3. GASで自動化（予約通知・報酬集計）

## ファイル
- `cf7-to-sheet.php` — CF7送信データをGoogleスプレッドシートに送信するmu-plugin
- `gas-booking.js` — Google Apps Script（スプレッドシート側の自動化）
- `setup-sheet.js` — スプレッドシートの初期構築スクリプト
