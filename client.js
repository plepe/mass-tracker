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

    this.send("Test message");
  }

  this.connection.onmessage=function(message) {
    var data=JSON.parse(message.data);

    alert("message received:\n"+JSON.stringify(data, null, "  "));
    console.log(message);
  }
}

Connection.prototype.send=function(data, type) {
  var param={
    timestamp: new Date().toISOString(),
    type: type,
    data: data
  };

  this.connection.send(JSON.stringify(param));
}
