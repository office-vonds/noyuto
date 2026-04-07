#!/usr/bin/env python3
"""
kizuna-job.com 一括デプロイスクリプト
1. テーマをFTPアップロード
2. REST APIで固定ページ作成
3. テーマ有効化・フロントページ設定（手動指示出力）
"""

import os
import sys
import ftplib
import json
import requests
from requests.auth import HTTPBasicAuth

# ===== 設定 =====
FTP_HOST = os.getenv('FTP_HOST', 'sv1092.wpx.ne.jp')
FTP_USER = os.getenv('FTP_USER', 'kizuna-job.com')
FTP_PASS = os.getenv('FTP_PASS', '')

WP_URL = os.getenv('WP_KIZUNA_JOB_URL', 'https://kizuna-job.com')
WP_USER = os.getenv('WP_KIZUNA_JOB_USER', 'link-group')
WP_APP_PASS = os.getenv('WP_KIZUNA_JOB_APP_PASSWORD', '')

THEME_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'wordpress-theme', 'kizuna-job-theme')

# ===== FTP Functions =====
def ensure_remote_dir(ftp, path):
    dirs = path.strip('/').split('/')
    current = ''
    for d in dirs:
        current += f'/{d}'
        try:
            ftp.cwd(current)
        except ftplib.error_perm:
            try:
                ftp.mkd(current)
                ftp.cwd(current)
            except ftplib.error_perm:
                pass

def upload_dir(ftp, local_dir, remote_dir):
    ensure_remote_dir(ftp, remote_dir)
    for item in sorted(os.listdir(local_dir)):
        local_path = os.path.join(local_dir, item)
        remote_path = f'{remote_dir}/{item}'
        if os.path.isdir(local_path):
            upload_dir(ftp, local_path, remote_path)
        else:
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {remote_path}', f)
                size = os.path.getsize(local_path)
                print(f'  [{size:>6} bytes] {remote_path}')

def deploy_theme():
    print('=' * 50)
    print('STEP 1: テーマをFTPアップロード')
    print('=' * 50)

    if not FTP_PASS:
        print('FTP_PASS が未設定。スキップします。')
        return False

    try:
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, 21, timeout=30)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.encoding = 'utf-8'
        print(f'FTP接続成功: {FTP_HOST}')

        remote_dir = '/wp-content/themes/kizuna-job-theme'
        upload_dir(ftp, THEME_DIR, remote_dir)
        ftp.quit()
        print('テーマのアップロード完了！\n')
        return True
    except Exception as e:
        print(f'FTPエラー: {e}\n')
        return False

