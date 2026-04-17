# A-TRUCK GTM 3重読込 統合計画（事前設計ドラフト）

作成: 2026-04-17 / KIRYU
承認フロー: CLAUDE.md #8 準拠（クライアント事前承認必須）

---

## 現状（state/atruck-seo.md より）

| # | ID | 種別 | 状態 |
|---|---|---|---|
| 1 | GTM-5X6GWL4 | GTMコンテナ | 稼働中（役割不明） |
| 2 | GTM-PG3FF87 | GTMコンテナ | 稼働中（役割不明） |
| 3 | GTM-5PNW7CC3 | GTMコンテナ | 稼働中（役割不明） |
| 4 | UA-47832247-1 | Universal Analytics | **2024/7終了済・死んでる・要削除** |
| 5 | AW-817161945 | Google Ads | **CV重複あり**（`q3qDCIrW9_cBENnN04UD` が2回発火）|
| 6 | G-?????? | GA4 | **未導入** |

## 問題点

1. **3つのGTMコンテナが並列で読み込まれる** → ページ速度低下・計測データ分散
2. **UA直書き** が終了済にもかかわらず残存 → HTMLにゴミ
3. **AW直書き＋GTM内CVタグ** で重複発火 → Google Ads CV水増し状態
4. **GA4未導入** → 2025年以降のGoogle標準解析が取れてない

---

## 統合方針（NOYUTO承認済・2026-04-15 state/atruck-seo.md）

> 1. GTM管理画面で3コンテナの中身を確認→1つに統合
> 2. UA/AWの直書きタグを削除→GTM内で一元管理
> 3. GA4新規設定→GTM経由で配信
> 4. CV重複修正

## KIRYU設計（承認後のサム実装タスクに落とし込む詳細）

### Phase 1: 監査・方針決定（NOYUTO+KIRYU作業）

**1-A. 各コンテナの中身を確認**

GTMコンソール（https://tagmanager.google.com/）で以下を確認:
- GTM-5X6GWL4 / GTM-PG3FF87 / GTM-5PNW7CC3 のそれぞれ
- タグ一覧・発火トリガー・作成日・最終更新日
- どれが「現役本番運用」でどれが「テスト or 忘れ残り」か

**1-B. メインコンテナ決定**

以下の優先順位で判断:
1. タグ数が最も多い = 実運用中の可能性高い
2. 最終更新日が直近 = メンテされている
3. Google Ads CV設定が入っている = 広告運用の中心
4. 上記で決定できない場合は NOYUTOヒアリング

**1-C. 統合計画の書面承認**

A-TRUCK担当者（ウェブサイト運用）へ以下を書面送付:
- 統合前後のタグ構成図
- GA4新規発行による計測仕様変更
- 移行期間中のCVデータ分断リスク（通常1-3日）
- 作業タイミング（クライアント側の広告運用影響を考慮）

### Phase 2: メインコンテナに統合（サム作業）

**2-A. メインコンテナにタグ集約**

他2コンテナに入っているタグを**メインに複製**:
- Google Ads CV タグ
- その他イベントタグ
- カスタムHTMLタグ

**2-B. GA4プロパティ発行**

- A-TRUCK の Google Analytics アカウント（SANKEN傘下？単独？→NOYUTOに確認）
- GA4プロパティ新規作成
- 測定ID `G-XXXXXXXXXX` 取得
- GTMにGA4設定タグ追加（トリガー: All Pages）

**2-C. CV重複修正**

- `AW-817161945` の `q3qDCIrW9_cBENnN04UD` 発火条件を見直し
- HTML直書き削除 → GTM側1本化
- Google Ads コンバージョンアクション画面で重複設定削除

**2-D. UA-47832247-1 削除**

- HTML直書きから削除
- GTM側に残ってれば削除

### Phase 3: HTML側の修正（サム作業）

**3-A. functions.php or header.php から不要スクリプト削除**

以下のスクリプトブロックを削除:
- 使わないGTMコンテナ2本のsnippet
- UA直書きsnippet
- AW直書きsnippet（GTM化後）

**3-B. デプロイ前バックアップ**

- `functions.php.bak-before-gtm-YYYYMMDD`
- `header.php.bak-before-gtm-YYYYMMDD`

### Phase 4: 検証（KIRYU+サム）

**4-A. Tag Assistant でタグ発火確認**

- Chrome拡張「Tag Assistant Companion」で本番確認
- GTM 1本のみ読込・GA4発火・CV発火 1回（重複なし）

**4-B. Google Ads コンバージョン計測確認**

- 48時間後にCV数が前日と比べて異常値でないか
- 減ってればCV取り逃し・増えてれば重複未解消

**4-C. GSC / Search Console への影響確認**

- 構造化データ発火継続確認
- page speed 前後比較

---

## 承認依頼メール文面ドラフト（クライアント向け）

```
件名: [ご確認依頼] a-truck.jp 計測タグの統合について

株式会社A-TRUCK ウェブサイト運用ご担当者様

お世話になっております。VONDSの小沢です。

貴社サイトの計測環境について、以下の課題を発見したため、
統合のご提案をさせていただきたくご連絡いたしました。

【現状】
・Google Tag Manager のコンテナが3つ並列で読み込まれている
  - GTM-5X6GWL4 / GTM-PG3FF87 / GTM-5PNW7CC3
・Universal Analytics (UA-47832247-1) が2024年7月終了済にもかかわらず残存
・Google Ads CVタグが重複して発火している状態
・GA4が未導入のため2025年以降の標準解析が取れていない

【ご提案する改修】
1. GTMコンテナを1本に統合（メインコンテナは中身確認のうえ決定）
2. UA直書きタグを削除
3. Google Ads CV重複を修正（正確なCV数計測の復旧）
4. GA4 新規発行・GTM経由で配信開始

【想定される効果】
・ページ速度向上（3重読込解消）
・Google Ads CV数の正確化（広告最適化の精度UP）
・2025年以降のGA4データ蓄積開始

【影響・リスク】
・作業期間中（1-3日）はCVデータ分断の可能性
・本番運用中の広告配信に影響が出ないよう、タイミングを調整

実施前に以下をご確認いただければ幸いです:
① 統合・GA4導入を進めてよいか
② 作業実施希望タイミング（即日可 or 特定日指定）
③ A-TRUCK の Google Analytics アカウント所有者（SANKEN or 単独？）

以下略
```

---

## 現在のステータス

- [x] 事前設計書作成（このファイル）
- [ ] NOYUTO レビュー・承認
- [ ] クライアント承認依頼メール送付
- [ ] GTMコンソールアクセスでPhase 1-A実施（NOYUTO＋KIRYU）
- [ ] 以降 Phase 2-4 順次

## 関連

- state/atruck-seo.md（GTM現状）
- tasks/sam-queue.md P0#2（GTM統合実装タスク）
- CLAUDE.md #8（クライアント承認必須ルール）
