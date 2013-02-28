function Event(event_id) {
  this.clients={};

  this.messages=new Messages();
}

Event.prototype.add_client=function(client) {
  this.clients[client.client_id]=client;
  client.set_event(this);
}

Event.prototype.remove_client=function(client) {
  delete(this.clients[client.client_id]);
}

Event.prototype.receive_message=function(message, client, callback) {
  this.messages.message_received(message);

  hooks.call("message_received", message);
}
