function mass_event(id, data) {
  this.id=id;
  this.data=data;

  this.time_shift=0;
  this.tracker={};

  this.update();
  window.setInterval(this.update.bind(this), 1000);
}

mass_event.prototype.set_date=function(new_date) {
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

mass_event.prototype.center_map=function() {
  map.setCenter(new OpenLayers.LonLat(this.data.begin_longitude, this.data.begin_latitude).transform(fromProjection, toProjection), this.data.begin_zoom);
}

mass_event.prototype.update=function() {
  var param={};
  if(this.last_timestamp)
    param.last_timestamp=this.last_timestamp;
  if(this.time_shift)
    param.time_shift=this.time_shift;
  param.id=this.id;

  this.request=new ajax("event_map_update", param, null, this.update_callback.bind(this));
}

mass_event.prototype.update_callback=function(data) {
  if(data.last_timestamp)
    this.last_timestamp=data.last_timestamp;

  this.request=null;

  // push new points to list
  for(var i in data) {
    if(i=="last_timestamp")
      continue;

    if(!this.tracker[i])
      this.tracker[i]=new tracker(i);

    for(var j=0; j<data[i].length; j++) {
      this.tracker[i].push_point(data[i][j]);
    }
  }

  var current=new Date();
  current.setSeconds(current.getSeconds()+this.time_shift);

  var status=document.getElementById("time");
  status.innerHTML=current.toString();

  this.refresh(current);
}

mass_event.prototype.refresh=function(current) {
  var center_pos=[];

  for(var i in this.tracker) {
    this.tracker[i].refresh(current);
  }

  // calculate arithmetic center of all front positions and pan viewport there
  var pos={ lon: 0.0, lat: 0.0 };
  var center_count=0;

  for(var i in this.tracker) {
    if(this.tracker[i].center_pos) {
      pos.lon+=this.tracker[i].center_pos.lon;
      pos.lat+=this.tracker[i].center_pos.lat;

      center_count++;
    }
  }

  if(center_count>0) {
    pos.lon=pos.lon/center_count;
    pos.lat=pos.lat/center_count;

    pos = new OpenLayers.LonLat(pos.lon, pos.lat);

    map.panTo(pos);
  }

  var tracker_count=document.getElementById("tracker_count");
  if(tracker_count) {
    tracker_count.innerHTML=center_count;
  }
}
