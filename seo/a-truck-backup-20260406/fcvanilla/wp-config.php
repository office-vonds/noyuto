<?php
/**
 * WordPress の基本設定
 *
 * このファイルは、インストール時に wp-config.php 作成ウィザードが利用します。
 * ウィザードを介さずにこのファイルを "wp-config.php" という名前でコピーして
 * 直接編集して値を入力してもかまいません。
 *
 * このファイルは、以下の設定を含みます。
 *
 * * MySQL 設定
 * * 秘密鍵
 * * データベーステーブル接頭辞
 * * ABSPATH
 *
 * @link http://wpdocs.osdn.jp/wp-config.php_%E3%81%AE%E7%B7%A8%E9%9B%86
 *
 * @package WordPress
 */

// 注意:
// Windows の "メモ帳" でこのファイルを編集しないでください !
// 問題なく使えるテキストエディタ
// (http://wpdocs.osdn.jp/%E7%94%A8%E8%AA%9E%E9%9B%86#.E3.83.86.E3.82.AD.E3.82.B9.E3.83.88.E3.82.A8.E3.83.87.E3.82.A3.E3.82.BF 参照)
// を使用し、必ず UTF-8 の BOM なし (UTF-8N) で保存してください。

// ** MySQL 設定 - この情報はホスティング先から入手してください。 ** //
/** WordPress のためのデータベース名 */
define('DB_NAME', 'jhuv52pz_wphp');

/** MySQL データベースのユーザー名 */
define('DB_USER', 'atruck_db_user');

/** MySQL データベースのパスワード */
define('DB_PASSWORD', '5fj71@eF');

/** MySQL のホスト名 */
define('DB_HOST', 'localhost');

/** データベースのテーブルを作成する際のデータベースの文字セット */
define('DB_CHARSET', 'utf8');

/** データベースの照合順序 (ほとんどの場合変更する必要はありません) */
define('DB_COLLATE', '');

/**#@+
 * 認証用ユニークキー
 *
 * それぞれを異なるユニーク (一意) な文字列に変更してください。
 * {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org の秘密鍵サービス} で自動生成することもできます。
 * 後でいつでも変更して、既存のすべての cookie を無効にできます。これにより、すべてのユーザーを強制的に再ログインさせることになります。
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'z6I>nFxEtp+.OKY= )1n=o;ysQ)K.?|)yo|O(kA*&tqr%xKRkV|Z#PlIK9U4#Q<%');
define('SECURE_AUTH_KEY',  'UF&$EF7{3+FN|-}>yXp1!_rTB&(!-TkPpc#{lU,M8x$*S{/Z;(@7MWWzo]<Mde-&');
define('LOGGED_IN_KEY',    'I@[w.x>M(.f0>]yKL+z]JTbB$DN$ZwNrcx9lZK}S@#q _~#pFcieG$^c#)jtA%-w');
define('NONCE_KEY',        'At[WbLy):y|8WC6cK/6KY`|!rk]SA@{N^0G0Gmp8EcZgX4A|DC5eS{h)l[ZA k-P');
define('AUTH_SALT',        'k<hkeXDA[aU}AF%0P52h/ihg)J}x:v_wxZW6~z9Z*_gu54?~Pnp+-z{Lg_zH3 ?e');
define('SECURE_AUTH_SALT', 'el1W$@C$$]8eQ?hATQ.4A[P5@+tEy9fjleMCUe0l%s4QIOoZ/v7-GZ|T=C.t.4wu');
define('LOGGED_IN_SALT',   'JB$mFWP|G)5->pdcK bTc[AOqbz=Ltgb/wR0L|BR}[-#-iU8K./*Nd:+<eRsq6|+');
define('NONCE_SALT',       '{ h-iYw+&ThLz+B+D}t()HHtHhvPrfcb@WPJaE[d+&g,5bvP7@VX89A+k9Sk^`<s');

/**#@-*/

/**
 * WordPress データベーステーブルの接頭辞
 *
 * それぞれにユニーク (一意) な接頭辞を与えることで一つのデータベースに複数の WordPress を
 * インストールすることができます。半角英数字と下線のみを使用してください。
 */
$table_prefix = 'wp_';

/**
 * 開発者へ: WordPress デバッグモード
 *
 * この値を true にすると、開発中に注意 (notice) を表示します。
 * テーマおよびプラグインの開発者には、その開発環境においてこの WP_DEBUG を使用することを強く推奨します。
 *
 * その他のデバッグに利用できる定数については Codex をご覧ください。
 *
 * @link http://wpdocs.osdn.jp/WordPress%E3%81%A7%E3%81%AE%E3%83%87%E3%83%90%E3%83%83%E3%82%B0
 */
define('WP_DEBUG', true);
define ('WPCF7_AUTOP', false);

/* 編集が必要なのはここまでです ! WordPress でのパブリッシングをお楽しみください。 */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');

