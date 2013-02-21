<?php
require "conf.php";
?>
<!DOCTYPE HTML>
<html>
<head>
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
</script>
</head>
<body>
<input type='button' onclick='client_send({msg: "foobar"})' value='send'>
<input type='button' onclick='client_send({}, "disconnect")' value='disconnect'>
</body>
</html>
