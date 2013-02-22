// Code based on https://gist.github.com/martinsik/2031681
function Connection(url) {
  "use strict";

  window.webSocket=window.WebSocket || window.MozWebSocket;

  if(!window.webSocket) {
    alert("Sorry, your browser doesn't support WebSockets!");
    return;
  }

  this.url=url;
  this.to_send=[];
  this.max_msg_num=null;
  this.messages=new Messages();
  this.connect();
}

Connection.prototype.connect=function() {
  this.keep_closed=false;
  this.connection=new WebSocket(this.url);

  this.connection.onerror=function(error) {
    alert("Sorry, but there's some problem with your connection or the server is down.");
  }.bind(this);

  this.connection.onclose=function() {
    if(typeof(this.disconnect_msg_num)=="undefined")
      this.disconnect_msg_num=this.max_msg_num;

    if(!this.keep_closed) {
      alert("Connection to server closed. Something wrong? Trying to reconnect.");
      this.connect();
    }
  }.bind(this);

  this.connection.onopen=function() {
    this.conf=this.get_cookie("mass_tracker");

    var msg={
      client_id: this.conf.client_id
    };

    this.send_raw({ type: 'hello', data: { client_id: this.conf.client_id }});
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
      hooks.call("message_received", param, null);

      if(param.type=='welcome') {
	this.peer_id=param.peer_id;
	this.client_id=param.data.client_id;

	this.conf.client_id=this.client_id;
	this.set_cookie('mass_tracker', this.conf);

	// Request missed messages
	var newmsg={
	  request: 'all'
	};
	if(this.disconnect_msg_num)
	  newmsg.min_msg_num=this.disconnect_msg_num;

	this.send_raw(newmsg);

	// Re-send queued messages
	for(var i=0; i<this.to_send.length; i++) {
	  this.to_send[i].resend=true;

	  this.send_raw(this.to_send[i]);
	}
      }
    }

    this.messages.receive(param);

    if(param.msg_num>this.max_msg_num) {
      this.max_msg_num=param.msg_num;
    }

  }.bind(this);
}

Connection.prototype.disconnect=function() {
  this.keep_closed=true;
  this.connection.close();
}

Connection.prototype.send=function(data, type) {
  var param={
    timestamp: new Date().toISOString(),
    type: type,
    data: data
  };

  this.to_send.push(param);
  this.send_raw(param);

  hooks.call("message_received", param, null);
}

Connection.prototype.send_raw=function(param) {
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
