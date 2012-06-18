<?php include "modulekit/loader.php"; /* loads all php-includes */
session_start();

?>
<html>
  <head>
    <title>Where is ...</title>
<script type='text/javascript' src='lib/php.default.min.js'></script>
<script type='text/javascript' src='lib/OpenLayers.js'></script>
    <?php print modulekit_include_js(); /* prints all js-includes */ ?>
    <?php print modulekit_include_css(); /* prints all css-includes */ ?>
  </head>
  <body>

<?
$event=new event($_REQUEST['id']);

if($_REQUEST['participate']) {
  $_SESSION['event_id']=$_REQUEST['id'];
}
if($_REQUEST['checkout']) {
  unset($_SESSION['event_id']);
}

print "<h1>{$event->data['name']}</h1>\n";
?>
<div id='map' style='width: 500px; height: 400px;'></div>
<div id='time'></div>
<div id='status'>
<?

if($event->data['status']=="current") {
  print "<form method='post'>\n";
  if($_SESSION['event_id']==$event->id) {
    print "<input type='submit' name='checkout' value='Von Ereignis abmelden'>\n";
  }
  elseif(isset($_SESSION['event_id'])) {
    print "Sie nehmen bereits an einem anderen Ereignis teil.\n";
  }
  else {
    print "<input type='submit' name='participate' value='An Ereignis teilnehmen'>\n";
  }
  print "</form>\n";
}
elseif($event->data['status']=="coming_up") {
  print "Das Ereignis startet erst.";
}
elseif($event->data['status']=="past") {
  print "Das Ereignis ist bereits Geschichte.";
}

?>
  </body>
</html>
