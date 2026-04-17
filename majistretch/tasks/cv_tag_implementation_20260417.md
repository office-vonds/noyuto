# 本気ストレッチ Google広告CVタグ実装 — 作業指示書

作成: 2026-04-17 / 起案: バナナ君 / 実装担当: サム / 管理画面作業: NOYUTO

---

## 現状（現物確認済み 2026-04-17）

| 項目 | 状態 |
|---|---|
| GTMコンテナID | `GTM-K32XLKXH` 導入済・本番稼働 |
| GA4測定ID | `G-93MZ8ERBW5` 稼働 |
| GTMコンテナ設計ファイル | `majistretch/gtm_container_majistretch.json`（GA4イベントまで設計済） |
| data-gtm属性 | CTAボタン（cta-fv/cta-guarantee/cta-final）・TEL（footer）に設置済 |
| **Google広告CVタグ** | **未実装** ← 今回のタスク |
| 予約フロー | `reservation.php` 自社サーバー送信 → `thanks.html` へ遷移（外部ペライチではない） |
| 電話番号 | `tel:05088848993` |

**重要**: NOYUTOの初期分析にあった「予約フォームがペライチ外部遷移」は現物と異なる。現状は自社サーバー完結（`/lp/reservation.php` → `/lp/thanks.html`）。**クロスドメイン設定不要・サンクスページ計測可能**。

---

## CV設計方針（バナナ決定）

| # | CV名 | 種別 | トリガー | CV値 | 優先度 |
|---|---|---|---|---|---|
| 1 | TEL タップ | **メインCV** | `tel:05088848993` クリック（SP/PCともに発火） | ¥5,000 | 高 |
| 2 | フォーム送信完了 | **メインCV** | `thanks.html` 到達 OR `form_submit` dataLayer push | ¥5,000 | 高 |
| 3 | 予約CTAクリック | マイクロCV | `data-gtm-click` を含むボタンクリック | ¥500 | 中 |
| 4 | メールリンク タップ | マイクロCV | `mailto:info@majistretch.com` クリック | ¥500 | 低 |

**CV値根拠**: 予約完了→来店→継続率から粗利LTV逆算。NOYUTO確認後に調整可。

**除外**: ページ滞在時間系のCVは使わない（Google広告が学習データを汚すため）

---

## NOYUTO作業（Google広告管理画面・所要15分）

### ステップ1: CVアクション4本を作成
Google広告 → ツール → コンバージョン → 「+新しいコンバージョンアクション」

| # | 名称 | カテゴリ | 値 | 計上方法 |
|---|---|---|---|---|
| 1 | 本気ST_TELタップ | 電話 → 電話の発信 | ¥5,000 | 毎回 |
| 2 | 本気ST_フォーム送信 | 申し込み | ¥5,000 | 1回 |
| 3 | 本気ST_予約CTAクリック | 見込み顧客アクション：その他 | ¥500 | 毎回 |
| 4 | 本気ST_メールタップ | 見込み顧客アクション：その他 | ¥500 | 毎回 |

### ステップ2: 各CVのIDとラベルをコピー
作成後に表示される以下の2文字列を4本分コピーしてバナナへ渡す:
```
コンバージョンID: AW-XXXXXXXXXX
コンバージョンラベル: abCDefGHIjKLmnoPQRs
```

### ステップ3: ペライチ確認は不要
→ 現状のLPはペライチを使っていない。この確認作業は削除。

---

## サム作業（GTM設定・所要30分）

### 前提
- バナナからNOYUTO経由で受領した **AW-ID + ラベル × 4本** を使う
- 既存の `gtm_container_majistretch.json` をベースに拡張

### タスク1: Google広告CVタグ4本をGTMに追加

GTM管理画面で以下のタグを新規作成:

| タグ名 | タイプ | 発火トリガー |
|---|---|---|
| GAds-CV-TEL | Google広告コンバージョントラッキング | 既存「tel_trigger」（tel:で始まるClick URL） |
| GAds-CV-FormSubmit | Google広告コンバージョントラッキング | 新規: Page View かつ `Page URL` に `/thanks.html` を含む |
| GAds-CV-CTAClick | Google広告コンバージョントラッキング | 既存「contact_trigger」（data-gtm-click属性を持つリンク） |
| GAds-CV-MailTap | Google広告コンバージョントラッキング | 新規: Click URL が `mailto:` で始まる |

各タグの設定値:
```
Conversion ID: AW-XXXXXXXXXX（NOYUTO提供）
Conversion Label: {各CVのラベル}
Conversion Value: {CV設計表の金額}
Currency Code: JPY
```

### タスク2: reservation.php送信成功時のdataLayer発火

既存の `/lp/reservation.php` 送信成功パスを確認し、`thanks.html` へのリダイレクト時にクエリパラメータ `?cv=1` を付与するか、または `thanks.html` 冒頭に以下を追加:

```html
<script>
window.dataLayer = window.dataLayer || [];
dataLayer.push({'event': 'form_submit_complete'});
</script>
```

※thanks.html到達だけで拾える場合は上記不要。要確認。

### タスク3: プレビュー → 本番Publish

1. GTMプレビューモードでLP実機タップテスト（TEL/CTA/フォーム送信/メール）
2. Google広告管理画面「コンバージョン」で「最近のコンバージョン」に計上されることを確認
3. 問題なければPublish

### タスク4: 更新後の `gtm_container_majistretch.json` をリポジトリにコミット

Publish後、GTMからコンテナをエクスポートし、`majistretch/gtm_container_majistretch.json` を差し替えて `[majistretch] Google広告CVタグ4本追加` でcommit&push。

---

## 完了判定

- [ ] NOYUTOがCVアクション4本作成完了・AW-ID/ラベル4組をサムへ共有
- [ ] サムがGTMタグ4本追加・Publish完了
- [ ] バナナがGoogle広告管理画面で「計測ステータス: 有効」を全4本で確認
- [ ] 72時間後、実CVが1件以上計上されていることを確認

---

## 関連

- GTMコンテナ設計: `majistretch/gtm_container_majistretch.json`
- 本番LP: `majistretch/work/site/lp/index.html`
- サーバー情報: `memory/reference_majistretch_server.md`
- KW棲み分け方針: `memory/project_ads_keyword_separation.md`
