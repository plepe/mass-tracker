function event_map() {
  this.time_shift=0;
  this.log={};

  this.update();
  window.setInterval(this.update.bind(this), 10000);
}

event_map.prototype.set_date=function(new_date) {
  // calc time_shift
  new_date=new Date(new_date);
  this.time_shift=floor((new_date.getTime()-new Date().getTime())/1000);

  // remove current last_timestamp and abort current xmlhttprequest
  if(this.request)
    this.request.request.abort();
  delete(this.last_timestamp);

  // force update
  this.update();
}

event_map.prototype.update_callback=function(data) {
  if(data.last_timestamp)
    this.last_timestamp=data.last_timestamp;

  this.request=null;

  // push new points to list
  for(var i in data) {
    if(i=="last_timestamp")
      continue;

    if(!this.log[i])
      this.log[i]=[];

    for(var j=0; j<data[i].length; j++) {
      this.log[i].push(data[i][j]);
    }
  }
}

event_map.prototype.update=function() {
  var param={};
  if(this.last_timestamp)
    param.last_timestamp=this.last_timestamp;
  if(this.time_shift)
    param.time_shift=this.time_shift;

  this.request=new ajax("event_map_update", param, null, this.update_callback.bind(this));
}

