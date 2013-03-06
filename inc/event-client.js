function Event(event_id, client) {
  this.client=client;
  this.client.set_event(this);
  this.event_id=event_id;
  this.ready=false;
  this._data={};

  this.messages=new Messages();
  this.participants=new Participants();
}

Event.prototype.data=function(k) {
  if(!k)
    return this._data;

  if(typeof this._data[k]=="undefined")
    return null;

  return this._data[k];
}

Event.prototype.set_data=function(k, v) {
  if(v===null) {
    delete(this._data[k]);
    return null;
  }

  this._data[k]=v;
  return v;
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

Event.prototype.send=function(data, type, callback) {
  return this.client.send(data, type, callback);
}

Event.prototype.set_ready=function() {
  this.ready=true;

  this.client.request({ request: "all" });
}
