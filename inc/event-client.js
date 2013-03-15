function Event(event_id, client) {
  this.client=client;
  this.client.set_event(this);
  this.event_id=event_id;
  this.ready=false;
  this._data={};
  // TODO: receive data from server? e.g. from messsages
  if(event_data)
    this._data=event_data;

  this.messages=new Messages();
  this.participants=new Participants(this);
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

Event.prototype.get_date=function(k) {
  var value=this.data(k);

  var datetime=value.match(/^([0-9]{4}-[0-9]{2}-[0-9]{2}) ([0-9]{2}:[0-9]{2}:[0-9]{2})/);
//  var timezone=this.data("timezone")/60.0;
//  timezone=(timezone<0?"-":"+")+zeroPad(Math.floor(Math.abs(timezone)), 2)+":"+zeroPad((timezone-Math.floor(timezone))*60, 2);
  var timezone="Z";
  var datetime=datetime[1]+"T"+datetime[2]+timezone;

  var x=new Date(datetime);
  return x;
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

  var param={ request: "all" };

  if(this.client.max_received)
    param.min_received=this.client.max_received;

  this.client.request(param);
}
