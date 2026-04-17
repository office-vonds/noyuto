# NOYUTO 1分作業：GSC自動取得のための権限付与

目的: BAR KOFU の GSC（Google Search Console）データを KIRYU が API 経由で自動取得できるようにする。
以降のSEO改修は**現物のGSCデータ分析ベース**で動かせるようになる。

---

## 手順（所要1分）

### Step 1: GSC にログイン

https://search.google.com/search-console → プロパティ `bar-kofu.com`（または `https://bar-kofu.com/`）を選択

### Step 2: 設定 → ユーザーと権限

左メニュー下部「設定」 → 「ユーザーと権限」 → 「ユーザーを追加」

### Step 3: 以下のメールを「フル」権限で追加

```
ga4-mcp@potent-impulse-165116.iam.gserviceaccount.com
```

権限: **フル**（「制限付き」ではダメ）

### Step 4: 完了。KIRYUに「GSC権限付与済み」とだけ伝える

---

## 権限付与後にKIRYUが自動実行すること

- 過去16ヶ月の検索パフォーマンス（KW/ページ/デバイス/国別）を取得
- インデックスカバレッジ状況を取得
- 実データに基づくKW狙い打ち戦略へ改修を差し替え
- 順位・クリック・CTR の 月次モニタリング自動化

---

## なぜこれが必要か

今日のBAR KOFU SEO改修は「現物サイトの内部構造」と「ACCESSページの住所・営業時間」の現物確認のみで動かした。**GSCの実データ（実際に今どのKWで何回露出しているか）を見ていない**。

KIRYU の判断基準①現物確認 → ②構造理解 → ③評価 の①を片方だけ飛ばした状態。
この1分作業でGSC側も現物確認ルートが確立し、以降のSEO判断が正確になる。

## GSC API側の準備

- ga4-mcp@potent-impulse-165116 サービスアカウントは `~/credentials/ga4-mcp.json` に格納済
- GSC API（searchconsole.googleapis.com）は同プロジェクトで有効化済
- 権限付与後、即 KIRYU が Python で叩けるコマンド用意済（別セッションで準備）

---

## BAR KOFU以外のGSCも同権限付与してほしいプロパティ

KIRYU が各サイトをSEOモニタリングするため、以下も同じメアドで権限付与すれば即自動化できる:

- kizuna-job.com
- majistretch.com
- stretchlabo.jp（オーナーがSANKEN側の場合は不要・現状外部運用）
- a-truck.jp（クライアント承認後にA-TRUCK側で追加依頼）
- vonds.co.jp
- unryuto.jp

**優先は BAR KOFU** です。他は時間ある時に段階的に。
