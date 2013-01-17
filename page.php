<?php
include "conf.php";
include "modulekit/loader.php"; /* loads all php-includes */
Header("Content-Type: text/html; charset=utf-8");
session_start();
call_hooks("init");

?>
<html>
  <head>
    <title><?=$title?></title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script type='text/javascript' src='lib/php.default.min.js'></script>
    <?php print modulekit_to_javascript(); /* pass modulekit configuration to JavaScript */ ?>
    <?php print modulekit_include_js(); /* prints all js-includes */ ?>
    <?php print modulekit_include_css(); /* prints all css-includes */ ?>
    <?php print_add_html_headers(); ?>
  </head>
  <body>
<?php 
if($_REQUEST['page']) {
  print call_user_func("page_{$_REQUEST['page']}", $_REQUEST);
}
?>
