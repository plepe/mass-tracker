var clients={};
var peers={};

function Client(connection) {
  this.connection=connection;
  this.last_received=0;

  this.connection.on('message', function(message) {
    var param=null;

    if(message.type==="utf8") {
      console.log((new Date())+" Received message from "+this.id);
      try {
	param=JSON.parse(message.utf8Data);
      }
      catch(e) {
      }

      // answer request
      if(param&&param.request) {
	db.each("select * from message",
	    [ ],
	    function(error, row) {
	      if(error) {
		console.log("Error select from database: "+error.message);
	      }
	      else {
		row.data=JSON.parse(row.data);
		this.send(row);
	      }
	    }.bind(this)
	  );

	return;
      }


      if(param) {
	param.peer_id=this.peer_id;

	if(!('data' in param))
	  param.data={};

	this.broadcast(param);
      }
    }

    // Request for disconnect -> close connection to peer
    if(param&&param.type=="disconnect") {
      this.close();
    }

    if(!param) {
      console.log((new Date())+" Illegal message received: ");
      console.log(message);
    }
  }.bind(this));

  this.connection.on('close', function() {
    delete(clients[this.client_id]);
    console.log((new Date())+" Connection "+this.client_id+"/"+this.peer_id+" closed");

    this.broadcast({
      type: 'disconnect',
      timestamp: new Date().toISOString(),
      peer_id: this.peer_id
    });
  }.bind(this));
}

Client.prototype.db_callback_message=function(param, row) {
  hooks.call("message_received", param, this);

  console.log(param);

  for(var i in clients) {
    if(i!=this.client_id)
      clients[i].send(param);
    else
      clients[i].send({
	ack: param.timestamp,
	received: param.received,
	data: param.data   // TODO: check for changed data
      });
  }
}

Client.prototype.get_received=function() {
  var current=new Date();
  var ret=current.toISOString();

  while(this.last_received>=ret) {
    current=new Date(current.getTime()+1);
    ret=current.toISOString();
  }

  this.last_received=ret;
  return ret;
}

Client.prototype.broadcast=function(param) {
  var current_client=this;

  if(!param.data)
    param.data={};

  var received=this.get_received();

  db.run("insert into message (peer_id, timestamp, received, type, data) values (?, ?, ?, ?, ?)",
      [ this.peer_id, param.timestamp, received, param.type, JSON.stringify(param.data) ], function(error) {
	if(error) {
	  console.log("Error inserting into database: "+error.message);
	}
	else {
	  param.received=received;
	  current_client.db_callback_message(param, this);
	}
      });
}

Client.prototype.send=function(data) {
  this.connection.sendUTF(JSON.stringify(data));
}

Client.prototype.close=function() {
  this.connection.close();
}

Client.prototype.authenticate=function(message, callback) {
  if(!message) {
    callback({message: "No message for authentication"});
    return;
  }

  if((!message.type)||(message.type!="hello")) {
    callback({message: "Invalid authentication message"});
  }

  if(message.data.client_id) {
    this.client_id=message.data.client_id;
  }
  else {
    this.client_id=uniq_id();
  }
  console.log("Connect from "+this.client_id);

  // TODO: get peer_id of previous connection
  if(clients[this.client_id]) {
    this.peer_id=clients[this.client_id].peer_id;

    if(this!=clients[this.client_id]) {
      console.log("Replace connection");
      clients[this.client_id].close();
    }
  }
  else {
    if(peers[this.client_id])
      this.peer_id=peers[this.client_id];
    else
      this.peer_id=uniq_id();
  }

  clients[this.client_id]=this;
  peers[this.client_id]=this.peer_id;

  console.log((new Date())+" Connection "+this.client_id+"/"+this.peer_id+" accepted");

  this.send({
	type: 'welcome',
	timestamp: new Date().toISOString(),
	peer_id: this.peer_id,
	data: {
	  client_id: this.client_id
	}
      });

  callback();
}

module.exports.Client=Client;
