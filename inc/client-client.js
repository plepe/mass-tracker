function Client(websocket_url, conf) {
  this.secret_id=null;
  this.client_id=null;
  this.conf=conf;

  this.connection=new Connection(websocket_url, this);
  
  this.connection.connect(function() {
    this.conf=get_cookie("mass_tracker");

    var data={
      secret_id: this.conf.secret_id,
      event_id: this.event.event_id
    };

    this.connection.send_raw({ type: 'hello', data: data });
    this.connection.send_raw({ type: 'timesync', data: { timestamp: new Date().toISOString() }});

  }.bind(this));
}

Client.prototype.receive_message=function(message, callback) {
  // TODO: check if message has already been received!

  // message can be handled by me
  switch(message.type) {
    case "timesync":
      message.data.receive_back=new Date().toISOString();
      ServerDate.set(message.data);

      callback(message);
      break;
    case "welcome":
      this.client_id=message.client_id;
      this.secret_id=message.data.secret_id;

      this.conf.secret_id=this.secret_id;
      set_cookie('mass_tracker', this.conf);

      this.event.set_ready();

      this.connection.re_send();
      break;
    default:
      if(!this.event) {
	this.receive_queue.push(message);
	return;
      }

      // let event process the message
      this.event.receive_message(message);

      break;
  }
}

Client.prototype.set_event=function(event) {
  this.event=event;
}

Client.prototype.send=function(data, type) {
  var message={
    timestamp: ServerDate().toISOString(),
    type: type,
    data: data
  };

  this.connection.send_queued(message);

  message.client_id=this.client_id;
  this.event.receive_message(message);
}

Client.prototype.request=function(data) {
  var message={
    timestamp: ServerDate().toISOString(),
    type: 'request',
    data: data
  };

  this.connection.send_raw(message);
}
