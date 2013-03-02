function Event(event_id, client) {
  this.client=client;
  this.client.set_event(this);
  this.event_id=event_id;
  this.ready=false;

  this.messages=new Messages();
}

Event.prototype.receive_message=function(message, client, callback) {
  if(message.type=='response') {
    for(var i=0; i<message.data.length; i++) {
      this.messages.message_received(message.data[i]);
    }
  }
  else {
    this.messages.message_received(message);

    hooks.call("message_received", message, this);
  }

  hooks.call("messages_received", this);
}

Event.prototype.send=function(data, type) {
  return this.client.send(data, type);
}

Event.prototype.set_ready=function() {
  this.ready=true;

  this.client.request({ request: "all" });
}
