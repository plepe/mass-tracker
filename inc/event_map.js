function event_map() {
  this.update();
  window.setInterval(this.update.bind(this), 10000);
}

event_map.prototype.update_callback=function(data) {
}

event_map.prototype.update=function() {
  ajax("event_map_update", {}, null, this.update_callback.bind(this));
}

