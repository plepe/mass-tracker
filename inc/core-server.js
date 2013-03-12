var webSocketServer=require('websocket').server;
var http=require('http');
var fs=require('fs');
var sqlite3=require('sqlite3');
var Functions=require('./functions.js');
var Event=require('./event-server.js');
var Client=require('./client-server.js');
var hooks=require('../modules/base/modules/hooks/hooks.js');
//var Event=require('./client-server.js');

function Core() {
}

Core.prototype.init=function(config) {
  global.db=new sqlite3.Database(config.database, function(error) {
    if(error) {
      console.log("Can't open SQLITE database: "+error.message);
      process.exit(1);
    }

    db.exec("select * from event", function(error) {
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

	    hooks.call("db_ready");
	  });
	});
      }
      else
	hooks.call("db_ready");
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

  var client=new Client(request);
}

global.ServerDate=function() {
  return new Date();
}

module.exports.Core=Core;
