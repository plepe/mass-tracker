<?php
require "conf.php";
?>
<!DOCTYPE HTML>
<html>
<head>
<script type='text/javascript' src='lib/jquery.js'></script>
<script type='text/javascript' src='client.js'></script>
<script type='text/javascript'>
var connection=new Connection("<?=$websocket_url?>");
function client_send(text) {
  connection.send({ msg: text });
}
</script>
</head>
<body>
<input type='button' onclick='client_send("foobar")' value='send'>
</body>
</html>
