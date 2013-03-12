// Code based on https://gist.github.com/martinsik/2031681
function connection_init() {
  "use strict";

  window.webSocket=window.WebSocket || window.MozWebSocket;

  if(!window.webSocket) {
    alert("Sorry, your browser doesn't support WebSockets!");
    return;
  }
}

function Connection(url, client) {
  this.to_send=[];
  this.send_callbacks={};
  this.url=url;
  this.client=client;
}

Connection.prototype.connect=function(callback) {
  this.keep_closed=false;
  this.websocket=new WebSocket(this.url);

  this.websocket.onerror=function(error) {
    notification("Sorry, but there's some problem with your connection or the server is down.", NOTIFICATION_ERROR);
  }.bind(this);

  this.websocket.onclose=function() {
    if(typeof(this.disconnect_received)=="undefined")
      this.disconnect_received=this.max_received;

    if(!this.keep_closed) {
      notification("Connection to server closed. Something wrong? Trying to reconnect in 10s.", NOTIFICATION_WARNING);
      setTimeout(this.connect.bind(this), 10000);
    }
  }.bind(this);

  this.websocket.onopen=function() {
    callback();
  };

  this.websocket.onmessage=function(message) {
    try {
      var message=JSON.parse(message.data);
    }
    catch(e) {
      alert("Invalid message received:\n"+message.data);
      return;
    }

    if(((typeof message) != "object")||(!message.type)) {
      alert("Invalid message received:\n"+message.data);
      return;
    }

    console.log('RECEIVE');
    console.log(message);

    switch(message.type) {
      case 'ack':
	for(var i=0; i<this.to_send.length; i++) {
	  if(this.to_send[i].timestamp==message.timestamp) {

	    this.to_send[i].received=message.received;
	    if('data' in message)
	      this.to_send[i].data=message.data;

	    var orig_message=this.to_send[i];
	    this.to_send.splice(i, 1);

	    if(this.send_callbacks[message.timestamp]) {
	      var callback=this.send_callbacks[message.timestamp];
	      delete(this.send_callbacks[message.timestamp]);

	      callback(
	        typeof orig_message.data=="undefined"?null:orig_message.data,
		orig_message
	      );
	    }

	    break;
	  }
	}
	break;
      default:
        this.client.receive_message(message);

	if(message.received>this.max_received) {
	  this.max_received=message.received;
	}

	break;
    }

  }.bind(this);
}

Connection.prototype.re_send=function() {
  // Re-send queued messages
  for(var i=0; i<this.to_send.length; i++) {
    this.to_send[i].resend=true;

    this.send_raw(this.to_send[i]);
  }
}

Connection.prototype.disconnect=function() {
  this.keep_closed=true;
  this.websocket.close();
}

Connection.prototype.send_queued=function(message, callback) {
  this.to_send.push(message);

  if(callback&&message.timestamp) {
    this.send_callbacks[message.timestamp]=callback;
  }

  this.send_raw(message);
}

Connection.prototype.send_raw=function(message) {
  console.log('SEND');
  console.log(message);

  this.websocket.send(JSON.stringify(message));
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
