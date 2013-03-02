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
  if(!param)
    param={ };

  var result=this.db();

  if(param.type)
    result=result.filter({ type: param.type });
  if(param.min_received)
    result=result.filter({ received: {">": param.min_received}});
  if(param.max_received)
    result=result.filter({ received: {"<=": param.max_received}});
  if(param.min_timestamp)
    result=result.filter({ timestamp: {">": param.min_timestamp}});
  if(param.max_timestamp)
    result=result.filter({ timestamp: {"<=": param.max_timestamp}});
  result=result.order("timestamp");

  if(callback)
    callback(result.get());

  return result.get();
}
