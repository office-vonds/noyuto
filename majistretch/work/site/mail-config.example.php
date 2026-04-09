<?php
// ===== SMTP設定（Google Workspace） =====
// このファイルを mail-config.php にリネームして使用すること
// mail-config.php は .gitignore で除外済み
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'info@majistretch.com');
define('SMTP_PASS', 'ここにアプリパスワードを入力');
define('SMTP_FROM_EMAIL', 'info@majistretch.com');
define('SMTP_FROM_NAME', 'ストレッチゼロ');
define('MAIL_TO_SHOP', 'info@majistretch.com');
define('MAIL_TO_FORWARD', 'yuki.nakagomi@sanken-gr.com');
