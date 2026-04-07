#!/usr/bin/env python3
"""XML-RPCで全固定ページを更新"""

import xmlrpc.client

WP_URL = 'https://kizuna-job.com/xmlrpc.php'
WP_USER = 'link-group'
WP_PASS = 'pjj9khxxrypm'

wp = xmlrpc.client.ServerProxy(WP_URL)

# 既存ページID → 更新データ
updates = {
    90: {
        'post_title': '山梨風俗求人 絆 -きずな- | 高収入・未経験歓迎・寮完備',
        'post_name': 'home',
        'post_content': '<!-- front-page.phpテンプレートで表示 -->',
    },
    30: {
        'post_title': 'お給料について | 山梨風俗求人 絆',
        'post_name': 'salary',
        'post_content': '''<h2>業界最高水準のお給料</h2>
<p>山梨デリヘル絆では、在籍キャスト全員が満足できる報酬体系を用意しています。容姿・体型・年齢に関係なく、頑張った分だけしっかり稼げる環境です。</p>

<h2>コース別バック額</h2>
<table style="width:100%;border-collapse:collapse;margin:20px 0;">
<tr style="background:#d4488e;color:#fff;"><th style="padding:12px;text-align:left;">コース</th><th style="padding:12px;text-align:right;">バック額</th></tr>
<tr style="border-bottom:1px solid #eee;"><td style="padding:12px;">60分コース</td><td style="padding:12px;text-align:right;font-weight:bold;">10,000〜13,000円</td></tr>
<tr style="border-bottom:1px solid #eee;"><td style="padding:12px;">90分コース</td><td style="padding:12px;text-align:right;font-weight:bold;">13,000〜16,000円</td></tr>
<tr><td style="padding:12px;">120分コース</td><td style="padding:12px;text-align:right;font-weight:bold;">18,000〜21,000円</td></tr>
</table>

<h2>体験入店の給与例</h2>
<table style="width:100%;border-collapse:collapse;margin:20px 0;">
<tr style="background:#1a1a2e;color:#fff;"><th style="padding:12px;text-align:left;">勤務時間</th><th style="padding:12px;text-align:right;">日給</th></tr>
<tr style="border-bottom:1px solid #eee;"><td style="padding:12px;">8時間</td><td style="padding:12px;text-align:right;font-weight:bold;color:#d4488e;">50,000円</td></tr>
<tr style="border-bottom:1px solid #eee;"><td style="padding:12px;">10時間</td><td style="padding:12px;text-align:right;font-weight:bold;color:#d4488e;">65,000円</td></tr>
<tr><td style="padding:12px;">12時間</td><td style="padding:12px;text-align:right;font-weight:bold;color:#d4488e;">80,000円</td></tr>
</table>
<p>体験入店期間は1ヶ月。1本目フルバック選択も可能です。</p>

<h2>日給・月収の目安</h2>
<ul>
<li><strong>日給（10時間勤務）</strong>：60,000円以上</li>
<li><strong>月収（週5勤務）</strong>：60万〜160万円</li>
<li><strong>1日の接客数</strong>：2〜7人（平均接客時間120分）</li>
</ul>

<h2>なぜ高収入が可能なのか</h2>
<p>絆では広告宣伝に力を入れ、集客力を最大化しています。バニラ・ガールズヘブンなどの大手求人サイトでの露出に加え、SEO対策やリスティング広告にも積極的に投資。お客様を安定的に確保できるため、キャストの皆さんに高い報酬をお支払いできます。</p>

<h2>日払い・前払いOK</h2>
<p>お給料は即日手渡し。急な出費にも対応できます。</p>

<h2>各種ボーナス</h2>
<ul>
<li>入店ボーナス</li>
<li>皆勤ボーナス</li>
<li>指名バック</li>
<li>イベント時の特別ボーナス</li>
</ul>''',
    },
    32: {
        'post_title': '保証制度 | 山梨風俗求人 絆',
        'post_name': 'guarantee',
        'post_content': '''<h2>全応募者に保証制度を適用</h2>
<p>絆では、すべての応募者に保証制度をご用意しています。「思ったより稼げなかったらどうしよう…」という不安を解消し、安心してお仕事を始めていただけます。</p>

<h2>保証制度の仕組み</h2>
<p>入店時に保証額を設定します。設定期間内に保証額に届かなかった場合、<strong>差額を最終日に全額補填</strong>します。</p>

<h3>具体例</h3>
<div style="background:#f8e8f0;padding:20px;border-radius:12px;margin:20px 0;">
<p style="margin:0;"><strong>保証設定：</strong>10日間で50万円</p>
<p style="margin:8px 0 0;"><strong>実績：</strong>40万円</p>
<p style="margin:8px 0 0;font-size:1.2em;color:#d4488e;"><strong>→ 差額の10万円を補填してお支払い</strong></p>
</div>

<h2>保証制度のポイント</h2>
<ul>
<li>未経験者でも適用</li>
<li>年齢・容姿不問</li>
<li>保証額は相談の上で決定</li>
<li>保証期間中もバック率は変わらず</li>
</ul>

<p>まずはお気軽にご希望額をお伝えください。あなたに合ったプランをご提案します。</p>''',
    },
    36: {
        'post_title': '入店までの流れ | 山梨風俗求人 絆',
        'post_name': 'flow',
        'post_content': '''<h2>応募から入店まで5つのステップ</h2>
<p>初めての方でも安心。応募から最短即日で体験入店が可能です。</p>

<h3>STEP 1：お問い合わせ</h3>
<p>電話・LINE・メール・応募フォームからお気軽にご連絡ください。匿名での相談もOK。まずは話を聞くだけでも大歓迎です。</p>

<h3>STEP 2：条件のご確認</h3>
<p>お給料・勤務時間・保証制度・待遇など、気になることは何でもお聞きください。納得いくまで丁寧にご説明します。</p>

<h3>STEP 3：面接</h3>
<p>面接場所はあなたの希望に合わせます（カフェ・駅前・車内など）。服装は自由、身分証明書のみお持ちください。所要時間は30分程度です。</p>

<h3>STEP 4：プロフィール作成・研修</h3>
<p>源氏名を決めてプロフィール写真を撮影。女性スタッフが接客マナーや心構えを丁寧に研修します。研修動画も用意しているので安心です。</p>

<h3>STEP 5：お仕事スタート</h3>
<p>体験入店からでもOK！あなたのペースで無理なく始められます。困ったことがあれば、いつでもスタッフに相談できます。</p>''',
    },
    34: {
        'post_title': '安心・安全への取り組み | 山梨風俗求人 絆',
        'post_name': 'security',
        'post_content': '''<h2>身バレ0%宣言</h2>
<p>絆では、働く女性のプライバシーを最優先に考えています。身バレのリスクをゼロにするための万全の対策を実施しています。</p>

<h3>顔確認制度</h3>
<p>お客様のご予約時にお顔の確認を行います。知り合いの可能性がある場合は、キャストの判断でお断りできます。</p>

<h3>NGエリア設定</h3>
<p>「この地域には行きたくない」というNGエリアを自由に設定できます。自宅周辺や知人の多いエリアを除外可能です。</p>

<h3>マイナンバー対策</h3>
<p>提携の税理士が確定申告をサポート。副業バレ・マイナンバーに関する不安も専門家が解消します。弁護士対応も可能です。</p>

<h3>在籍確認は一切なし</h3>
<p>どなたからのお問い合わせであっても、在籍の有無をお伝えすることは絶対にありません。</p>

<h3>源氏名・プロフィール管理</h3>
<p>本名は一切使用しません。プロフィール写真もご本人と分からない加工が可能です。</p>

<h2>安全な労働環境</h2>
<ul>
<li>GPS搭載のスマートフォン貸与</li>
<li>スタッフが常時待機で緊急時即対応</li>
<li>お客様のNG登録システム完備</li>
<li>定期的な防犯研修の実施</li>
</ul>''',
    },
    28: {
        'post_title': '未経験の方へ | 山梨風俗求人 絆',
        'post_name': 'beginner',
        'post_content': '''<h2>未経験者採用率90%以上</h2>
<p>絆で働くキャストの多くが未経験からスタートしています。初めてで不安な気持ちは当然のこと。だからこそ、安心して始められる環境を整えています。</p>

<h3>女性スタッフによる丁寧な研修</h3>
<p>接客の基本からお客様との会話のコツまで、女性キャストが実践的に指導します。男性による講習は一切ありません。</p>

<h3>体験入店制度</h3>
<p>まずは1日だけ体験してみることができます。雰囲気を確認してから入店を決められるので、リスクはゼロ。もちろん体験入店でもお給料はお支払いします。</p>

<h3>研修動画完備</h3>
<p>自分のペースで学べる研修動画を用意。繰り返し確認できるので、焦らずスキルを身につけられます。</p>

<h3>先輩キャストのサポート</h3>
<p>分からないことや困ったことがあれば、先輩キャストやスタッフにいつでも相談OK。一人で抱え込む必要はありません。</p>

<h2>よくある不安にお答えします</h2>
<ul>
<li><strong>「容姿に自信がない」</strong> → 容姿・体型・年齢は一切不問です</li>
<li><strong>「何も知らない」</strong> → 全て一から丁寧にお教えします</li>
<li><strong>「続けられるか不安」</strong> → まずは体験入店から。辞めるのも自由です</li>
</ul>''',
    },
    38: {
        'post_title': '30代・40代・50代大歓迎 | 山梨風俗求人 絆',
        'post_name': 'mature',
        'post_content': '''<h2>人妻・熟女さん大歓迎</h2>
<p>絆では30代〜50代の方を積極採用しています。「年齢的にもう無理かも…」と諦める必要はありません。実際に多くの30代以上のキャストが活躍し、高収入を得ています。</p>

<h2>報酬の目安</h2>
<table style="width:100%;border-collapse:collapse;margin:20px 0;">
<tr style="background:#d4488e;color:#fff;"><th style="padding:12px;text-align:left;">コース</th><th style="padding:12px;text-align:right;">バック額</th></tr>
<tr style="border-bottom:1px solid #eee;"><td style="padding:12px;">60分</td><td style="padding:12px;text-align:right;font-weight:bold;">8,000〜13,000円</td></tr>
<tr style="border-bottom:1px solid #eee;"><td style="padding:12px;">90分</td><td style="padding:12px;text-align:right;font-weight:bold;">13,000〜16,000円</td></tr>
<tr><td style="padding:12px;">120分</td><td style="padding:12px;text-align:right;font-weight:bold;">18,000〜21,000円</td></tr>
</table>

<h2>なぜ30代以上が稼げるのか</h2>
<p>甲府エリアでは人妻・熟女ジャンルの需要が非常に高く、安定した集客が見込めます。大人の女性ならではの魅力を活かせるお仕事です。</p>

<h2>採用率90%</h2>
<p>年齢・容姿・体型は一切不問。面接で落とすことはほとんどありません。まずはお気軽にご応募ください。</p>

<h2>こんな方に選ばれています</h2>
<ul>
<li>子育てと両立したい主婦の方</li>
<li>短時間で効率よく稼ぎたい方</li>
<li>生活費の足しにしたい方</li>
<li>借金返済を早く終わらせたい方</li>
<li>今の仕事だけでは不安な方</li>
</ul>''',
    },
    124: {
        'post_title': '寮について | 山梨風俗求人 絆',
        'post_name': 'dormitory',
        'post_content': '''<h2>個室ワンルーム寮を12部屋完備</h2>
<p>県外からの方、住居にお困りの方もすぐにお仕事を始められます。面接当日からの即入寮が可能です。</p>

<h2>寮の設備</h2>
<ul>
<li>完全個室のワンルーム</li>
<li>エアコン完備</li>
<li>テレビ</li>
<li>洗濯機</li>
<li>冷蔵庫</li>
<li>電子レンジ</li>
<li>寝具一式</li>
<li>ドライヤー</li>
<li>タオル類</li>
<li>加湿器</li>
<li>生活用品一式</li>
</ul>

<h2>こんな方におすすめ</h2>
<ul>
<li>県外から山梨で働きたい方</li>
<li>すぐに一人暮らしを始めたい方</li>
<li>環境を変えたい方</li>
<li>DV被害などで住居にお困りの方</li>
</ul>

<h2>一人で悩まないでください</h2>
<p>住居の問題、生活の問題を抱えている方も、まずはご相談ください。できる限りのサポートをいたします。</p>''',
    },
    220: {
        'post_title': 'よくある質問（Q&A） | 山梨風俗求人 絆',
        'post_name': 'qa',
        'post_content': '''<h2>よくあるご質問</h2>

<h3>Q. 講習はどんなことをするの？</h3>
<p>女性キャストが丁寧に指導します。お客様への接し方やマナーを中心に、実践的な内容を研修します。男性による講習は一切ありません。</p>

<h3>Q. 待機場所はどこですか？</h3>
<p>甲府市内に完全個室の待機所を完備しています。Wi-Fi・TV・飲み物あり。自宅での待機も可能です。</p>

<h3>Q. 身バレが心配です</h3>
<p>身バレ0%宣言をしています。お客様の顔確認制度、NGエリア設定、源氏名使用、マイナンバー対策（提携税理士対応）など万全の対策を実施しています。在籍確認も一切しません。</p>

<h3>Q. 確定申告はどうすればいい？</h3>
<p>提携の税理士が無料でサポートします。マイナンバーに関する不安も解消できます。</p>

<h3>Q. 未経験でも大丈夫？</h3>
<p>未経験者の採用率は90%以上です。丁寧な研修と体験入店制度があるので、安心してスタートできます。</p>

<h3>Q. 在籍確認はありますか？</h3>
<p>一切ありません。どなたからのお問い合わせであっても、在籍の有無をお伝えすることは絶対にありません。</p>

<h3>Q. 体験入店はできますか？</h3>
<p>はい、即日体験入店が可能です。実際の雰囲気を確認してから入店を決められます。もちろんお給料もお支払いします。</p>

<h3>Q. 保証制度について教えてください</h3>
<p>全応募者に保証制度を適用しています。希望額に届かなかった場合、差額を最終日に全額補填します。例：10日50万保証で実績40万の場合、10万円を補填。</p>

<h3>Q. 容姿に自信がないのですが…</h3>
<p>容姿・体型・年齢は一切不問です。30〜50代の方も多数活躍中。採用率90%以上です。</p>

<h3>Q. 寮はありますか？</h3>
<p>個室ワンルームを12部屋完備しています。家具家電付きで即入寮可能。県外からの方も安心です。</p>''',
    },
    40: {
        'post_title': 'お問い合わせ・ご応募 | 山梨風俗求人 絆',
        'post_name': 'contact',
        'post_content': '''<h2>お問い合わせ・ご応募</h2>
<p>ご質問だけでも大歓迎。匿名でのご相談もOKです。24時間受付中。</p>

<h2>電話で相談</h2>
<p style="font-size:1.5em;"><strong><a href="tel:08066360902">080-6636-0902</a></strong></p>
<p>24時間対応・秘密厳守</p>

<h2>LINEで相談</h2>
<p style="font-size:1.2em;"><a href="http://line.me/ti/p/iZbLQQ9CbO" target="_blank" rel="noopener"><strong>LINEで友だち追加する</strong></a></p>
<p>気軽にメッセージを送ってください。</p>

<h2>メールで相談</h2>
<p style="font-size:1.2em;"><a href="mailto:kizuna0511@au.com"><strong>kizuna0511@au.com</strong></a></p>

<p><small>お送りいただいた個人情報は、採用選考およびご連絡の目的のみに使用し、第三者に開示することはありません。</small></p>''',
    },
}

