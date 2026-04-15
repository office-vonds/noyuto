# VONDS Google広告監査 商品化

## 現在地（2026-04-15更新）

- **状態**: ストレッチゼロCSV 7本未取得
- **Google Ads顧客ID**: 854-911-4235（ストレッチゼロ）
- **手順書**: ads-audit/samples/stretchzero/EXPORT_CHECKLIST.md
- **実行環境**: claude-adsスキルは会社メインPCにのみ存在

## 商品化フレーム（構築済み・ads-audit/配下）

- 4プラン価格表: スポット¥75k〜¥220k / 月額¥80k〜¥250k+広告費%
- 既存客優遇: ¥98,000（税別）
- 監査レポート雛形: 9セクション・74チェック項目日本語対訳
- 業務委託契約書雛形: 15条
- 提案書: 既存客向け・新規向け 各1本
- 完全版HTML: ダウンロード/ads-audit/VONDS_Google広告監査サービス_完全版.html

## CSV取得後の自動フロー

1. CSV読み込み → audit-google → 74チェック走査（30-60分）
2. 英語出力 → 日本語化（30分）
3. NOYUTO所見欄空欄で仕上げ → 記入依頼（10-15分）
4. PDF化 → commit+push

## 次のアクション

1. **NOYUTO**: 会社PCでストレッチゼロCSV 7本DL → ads-audit/samples/stretchzero/data/
2. KIRYU: CSV検知 → 監査実行 → レポート完成

## 関連ファイル

- ads-audit/ 配下全ファイル（7ファイル・1,187行）
- session-logs/2026-04-13_0200_kiryu-ads-audit-recovery.md
