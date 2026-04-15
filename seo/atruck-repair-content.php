/**
 * A-TRUCK 鈑金塗装ページ コンテンツ拡充
 * functions.php の末尾に追記する
 * 対象: /repair/ ページ
 */

// ── 鈑金ページ h1 日本語最適化 ──
add_filter('the_title', function($title, $id = null) {
    if (!is_page('repair') || is_admin()) return $title;
    // h1タグ内のタイトルのみ変更（ブラウザタブのtitleはAIOSEOが管理）
    if (in_the_loop() && is_main_query()) {
        return 'トラック鈑金塗装・修理 | A-TRUCK 市川R&Cセンター';
    }
    return $title;
}, 10, 2);

// ── 鈑金ページ コンテンツ追加（本文末尾に挿入） ──
add_filter('the_content', function($content) {
    if (!is_page('repair') || is_admin()) return $content;

    $extra = '
<!-- A-TRUCK 鈑金塗装 SEOコンテンツ拡充 -->
<div class="section-content atruck-seo-repair">

<div class="container">
<h2 class="section-title">対応車種・メーカー一覧</h2>
<div class="introduction">
<p>A-TRUCKでは国内外の主要トラックメーカーの車両に対応しています。小型から大型まで、車種を問わず鈑金塗装・修理が可能です。</p>

<h3>対応メーカー</h3>
<ul>
<li><strong>いすゞ（ISUZU）</strong> — エルフ・フォワード・ギガ</li>
<li><strong>日野（HINO）</strong> — デュトロ・レンジャー・プロフィア</li>
<li><strong>三菱ふそう（FUSO）</strong> — キャンター・ファイター・スーパーグレート</li>
<li><strong>UDトラックス</strong> — カゼット・コンドル・クオン</li>
<li><strong>トヨタ</strong> — ダイナ・トヨエース</li>
<li><strong>日産</strong> — アトラス</li>
<li><strong>マツダ</strong> — タイタン</li>
</ul>

<h3>対応車種</h3>
<ul>
<li>小型トラック（1t〜3t）</li>
<li>中型トラック（4t〜8t）</li>
<li>大型トラック（10t〜25t）</li>
<li>トレーラー・セミトレーラー</li>
<li>バス（マイクロバス・大型バス）</li>
<li>冷凍車・冷蔵車・保冷車</li>
<li>ダンプ・ミキサー車・タンクローリー</li>
<li>ウイング車・バン車</li>
</ul>
</div>
</div>

<div class="container">
<h2 class="section-title">鈑金塗装の料金目安</h2>
<div class="introduction">
<p>修理内容・損傷の程度・車種によって料金は異なります。以下は一般的な目安です。正確なお見積もりは無料で承っておりますので、お気軽にお問い合わせください。</p>

<table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:15px;">
<thead>
<tr style="background:#003366;color:#fff;">
<th style="padding:12px;text-align:left;">修理内容</th>
<th style="padding:12px;text-align:left;">小型トラック</th>
<th style="padding:12px;text-align:left;">中型トラック</th>
<th style="padding:12px;text-align:left;">大型トラック</th>
</tr>
</thead>
<tbody>
<tr style="border-bottom:1px solid #ddd;">
<td style="padding:12px;"><strong>小キズ・へこみ修理</strong></td>
<td style="padding:12px;">3万円〜</td>
<td style="padding:12px;">5万円〜</td>
<td style="padding:12px;">8万円〜</td>
</tr>
<tr style="border-bottom:1px solid #ddd;background:#f9f9f9;">
<td style="padding:12px;"><strong>パネル交換</strong></td>
<td style="padding:12px;">10万円〜</td>
<td style="padding:12px;">15万円〜</td>
<td style="padding:12px;">20万円〜</td>
</tr>
<tr style="border-bottom:1px solid #ddd;">
<td style="padding:12px;"><strong>キャビン修理</strong></td>
<td style="padding:12px;">20万円〜</td>
<td style="padding:12px;">30万円〜</td>
<td style="padding:12px;">50万円〜</td>
</tr>
<tr style="border-bottom:1px solid #ddd;background:#f9f9f9;">
<td style="padding:12px;"><strong>全塗装</strong></td>
<td style="padding:12px;">30万円〜</td>
<td style="padding:12px;">50万円〜</td>
<td style="padding:12px;">80万円〜</td>
</tr>
<tr style="border-bottom:1px solid #ddd;">
<td style="padding:12px;"><strong>床張替</strong></td>
<td style="padding:12px;">15万円〜</td>
<td style="padding:12px;">20万円〜</td>
<td style="padding:12px;">30万円〜</td>
</tr>
</tbody>
</table>
<p style="font-size:13px;color:#666;">※ 上記は税別の概算料金です。車両の状態により変動します。お見積もりは無料です。</p>
</div>
</div>

<div class="container">
<h2 class="section-title">保険修理について</h2>
<div class="introduction">
<p>A-TRUCKでは<strong>車両保険を使った鈑金塗装修理</strong>にも対応しています。事故や災害による損傷の場合、保険会社との連絡・見積書の作成・修理完了報告まで一貫してサポートいたします。</p>
<ul>
<li>保険会社への提出用見積書を無料で作成</li>
<li>保険適用の可否についてもアドバイス可能</li>
<li>自費修理との比較もご提案します</li>
</ul>
</div>
</div>

<div class="container">
<h2 class="section-title">対応エリア</h2>
<div class="introduction">
<p>鈑金塗装の受付は<strong>市川R&Cセンター（千葉県市川市）</strong>で行っています。関東近郊からのお持ち込みはもちろん、引取り・納車のご相談も承ります。</p>
<ul>
<li><strong>千葉県</strong> — 市川市・船橋市・松戸市・柏市・千葉市ほか全域</li>
<li><strong>東京都</strong> — 23区・多摩地域</li>
<li><strong>埼玉県</strong> — さいたま市・川口市・越谷市ほか</li>
<li><strong>神奈川県</strong> — 横浜市・川崎市・相模原市ほか</li>
<li><strong>茨城県・栃木県・群馬県</strong> — ご相談ください</li>
</ul>
<p>遠方のお客様は、レンタル用代車のご用意も可能です。お気軽にご相談ください。</p>
</div>
</div>

<div class="container">
<h2 class="section-title">よくあるご質問（鈑金塗装）</h2>
<div class="introduction">

<div style="margin-bottom:16px;border-bottom:1px solid #eee;padding-bottom:16px;">
<h3 style="color:#003366;font-size:16px;">Q. 修理期間はどのくらいですか？</h3>
<p>軽微なキズ・へこみは3〜5営業日、パネル交換やキャビン修理は1〜2週間、全塗装は2〜3週間が目安です。お急ぎの場合はご相談ください。</p>
</div>

<div style="margin-bottom:16px;border-bottom:1px solid #eee;padding-bottom:16px;">
<h3 style="color:#003366;font-size:16px;">Q. どのメーカーのトラックでも対応できますか？</h3>
<p>はい。いすゞ・日野・三菱ふそう・UDトラックス・トヨタ・日産・マツダなど、国内主要メーカーの全車種に対応しています。</p>
</div>

<div style="margin-bottom:16px;border-bottom:1px solid #eee;padding-bottom:16px;">
<h3 style="color:#003366;font-size:16px;">Q. 修理中の代車は借りられますか？</h3>
<p>はい。修理期間中のレンタル用代車をご用意しています。料金は車種・期間により異なりますので、お見積もり時にご確認ください。</p>
</div>

<div style="margin-bottom:16px;border-bottom:1px solid #eee;padding-bottom:16px;">
<h3 style="color:#003366;font-size:16px;">Q. 見積もりは無料ですか？</h3>
<p>はい。お見積もりは無料です。お電話またはお問い合わせフォームからお気軽にご連絡ください。写真をお送りいただければ概算のお見積もりも可能です。</p>
</div>

<div style="margin-bottom:16px;border-bottom:1px solid #eee;padding-bottom:16px;">
<h3 style="color:#003366;font-size:16px;">Q. 保険を使って修理できますか？</h3>
<p>はい。車両保険を使った修理に対応しています。保険会社への見積書作成から修理完了報告まで一貫してサポートいたします。</p>
</div>

<div style="margin-bottom:16px;border-bottom:1px solid #eee;padding-bottom:16px;">
<h3 style="color:#003366;font-size:16px;">Q. カスタム塗装やラッピングも対応していますか？</h3>
<p>はい。社名入れ・ロゴ塗装・カラーチェンジなどのカスタム塗装に対応しています。トラック専門の大型塗装ブースを完備しているため、大型車の全塗装も可能です。</p>
</div>

<div style="margin-bottom:16px;border-bottom:1px solid #eee;padding-bottom:16px;">
<h3 style="color:#003366;font-size:16px;">Q. 引取り・納車はしてもらえますか？</h3>
<p>関東近郊であれば引取り・納車のご相談を承ります。詳細はお電話にてお問い合わせください。</p>
</div>

<div style="margin-bottom:16px;">
<h3 style="color:#003366;font-size:16px;">Q. 事故ではなく経年劣化の修理もできますか？</h3>
<p>もちろん対応可能です。サビ・腐食の補修、退色した塗装の塗り直し、床板の張替えなど、経年劣化による修理も多数実績があります。</p>
</div>

</div>
</div>

</div>
<!-- /A-TRUCK 鈑金塗装 SEOコンテンツ拡充 -->
';

    return $content . $extra;
}, 20);

