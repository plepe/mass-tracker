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
$event=new event($_REQUEST['id']);

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
<div id='time'></div>
<div id='status'>
<?

print "<h1>{$event->data['name']}</h1>\n";
$may_edit=false;
if($event->data['status']=="current") {
  print "<form method='post'>\n";
  if(!isset($_SESSION['event_id'])) {
    print "<input type='submit' name='participate' value='An Ereignis teilnehmen'>\n";
  }
  elseif($_SESSION['event_id']==$event->id) {
    print "<input type='submit' name='checkout' value='Von Ereignis abmelden'>\n";
  }
  else {
    print "Sie nehmen bereits an einem anderen Ereignis teil.\n";
  }
  print "</form>\n";
  $may_edit=true;
}
elseif($event->data['status']=="coming_up") {
  print "Das Ereignis startet erst.";
  $may_edit=true;
}
elseif($event->data['status']=="past") {
  print "Das Ereignis ist bereits Geschichte.";
}

print "<p><a href='.'>Index</a>\n";
if($may_edit) {
  print "<a href='event_edit.php?id={$event->id}'>Bearbeiten</a>\n";
}

?>
  </body>
</html>
