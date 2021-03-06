<?php
include "conf.php";
include "modulekit/loader.php"; /* loads all php-includes */
Header("Content-Type: text/html; charset=utf-8");
session_start();
call_hooks("init");
$body="";

$form_def=array(
  'name'	=>array(
    'type'	=>"text",
    'name'	=>"Name",
    'req'	=>true,
  ),
  'description'	=>array(
    'type'	=>"textarea",
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
  'timezone'	=>array(
    'type'	=>"text",
    'name'	=>"Zeitzone (Minuten)",
  ),
  'begin_longitude'	=>array(
    'type'	=>"text",
    'name'	=>"Longitude Beginnort",
  ),
  'begin_latitude'	=>array(
    'type'	=>"text",
    'name'	=>"Latitude Beginnort",
  ),
  'begin_zoom'	=>array(
    'type'	=>"integer",
    'name'	=>"Default Zoom",
    'default'	=>16,
  ),
);

if(isset($_REQUEST['id'])) {
  $event=new mass_event($_REQUEST['id']);
  $body.="<h1>Ereignis bearbeiten</h1>\n";
}
else
  $body.="<h1>Neues Ereignis anlegen</h1>\n";

$form=new form("data", $form_def);

if($form->errors()) {
  // $body.=errors
  $body.="Im Formular gibt es Fehler:";
  $body.=$form->show_errors();
}

if($form->is_complete()) {
  $data=$form->get_data();

  $set=array();
  $var=array();

  if((!isset($_REQUEST['id']))||(!$_REQUEST['id'])) {
    $id=uniq_id();
    $event=new mass_event($id);
  }
  else {
    $event=get_event($_REQUEST['id']);
    if(!$event) {
      print "No such event!";
    }
  }

  $event->save($data);

  Header("Location: event.php?id={$event->id}");
}

if($form->is_empty()) {
  if(isset($event)) {
    $data=$event->data;

    foreach(array("begin_time", "end_time") as $k) {
      $d=new DateTime($data[$k]);
      if($data['timezone']>0)
	$d->sub(new DateInterval("PT{$data['timezone']}M"));
      else {
	$t=-$data['timezone'];
	$d->add(new DateInterval("PT{$t}M"));
      }

      $data[$k]=$d->format("Y-m-d H:i:00");
    }
  }
  else {
    $data=array(
      'begin_time'=>Date("Y-m-d H:i"),
      'end_time'=>Date("Y-m-d H:i", time()+7200),
    );
  }

  $form->set_data($data);
}

$body.="<form enctype='multipart/form-data' method='post'>\n";
$body.=$form->show();
$body.="<input type='submit' value='Ok'>\n";
$body.="</form>\n";

$body.="<p><a href='.'>Index</a>\n";
if(isset($event)) {
  $body.="<a href='event.php?id={$event->id}'>Zurück</a>\n";
}

?>
<html>
  <head>
    <title><?=$title?></title>
<script type='text/javascript' src='lib/php.default.min.js'></script>
    <?php print modulekit_include_js(); /* prints all js-includes */ ?>
    <?php print modulekit_include_css(); /* prints all css-includes */ ?>
    <?php print_add_html_headers(); ?>
  </head>
  <body>
<?
print $body;
?>
  </body>
</html>
