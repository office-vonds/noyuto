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
  var originalOptions = {};

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function earliest() {
    var d = new Date();
    d.setMinutes(d.getMinutes() + LEAD_HOURS * 60);
    return d;
  }

  function snapshotOriginal(timeEl, key) {
    if (originalOptions[key]) return;
    var list = [];
    Array.prototype.forEach.call(timeEl.options, function (opt) {
      list.push({ value: opt.value, label: opt.textContent });
    });
    originalOptions[key] = list;
  }

  function rebuild(timeEl, key, basisDate, minDate, minYmd) {
    var prev = timeEl.value;
    while (timeEl.firstChild) timeEl.removeChild(timeEl.firstChild);

    originalOptions[key].forEach(function (item) {
      var isPlaceholder = !item.value || item.value === '時間を選択';
      var keep = true;

      if (!isPlaceholder) {
        if (basisDate < minYmd) {
          keep = false;
        } else if (basisDate === minYmd) {
          var parts = item.value.split(':');
          var optDate = new Date(basisDate + 'T' + pad(parts[0]) + ':' + pad(parts[1]) + ':00');
          keep = optDate.getTime() >= minDate.getTime();
        }
      }

      if (keep) {
        var opt = document.createElement('option');
        opt.value = item.value;
        opt.textContent = item.label;
        timeEl.appendChild(opt);
      }
    });

    var canRestore = Array.prototype.some.call(timeEl.options, function (o) { return o.value === prev; });
    timeEl.value = canRestore ? prev : (timeEl.options[0] ? timeEl.options[0].value : '');
  }

  function hasSlotOnDay(ymdStr, minDate) {
    var slots = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00'];
    for (var i = 0; i < slots.length; i++) {
      var p = slots[i].split(':');
      var d = new Date(ymdStr + 'T' + pad(p[0]) + ':' + pad(p[1]) + ':00');
      if (d.getTime() >= minDate.getTime()) return true;
    }
    return false;
  }

  function firstAvailableYmd(minDate) {
    var today = new Date();
    var todayYmd = ymd(today);
    if (hasSlotOnDay(todayYmd, minDate)) return todayYmd;
    var tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    return ymd(tomorrow);
  }

  function showPlaceholderOnly(timeEl) {
    while (timeEl.firstChild) timeEl.removeChild(timeEl.firstChild);
    var opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '先に日付を選択してください';
    timeEl.appendChild(opt);
    timeEl.disabled = true;
  }

  function applyConstraints() {
    var min = earliest();
    var firstYmd = firstAvailableYmd(min);

    ['1', '2', '3'].forEach(function (n) {
      var dateEl = document.querySelector('input[name="your-date' + n + '"]');
      var timeEl = document.querySelector('select[name="your-time' + n + '"]');
      if (!dateEl || !timeEl) return;

      dateEl.min = firstYmd;
      dateEl.setAttribute('min', firstYmd);

      snapshotOriginal(timeEl, n);

      if (!dateEl.value) {
        showPlaceholderOnly(timeEl);
        return;
      }

      timeEl.disabled = false;
      rebuild(timeEl, n, dateEl.value, min, firstYmd);
    });
  }

  function bind() {
    ['1', '2', '3'].forEach(function (n) {
      var dateEl = document.querySelector('input[name="your-date' + n + '"]');
      if (dateEl) dateEl.addEventListener('change', applyConstraints);
    });
  }

  function init() {
    bind();
    applyConstraints();
    setInterval(applyConstraints, 60 * 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
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
