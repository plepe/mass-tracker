<?php
require "conf.php";
?>
<!DOCTYPE HTML>
<html>
<head>
<script type='text/javascript' src='modules/base/modules/hooks/hooks.js'></script>
<script type='text/javascript' src='lib/jquery.js'></script>
<script type='text/javascript' src='client.js'></script>
<script type='text/javascript' src='inc/messages.js'></script>
<script type='text/javascript'>
var connection=new Connection("<?=$websocket_url?>");
function client_send(data, type) {
  if(!type)
    type='chat';

  connection.send(data, type);
}

function client_connect() {
  connection.connect();
}

function client_disconnect() {
  connection.disconnect();
}

hooks.register("message_received", function(msg, peer) {
  var block=document.getElementById("messages");
  var div=document.createElement("div");
  div.appendChild(document.createTextNode(JSON.stringify(msg, null, '  ')));

  if(block.firstChild)
    block.insertBefore(div, block.firstChild)
  else
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
