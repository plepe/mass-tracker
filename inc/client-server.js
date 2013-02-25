var clients={};
var peers={};

function Client(connection) {
  this.connection=connection;
  this.last_received=0;

  this.connection.on('message', function(message) {
    var param=null;

    if(message.type!=="utf8") {
      console.log("Invalid message received from "+this.id+":");
      console.log(message);
      return;
    }

    try {
      message=JSON.parse(message.utf8Data);
    }
    catch(e) {
      console.log("Invalid message received from "+this.id+":");
      console.log(message);
      return;
    }

    // ok, 'message' is now the submitted message - see what we can do with it

    // message can be handled by me
    if(message.type=="disconnect") {
      // Request for disconnect -> close connection to peer
      this.close();
    }

    // let event process the message
    this.event.receive_message(message, this, function(message) {
      if(!message)
	return;

      // send ack to client
      this.send({
	ack: message.timestamp,
	received: message.received,
	data: message.data   // TODO: check for changed data
      });
    }.bind(this));

/*
    */

  }.bind(this));

  this.connection.on('close', function() {
    delete(clients[this.client_id]);
    console.log((new Date())+" Connection "+this.client_id+"/"+this.peer_id+" closed");

    this.event.remove_peer(this);
  }.bind(this));
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

Client.prototype.set_event=function(event) {
  this.event=event;
}

module.exports.Client=Client;
