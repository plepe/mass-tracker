function Messages(event) {
  this.event=event;
  this.db=event.db;
}

Messages.prototype.request=function(param, callback) {
  var reply=[];

  var where=[];
  var sql_param=[];

  if(param.min_received) {
    where.push("received>?");
    sql_param.push(param.min_received);
  }
  if(param.max_received) {
    where.push("received<=?");
    sql_param.push(param.max_received);
  }
  if(param.min_timestamp) {
    where.push("timestamp>?");
    sql_param.push(param.min_timestamp);
  }
  if(param.max_timestamp) {
    where.push("timestamp<=?");
    sql_param.push(param.max_timestamp);
  }
  if(param.type) {
    where.push("type=?");
    sql_param.push(param.type);
  }
  if(param.client_id) {
    where.push("client_id=?");
    sql_param.push(param.client_id);
  }

  if(where.length>0)
    where="where "+where.join(" and ");
  else
    where="";

  var order="timestamp asc";
  if(param.request&&param.client_id&&(param.request=="newest"))
    order="timestamp desc limit 1";

  // answer request
  this.db.each("select * from message "+where+" order by "+order,
      sql_param,
      
      // for each message
      function(error, row) {
	if(error) {
	  console.log("Error select from database: "+error.message);
	}
	else {
	  row.data=JSON.parse(row.data);

	  reply.push(row);
	}
      }.bind(this),

      // final function
      function(error, count) {
	if(error) {
	  console.log("Error select from database: "+error.message);
	}

	if(param.request&&(param.request=="newest")) {
	  var newest={};
	  for(var i=0; i<reply.length; i++)
	    newest[reply[i].client_id]=reply[i];

	  reply=[];
	  for(var i in newest)
	    reply.push(newest[i]);
	}

	callback(reply);
      }
    );
}

Messages.prototype.message_received=function(message) {
  // Insert to database
  this.db.run("insert into message (client_id, timestamp, received, type, data) values (?, ?, ?, ?, ?)",
      [ message.client_id, message.timestamp, message.received, message.type, JSON.stringify(message.data) ], function(error) {
	if(error) {
	  console.log("Error inserting into database: "+error.message+":");
	  console.log(message);
	}
      }.bind(this));
}

module.exports=Messages;
