# ILゲーム v5_unidra

## 現在地（2026-04-17更新）

- **状態**: 本番稼働中
- **URL**: eloquent-treacle-64cfec.netlify.app
- **Netlifyアカウント**: ozawa@vonds.co.jp（認証情報はNotion「各種アカウント」）
- **ソース**: il_game/source/kizuna_v5_unidra.html (124KB)

## 主要機能

- DEFAULT_CASTS: 3月稼働37名
- ChatTab「相談」: rinaペルソナ（mockRespond・Phase2でClaude API化）
- UnidraSuggestionModal: 健康カテゴリ文脈連動提案
- Firebase Firestore学習ログ（同意制・匿名化・SHA-256）

## 教育資料（IL2025理論準拠）

2026-04-17 に `memory/project_il2025_theory.md` 準拠で刷新:

- `il_game/education/IL_guide_cast.md` + `.html` — キャスト向け
- `il_game/education/IL_guide_owner.md` + `.html` — オーナー向け営業資料

改訂ポイント:
- IL15-20 旧基準廃止 → IL40（業界標準）/ IL70（業界上位）3段階ベンチマーク化
- 1成約 = 約300PV 方程式を核に据え、IL→PV→成約の因果を定量化
- オーナー向けROI試算を 300PV 方程式で書き直し（IL15→IL30 で +720万円/年、IL40到達で +1,560万円/年）
- ILゲームの位置づけを「業界ベンチマークとの差分可視化ツール」として強化

## 観測タスク

- [ ] Firestoreログ100件蓄積 → KIRYU月次レビュー初回
- [ ] Phase2: Claude API接続（Netlify Functions経由）
- [ ] 刷新した教育資料のオーナー営業活用（第1ターゲット選定はNOYUTO判断）

## 関連

- session-logs/2026-04-12_1200_kizuna-v5-deploy.md
- session-logs/2026-04-17_1300_il-education-refresh.md（教育資料刷新）
- memory: project_rina_persona.md / project_rina_learning_loop.md / project_il2025_theory.md / reference_il_saas_pdf.md
