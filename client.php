<?php
require "conf.php";
?>
<!DOCTYPE HTML>
<html>
<head>
<link id='layout_css' rel='stylesheet' href='style.css' type='text/css' />
<script type='text/javascript' src='modules/base/modules/hooks/hooks.js'></script>
<script type='text/javascript' src='lib/jquery.js'></script>
<script type='text/javascript' src='inc/client-client.js'></script>
<script type='text/javascript' src='inc/connection-client.js'></script>
<script type='text/javascript' src='inc/event-client.js'></script>
<script type='text/javascript' src='lib/taffy-min.js'></script>
<script type='text/javascript' src='inc/messages-taffy.js'></script>
<script type='text/javascript' src='inc/serverdate.js'></script>
<script type='text/javascript' src='inc/gps-client.js'></script>
<script type='text/javascript' src='client.js'></script>

<script type='text/javascript' src='inc/frontend.js'></script>
<script type='text/javascript' src='inc/map-frontend.js'></script>
<script type='text/javascript' src='inc/gps-frontend.js'></script>
<script type='text/javascript' src='inc/participants-frontend.js'></script>

<script type='text/javascript' src='lib/OpenLayers/OpenLayers.js'></script>

<script type='text/javascript'>
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
<div id='messages'></div>
</body>
</html>
