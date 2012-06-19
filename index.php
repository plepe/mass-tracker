<?php include "modulekit/loader.php"; /* loads all php-includes */
Header("Content-Type: text/html; charset=utf-8");
session_start();
?>
<html>
  <head>
    <title>Where is ...</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script type='text/javascript' src='lib/php.default.min.js'></script>
<script type='text/javascript' src='lib/OpenLayers/OpenLayers.js'></script>
    <?php print modulekit_include_js(); /* prints all js-includes */ ?>
    <?php print modulekit_include_css(); /* prints all css-includes */ ?>
  </head>
  <body>
<?
function show_block($res, $title) {
  if(!sqlite_num_rows($res))
    return "";

  $ret="";
  $ret.="<h2>$title</h2>\n";

  $ret.="<ul>\n";
  while($elem=sqlite_fetch_array($res, SQLITE_ASSOC)) {
    $ev=new event($elem['event_id']);
    $ret.="<li>{$ev->index_info()}</li>\n";
  }
  $ret.="</ul>\n";

  return $ret;
}

$res=sqlite_query($db, "select * from event where begin_time<=datetime('now') and end_time>datetime('now') order by begin_time asc");
print show_block($res, "Aktuelle Ereignisse");

$res=sqlite_query($db, "select * from event where begin_time>datetime('now') order by begin_time asc limit 10");
print show_block($res, "Kommende Ereignisse");

$res=sqlite_query($db, "select * from event where end_time<=datetime('now') order by end_time desc limit 10");
print show_block($res, "Letzte Ereignisse");

print "<a href='event_edit.php'>Neues Ereignis anlegen</a>\n";

?>
  </body>
</html>
