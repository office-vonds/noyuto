#!/usr/bin/env python3
"""朝のダイジェスト - NOYUTO向け夜間活動&成果レポート
毎朝7:00 cronで実行→Google Calendar event or email送信（SMTP復旧後）

まとめる内容:
  1. 夜間の git 活動（commit数・ファイル変更・誰が動いた）
  2. 夜間の cron 実行結果（成功/失敗）
  3. GSC 順位変動（全監視サイト 24時間で上下したKW）
  4. 自動投稿成果（rina→ブログ / vanilla / GH / unryuto_ai）
  5. エージェント作業キュー状況
  6. 未対応アラート（401・認証切れ・エラー連続）
"""

import subprocess, json, os, sys
from datetime import datetime, timedelta, date
from pathlib import Path
try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    GSC_OK = True
except Exception:
    GSC_OK = False

PROJECT = Path('/home/ozawakiryu0902/projects/vonds')
CRED = '/home/ozawakiryu0902/credentials/ga4-mcp.json'
MONITORED_SITES = [
    'https://bar-kofu.com/',
    'https://kizuna-job.com/',
    'https://majistretch.com/',
    'https://vonds.co.jp/',
    'https://www.a-truck.jp/',
]

JST = datetime.now()
SINCE = (JST - timedelta(hours=24)).strftime('%Y-%m-%d %H:%M')

def sh(cmd, cwd=PROJECT):
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd, timeout=30)
        return r.stdout.strip()
    except Exception as e:
        return f'ERR: {e}'

def git_activity():
    lines = ['## 1. 夜間Git活動 (直近24h)']
    log = sh(f'git log --since="{SINCE}" --pretty=format:"%h|%an|%ar|%s" --no-merges')
    if not log.strip():
        lines.append('  - (commit無し・静かな夜)')
        return '\n'.join(lines)
    commits = log.split('\n')
    lines.append(f'  - commit数: **{len(commits)}**')
    # 担当者集計
    by_author = {}
    for c in commits:
        parts = c.split('|')
        if len(parts) >= 2:
            by_author.setdefault(parts[1], 0)
            by_author[parts[1]] += 1
    for a, n in sorted(by_author.items(), key=lambda x: -x[1]):
        lines.append(f'  - {a}: {n}commit')
    lines.append('')
    lines.append('  直近5件:')
    for c in commits[:5]:
        parts = c.split('|')
        if len(parts) >= 4:
            lines.append(f'    - `{parts[0]}` {parts[2]} — {parts[3][:70]}')
    return '\n'.join(lines)

def cron_activity():
    lines = ['## 2. 夜間Cron実行ログ (昨夜)']
    logs = [
        ('rina→絆JOBブログ',  'scripts/kizuna-job/rina-to-blog.log'),
        ('絆JOB IndexNow',     'scripts/kizuna-job/indexnow-ping.log'),
        ('BAR KOFU IndexNow',  'scripts/bar-kofu/indexnow-ping.log'),
        ('unryuto_ai 投稿',    'unryuto/x-posts/cron.log'),
        ('vanilla 投稿',        'scripts/vanilla-cron.log'),
        ('girlsheaven 投稿',   'scripts/gh-cron.log'),
    ]
    for name, path in logs:
        p = PROJECT / path
        if not p.exists():
            lines.append(f'  - {name}: ログ無し')
            continue
        tail = sh(f'tail -n 3 "{p}"', cwd=PROJECT)
        recent_lines = [l for l in tail.split('\n') if '4/17' in l or '4/18' in l or datetime.now().strftime('%m/%d') in l]
        ok = any('成功' in l or 'Tweet ID' in l or '✅' in l or '投稿成功' in l for l in recent_lines)
        err = any('ERROR' in l or '❌' in l or '401' in l or 'Unauthorized' in l for l in recent_lines)
        status = '✅ 成功' if ok and not err else ('❌ エラー' if err else '- 不明')
        lines.append(f'  - {name}: {status}')
    return '\n'.join(lines)

