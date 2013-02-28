var EventEmitter=require('events').EventEmitter;
var hooks=require('../modules/base/modules/hooks/hooks.js');
var util=require('util');
var sqlite3=require('sqlite3');
var fs=require('fs');
var Messages=require('./messages-server.js');
var events={};
var event_db_fields=[ 'name', 'description', 'begin_time', 'end_time', 'timezone', 'begin_longitude', 'begin_latitude', 'begin_zoom' ];

function Event(event_id) {
  this.id=event_id;
  this.ready=false;
  this.clients={};
  this.client_id='';
  events[this.id]=this;

  fs.stat('db/'+this.id, function(error, stat) {
    if(!stat) {
      console.log("create directory");
      fs.mkdir('db/'+this.id, config.dir_mode, this.open_db.bind(this, true));
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
	fs.chmod('db/'+this.id+'/db.sqlite', config.file_mode);

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

  global.db.run("insert or ignore into event (event_id) values (?)", this.id, function(error) {
    if(error) {
      console.log("Error creating global event");
      console.log(error.message);
    }
  });
}

Event.prototype.set_ready=function() {
  this.ready=true;
  console.log("Event "+this.id+" ready!");

  this.messages=new Messages(this);
  this.emit('ready', this);
}

Event.prototype.add_client=function(client) {
  this.clients[client.client_id]=client;
  client.set_event(this);

  this.send_all({ client_id: client.client_id }, 'connect', client);
}

Event.prototype.remove_client=function(client) {
  delete(this.clients[client.client_id]);

  this.send_all({ client_id: client.client_id }, 'disconnect', client);
}

Event.prototype.send_all=function(data, type, client, callback) {
  if(!client)
    client=this;

  var message={
    type: type,
    data: data,
    timestamp: ServerDate().toISOString(),
  };

  this.receive_message(message, client, callback);
}

Event.prototype.receive_message=function(message, client, callback) {
  // complete message
  message.received=get_received_timestamp();
  message.client_id=client.client_id;
  if(!('data' in message))
    message.data={};

  this.emit("message_received", message, client);

  // The hooks may modify the message, wait for changes before
  // passing broadcasting and writing to database
  hooks.call_callback("message_received", message, this, function(ret) {
    // Broadcast
    this.broadcast(message, client);

    // call callback (eg. for sending ack)
    if(callback)
      callback(message);

    // enter message to database
    this.messages.message_received(message);
  }.bind(this));
}

Event.prototype.broadcast=function(message, exclude) {
  for(var i in this.clients) {
    if(this.clients[i]!=exclude)
      this.clients[i].send_raw(message);
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

    f2.push(this.id);
    global.db.run("update event set "+f1+" where event_id=?", f2, function(error) {
      if(error) {
	console.log("Error changing (global) event:");
	console.log(error.message);
      }
    }.bind(this));
}
}

module.exports=Event;
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
