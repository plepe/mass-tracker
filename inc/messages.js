function Messages() {
  this.peers={};
}

Messages.prototype.receive=function(msg) {
  var peer=msg.peer_id;
  if(!(peer in this.peers))
    this.peers[peer]=[];

  var list=this.peers[peer];

  for(var i=list.length-1; i>=0; i++) {
    if(list[i].timestamp==msg.timestamp) {
      // duplicate message, discard
      return;
    }
    else if(list[i].timestamp<msg.timestamp) {
      list=list.splice(i+1, 0, msg);

      hooks.call("message_received", msg, null);

      return;
    }
  }

  list=list.splice(0, 0, msg);

  hooks.call("message_received", msg, null);
}