def gsc_snapshot():
    if not GSC_OK:
        return '## 3. GSC順位変動\n  - google-api-python-client未インストール'
    lines = ['## 3. GSC順位動向 (過去7日 vs 過去28日)']
    try:
        creds = service_account.Credentials.from_service_account_file(
            CRED, scopes=['https://www.googleapis.com/auth/webmasters.readonly'])
        svc = build('searchconsole', 'v1', credentials=creds, cache_discovery=False)
    except Exception as e:
        return f'## 3. GSC\n  - 認証失敗: {e}'

    today = date.today()
    for site in MONITORED_SITES:
        try:
            r7 = svc.searchanalytics().query(siteUrl=site, body={
                'startDate': str(today - timedelta(days=7)), 'endDate': str(today),
                'dimensions': [], 'rowLimit': 1,
            }).execute().get('rows', [])
            r28 = svc.searchanalytics().query(siteUrl=site, body={
                'startDate': str(today - timedelta(days=28)), 'endDate': str(today),
                'dimensions': [], 'rowLimit': 1,
            }).execute().get('rows', [])
            clk7 = r7[0].get('clicks', 0) if r7 else 0
            imp7 = r7[0].get('impressions', 0) if r7 else 0
            clk28 = r28[0].get('clicks', 0) if r28 else 0
            imp28 = r28[0].get('impressions', 0) if r28 else 0
            pace7 = clk7 / 7
            pace28 = clk28 / 28
            trend = '↑' if pace7 > pace28 * 1.1 else ('↓' if pace7 < pace28 * 0.9 else '→')
            lines.append(f'  - {site.replace("https://","").rstrip("/")}: 7d={clk7}clk/{imp7}imp / 28d={clk28}clk/{imp28}imp {trend}')
        except Exception as e:
            lines.append(f'  - {site}: err {str(e)[:80]}')
    return '\n'.join(lines)

def task_queues():
    import re, glob
    lines = ['## 4. 各エージェント作業キュー']
    for agent, path in [
        ('サム',     'tasks/sam-queue.md'),
        ('バナナ',   'tasks/banana-queue.md'),
        ('KIRYU',    'tasks/kiryu-queue.md'),
    ]:
        p = PROJECT / path
        if not p.exists():
            lines.append(f'  - {agent}: queue無し')
            continue
        content = p.read_text(encoding='utf-8')
        undone = content.count('[ ]')
        done = content.count('[x]')
        lines.append(f'  - {agent}: 未着手 {undone} / 完了 {done}')

    # NOYUTOキューは tasks/noyuto-*.md 複数ファイルに分散
    noyuto_undone = 0
    noyuto_done = 0
    noyuto_top = []
    for f in sorted(glob.glob(str(PROJECT / 'tasks/noyuto-*.md'))):
        name = Path(f).name
        content = Path(f).read_text(encoding='utf-8')
        if name == 'noyuto-1min-actions.md':
            for m in re.finditer(r'^###\s+(.+?)$', content, re.MULTILINE):
                line = m.group(1).strip()
                if not re.search(r'^(~~)?\s*🔥?\s*[A-C]-[\d\.]+', line):
                    continue
                if '~~' in line or '✅完了' in line or '✅' in line:
                    noyuto_done += 1
                else:
                    noyuto_undone += 1
                    noyuto_top.append(line[:72])
        else:
            head = content[:400]
            if '✅ 完了' in head or '✅完了' in head or 'ステータス: 完了' in head:
                noyuto_done += 1
            else:
                noyuto_undone += 1
                m = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
                noyuto_top.append((m.group(1) if m else name)[:72])
    lines.append(f'  - NOYUTO: 未着手 {noyuto_undone} / 完了 {noyuto_done}')
    for t in noyuto_top[:15]:
        lines.append(f'     • {t}')
    if len(noyuto_top) > 15:
        lines.append(f'     ... 他 {len(noyuto_top) - 15}件 (tasks/noyuto-*.md参照)')
    return '\n'.join(lines)

def alerts():
    lines = ['## 5. アラート & 要注意']
    # unryuto_ai Cookie切れ
    unryuto_log = PROJECT / 'unryuto/x-posts/cron.log'
    if unryuto_log.exists():
        recent = sh(f'tail -n 20 "{unryuto_log}"')
        if '401' in recent or 'Unauthorized' in recent:
            lines.append('  - ⚠️ unryuto_ai Cookie期限切れ (WSL再取得はBanリスク)')

    # crontab生死
    cron_list = sh('crontab -l')
    if not cron_list or 'error' in cron_list.lower():
        lines.append('  - ⚠️ crontab取得エラー')

    # disk
    disk = sh('df -h / | tail -1 | awk \'{print $5}\'')
    if disk and '%' in disk:
        used = int(disk.replace('%',''))
        if used > 85:
            lines.append(f'  - ⚠️ ディスク使用率 {disk}')

    if len(lines) == 1:
        lines.append('  - 重大アラートなし')
    return '\n'.join(lines)

def main():
    report = [
        f'# 🌅 NOYUTO 朝のダイジェスト — {JST.strftime("%Y-%m-%d %H:%M")} JST',
        f'昨夜{SINCE}以降の活動サマリ',
        '',
        git_activity(), '',
        cron_activity(), '',
        gsc_snapshot(), '',
        task_queues(), '',
        alerts(), '',
        '---',
        '詳細: `vc` 起動してKIRYUに確認',
    ]
    out = '\n'.join(report)

    # 保存
    archive = PROJECT / 'scripts/daily-digest-archive'
    archive.mkdir(exist_ok=True)
    fname = archive / f'digest-{JST.strftime("%Y-%m-%d")}.md'
    fname.write_text(out, encoding='utf-8')

    # 出力
    print(out)

if __name__ == '__main__':
    main()
