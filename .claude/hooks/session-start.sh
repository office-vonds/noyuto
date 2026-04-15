#!/usr/bin/env bash
# session-start.sh
# セッション開始時に origin/main 遅延を検出し警告する。
# KIRYU 条件により failure-tolerant（起動はブロックしない）。
#
# 出力は Claude Code の SessionStart hook に入り、エージェントの初期コンテキストに追加される。
# 失敗しても set -e せず、exit 0 で必ず抜ける。

set +e  # 明示的にエラー時でも続行

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR" 2>/dev/null || exit 0

# git リポジトリでなければ黙って抜ける
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

echo "=========================================="
echo "🔄 SessionStart: $(date '+%Y-%m-%d %H:%M') @ $(hostname)"
echo "=========================================="

# 1. origin を fetch（失敗しても続行）
FETCH_OUT=$(git fetch origin --quiet 2>&1)
FETCH_RC=$?
if [ $FETCH_RC -ne 0 ]; then
  echo "⚠️  git fetch 失敗（ネット断 or 認証エラー?） — ローカル情報で継続"
  echo "   詳細: $FETCH_OUT"
fi

# 2. 現在ブランチと origin/main の差分
CUR_BRANCH=$(git branch --show-current 2>/dev/null)
LOCAL_HEAD=$(git rev-parse HEAD 2>/dev/null)
REMOTE_MAIN=$(git rev-parse origin/main 2>/dev/null)

echo ""
echo "📍 現在ブランチ: ${CUR_BRANCH:-(detached)} @ ${LOCAL_HEAD:0:7}"

if [ -n "$REMOTE_MAIN" ]; then
  BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null)
  AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null)
  BEHIND=${BEHIND:-0}
  AHEAD=${AHEAD:-0}

  if [ "$BEHIND" -gt 0 ]; then
    # --- auto-pull 判定（3条件全部クリアした時だけ実行）---
    # 条件1: 未コミット変更ゼロ
    # 条件2: 現在ブランチが main である（他ブランチでは安全のため auto-pull しない）
    # 条件3: fast-forward 可能（HEAD が origin/main の祖先）
    DIRTY_COUNT=$(git status --porcelain 2>/dev/null | wc -l)
    CAN_FF=1
    git merge-base --is-ancestor HEAD origin/main 2>/dev/null || CAN_FF=0

    if [ "$DIRTY_COUNT" -eq 0 ] && [ "$CUR_BRANCH" = "main" ] && [ "$CAN_FF" -eq 1 ]; then
      echo ""
      echo "🔄 auto-pull: 安全条件クリア（clean + main + ff）→ 自動 pull 実行"
      PULL_OUT=$(git merge --ff-only origin/main 2>&1)
      PULL_RC=$?
      if [ $PULL_RC -eq 0 ]; then
        NEW_HEAD=$(git rev-parse HEAD 2>/dev/null)
        echo "✅ auto-pull 成功: ${LOCAL_HEAD:0:7} → ${NEW_HEAD:0:7}（$BEHIND コミット取り込み）"
        LOCAL_HEAD="$NEW_HEAD"
        BEHIND=0
      else
        echo "⚠️  auto-pull 失敗 — 手動で pull 必要"
        echo "   詳細: $PULL_OUT"
      fi
    else
      # auto-pull 不可の理由を明示
      echo ""
      echo "🚨 origin/main が $BEHIND コミット先行している"
      echo "   → 作業前に必ず pull / merge すること"
      REASONS=""
      [ "$DIRTY_COUNT" -gt 0 ] && REASONS="$REASONS 未コミット変更($DIRTY_COUNT)"
      [ "$CUR_BRANCH" != "main" ] && REASONS="$REASONS 非mainブランチ($CUR_BRANCH)"
      [ "$CAN_FF" -eq 0 ] && REASONS="$REASONS ff不可(履歴分岐)"
      [ -n "$REASONS" ] && echo "   auto-pull 不可の理由:$REASONS"
      echo ""
      echo "   直近の origin/main コミット:"
      git log HEAD..origin/main --oneline 2>/dev/null | head -5 | sed 's/^/     /'
    fi
  else
    echo "✅ origin/main と同期済み"
  fi

  if [ "$AHEAD" -gt 0 ]; then
    echo "ℹ️  ローカルは origin/main より $AHEAD コミット進行"
  fi
fi

# 3. 最終 push 者（pc-lock.json の代わりに git log から動的判定）
LAST_PUSH=$(git log -1 --format='%an / %ci / %h' origin/main 2>/dev/null)
if [ -n "$LAST_PUSH" ]; then
  echo ""
  echo "🖥  最終 origin/main push: $LAST_PUSH"
fi

# 4. STATE.md（単一の真実）の最終更新を表示
if [ -f STATE.md ]; then
  STATE_UPDATE=$(head -3 STATE.md | grep -o '最終更新.*' || echo "不明")
  echo ""
  echo "📋 STATE.md: $STATE_UPDATE"
  echo "   → 起動後は STATE.md を読めば全プロジェクトの現在地がわかる"
fi

# 5. 直近 session-logs 3本
if [ -d session-logs ]; then
  echo ""
  echo "📄 直近 session-logs（3件）:"
  ls -t session-logs/*.md 2>/dev/null | head -3 | sed 's|^|   |'
fi

# 6. 未コミット変更（あれば）
DIRTY=$(git status --porcelain 2>/dev/null | wc -l)
if [ "$DIRTY" -gt 0 ]; then
  echo ""
  echo "🔧 未コミット変更: $DIRTY ファイル"
fi

echo "=========================================="

exit 0
