function server_test_received(message, client, callback) {
  message.data.foo="bar";

  callback();
}

module.exports.register=function(modules) {
  modules.hooks.register("message_received", server_test_received);
}
