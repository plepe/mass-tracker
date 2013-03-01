function Event(event_id, client) {
  this.client=client;
  this.client.set_event(this);
  this.event_id=event_id;
  this.ready=false;

  this.messages=new Messages();
}

Event.prototype.receive_message=function(message, client, callback) {
  this.messages.message_received(message);

  hooks.call("message_received", message);
}

Event.prototype.set_ready=function() {
  this.ready=true;
}
