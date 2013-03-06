function Participants() {
  this.list={};

  hooks.register("message_received", this.message_received.bind(this), this);
}

Participants.prototype.message_received=function(message) {
  if(message.type=="tracker_start") {
    if(typeof this.list[message.client_id])
      this.list[message.client_id]=new Participant(message.client_id);

    this.list[message.client_id].update(message);
  }
}

Participants.prototype.get=function(id) {
  return this.list[id];
}

function Participant(id) {
  this.id=id;

  this._data={};
}

Participant.prototype.data=function() {
  return this._data;
}

Participant.prototype.update=function(message) {
  this._data=message.data;
}
