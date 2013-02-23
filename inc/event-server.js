var EventEmitter=require('events').EventEmitter;
var util=require('util');
var sqlite3=require('sqlite3');
var fs=require('fs');
var events={};

function Event(event_id) {
  this.id=event_id;
  this.ready=false;
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
