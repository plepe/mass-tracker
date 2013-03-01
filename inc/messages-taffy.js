function Messages() {
  this.db=TAFFY();
}

Messages.prototype.message_received=function(message) {
  var done=this.db({client_id: message.client_id, timestamp: message.timestamp});

  if(!done.length) {
    this.db.insert(message);
  }
}

Messages.prototype.request=function(param, callback) {
  var result=this.db().get();

  if(callback)
    callback(result);

  return result;
}
