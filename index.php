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
    <?php print modulekit_include_js(); /* prints all js-includes */ ?>
    <?php print modulekit_include_css(); /* prints all css-includes */ ?>
    <?php print_add_html_headers(); ?>
  </head>
  <body>
<?
function show_block($res, $title) {
//  if(!$res->numRows())  TODO: there is no numRows() in SQLite3
//    return "";

  $ret="";
  $ret.="<h2>$title</h2>\n";

  $ret.="<ul>\n";
  while($elem=$res->fetchArray(SQLITE3_ASSOC)) {
    $ev=new mass_event($elem['event_id']);
    $ret.="<li>{$ev->index_info()}</li>\n";
  }
  $ret.="</ul>\n";

  return $ret;
}

$res=$db->query("select * from mass_event where begin_time<=datetime('now') and end_time>datetime('now') order by begin_time asc");
print show_block($res, "Aktuelle Ereignisse");

$res=$db->query("select * from mass_event where begin_time>datetime('now') order by begin_time asc limit 10");
print show_block($res, "Kommende Ereignisse");

$res=$db->query("select * from mass_event where end_time<=datetime('now') order by end_time desc limit 10");
print show_block($res, "Letzte Ereignisse");

print "<a href='event_edit.php'>Neues Ereignis anlegen</a>\n";

?>
  </body>
</html>
