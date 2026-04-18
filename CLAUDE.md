# NOYUTO プロジェクト

## 社長プロファイル
- 氏名: 小沢宗弘（NOYUTO）/ 山梨県甲府市 / ENFJ型
- 思考特性: 現場主義・実証重視・「見てない奴に語る資格なし」
- 判断基準: ①現物確認 → ②構造理解 → ③評価（この順番を飛ばすな）
- 怒るポイント: 見てないのに断定 / 経験を軽視 / 前提共有後の疑念
- 性格タイプ: 本気で取り組む対象には非常に真剣、中途半端を嫌う

## 組織構造
- CEO: NOYUTO（小沢宗弘）— 最終意思決定・全体統括
- COO: KIRYU — 経営戦略・全事業横断管理・NOYUTOの右腕
- マーケティング: バナナ君 — X運用・NOTE・SNS・広告
- 開発・技術: サム — ILアプリ・ツール構築・技術リサーチ
- 財務・分析: レオ — KPI管理・経費・収益分析・予算
- リサーチ・営業: 河井章 — 市場調査・事業開発・法務
- 投資: 小丸 — 投資戦略・マーケット分析
- 投資: 清水悦夫 — 投資実行・リスク管理

## 事業一覧（詳細は各skills/を参照）
1. **株式会社オフィスVONDS** — Google広告運用代行・LP/Web制作（→ skills/vonds/）
2. **RIWAY International** — Diamond 3-Star / 目標: TEAM ELITE PEGASUS（→ skills/riway/）
3. **antique合同会社** — 社長:阿部忍 / 絆からの引継ぎ（→ skills/antique/）
4. **UNLYUTO合同会社** — ILアプリ開発・ヘブンネット戦略（→ skills/unlyuto/）
5. **noyuto（X/NOTE）** — 思想の資産化・収益化モデル（→ skills/noyuto-media/）
6. **THEパレッターズ** — バンド・ドラム担当（→ skills/palletters/）
7. **NOYUTO AI経営パッケージ（合同会社UNRYUTO）** — 風俗経営×AI商品化・SEOサイト・EC自動販売（→ skills/ai-biz-package/）

## コミュニケーションルール
- 丁寧すぎない敬語。対等でリスペクトし合う関係
- 無駄な前置き・装飾的表現は省く。簡潔で実行重視
- 見ていないものを評価・断定しない
- 推測で断定するな。「わからない」は正直に言え
- 後戻りを極端に嫌う。事前確認を怠るな

## ミッション
AIを教育分野に活用し、戦争の種を消す教育に貢献する。
「信頼を通貨に変換できる状態」を全事業で実現する。

## 連携済みツール
- Google Calendar（MCP）
- Notion（MCP）— ダッシュボード + 事業別6ページ + DB4つ
- Gmail（MCP）— office.vonds@gmail.com
- Figma（MCP）
- GitHub — office-vonds/noyuto

## 環境情報
- メインPC: GALLERIA XT / i7-8700 / RAM16GB / Win11 Pro
- Claude Code: WSL2+Ubuntu / v2.1.77+ / Opus 4.6 / Claude Max
- 起動: Ubuntu → cd ~/projects/noyuto && claude
- ノートPC: ozawakiryu0902@NOYUTO2023（同期済み）

## セッション記録ルール（必須）
毎セッション、以下を必ず実行すること。

### セッション開始時
- **STATE.md は hook で自動注入済み。読みに行くな。即作業開始。**

### セッション中（作業の区切りごと）
- `session-logs/YYYY-MM-DD_HHmm_[プロジェクト名].md` に作業ログを記録・更新する
- 記録内容:
  ```
  # セッションログ: [日付] [プロジェクト名]
  - セッションID: [session URL]
  - ブランチ: [作業ブランチ名]
  - 作業内容: [箇条書きで具体的に]
  - 現在の状態: [完了 / 進行中 / 中断]
  - 次にやること: [具体的なTODO]
  - 関連ファイル: [主要な変更ファイルパス]
  ```