# ===== WordPress REST API Functions =====
def create_pages():
    print('=' * 50)
    print('STEP 2: 固定ページを作成')
    print('=' * 50)

    if not WP_APP_PASS:
        print('WP_KIZUNA_JOB_APP_PASSWORD が未設定。スキップします。')
        return

    api = f'{WP_URL}/wp-json/wp/v2'
    auth = HTTPBasicAuth(WP_USER, WP_APP_PASS)

    pages_data = [
        ('home', '山梨風俗求人 絆 -きずな- | 高収入・未経験歓迎・寮完備', '<!-- front-page.php -->'),
        ('salary', 'お給料について | 山梨風俗求人 絆', '<h2>業界最高水準のお給料</h2><p>山梨デリヘル絆では、在籍キャスト全員が満足できる報酬体系を用意しています。</p><h2>コース別バック額</h2><ul><li><strong>60分</strong>：10,000〜13,000円</li><li><strong>90分</strong>：13,000〜16,000円</li><li><strong>120分</strong>：18,000〜21,000円</li></ul><h2>体験入店日給</h2><ul><li>8時間：50,000円</li><li>10時間：65,000円</li><li>12時間：80,000円</li></ul><p>体験入店期間は1ヶ月。1本目フルバック選択可能。</p><h2>日払い・前払いOK</h2><p>お給料は即日手渡し。急な出費にも対応できます。</p>'),
        ('guarantee', '保証制度 | 山梨風俗求人 絆', '<h2>全応募者に保証制度を適用</h2><p>入店時に保証額を設定。期間内に届かなかった場合、<strong>差額を最終日に全額補填</strong>します。</p><h3>具体例</h3><p>10日間で50万円保証 → 実績40万円 → 差額10万円を補填</p>'),
        ('flow', '入店までの流れ | 山梨風俗求人 絆', '<h2>応募から入店まで5ステップ</h2><h3>STEP 1：お問い合わせ</h3><p>電話・LINE・メールでお気軽に。匿名OK。</p><h3>STEP 2：条件確認</h3><p>お給料・勤務時間・保証など何でもお聞きください。</p><h3>STEP 3：面接</h3><p>場所はあなたの希望に合わせます。身分証のみご持参。</p><h3>STEP 4：プロフィール作成・研修</h3><p>女性スタッフが丁寧に研修。研修動画あり。</p><h3>STEP 5：お仕事スタート</h3><p>体験入店からでもOK。</p>'),
        ('security', '安心・安全への取り組み | 山梨風俗求人 絆', '<h2>身バレ0%宣言</h2><p>顔確認制度、NGエリア設定、マイナンバー対策（税理士対応）、在籍確認一切なし。</p><h2>安全な労働環境</h2><ul><li>GPS搭載スマホ貸与</li><li>スタッフ常時待機で緊急対応</li><li>お客様NG登録システム</li></ul>'),
        ('beginner', '未経験の方へ | 山梨風俗求人 絆', '<h2>未経験者採用率90%以上</h2><p>女性スタッフによる丁寧な研修、体験入店制度、研修動画完備。男性による講習は一切なし。</p>'),
        ('mature', '30代・40代・50代大歓迎 | 山梨風俗求人 絆', '<h2>人妻・熟女さん大歓迎</h2><p>30〜50代の方を積極採用。60〜100分で8,000〜14,000円。採用率90%。</p>'),
        ('dormitory', '寮について | 山梨風俗求人 絆', '<h2>個室ワンルーム寮12部屋完備</h2><p>家具家電付き即入寮可能。エアコン・TV・洗濯機・冷蔵庫・電子レンジ・寝具完備。</p>'),
        ('qa', 'よくある質問（Q&A） | 山梨風俗求人 絆', '<h2>よくあるご質問</h2><h3>Q. 未経験でも大丈夫？</h3><p>採用率90%以上。丁寧な研修あり。</p><h3>Q. 身バレが心配</h3><p>身バレ0%宣言。顔確認制度・NGエリア設定・マイナンバー対策完備。</p><h3>Q. 保証制度は？</h3><p>全応募者に適用。差額は最終日に補填。</p><h3>Q. 寮はある？</h3><p>個室ワンルーム12部屋完備。即入寮可能。</p>'),
        ('contact', 'お問い合わせ・ご応募 | 山梨風俗求人 絆', '<h2>お問い合わせ</h2><p><strong>電話：</strong><a href="tel:08066360902">080-6636-0902</a></p><p><strong>LINE：</strong><a href="http://line.me/ti/p/iZbLQQ9CbO">友だち追加</a></p><p><strong>メール：</strong><a href="mailto:kizuna0511@au.com">kizuna0511@au.com</a></p>'),
        ('privacy', 'プライバシーポリシー | 山梨風俗求人 絆', '<h2>プライバシーポリシー</h2><p>当店は応募者の個人情報保護に最大限の配慮を行います。採用選考・連絡目的のみに使用し、第三者に開示しません。</p>'),
    ]

    home_id = None
    for slug, title, content in pages_data:
        # 既存チェック
        res = requests.get(f'{api}/pages', params={'slug': slug, 'per_page': 1}, auth=auth)
        existing = res.json() if res.status_code == 200 else []

        data = {'title': title, 'slug': slug, 'content': content, 'status': 'publish'}

        if existing and len(existing) > 0:
            pid = existing[0]['id']
            res = requests.post(f'{api}/pages/{pid}', json=data, auth=auth)
            print(f'  更新: {slug} (ID: {pid})')
        else:
            res = requests.post(f'{api}/pages', json=data, auth=auth)
            if res.status_code == 201:
                pid = res.json()['id']
                print(f'  作成: {slug} (ID: {pid})')
            else:
                print(f'  エラー: {slug} - {res.status_code}')
                continue

        if slug == 'home':
            home_id = pid

    return home_id


def print_manual_steps(theme_uploaded, home_id):
    print('\n' + '=' * 50)
    print('手動で行うステップ')
    print('=' * 50)

    steps = []
    if theme_uploaded:
        steps.append('1. テーマを有効化: https://kizuna-job.com/wp-admin/themes.php\n   → 「Kizuna Job Theme」を有効化')
    else:
        steps.append('1. FTPパスワードを設定してテーマをアップロード:\n   FTP_PASS=xxxxx python3 scripts/deploy-all.py')

    steps.append('2. 表示設定: https://kizuna-job.com/wp-admin/options-reading.php\n   → ホームページの表示: 固定ページ\n   → ホームページ: home')
    steps.append('3. パーマリンク設定: https://kizuna-job.com/wp-admin/options-permalink.php\n   → 投稿名 (/%postname%/) を選択')

    if not WP_APP_PASS:
        steps.append('4. アプリケーションパスワードを生成:\n   https://kizuna-job.com/wp-admin/profile.php\n   → 「アプリケーションパスワード」セクション\n   → 名前「claude」で新規追加\n   → .envに記入後、再度このスクリプトを実行')

    for step in steps:
        print(f'\n{step}')


if __name__ == '__main__':
    theme_ok = deploy_theme()
    home_id = create_pages()
    print_manual_steps(theme_ok, home_id)
