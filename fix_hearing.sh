#!/bin/bash
# VONDSヒアリングシート — フォーム送信修正スクリプト
# メインPCで実行: bash ~/noyuto/fix_hearing.sh

set -e

FTP_HOST="sv1092.wpx.ne.jp"
FTP_USER="vonds.co.jp"
FTP_PASS="kiryu0902"
FTP_OPTS="set ftp:ssl-force true; set ssl:verify-certificate false"
WORK_DIR=~/noyuto/hearing_work
HTML_FILE="$WORK_DIR/hearing/index.html"

echo "=========================================="
echo "VONDS ヒアリングシート 送信修正"
echo "=========================================="

cd "$WORK_DIR"

# バックアップ
cp "$HTML_FILE" "$HTML_FILE.bak"
echo "[1/3] バックアップ完了"

# 送信用JavaScriptを </body> の直前に挿入
echo "[2/3] フォーム送信処理を追加中..."

# 既存のsubmit処理があれば削除用のマーカーを探す
# </body>の前にスクリプトを挿入
sed -i '/<\/body>/i \
<!-- VONDS Hearing Form Submit Handler -->\
<script>\
(function() {\
  var submitBtn = document.querySelector(".btn-submit");\
  if (!submitBtn) return;\
  \
  submitBtn.addEventListener("click", function(e) {\
    e.preventDefault();\
    \
    /* 必須フィールドチェック */\
    var requiredFields = document.querySelectorAll("[required]");\
    var allFilled = true;\
    requiredFields.forEach(function(field) {\
      if (!field.value || field.value.trim() === "") {\
        field.style.borderColor = "#e94560";\
        allFilled = false;\
      } else {\
        field.style.borderColor = "";\
      }\
    });\
    \
    if (!allFilled) {\
      alert("必須項目をすべて入力してください。");\
      return;\
    }\
    \
    /* フォームデータ収集 */\
    var form = document.querySelector("form");\
    if (!form) {\
      /* formタグがない場合、全inputを収集 */\
      var inputs = document.querySelectorAll("input, select, textarea");\
      var formData = new FormData();\
      inputs.forEach(function(input) {\
        var name = input.name || input.id || input.placeholder || "";\
        if (name && input.value) {\
          if (input.type === "checkbox") {\
            if (input.checked) formData.append(name, input.value || "on");\
          } else if (input.type === "radio") {\
            if (input.checked) formData.append(name, input.value);\
          } else {\
            formData.append(name, input.value);\
          }\
        }\
      });\
    } else {\
      var formData = new FormData(form);\
    }\
    \
    /* 送信ボタン無効化 */\
    submitBtn.disabled = true;\
    submitBtn.textContent = "送信中...";\
    \
    /* send_hearing.php に送信 */\
    fetch("send_hearing.php", {\
      method: "POST",\
      body: formData\
    })\
    .then(function(response) { return response.json(); })\
    .then(function(data) {\
      if (data.status === "success") {\
        alert("送信が完了しました。\\n確認メールをお送りしましたのでご確認ください。");\
        window.location.href = window.location.href;\
      } else {\
        alert("送信に失敗しました。お手数ですが、お電話（055-269-7220）でご連絡ください。");\
        submitBtn.disabled = false;\
        submitBtn.textContent = "送信する";\
      }\
    })\
    .catch(function(error) {\
      alert("通信エラーが発生しました。お手数ですが、お電話（055-269-7220）でご連絡ください。");\
      submitBtn.disabled = false;\
      submitBtn.textContent = "送信する";\
    });\
  });\
})();\
</script>' "$HTML_FILE"

# info@vonds.co.jp → office.vonds@gmail.com に変更
sed -i 's/info@vonds.co.jp/office.vonds@gmail.com/g' "$HTML_FILE"

echo "  送信処理追加完了"
echo "  メール表記を office.vonds@gmail.com に変更"

# アップロード
echo "[3/3] サーバーにアップロード中..."
lftp -u "$FTP_USER","$FTP_PASS" -e "$FTP_OPTS; mirror -R ./hearing/ hearing/; quit" "$FTP_HOST"

echo ""
echo "=========================================="
echo "完了！"
echo "=========================================="
echo ""
echo "修正内容:"
echo "  1. 送信ボタンにJavaScript送信処理を追加"
echo "  2. フォームデータをsend_hearing.phpに送信"
echo "  3. 必須項目チェック機能"
echo "  4. 送信完了アラート+自動返信メール"
echo "  5. info@vonds.co.jp → office.vonds@gmail.com に変更"
echo ""
echo "テスト: https://vonds.co.jp/hearing/"
echo "送信先: office.vonds@gmail.com"
