# セッションログ: 2026-04-17 12:50 バナナ担当2案件

- ブランチ: main
- 担当: バナナ君

## 作業内容

### ①ストレッチゼロ KW追加（予算¥10,250/日 対応）
現状: 30日消化¥117,681（日¥3,923）・KW10本 → 予算2.6倍増でKW不足。
本気ストレッチとのカニバリ回避で以下を作成:

- `ads-audit/samples/stretchzero/kw_add_20260417.tsv` — 即投入11本（Tier1-2）
- `ads-audit/samples/stretchzero/kw_negative_20260417.tsv` — 除外KW 11本
- `ads-audit/samples/stretchzero/kw_tier3_5_pipeline.tsv` — 段階投入14本（Week2-4）

### ②本気ストレッチ Google広告CVタグ実装
現物確認の結果:
- GTM `GTM-K32XLKXH` 導入済（NOYUTO初期分析の「未導入」は誤り）
- GA4 `G-93MZ8ERBW5` 稼働
- 予約は自社`reservation.php`完結（ペライチ外部遷移ではない）
- Google広告CVタグ（AW-xxxxx）のみ未実装

作業指示書作成: `majistretch/tasks/cv_tag_implementation_20260417.md`
CV設計（メインCV: TEL/フォーム送信 / マイクロCV: CTAクリック/メールタップ）

## 役割分担
- NOYUTO: Google広告管理画面でKW11本＋除外11本投入 / CVアクション4本作成＋AW-ID共有
- バナナ: リスト作成（完了）/ CV設計（完了）
- サム: GTMタグ4本追加・Publish・reservation.php拡張

## 現在の状態
完了（バナナ側タスクすべて。以降はNOYUTO管理画面操作＋サム実装）

## 追記（13:20）GTM現物確認
NOYUTOからGTMコンテナスクショ3枚受領→整理判定実施:
- TELタップ2重計上（旧タグ + 新タグ）確定→旧停止
- コンバージョンリンカー2本重複→旧停止
- 予約ボタントリガーがairrsv.net想定で発火ゼロ（本番は#reservation）→修正
- メールタップCVタグ未実装→追加必要
NOYUTO承認済み→確定版指示書作成: `majistretch/tasks/gtm_cleanup_20260417_final.md`
メールタップCV ID/ラベル提供済み: `18057524680` / `FpUuCN7tzp0cEMjrv6JD`

## 次にやること
1. NOYUTOがGoogle広告管理画面でKW/除外投入
2. NOYUTOがCVアクション4本作成→AW-ID/ラベルをサムへ共有
3. サムがGTMタグ追加→Publish
4. 72時間後にバナナがCV計上確認

## 関連ファイル
- ads-audit/samples/stretchzero/kw_add_20260417.tsv
- ads-audit/samples/stretchzero/kw_negative_20260417.tsv
- ads-audit/samples/stretchzero/kw_tier3_5_pipeline.tsv
- majistretch/tasks/cv_tag_implementation_20260417.md
