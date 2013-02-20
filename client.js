// Code based on https://gist.github.com/martinsik/2031681
function Connection(url) {
  "use strict";

  window.webSocket=window.WebSocket || window.MozWebSocket;

  if(!window.webSocket) {
    alert("Sorry, your browser doesn't support WebSockets!");
    return;
  }

  this.connection=new WebSocket(url);
  this.to_send=[];

  this.connection.onopen=function() {
    alert("onopen called");

    this.send("Test message");
  }

  this.connection.onmessage=function(message) {
    var data=JSON.parse(message.data);

    if(data.ack) {
      for(var i=0; i<this.to_send.length; i++) {
	if(this.to_send[i].timestamp==data.ack) {
          console.log('success');
	  this.to_send.splice(i, 1);
	  return;
	}
      }
    }
    else {
      alert("message received:\n"+JSON.stringify(data, null, "  "));
    }

  }.bind(this);
}

Connection.prototype.send=function(data, type) {
  var param={
    timestamp: new Date().toISOString(),
    type: type,
    data: data
  };

  this.to_send.push(param);

  this.connection.send(JSON.stringify(param));
}

Connection.prototype.check_to_send=function() {
}
