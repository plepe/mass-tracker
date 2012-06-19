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
$form_def=array(
  'name'	=>array(
    'type'	=>"text",
    'name'	=>"Name",
  ),
  'description'	=>array(
    'type'	=>"text",
    'name'	=>"Beschreibung",
  ),
  'begin_time'	=>array(
    'type'	=>"text",
    'name'	=>"Beginnzeit",
  ),
  'end_time'	=>array(
    'type'	=>"text",
    'name'	=>"Endezeit",
  ),
);

if(isset($_REQUEST['id'])) {
  $event=new event($_REQUEST['id']);
  print "<h1>Ereignis bearbeiten</h1>\n";
}
else
  print "<h1>Neues Ereignis anlegen</h1>\n";

$form=new form("data", $form_def);

if($form->errors()) {
  // print errors
  print "Errors in the form were found:";
  print $form->show_errors();
}

if($form->is_complete()) {
  $data=$form->get_data();

  $set=array();
  $var=array();
  
  if($_REQUEST['id']) {
    $var[]="\"event_id\"";
    $set[]="'".sqlite_escape_string($_REQUEST['id'])."'";
  }

  foreach(array("name", "description", "begin_time", "end_time") as $k) {
    $var[]="\"$k\"";
    $set[]="'".sqlite_escape_string($data[$k])."'";
  }
  $set=implode(", ", $set);
  $var=implode(", ", $var);

  sqlite_query($db, "insert or replace into event ($var) values ($set)");
}

if($form->is_empty()) {
  if(isset($event))
    $form->set_data($event->data);
  else {
    $d=array(
      'begin_time'=>Date("Y-m-d H:i"),
      'end_time'=>Date("Y-m-d H:i", time()+7200),
    );

    $form->set_data($d);
  }
}

print "<form enctype='multipart/form-data' method='post'>\n";
print $form->show();
print "<input type='submit' value='Ok'>\n";
print "</form>\n";

?>
  </body>
</html>
