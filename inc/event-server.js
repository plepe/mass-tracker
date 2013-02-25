var EventEmitter=require('events').EventEmitter;
var hooks=require('../modules/base/modules/hooks/hooks.js');
var util=require('util');
var sqlite3=require('sqlite3');
var fs=require('fs');
var events={};
var event_db_fields=[ 'name', 'description', 'begin_time', 'end_time', 'timezone', 'begin_longitude', 'begin_latitude', 'begin_zoom' ];

function Event(event_id) {
  this.id=event_id;
  this.ready=false;
  this.peers={};
  events[this.id]=this;

  fs.stat('db/'+this.id, function(error, stat) {
    if(!stat) {
      console.log("create directory");
      fs.mkdir('db/'+this.id, this.open_db.bind(this, true));
    }
    else {
      this.open_db(false);
    }
  }.bind(this));

  this.on('message_received', this.check_message_received.bind(this));
}
util.inherits(Event, EventEmitter);

Event.prototype.open_db=function(init_db) {
  this.db=new sqlite3.Database('db/'+this.id+'/db.sqlite',
    function(init_db, error) {
      if(error) {
	console.log("Can't open SQLITE database for event "+this.id+": "+error.message);
	process.exit(1);
      }

      if(init_db) {
	console.log("Initializing database for event "+this.id);
	fs.readFile("./event.sql", "utf8", function(error, text) {
	  if(error) {
	    console.log("Error reading event.sql");
	    process.exit(1);
	  }

	  this.db.exec(text, function(error) {
	    if(error) {
	      console.log("Error initializing database: "+error.message);
	      process.exit(1);
	    }

	    this.set_ready();
	  }.bind(this));
	}.bind(this));
      }
      else {
	this.set_ready();
      }
  }.bind(this, init_db));
}

Event.prototype.set_ready=function() {
  this.ready=true;
  console.log("Event "+this.id+" ready!");

  this.emit('ready', this);
}

Event.prototype.add_peer=function(client) {
  this.peers[client.peer_id]=client;
  client.set_event(this);

  this.receive_message({
      type: 'connect',
      timestamp: new Date().toISOString(),
      peer_id: client.peer_id
    }, client);
}

Event.prototype.remove_peer=function(client) {
  delete(this.peers[client.peer_id]);

  this.receive_message({
      type: 'disconnect',
      timestamp: new Date().toISOString(),
      peer_id: client.peer_id
    }, client);
}

Event.prototype.get_received=function() {
  var current=new Date();
  var ret=current.toISOString();

  while(this.last_received>=ret) {
    current=new Date(current.getTime()+1);
    ret=current.toISOString();
  }

  this.last_received=ret;
  return ret;
}

Event.prototype.receive_message=function(message, client, callback) {
  // complete message
  message.received=this.get_received();
  message.peer_id=client.peer_id;
  if(!('data' in message))
    message.data={};

  // answer request
  if(message.request) {
    this.db.each("select * from message",
	[ ],
	function(error, row) {
	  if(error) {
	    console.log("Error select from database: "+error.message);
	  }
	  else {
	    row.data=JSON.parse(row.data);
	    client.send(row);
	  }
	}.bind(this)
      );

    return;
  }

  // TODO? wait for callbacks?
  hooks.call("message_received", message, this);
  this.emit("message_received", message);

  // Broadcast
  this.broadcast(message, client);

  // call callback (eg. for sending ack)
  if(callback)
    callback(message);

  // Insert to database
  this.db.run("insert into message (peer_id, timestamp, received, type, data) values (?, ?, ?, ?, ?)",
      [ client.peer_id, message.timestamp, message.received, message.type, JSON.stringify(message.data) ], function(error) {
	if(error) {
	  console.log("Error inserting into database: "+error.message);
	}
      }.bind(this));
}

Event.prototype.broadcast=function(message, exclude) {
  for(var i in this.peers) {
    if(this.peers[i]!=exclude)
      this.peers[i].send(message);
  }
}

Event.prototype.check_message_received=function(message) {
  if(message.type=="change_event") {
    var f1=[];
    var f2=[];

    for(var i=0; i<event_db_fields.length; i++) {
      if(message.data[event_db_fields[i]]) {
	f1.push(event_db_fields[i]+"=?");
	f2.push(message.data[event_db_fields[i]]);
      }
    }

    f1=f1.join(", ");
    this.db.run("update event set "+f1, f2, function(error) {
      if(error) {
	console.log("Error changing event:");
	console.log(error.message);
      }
    }.bind(this));
  }
}

module.exports.Event=Event;
module.exports.get_event=function(event_id, callback) {
  if(events[event_id]) {
    if(callback)
      callback(events[event_id]);

    return events[event_id];
  }

  var ev=new Event(event_id);

  if(callback)
    ev.once('ready', function(event) {
      callback(event);
    });

  return ev;
}
