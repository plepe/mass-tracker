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
  this.max_msg_num=null;
  this.messages=new Messages();

  this.connection.onopen=function() {
    alert("onopen called");

    this.send("Test message");
  }

  this.connection.onmessage=function(message) {
    var param=JSON.parse(message.data);

    if(param.ack) {
      for(var i=0; i<this.to_send.length; i++) {
	if(this.to_send[i].timestamp==param.ack) {

	  this.to_send[i].msg_num=param.msg_num;
	  if('data' in param)
	    this.to_send[i].data=param.data;

	  this.to_send.splice(i, 1);
	  break;
	}
      }
    }
    else {
      alert("message received:\n"+JSON.stringify(param, null, "  "));
    }

    this.messages.receive(param);

    if(param.msg_num>this.max_msg_num) {
      this.max_msg_num=param.msg_num;
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