### セッション終了前・作業区切り時（別PC引き継ぎ対応・必須）
作業完了時は以下を**必ず順番通り**実行すること。別PCから即座に引き継げる状態を保つ。

1. **STATE.md の該当プロジェクト行を最新化**（状態・ボール・次のアクション）
2. **state/*.md の該当ファイルを最新化**（詳細情報）
3. `session-logs/YYYY-MM-DD_HHmm_*.md` に作業ログを記録
4. `git add` → `git commit` → `git push origin main`

※ `git push` せずにセッション終了するのは禁止。別PC側で続きが組めなくなる。

### 命名規則
- ファイル名例: `2026-03-27_0800_vonds-site.md`
- ブランチ名にはプロジェクト名を含める（例: `vonds-site/main`）
- コミットメッセージには `[プロジェクト名]` タグをつける（例: `[vonds-site] ページ構成修正`）

## 起動ルール（最重要・絶対遵守）

1. **STATE.md は session-start.sh hook で自動的にコンテキストに注入済み。再度読みに行くな**
2. **起動時の確認合わせ・ブリーフィングは不要。即作業開始**
3. **session-logs/ を起動時に読むな。** 必要な情報は STATE.md と state/*.md に集約されている
4. **Notion・Calendar への起動時問い合わせ禁止。** NOYUTOが聞いた時だけ取得する
5. **ユーザーに「〜していいか？」と聞くな。** 判断して実行しろ。間違えたら直せ
6. **vcとexitだけで全てが完結する設計。** NOYUTOに追加操作を求めるな

## プロジェクト現在地

STATE.md（hookで自動注入）→ 詳細は `state/*.md` → 過去の履歴は `session-logs/`

---

## スキル構成（.claude/skills/配下）
各スキルはタスクに応じて自動で読み込まれる。全部を常時参照する必要はない。
- riway/ — RIWAY事業・パーティア成分・PEGASUS戦略
- vonds/ — VONDS事業・クライアント管理・Web制作ワークフロー
- unlyuto/ — ILアプリ・300PVの方程式・収益構造
- noyuto-media/ — X/NOTE戦略・思想の資産化モデル・KPI設計
- x-post/ — X投稿生成ルール・文体・構成パターン
- note-article/ — NOTE記事生成ルール・構成・収益設計
- antique/ — antique合同会社・引継ぎ後の関係
- palletters/ — バンド活動・メンバー構成
- client-web/ — クライアントWeb案件（SANKEN等）
- design-system/ — デザインシステム（UIスタイル・カラーパレット・フォント・コンポーネント設計）
- catchup/ — セッション再開時の現状把握（Git状態・変更ファイル・TODO自動取得）

---

## Compaction Rules
コンテキスト圧縮（/compact）実行時に必ず保持する情報：
- 編集中の全ファイルパス一覧
- 現在のタスクのゴール・完了条件・進捗状況
- テスト失敗メッセージ（未解決のもの）
- このセッションで決定したアーキテクチャ判断・設計変更
- git操作の状態（現在のブランチ、未コミット変更の有無、直近のコミットハッシュ）
- 外部サービスの認証状態（FTP接続済み、API認証済み等）

圧縮時に削除してよい情報：
- ファイルの中身の全文（パスだけ残せばよい）
- 成功したコマンドの出力全文（結果の要約だけ残せばよい）
- 試行錯誤の過程（最終的な判断だけ残せばよい）

---

「## 絶対遵守ルール」

1. 技術的な設定・仕組みの変更は必ず「入口と出口」をセットで実装すること（pullだけ入れてpush未対応のような片側実装は禁止）
2. 環境変数名・API仕様・ファイルパスは現物確認してから使うこと。推測で書かない
3. 成果物は必ずgitにコミットされた状態にすること。ローカルのみに残る状態を作らない
4. NOYUTOは非エンジニア。同じ説明を二度させない。一度で動く指示を出す
5. 作業前にバックアップまたはコミットを取ること。上書きで成果物を消失させない
6. テスト・検証は必ず `/tmp/` 配下で行う。実環境のファイル（`.env`、認証情報、本番HTML、公開ディレクトリ）を使ったテストは禁止。テスト用ファイルは `/tmp/` 配下に作成し、検証後に削除する
7. **個人名・住所・電話番号・メールアドレスなど本人特定に繋がる情報を外部公開ファイルに書く場合は、書く前にNOYUTOに確認すること。** 法令の建前より実害回避が優先。業界の現場慣行を無視して法律の文面だけで判断するな。（2026-04-16 UNRYUTO特商法に実名公開した事故から）
8. **クライアント案件の本番サーバー改修は事前承認必須。** サンプル（HTML/PDF/プレビューURL）と改修意図の説明文をクライアント担当者に送付 → 書面（メール）で承認を得てからのみ着手。UNRYUTO等の自社案件はこの制約対象外。承認内容は session-log に記録すること。（2026-04-17 A-TRUCK鈑金ページ無断デプロイ発注ミスから）
9. **SNSアカウント自動化の絶対ルール**（2026-04-17 @rina_xxxfree 凍結事故から）
   - **新規アカウントは自動化禁止**。最低3日間は Windows Chrome から手動投稿で「人間性」を示す
   - **電話番号認証を必ず最初に通す**（未認証アカウントはX側のSpam Detector閾値が低い）
   - **自動フォロー・自動いいね・自動リツイートは永久禁止**（engage.py系はこの事故の直接原因）
   - **Cookie方式移行時は初回のみ Windows ChromeからWeb UIで投稿**し、2日以上空けてから自動化crontab登録
   - **WSL/サーバーIPから直接Cookie認証すると新デバイス判定で凍結リスク増大** — 回避策: Windowsのブラウザプロファイル経由 or WSL IP固定化
   - 1日の投稿頻度上限: **新規は2投稿/日・安定期3投稿/日・超える場合は手動確認**
   - これらは全SNS（X/Threads/Bluesky等）共通の原則
10. **秘密情報（API Key / Developer Token / OAuth credentials / PEM鍵 / SMTPパスワード等）を絶対にチャット/ファイル/commitに書かない。** 詳細: `SECURITY.md`・`.githooks/pre-commit` で自動ブロック済。別PC clone後は必ず `git config core.hooksPath .githooks` 実行。（2026-04-17 Ads Developer Token漏洩事故から）
11. **成果直結指数(RII)による工数管理** (2026-04-18 NOYUTO指示)
    - 全タスク・全プロジェクトに着手前にRII(0-100)を算出・明記
    - 算出式: `(成果インパクト × 実現確率) ÷ 投入工数 × 100`
    - RII≥60: 即実行キュー / RII 30-59: 要再検討 / RII<30: `tasks/ideas-draft.md` 隔離
    - NOYUTO時間を使う依頼は RII 80以上のみ許可
    - **ただし草案・アイデアは最大限共有する**（`ideas-draft.md`で発散自由・実行はフィルタ）
    - 詳細: `memory/feedback_result_impact_index.md`
12. **HyperFrames運用ルール**（2026-04-18 vonds-test クラッシュ事故から）
    - **レンダ実行前に必ず `free -h` で available 2GB以上確認**。未満なら実行禁止
    - **Puppeteerは常に1インスタンスのみ**。並行起動禁止（`ps aux | grep puppeteer` で事前確認）
    - **重いフィルタ（5段以上、mix-blend-mode）は負荷倍増**。Duration延長と同時適用は特に注意
    - **HyperFrames出力は既にh264圧縮済み**。ffmpeg等での二重圧縮禁止
    - **重要git操作前は auto-save hook を停止**（`touch ~/.claude/no-autosave` / 再開は `rm ~/.claude/no-autosave`）
    - WSL2メモリ制限は `C:\Users\<user>\.wslconfig` で memory=8GB / swap=4GB 設定済み（別PC環境構築時に要設定）
    - 詳細: `session-logs/2026-04-18_vonds-test-crash-recovery.md`
