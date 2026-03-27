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
- `session-logs/` 内の最新ファイルを確認し、前回の作業状況を把握する
- 前回の続きがあれば、ユーザーに確認せず把握した状態で対応開始

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

### セッション終了前・作業区切り時
- ログファイルをコミット＆プッシュする
- 「次にやること」を明確に書いておく

### 命名規則
- ファイル名例: `2026-03-27_0800_vonds-site.md`
- ブランチ名にはプロジェクト名を含める（例: `vonds-site/main`）
- コミットメッセージには `[プロジェクト名]` タグをつける（例: `[vonds-site] ページ構成修正`）

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
