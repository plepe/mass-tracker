<?php
include "conf.php";
include "modulekit/loader.php"; /* loads all php-includes */
Header("Content-Type: text/html; charset=utf-8");
session_start();

?>
<html>
  <head>
    <script type='text/javascript'>
    // calculate client time offset
    var client_time_offset=(new Date().getTime())-<?=time()?>*1000;
    </script>
    <title><?=$title?></title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link id='layout_css' rel='stylesheet' href='inc/layout_dummy.css' type='text/css' />
<script type='text/javascript' src='lib/php.default.min.js'></script>
<script type='text/javascript' src='lib/OpenLayers/OpenLayers.js'></script>
    <?php print modulekit_include_js(); /* prints all js-includes */ ?>
    <?php print modulekit_include_css(); /* prints all css-includes */ ?>
  </head>
  <body>

<?
$event=new mass_event($_REQUEST['id']);
print "<script type='text/javascript'>\n";
print "var current_event=new mass_event({$_REQUEST['id']}, ".json_encode($event->data).");\n";
print "</script>\n";

if(isset($_REQUEST['participate'])) {
  $_SESSION['event_id']=$_REQUEST['id'];
}
if(isset($_REQUEST['checkout'])) {
  unset($_SESSION['event_id']);
}

?>
<div id='map'>
  <div id='nav'>
    <div id='nav_zoomin' onClick='nav_zoomin()'>+</div>
    <div id='nav_zoomout' onClick='nav_zoomout()'>-</div>
  </div>
</div>
<div id='content_container'>

<div id='content'>
<div id='title'><?=$event->data['name']?></div>

<div id='displays' class='displays'></div>
<div id='status'>
<?

$may_edit=false;
if($event->data['status']=="current") {
  $may_edit=true;
}
elseif($event->data['status']=="coming_up") {
  $may_edit=true;
}

print "<div id='event_ui_form'></div>\n";
print "<div id='navigation'>\n";
print "<a href='.'>Index</a>\n";
if($may_edit) {
  print "<a href='event_edit.php?id={$event->id}'>Bearbeiten</a>\n";
}
print "<a href='gpx.php?id={$event->id}'>Download as GPX</a>\n";
print "</div>\n";

?>
</div>  <!-- #container -->
</div>  <!-- #content_container -->
  </body>
</html>
