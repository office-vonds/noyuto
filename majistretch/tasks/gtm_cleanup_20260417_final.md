# 本気ストレッチ GTM整理・修正指示書【確定版】

作成: 2026-04-17 / 起案: バナナ君 / 承認: NOYUTO / 実装担当: **サム**

コンテナ: `GTM-K32XLKXH`
本番URL: https://majistretch.com/
GA4: `G-93MZ8ERBW5`（稼働中・触らない）

---

## 前提: 予約フロー（NOYUTO承認済み 2026-04-17）

**ページ内アンカー `#reservation`** → **LP下部の自社フォーム** → **`reservation.php` 送信** → **`/lp/thanks.html` 到達でCV**

Airリザーブ等の外部予約サービスは**現時点では使っていない**（将来的に切替の可能性あり・その時は再指示）。

---

## 作業項目（4項目）

### ① タグの停止（重複・旧設定の整理）

| タグ名 | 作成日 | 措置 |
|---|---|---|
| `Google 広告経由でのTELタップ` | 2026/04/02 | **一時停止**（削除ではなく停止） |
| `コンバージョン リンカー`（旧） | 2026/04/02 | **一時停止** |

→ 新タグ（4/17作成）の `Google広告_TELタップ` と `Google広告_コンバージョンリンカー` を正とする

### ② トリガー「予約ボタン_トリガー」の修正

**現状（誤）**: すべての要素 / Click URL 含む `https://airr...` → **発火ゼロ**

**修正後**:
- タイプ: **リンクのみ**
- フィルタ1: `Click URL` **含む** `#reservation`
- フィルタ2（併用推奨・AND条件）: `{{data-gtm-click}}` **含む** `cta-`

本番LPの予約CTAは3箇所すべて:
```html
<a href="#reservation" class="c-btn c-btn--primary" data-gtm-click="cta-fv">
<a href="#reservation" ... data-gtm-click="cta-guarantee">
<a href="#reservation" ... data-gtm-click="cta-final">
```

### ③ 新規タグ追加「Google広告_メールタップ」

| 項目 | 値 |
|---|---|
| タイプ | Google 広告のコンバージョン トラッキング |
| **コンバージョンID** | `18057524680` |
| **コンバージョンラベル** | `FpUuCN7tzp0cEMjrv6JD` |
| 通貨 | JPY |
| コンバージョン値 | 500 |
| トリガー | 新規「メールタップ_トリガー」 |

**新規トリガー「メールタップ_トリガー」**:
- タイプ: リンクのみ
- フィルタ: `Click URL` **含む** `mailto:`

本番LPのメール箇所: `<a href="mailto:info@majistretch.com">`（1052行目）

### ④ プレビュー検証 → Publish → リポジトリ反映

1. GTMプレビューモードで https://majistretch.com/ を開く
2. 以下4アクションを順に実行し、「Tags Fired」に該当タグが**1本のみ**発火することを確認:
   - TELタップ → `Google広告_TELタップ` のみ
   - 予約CTAクリック → `Google広告_予約ボタンクリック` のみ
   - 予約フォーム送信完了（thanks.html到達） → `Google広告_フォーム送信完了` のみ
   - メール（mailto:）タップ → `Google広告_メールタップ` のみ
3. 問題なければバージョン公開（Publish）
4. 公開後、GTM管理画面「管理 → コンテナのエクスポート」でJSON取得
5. リポジトリの `majistretch/gtm_container_majistretch.json` を差し替え
6. commit: `[majistretch] GTM整理完了: 重複2本停止・予約トリガー修正・メールタップ追加`

---

## 完了判定（バナナが確認）

- [ ] プレビューで4CV全てが単発発火
- [ ] 旧タグ2本が「一時停止」状態
- [ ] Publish完了・新バージョンが「ライブ」
- [ ] Google広告管理画面「コンバージョン → 最近のコンバージョン」で24時間以内にタグステータス「有効」
- [ ] 72時間後、4CV全てにCVカウント1以上（実トラフィックから）

---

## 関連ファイル
- 初版指示書: `majistretch/tasks/cv_tag_implementation_20260417.md`
- GTMコンテナ設計JSON: `majistretch/gtm_container_majistretch.json`
- 本番LP: `majistretch/work/site/lp/index.html`
- サーバー情報: `memory/reference_majistretch_server.md`
