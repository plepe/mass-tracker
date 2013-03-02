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

  var list=result.get();

  switch(param.request) {
    case "newest":
      var newest={};
      for(var i=0; i<list.length; i++)
	newest[list[i].client_id]=list[i];

      list=[];
      for(var i in newest)
	list.push(newest[i]);

      break;
    case "all":
    default:
  }

  if(callback)
    callback(list);

  return list;
}
