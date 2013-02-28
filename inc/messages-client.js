function Messages() {
  this.clients={};
}

Messages.prototype.message_received=function(message) {
  var client_id=message.client_id;
  if(!(client_id in this.clients))
    this.clients[client_id]=[];

  var list=this.clients[client_id];

  for(var i=list.length-1; i>=0; i++) {
    if(list[i].timestamp==message.timestamp) {
      // duplicate message, discard
      return;
    }
    else if(list[i].timestamp<message.timestamp) {
      list=list.splice(i+1, 0, message);

      return;
    }
  }

  list=list.splice(0, 0, message);
}
