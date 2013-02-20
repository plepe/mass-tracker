function server_test_received(message, client) {
  message.data.foo="bar";
}

module.exports.register=function(modules) {
  modules.hooks.register("message_received", server_test_received);
}
