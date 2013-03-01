function Messages(event) {
  this.event=event;
  this.db=event.db;
}

Messages.prototype.request=function(param, callback) {
  var reply=[];

  // answer request
  this.db.each("select * from message",
      [ ],
      
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
