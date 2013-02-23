var webSocketServer=require('websocket').server;
var http=require('http');
var fs=require('fs');
var sqlite3=require('sqlite3');
var Event=require('./event-server.js');
//var Event=require('./client-server.js');

function Core() {
}

Core.prototype.init=function(config) {
  this.db=new sqlite3.Database(config.database, function(error) {
    if(error) {
      console.log("Can't open SQLITE database: "+error.message);
      process.exit(1);
    }

    this.db.exec("select * from event", function(error) {
      if(error) {
	console.log("Database seems to be empty -> initializing");
	fs.readFile("./init.sql", "utf8", function(error, text) {
	  if(error) {
	    console.log("Error reading init.sql");
	    process.exit(1);
	  }

	  db.exec(text, function(error) {
	    if(error) {
	      console.log("Error initializing database: "+error.message);
	      process.exit(1);
	    }
	  });
	});
      }
    });
  }.bind(this));

  var server=http.createServer(function(request, response) {
  });
  server.listen(config.port, function() {
    console.log((new Date())+" HTTP server listening on port "+config.port);
  });

  this.wsServer=new webSocketServer({
    httpServer: server
  });

  this.wsServer.on('request', this.handle_new_connection.bind(this));
}

Core.prototype.handle_new_connection=function(request) {
  console.log((new Date())+" Connection from "+request.origin);

  var connection=request.accept(null, request.origin);
  connection.once('message', function(connection, message) {
    console.log((new Date())+" Received first message:");
    console.log(JSON.stringify(message, null, '  '));

    if(message.type!=="utf8") {
      console.log("Wrong message format!");
      connection.send("Sorry dude, wrong message format!");
      connection.close();
      return;
    }

    message=JSON.parse(message.utf8Data);

    // check validity of message, authentication, ...

    Event.get_event(message.data.event_id, function(ev) {
      console.log('event ready');
      console.log(ev);
    }.bind(this));
  }.bind(this, connection));
}

module.exports.Core=Core;
