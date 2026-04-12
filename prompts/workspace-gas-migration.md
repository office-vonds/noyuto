# Google Workspace + GAS フォーム基盤 統合移行プロジェクト

## 指示書作成日: 2026-04-12
## 作成者: Claude Code (Opus 4.6) — 前セッションで全調査・分析完了済み

---

## このドキュメントの目的

Claude AI での戦略議論 → Claude Code 実行部隊への引き継ぎ、という2段構成で以下3つの問題を同時に解決する。

---

## 解決すべき3つの問題

### 問題1: VONDSメール消失
- `ozawa@vonds.co.jp` → `office.vonds@gmail.com` への転送で受信漏れ発生中
- 原因: DKIM/DMARC未設定 + 2025年11月以降のGmail DMARC厳格化
- 実害あり（社長確認済み・大切なメールが届いていない可能性）

### 問題2: クライアントサイト予約フォーム脆弱性
- ストレッチゼロ（stretchzero.jp）の予約フォームがmu-pluginバグでダウン（2026-04-11発生）
- 原因: CF7（Contact Form 7）がWordPress PHP実行環境に完全依存しており、PHPの1行Fatal errorでフォーム全体が死亡
- 実店舗の生命線である予約導線が断絶 → 機会損失 + 信用毀損
- 本気ストレッチ（majistretch.com）も同一構造の脆弱性を抱えている

### 問題3: VONDSサービス品質基盤の不在
- クライアントごとにフォーム実装がバラバラ（CF7, PHPMailer, 各種プラグイン）
- 統一的な品質基準・監視・復旧手順が存在しない
- 「VONDSが管理するサイトのフォームは落ちない」という保証が出せない

---

## 解決策: Google Workspace + GAS 統合移行

### 全体像

```
Phase 1: Google Workspace 導入（メール問題の根本解決）
  ├── Workspace Business Starter 契約（¥680/月・1ユーザー）
  ├── MXレコード変更（WPX → Google）
  ├── SPF / DKIM / DMARC 設定
  ├── エイリアス設定（info@ / support@）
  └── 転送廃止 → Google MX直受信に切替

Phase 2: GAS フォーム基盤 構築（予約フォーム根本解決）
  ├── ストレッチゼロ予約フォーム → GAS移行
  ├── 本気ストレッチ予約フォーム → GAS移行
  ├── テンプレート化（新規クライアント追加用）
  └── Google Sheets 予約台帳 自動記録

Phase 3: 監視 + ガバナンス整備
  ├── フォーム死活監視（auto-repair統合）
  ├── CLAUDE.md にフォーム品質基準を明文化
  └── mu-plugins 原則禁止ルール
```

---

## Phase 1: Google Workspace 導入（詳細）

### 前提情報（調査済み）

| 項目 | 値 |
|---|---|
| ドメイン | vonds.co.jp |
| ドメイン管理 | お名前.com |
| ネームサーバー | WPX（ns1/2/3.wpx.ne.jp） |
| メールサーバー | WPX（sv1092.wpx.ne.jp） |
| 現在のMX | sv1092.wpx.ne.jp（priority 10） |
| SPF | `+a:sv1092.wpx.ne.jp include:spf.sender.xserver.jp ~all` |
| DKIM | **未設定（致命的）** |
| DMARC | **未設定（致命的）** |
| Aレコード | GitHub Pages IP（185.199.x.x） → Webサイトに影響なし |
| 移行対象メアド | **info@vonds.co.jp**（メイン） / ozawa@vonds.co.jp（エイリアス） / support@vonds.co.jp（エイリアス） |
| 現在の転送先 | office.vonds@gmail.com |
| マスターメールアドレス | **info@vonds.co.jp**（社長指定・Workspaceのメインユーザーとして使用） |
| 費用 | Business Starter ¥680/月（年約¥8,160）・1ユーザー+エイリアス2本 |

### 移行7ステップ

1. **Google Workspace 申し込み**（vonds.co.jp / ozawa@vonds.co.jp で登録）
2. **ドメイン所有権確認**（WPXのDNS管理画面にTXTレコード追加）
3. **MXレコード変更**（WPXメール → Google の5本に差し替え）
   ```
   1  ASPMX.L.GOOGLE.COM
   5  ALT1.ASPMX.L.GOOGLE.COM
   5  ALT2.ASPMX.L.GOOGLE.COM
   10 ALT3.ASPMX.L.GOOGLE.COM
   10 ALT4.ASPMX.L.GOOGLE.COM
   ```
4. **SPFレコード更新**
   ```
   v=spf1 include:_spf.google.com ~all
   ```
5. **DKIM有効化**（Google管理コンソールで鍵生成 → WPXのDNSに追加）
6. **DMARC設定**
   ```
   _dmarc.vonds.co.jp TXT "v=DMARC1; p=quarantine; rua=mailto:info@vonds.co.jp"
   ```
