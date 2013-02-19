// Code based on https://gist.github.com/martinsik/2031681
function Connection(url) {
  "use strict";

  window.webSocket=window.WebSocket || window.MozWebSocket;

  if(!window.webSocket) {
    alert("Sorry, your browser doesn't support WebSockets!");
    return;
  }

  this.connection=new WebSocket(url);

  this.connection.onopen=function() {
    alert("onopen called");

    connection.send("Test message");
  }

  this.connection.onmessage=function(message) {
    alert("message received: "+message.data);
  }
}

Connection.prototype.send=function(data) {
  this.connection.send(JSON.stringify(data));
}
