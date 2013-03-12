var Connection=require('./connection-server.js');
var Event=require('./event-server.js');
var hooks=require('../modules/base/modules/hooks/hooks.js');

var clients={};
var client_ids={};

function Client(request) {
  var websocket=request.accept(null, request.origin);
  this.connection=new Connection(websocket, this);
  this.last_received=0;
  this.receive_queue=[];

  this.secret_id=null;
  this.client_id=null;
}

hooks.register("db_ready", function() {
  db.each("select * from client_ids", [],
    function(error, row) {
      client_ids[row.secret_id]=row.client_id;
    },
    function(error, count) {
      if(error) {
	console.log("Error loading client_ids:");
	console.log(error);
      }
    });
});

Client.prototype.receive_message=function(message, callback) {
  // TODO: check if message has already been received!

  // message can be handled by me
  switch(message.type) {
    case "disconnect":
      // Request for disconnect -> close connection to client
      this.connection.close();
      break;
    case "timesync":
      message.data.received=new Date().toISOString();

      callback(message);
      break;
    case "hello":
      this.authenticate(message, function(error) {
	if(error) {
	  console.log(error.message);
	  return;
	}

	Event.get_event(message.data.event_id, function(ev) {
	  ev.add_client(this);
	}.bind(this));
      }.bind(this));
      break;
    default:
      if(!this.event) {
	this.receive_queue.push(message);
	return;
      }

      // let event process the message
      this.event.receive_message(message, this,
	this.receive_callback.bind(this, callback));
      break;
  }
}

Client.prototype.receive_callback=function(callback, message) {
  if(callback)
    callback(message);
}

Client.prototype.send=function(data, type) {
  var message={
    type: type,
    client_id: this.client_id,
    data: data,
    timestamp: ServerDate().toISOString(),
  };

  this.connection.send_raw(message);
}

Client.prototype.send_raw=function(message) {
  this.connection.send_raw(message);
}

Client.prototype.on_close=function() {
  delete(clients[this.secret_id]);
  console.log((new Date())+" Connection "+this.secret_id+"/"+this.client_id+" closed");

  if(this.event)
    this.event.remove_client(this);
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

  if(message.data.secret_id) {
    this.secret_id=message.data.secret_id;
  }
  else {
    this.secret_id=uniq_id();
  }
  console.log("Connect from "+this.secret_id);

  if(clients[this.secret_id]) {
    this.client_id=clients[this.secret_id].client_id;

    if(this!=clients[this.secret_id]) {
      console.log("Replace connection");
      clients[this.secret_id].close();
    }
  }
  else {
    if(client_ids[this.secret_id])
      this.client_id=client_ids[this.secret_id];
    else {
      this.client_id=uniq_id();

      db.run("insert into client_ids values (?, ?)", this.secret_id, this.client_id);
    }
  }

  clients[this.secret_id]=this;
  client_ids[this.secret_id]=this.client_id;

  console.log((new Date())+" Connection "+this.secret_id+"/"+this.client_id+" accepted");

  this.send({ secret_id: this.secret_id }, 'welcome');

  callback();
}

Client.prototype.set_event=function(event) {
  this.event=event;

  // we already got messages? pass to event
  for(var i=0; i<this.receive_queue.length; i++)
    this.event.receive_message(this.receive_queue[i], this,
      this.receive_callback.bind(this));

  this.receive_queue=[];
}

module.exports=Client;