7. **エイリアス設定**（info@ / support@ をGmail管理コンソールで追加）

### 注意事項
- MX切り替え時に数時間〜24時間のDNS浸透で受信不安定の可能性
- 切り替え前にWPX側の受信トレイを確認して取りこぼし防止
- GitHub Pages（Aレコード）はそのまま維持 → vonds.co.jp Webサイトに影響なし
- NSレコードはWPXのまま（お名前.com側の設定変更不要）
- WPXの管理画面でDNSレコード（MX/TXT）を自由に編集できるか事前確認が必要。制限がある場合はお名前.comにNSを戻すことを検討

---

## Phase 2: GAS フォーム基盤 構築（詳細）

### 設計思想

**フォーム送信をWordPressから完全に切り離す。**

```
[ユーザーのブラウザ]
    ↓ フォーム送信（JavaScript fetch POST）
[Google Apps Script]  ← WordPressと完全に無関係
    ├→ バリデーション（JavaScript）
    ├→ Gmail API でメール送信（店舗通知 + 客への自動返信）
    ├→ Google Sheets に自動記録（予約台帳・証跡）
    └→ 成功/失敗レスポンスをブラウザに返す
[ブラウザ]
    └→ サンクス表示 or エラー表示 + 電話フォールバック
```

### 移行対象サイト

| サイト | 現在のフォーム | 送信先メール | 備考 |
|---|---|---|---|
| ストレッチゼロ (stretchzero.jp) | CF7 + mu-plugin | 要確認（info@stretchzero.jp?） | XサーバーWordPress |
| 本気ストレッチ (majistretch.com) | PHPMailer + SMTP | yuki.nakagomi@sanken-gr.com | WPXサーバー |

### GAS移行で変わること

| 観点 | 現状（CF7/PHPMailer） | GAS移行後 |
|---|---|---|
| WordPress壊れたら | フォーム送信も死ぬ | フォーム送信は無関係に動く |
| PHPエラー出たら | フォーム送信死ぬ | PHP自体を使わない |
| プラグイン更新で壊れたら | フォーム送信死ぬ | プラグインに依存しない |
| メール不達時 | データ消失（DB保存なし） | Google Sheets に必ず残る |
| 予約データの一覧管理 | なし（メール頼み） | Sheets で検索・集計可能 |
| 追加コスト | ¥0 | ¥0（既存Workspace内） |
| 信頼性 | Xサーバー/WPX依存 | Google SLA 99.9%+ |

### 各GASプロジェクトの構成（テンプレート）

```
GASプロジェクト（1クライアントにつき1つ）
├── doPost(e)        ← フォーム受信エンドポイント
├── validateInput()  ← バリデーション（営業時間・必須項目・リードタイム等）
├── sendNotification() ← 店舗への通知メール
├── sendAutoReply()  ← 客への自動返信メール
├── logToSheet()     ← Sheets記録
└── config.gs        ← 設定ファイル（メアド・Sheets ID・店舗名等）
```

新規クライアント追加時:
1. テンプレートGASプロジェクトをコピー
2. `config.gs` の送信先メアド・Sheets ID・店舗名を書き換え
3. フォームHTMLの action URL をGASのデプロイURLに差し替え
→ 完了（5分）

### フォームHTML側の変更

既存のフォームHTML（CF7ショートコードで生成されている部分）を静的HTMLに置き換え、`fetch()` でGASに送信する形に変更。デザイン・入力項目は既存のまま維持。

```html
<!-- 既存: CF7 -->
[contact-form-7 id="xxx" ...]

<!-- 新: 静的HTML + GAS送信 -->
<form id="reservation-form">
  <!-- 既存と同じ入力項目 -->
  <button type="submit">予約する</button>
</form>
<script>
document.getElementById('reservation-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  try {
    const res = await fetch('https://script.google.com/macros/s/DEPLOY_ID/exec', {
      method: 'POST', body: data
    });
    const json = await res.json();
    if (json.result === 'success') {
      // サンクス表示
    } else {
      // エラー表示 + 電話フォールバック
    }
  } catch (err) {
    // GAS応答不能 → 電話フォールバック表示
    alert('予約システムに一時的な問題が発生しています。お電話でご予約ください: 055-XXX-XXXX');
  }
});
</script>
```

### フォールバック設計（重要）

GASが応答しなかった場合（Google障害・ネットワーク問題等）、ブラウザ側で：
1. 「お電話でご予約ください: 電話番号」を表示
2. エラーログをローカルストレージに保存
3. 次回アクセス時に未送信データを再送試行（オプション）

---

## Phase 3: 監視 + ガバナンス（詳細）

### 死活監視

