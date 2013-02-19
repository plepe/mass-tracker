function server_test_received(data, client) {
  data.foo="bar";
}

module.exports.register=function(modules) {
  modules.hooks.register("message_received", server_test_received);
}
