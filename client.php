<?php
require "conf.php";
?>
<!DOCTYPE HTML>
<html>
<head>
<script type='text/javascript' src='modules/base/modules/hooks/hooks.js'></script>
<script type='text/javascript' src='lib/jquery.js'></script>
<script type='text/javascript' src='inc/client-client.js'></script>
<script type='text/javascript' src='inc/connection-client.js'></script>
<script type='text/javascript' src='inc/event-client.js'></script>
<script type='text/javascript' src='inc/messages-client.js'></script>
<script type='text/javascript' src='inc/serverdate.js'></script>
<script type='text/javascript' src='client.js'></script>
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

hooks.register("message_received", function(msg, peer) {
  var block=document.getElementById("messages");
  var div=document.createElement("div");
  div.appendChild(document.createTextNode(JSON.stringify(msg, null, '  ')));
  div.timestamp=msg.timestamp;

  var current=block.firstChild;
  while(current) {
    if((typeof(current.timestamp)!="undefined")&&
       (msg.timestamp>current.timestamp)) {
      block.insertBefore(div, current);
      return;
    }

    current=current.nextSibling;
  }

  block.appendChild(div);
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