`auto-repair/` 配下に統合するフォーム監視スクリプト:

```
監視対象:
  - https://script.google.com/macros/s/DEPLOY_ID_1/exec（ストレッチゼロ）
  - https://script.google.com/macros/s/DEPLOY_ID_2/exec（本気ストレッチ）
  - （将来追加分は設定ファイルに1行追加するだけ）

監視間隔: 10〜30分
方法: ダミーPOST → HTTP 200 + JSON {"result":"success"} 確認
異常時: LINE / メール で NOYUTO に即通知
```

### CLAUDE.md に追加するルール

```markdown
## フォーム品質基準（全クライアント共通）
1. フォーム送信はWordPressに依存させない（GAS基盤を使用）
2. mu-plugins は原則使用禁止。使用する場合はNOYUTO承認必須
3. フォームバリデーションエラー時は「送信を通す」側にフェイルオーバー
4. GAS応答不能時は電話フォールバックを必ず表示
5. 全予約データはGoogle Sheetsに記録（メール不達でもデータ保全）
6. フォーム死活監視を全クライアントサイトに適用
```

---

## 確認が必要な事項（Claude AI で社長と議論すべき）

1. **ストレッチゼロの予約フォーム送信先メールアドレス**は何か？
   - info@stretchzero.jp? 別のアドレス?
   - 店舗通知先と自動返信BCCの宛先

2. **WPXの管理画面でDNSレコード（MX/TXT）を自由に編集できるか？**
   - WPXログインして確認が必要
   - 制限がある場合はお名前.comにNSを移す判断が要る

3. **Workspace 申し込みのタイミング**
   - 即日やるか、フォームGAS移行の設計が固まってからか
   - メール消失の実害が出ているなら即日推奨

4. **既存のoffice.vonds@gmail.comアカウントの扱い**
   - Workspace導入後もサブとして残すか
   - MCP連携（Gmail MCP・Google Calendar等）のアカウント切替が必要か

5. **本気ストレッチのフォームも同時移行するか？**
   - ストレッチゼロ先行 → 動作確認 → 横展開、がリスク低い
   - 同時にやれば工数は少ない

---

## 技術参照情報（Claude Code 実行部隊向け）

### サーバー情報（メモリ参照）
- `reference_stretchzero_server.md` — ストレッチゼロ Xサーバー・WordPress・FTP
- `reference_majistretch_server.md` — 本気ストレッチ WPXサーバー・FTP・SMTP
- `reference_vonds_deploy.md` — vonds.co.jp GitHub Pages（Pages source = main）

### GA4 / GSC（本セッションで構築済み）
- `scripts/ga4_snapshot.py` — GA4 9プロパティ一括取得
- `scripts/gsc_snapshot.py` — GSC 5サイト一括KPI/クエリ/ページ取得
- `data/gsc/baseline_20260411.json` — 全サイトGSCベースライン（2026-04-11時点）
- サービスアカウント: `~/credentials/ga4-mcp.json`（GA4 + GSC 両方対応）

### 今回のセッションで作成した成果物
- `seo/vonds-seo-recovery-plan-20260411.html` — VONDS SEO復旧ダッシュボード
- `seo/a-truck-proposal.html` — A-TRUCK提案書（GSC実データ18スライド版）
- `seo/atruck-seo-enhance.php` — A-TRUCK SEO強化プラグイン（本番未反映・opcache問題）
- `seo/a-truck-php-fpm-restart-request.md` — A-TRUCK PHP-FPM再起動依頼メール文案
- `scripts/generate_sitemap.py` — vonds.co.jp sitemap.xml 自動生成

### A-TRUCK opcache問題（未解決・別レーン）
- functions.php 修正版はサーバーに配置済み（L4 全角クォート→半角）
- PHP-FPM 再起動待ち（A-TRUCKクライアント管理者への依頼メール文案作成済み）
- 再起動後に atruck_* 8関数が発火して LocalBusiness/Service/FAQ スキーマが出力される
- 詳細: `session-logs/2026-04-11_1700_atruck-seo-opcache-investigation.md`

---

## プロジェクト実行の推奨順序

```
1. [Claude AI]  Workspace申し込み判断 + DNS操作手順の最終確認
2. [NOYUTO]     Workspace契約 + WPXでDNS設定変更（MX/SPF/DKIM/DMARC）
3. [Claude AI]  GASフォーム設計（入力項目・バリデーション・メール文面の確定）
4. [Claude Code] GASプロジェクト実装 + フォームHTML実装 + テスト
5. [NOYUTO]     本番切替（CF7 → GAS）+ 動作確認
6. [Claude Code] 死活監視スクリプト構築 + CLAUDE.md ガバナンス更新
7. [Claude Code] 本気ストレッチへの横展開
```
