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
  this.max_received=null;
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
    if(typeof(this.disconnect_received)=="undefined")
      this.disconnect_received=this.max_received;

    if(!this.keep_closed) {
      alert("Connection to server closed. Something wrong? Trying to reconnect.");
      this.connect();
    }
  }.bind(this);

  this.connection.onopen=function() {
    this.conf=this.get_cookie("mass_tracker");
    this.conf.event_id='foobar'; // get event_id from parameter or so

    var msg={
      client_id: this.conf.client_id,
      event_id: this.conf.event_id
    };

    this.send_raw({ type: 'hello', data: msg });
  }.bind(this);

  this.connection.onmessage=function(message) {
    var param=JSON.parse(message.data);
    console.log('RECEIVE');
    console.log(param);

    if(param.ack) {
      for(var i=0; i<this.to_send.length; i++) {
	if(this.to_send[i].timestamp==param.ack) {

	  this.to_send[i].received=param.received;
	  if('data' in param)
	    this.to_send[i].data=param.data;

	  this.to_send.splice(i, 1);
	  break;
	}
      }
    }
    else {
      if(param.type=='welcome') {
	this.peer_id=param.peer_id;
	this.client_id=param.data.client_id;

	this.conf.client_id=this.client_id;
	this.set_cookie('mass_tracker', this.conf);

	// Request missed messages
	var newmsg={
	  request: 'all'
	};
	if(this.disconnect_received)
	  newmsg.min_received=this.disconnect_received;

	this.send_raw(newmsg);

	// Re-send queued messages
	for(var i=0; i<this.to_send.length; i++) {
	  this.to_send[i].resend=true;

	  this.send_raw(this.to_send[i]);
	}
      }
    }

    this.messages.receive(param);

    if(param.received>this.max_received) {
      this.max_received=param.received;
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

  param.peer_id=this.peer_id;
  this.messages.receive(param);
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
