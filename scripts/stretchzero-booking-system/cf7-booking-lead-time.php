<?php
/**
 * Plugin Name: StretchZero Booking Lead Time (3h)
 * Description: 予約フォーム(ID:1354) の第1〜第3希望日時について、現在時刻＋3時間以降しか選択できないように制限する（クライアントJS + サーバー側バリデーション）
 * Version: 1.0
 */

if (!defined('ABSPATH')) exit;

/**
 * リード時間（時間単位）
 */
const SZ_LEAD_HOURS = 3;

/**
 * 対象CF7フォームID
 */
const SZ_FORM_ID = 1354;

/**
 * /contact/ ページ読み込み時に制限JSを出力する
 */
add_action('wp_footer', function () {
    if (!is_page('contact')) return;
    $lead = (int) SZ_LEAD_HOURS;
    ?>
<script>
(function () {
  var LEAD_HOURS = <?php echo $lead; ?>;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function earliest() {
    var d = new Date();
    d.setMinutes(d.getMinutes() + LEAD_HOURS * 60);
    return d;
  }

  function applyConstraints() {
    var now = new Date();
    var min = earliest();
    var minYmd = ymd(min);

    ['1', '2', '3'].forEach(function (n) {
      var dateEl = document.querySelector('input[name="your-date' + n + '"]');
      var timeEl = document.querySelector('select[name="your-time' + n + '"]');
      if (!dateEl || !timeEl) return;

      dateEl.min = minYmd;
      dateEl.setAttribute('min', minYmd);

      var selectedDate = dateEl.value;
      var basisDate = selectedDate || minYmd;

      Array.prototype.forEach.call(timeEl.options, function (opt) {
        if (!opt.value || opt.value === '時間を選択') { opt.disabled = false; return; }

        if (basisDate < minYmd) {
          opt.disabled = true;
        } else if (basisDate === minYmd) {
          var parts = opt.value.split(':');
          var optDate = new Date(basisDate + 'T' + pad(parts[0]) + ':' + pad(parts[1]) + ':00');
          opt.disabled = optDate.getTime() < min.getTime();
        } else {
          opt.disabled = false;
        }
      });

      if (timeEl.selectedOptions[0] && timeEl.selectedOptions[0].disabled) {
        timeEl.value = '時間を選択';
      }
    });
  }

  function bind() {
    ['1', '2', '3'].forEach(function (n) {
      var dateEl = document.querySelector('input[name="your-date' + n + '"]');
      if (dateEl) dateEl.addEventListener('change', applyConstraints);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bind();
    applyConstraints();
    setInterval(applyConstraints, 60 * 1000);
  });
})();
</script>
    <?php
}, 100);

/**
 * サーバー側バリデーション：第1希望日時が現在時刻+3h未満ならエラー
 * 第2/第3希望は任意なので、入力された場合のみチェック
 */
add_filter('wpcf7_validate_select', 'sz_validate_booking_lead_time', 20, 2);
add_filter('wpcf7_validate_select*', 'sz_validate_booking_lead_time', 20, 2);

function sz_validate_booking_lead_time($result, $tag) {
    $name = $tag->name;
    if (!preg_match('/^your-time([123])$/', $name, $m)) return $result;

    $submission = WPCF7_Submission::get_instance();
    if (!$submission) return $result;
    $form = $submission->get_contact_form();
    if (!$form || $form->id() != SZ_FORM_ID) return $result;

    $data = $submission->get_posted_data();
    $n = $m[1];
    $date = isset($data['your-date' . $n]) ? trim($data['your-date' . $n]) : '';
    $time = isset($data['your-time' . $n]) ? trim($data['your-time' . $n]) : '';

    if ($n !== '1' && ($date === '' || $time === '' || $time === '時間を選択')) {
        return $result;
    }
    if ($date === '' || $time === '' || $time === '時間を選択') return $result;

    try {
        $tz = new DateTimeZone('Asia/Tokyo');
        $selected = new DateTime($date . ' ' . $time . ':00', $tz);
        $earliest = new DateTime('now', $tz);
        $earliest->modify('+' . SZ_LEAD_HOURS . ' hours');

        if ($selected < $earliest) {
            $result->invalidate($tag, '現在時刻から' . SZ_LEAD_HOURS . '時間後以降の日時をご選択ください。');
        }
    } catch (Exception $e) {
        // 日時パース失敗時はスルー（CF7本体のdate/selectバリデーションに任せる）
    }

    return $result;
}
