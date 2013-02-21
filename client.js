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
    this.conf=this.get_cookie("mass_tracker");

    var msg={
      client_id: this.conf.client_id
    };

    this.send(msg, 'hello');
  }.bind(this);

  this.connection.onmessage=function(message) {
    var param=JSON.parse(message.data);
    console.log('RECEIVE');
    console.log(param);

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

      if(param.type=='welcome') {
	this.peer_id=param.peer_id;
	this.client_id=param.data.client_id;

	this.conf.client_id=this.client_id;
	this.set_cookie('mass_tracker', this.conf);
      }
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

  console.log('SEND');
  console.log(param);
  this.connection.send(JSON.stringify(param));
}

Connection.prototype.check_to_send=function() {
}

Connection.prototype.get_cookie=function(k) {
  if(document.cookie) {
    var cookies=document.cookie.split(/;/);

    for(var i=0; i<cookies.length; i++) {
      var m;

      if(m=cookies[i].match(/ *([A-Za-z0-9_]+)=(.*)$/)) {
	if(m[1]==k)
	  return JSON.parse(m[2]);
      }
    }
  }

  return {};
}

Connection.prototype.set_cookie=function(key, value) {
  var expiry=new Date();
  expiry.setTime(expiry.getTime()+365*86400000);

  document.cookie=key+"="+JSON.stringify(value)+"; expires="+expiry.toGMTString()+"; path=/";
}