print('=== XML-RPCで全ページ一括更新 ===\n')

for page_id, data in updates.items():
    try:
        result = wp.wp.editPost(0, WP_USER, WP_PASS, page_id, data)
        if result:
            print(f'  OK: ID:{page_id} → {data["post_name"]} "{data["post_title"][:40]}"')
        else:
            print(f'  NG: ID:{page_id} → 更新失敗')
    except Exception as e:
        print(f'  NG: ID:{page_id} → {e}')

# プライバシーポリシーページを新規作成
print('\n--- プライバシーポリシーページ作成 ---')
try:
    privacy_id = wp.wp.newPost(0, WP_USER, WP_PASS, {
        'post_type': 'page',
        'post_title': 'プライバシーポリシー | 山梨風俗求人 絆',
        'post_name': 'privacy',
        'post_status': 'publish',
        'post_content': '''<h2>プライバシーポリシー</h2>
<p>山梨デリヘル絆（以下「当店」）は、お客様・応募者の個人情報の保護に最大限の配慮を行います。</p>

<h3>個人情報の取得</h3>
<p>当店は、応募フォーム・電話・LINE・メールを通じて、氏名・連絡先等の個人情報を取得する場合があります。</p>

<h3>利用目的</h3>
<ul>
<li>採用選考およびご連絡のため</li>
<li>お問い合わせへの回答のため</li>
<li>サービス向上のため</li>
</ul>

<h3>第三者提供</h3>
<p>法令に基づく場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。</p>

<h3>お問い合わせ</h3>
<p>電話：<a href="tel:08066360902">080-6636-0902</a><br>メール：<a href="mailto:kizuna0511@au.com">kizuna0511@au.com</a></p>''',
    })
    print(f'  OK: プライバシーポリシー (ID: {privacy_id})')
except Exception as e:
    print(f'  NG: {e}')

print('\n=== 完了 ===')
