# 4/23 MTG メモ（Kayoko Ando氏）

- 日時: 2026-04-23(木) 13:00-13:30 JST（30分）
- 相手: Kayoko Ando氏 / kayokoa@xwf.google.com（Google外部委託パートナー）
- 目的: Basic Access承認状況確認・代理店書類要件・Standard Access昇格条件

## 現在地（2026-04-17時点）

- MCC `709-306-3546` 構築完了（4/17）
- 配下3クライアント（A-TRUCK / ストレッチゼロ / 本気ストレッチ）統合済み
- Basic Access 申請提出済み（4/17）・承認待ち
- 自作8ページPDF `VONDS_Google_Ads_API_Design_Document.pdf` 同梱
- Developer Token リセット予定（チャット露出事故・4/17）
- API実装雛形: `scripts/vonds-ads-api/` 整備済み（auth/test/fetch_reports）

## 質問リスト（優先順）

### 1. Basic Access 承認ステータス
- 提出から4/23時点で4-6営業日経過
- 審査通ってなければ何が必要か
- 補足書類（代理店書類）の提出形式・フォーマット指定

### 2. 代理店適格性確認プログラム
- VONDS側準備中の「代理店書類」の具体要件
- SANKEN中込氏へ依頼済のクライアント書類の確認方法
- プログラム承認までのSLA

### 3. Standard Access 昇格条件
- Basic → Standard のAPIコール量しきい値（Basic は 15,000/day）
- VONDS 想定コール量: 500/day（3.3%）で当面Basic十分
- 昇格申請のトリガー（コール量 or 顧客数 or その他）

### 4. Performance Max
- SANKEN3社の業種（運送・ヘルスケア）でのベストプラクティス
- 除外地域・除外オーディエンスの設定推奨
- 本気 × ゼロ のカニバリ回避でPMaxを避けるべきケース

### 5. 業界ベンチマーク
- ヘルスケア（ストレッチ/整体）の CPC / CV率 / CPA 中央値
- 運送業（引越し・軽貨物）の同上
- 中小企業代理店の Standard 昇格率

## 準備物（MTG当日までに確認）

- [ ] Developer Token の無効化完了確認
- [ ] `google-ads.yaml` に新Token反映
- [ ] 3クライアントの直近30日レポートをAPI経由で取得できる状態（承認依存）
- [ ] SANKEN書類（クライアント側）の返送状況（中込氏）
- [ ] 適格性確認4項目（組織/EU政治広告/請求先）の提出完了証憑

## 想定される依頼・行動（承認下りたら即実行）

1. 3クライアントCSV取得 → 74チェック監査 → レポート納品
2. 本気×ゼロ除外KWの本番反映確認
3. A-TRUCK月次レポート自動生成 cron 化
4. 買取コンシェルジュのAPI統合（MCC配下に追加 or 別扱いの判定）

## 関連 memory

- `project_vonds_ads_mcc.md` — MCC基本情報
- `project_ads_keyword_separation.md` — 本気×ゼロ棲み分け
- `feedback_secret_handling.md` — Token漏洩事故・ルール
