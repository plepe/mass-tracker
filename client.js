// Code based on https://gist.github.com/martinsik/2031681
$(function() {
  "use strict";

  window.webSocket=window.WebSocket || window.MozWebSocket;

  if(!window.webSocket) {
    alert("Sorry, your browser doesn't support WebSockets!");
    return;
  }

  var connection=new WebSocket("ws://192.168.0.13:6777");

  connection.onopen=function() {
    alert("onopen called");

    connection.send("Test message");
  }

  connection.onmessage=function(message) {
    alert("message received: "+message.data);
  }
});