// ── 鈑金ページ FAQPage スキーマ更新（8問に拡張） ──
add_action('wp_head', function() {
    if (!is_page('repair')) return;
    $faq = [
        ['q' => '修理期間はどのくらいですか？', 'a' => '軽微なキズ・へこみは3〜5営業日、パネル交換やキャビン修理は1〜2週間、全塗装は2〜3週間が目安です。'],
        ['q' => 'どのメーカーのトラックでも対応できますか？', 'a' => 'はい。いすゞ・日野・三菱ふそう・UDトラックス・トヨタ・日産・マツダなど、国内主要メーカーの全車種に対応しています。'],
        ['q' => '修理中の代車は借りられますか？', 'a' => 'はい。修理期間中のレンタル用代車をご用意しています。料金は車種・期間により異なりますので、お見積もり時にご確認ください。'],
        ['q' => '見積もりは無料ですか？', 'a' => 'はい。お見積もりは無料です。お電話またはお問い合わせフォームからお気軽にご連絡ください。'],
        ['q' => '保険を使って修理できますか？', 'a' => 'はい。車両保険を使った修理に対応しています。保険会社への見積書作成から修理完了報告まで一貫してサポートいたします。'],
        ['q' => 'カスタム塗装やラッピングも対応していますか？', 'a' => 'はい。社名入れ・ロゴ塗装・カラーチェンジなどのカスタム塗装に対応しています。大型塗装ブースを完備しているため、大型車の全塗装も可能です。'],
        ['q' => '引取り・納車はしてもらえますか？', 'a' => '関東近郊であれば引取り・納車のご相談を承ります。詳細はお電話にてお問い合わせください。'],
        ['q' => '事故ではなく経年劣化の修理もできますか？', 'a' => 'もちろん対応可能です。サビ・腐食の補修、退色した塗装の塗り直し、床板の張替えなど、経年劣化による修理も多数実績があります。'],
    ];
    $items = [];
    foreach ($faq as $i => $f) {
        $items[] = [
            '@type' => 'Question',
            'name' => $f['q'],
            'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f['a']],
        ];
    }
    $schema = ['@context' => 'https://schema.org', '@type' => 'FAQPage', 'mainEntity' => $items];
    echo '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>' . "\n";
}, 5);
