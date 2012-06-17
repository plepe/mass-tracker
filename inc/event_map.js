function event_map() {
  this.update();
  window.setInterval(this.update.bind(this), 10000);
}

event_map.prototype.update_callback=function(data) {
  if(data.last_timestamp)
    this.last_timestamp=data.last_timestamp;
}

event_map.prototype.update=function() {
  var param={};
  if(this.last_timestamp)
    param.last_timestamp=this.last_timestamp;

  ajax("event_map_update", param, null, this.update_callback.bind(this));
}

