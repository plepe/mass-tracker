function Connection(websocket, client) {
  this.websocket=websocket;
  this.client=client;

  this.websocket.on('message', function(message) {
    // check for validity of message
    if(message.type!=="utf8") {
      console.log("Invalid message received from "+this.client.client_id+":");
      console.log(message);
      return;
    }

    try {
      message=JSON.parse(message.utf8Data);
    }
    catch(e) {
      console.log("Invalid message received from "+this.client.client_id+":");
      console.log(message);
      return;
    }

    if((typeof message) != "object") {
      console.log("Invalid message received from "+this.client.client_id+":");
      console.log(message);
      return;
    }

    // Debug
    log("Message recv from "+this.client.client_id, message);

    // add 'received' timestamp
    message.received=get_received_timestamp();

    // ok, 'message' is now the submitted message - pass to client to handle
    // content
    this.client.receive_message(message, this.receive_callback.bind(this));

    // done.
  }.bind(this));

  this.websocket.on('close', function() {
    this.client.on_close();
  }.bind(this));
}

Connection.prototype.receive_callback=function(message) {
  if(!message)
    return;

  // send ack to client
  this.send_raw({
    type: 'ack',
    timestamp: message.timestamp,
    received: message.received,
    data: message.data   // TODO: check for changed data, discard if unchanged
  });
}

Connection.prototype.send_raw=function(data) {
  this.websocket.sendUTF(JSON.stringify(data));

  // Debug
  log("Message sent to "+this.client.client_id, data);
}

module.exports=Connection;
