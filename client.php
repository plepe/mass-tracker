<?php
require "conf.php";
include "modulekit/loader.php"; /* loads all php-includes */
Header("Content-Type: text/html; charset=utf-8");
session_start();
call_hooks("init");

if(!isset($_REQUEST['id'])) {
  print "No event id supplied!";
  exit;
}

$event=get_event($_REQUEST['id']);
if(!$event) {
  print "No such event";
  exit;
}

?>
<!DOCTYPE HTML>
<html>
<head>
<link rel='stylesheet' href='style.css' type='text/css' />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link id='layout_css' rel='stylesheet' href='inc/layout_dummy.css' type='text/css' />

<script type='text/javascript' src='lib/php.default.min.js'></script>
<script type='text/javascript' src='lib/OpenLayers/OpenLayers.js'></script>
    <?php print modulekit_include_js(); /* prints all js-includes */ ?>
    <?php print modulekit_include_css(); /* prints all css-includes */ ?>
    <?php print_add_html_headers(); ?>

<script type='text/javascript' src='modules/base/modules/hooks/hooks.js'></script>
<script type='text/javascript' src='inc/client-client.js'></script>
<script type='text/javascript' src='inc/connection-client.js'></script>
<script type='text/javascript' src='inc/event-client.js'></script>
<script type='text/javascript' src='lib/taffy-min.js'></script>
<script type='text/javascript' src='inc/messages-taffy.js'></script>
<script type='text/javascript' src='inc/serverdate.js'></script>
<script type='text/javascript' src='inc/gps-client.js'></script>
<script type='text/javascript' src='inc/participants-client.js'></script>
<script type='text/javascript' src='client.js'></script>

<script type='text/javascript' src='inc/frontend.js'></script>
<script type='text/javascript' src='inc/event-frontend.js'></script>
<script type='text/javascript' src='inc/map-frontend.js'></script>
<script type='text/javascript' src='inc/gps-frontend.js'></script>
<script type='text/javascript' src='inc/tracker-frontend.js'></script>
<script type='text/javascript' src='inc/participants-frontend.js'></script>

<script type='text/javascript' src='lib/OpenLayers/OpenLayers.js'></script>

<script type='text/javascript'>
var event_id="<?=$event->id?>";
var websocket_url="<?=$websocket_url?>";

function client_send(data, type) {
  if(!type)
    type='chat';

  client.send(data, type);
}

function client_connect() {
  client.connect();
}

function client_disconnect() {
  client.disconnect();
}

hooks.register("messages_received", function(msg, peer) {
  var block=document.getElementById("messages");

  var current=block.firstChild;
  while(current) {
    var next=current.nextSibling;
    block.removeChild(current);
    current=next;
  }

  messages=client.event.messages.request();
  for(var i=messages.length-1; i>=0; i--) {
    var div=document.createElement("div");
    var msg=messages[i];

    var str=
      "("+msg.type+") "+msg.client_id+": "+
      JSON.stringify(msg.data, null, ' ');

    div.appendChild(document.createTextNode(str));
    div.timestamp=msg.timestamp;

    block.appendChild(div);
  }
});

</script>
</head>
<body>
<input type='button' onclick='client_send({msg: "foobar"})' value='send'>
<input type='button' onclick='client_connect()' value='connect'>
<input type='button' onclick='client_disconnect()' value='disconnect'>
<div id='map'>
  <div id='nav'>
    <div id='nav_zoomin' onClick='nav_zoomin()'>+</div>
    <div id='nav_zoomout' onClick='nav_zoomout()'>-</div>
  </div>
</div>
<div id='content_container'>

<div id='content'>
<div id='event'><?=$event->data['name']?></div>

<div id='displays' class='displays'></div>
<div id='status'>
<?
$event=get_event($_REQUEST['id']);
if(!$event) {
  print "No such event";
  exit;
}

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

print "<div id='footer'>\n";
print "Mass-Tracker: AGPL 3.0, Stephan Plepelits 2012. Fork me on <a href='http://github.com/plepe/mass-tracker'>GitHub</a>.<br/>\n";
print "Karte: CC-BY-SA 3.0 <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, Rendering: <a href='http://openstreetbrowser.org'>OpenStreetBrowser</a>.\n";
print "</div>\n";
?>
</div>  <!-- #container -->
</div>  <!-- #content_container -->
<div id='messages' style='display: none'></div>
</body>
</html>
