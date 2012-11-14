var event_ui_form;
var event_ui_form_def={
//  'view': {
//    'name':	"Ansicht",
//    'type':	'radio',
//    'values':	{ 'live': "Verlauf", 'full': "Gesamt" }
//  }
};
var event_ui_default={ 'view': 'live' };

function mass_event(id, data) {
  this.id=id;
  this.data=data;

  this.time_shift=0;
  this.tracker={};

  this.update();
  window.setInterval(this.update.bind(this), 1000);
  window.setInterval(this.cleanup.bind(this), 10000);

  this.begin_time=get_date(this.data.begin_time);
  this.end_time=get_date(this.data.end_time);

  this.current_time=now();
  if(this.current_time>this.end_time)
    this.set_date(this.end_time);
  else if(this.current_time<this.begin_time)
    this.set_date(this.begin_time);

  var param={ "all": true };
  if(this.time_shift)
    param.time_shift=this.time_shift;
  param.id=this.id;

  new ajax("get_trackers", param, null, this.update_callback.bind(this, true));

  register_hook("map_moveend", function() {
    delete this.follow_to_move;
  }.bind(this), this);

}

mass_event.prototype.init=function() {
  current_event.center_map();

  var event_ui_form_div=document.getElementById("event_ui_form");
  if(event_ui_form_div) {
    event_ui_form=new form("event_ui", event_ui_form_def);
    event_ui_form.show(event_ui_form_div);
    event_ui_form.set_data(event_ui_default);
    event_ui_form.onchange=this.change_ui;
  }

   $("#timeslider").slider({
            sliderOptions: {
                orientation: 'horizontal',
	    },

	    min: this.begin_time.getTime() / 1000,
	    max: this.end_time.getTime() / 1000,
	    value: this.current_time.getTime() / 1000,
	    step: 1,

	    create: function(event, ui) {
	      this.slider=ui;
	    }.bind(this),

	    change: function(event, ui) {
	      if(event.originalEvent)
	        this.set_date(new Date(ui.value*1000));
	    }.bind(this)
	  });
}

mass_event.prototype.change_ui=function() {
}

mass_event.prototype.cleanup=function() {
  this.current_time=new Date(now().getTime()+this.time_shift*1000);

  for(var i in this.tracker)
    this.tracker[i].cleanup();
}

mass_event.prototype.set_date=function(new_date) {
  // calc time_shift
  new_date=new Date(new_date);

  if(new_date.getTime()>now().getTime())
    new_date=now();

  this.time_shift=round((new_date.getTime()-now().getTime())/1000);

  this.current_time=new Date(now().getTime()+this.time_shift*1000);
  $("#timeslider").slider('value', round(this.current_time.getTime()/1000));

  // remove current last_timestamp and abort current xmlhttprequest
  if(this.request) {
    this.request.request.abort();
    this.request=null;
  }
  delete(this.last_timestamp);

  // reset trackers
  for(var i in this.tracker)
    this.tracker[i].reset();

  // get list of (new) current trackers
  var param={ "all": true };
  if(this.time_shift)
    param.time_shift=this.time_shift;
  param.id=this.id;

  new ajax("get_trackers", param, null, this.update_callback.bind(this, true));

  // force update
  this.update(true);
}

mass_event.prototype.center_map=function() {
  map.setCenter(new OpenLayers.LonLat(this.data.begin_longitude, this.data.begin_latitude).transform(fromProjection, toProjection), this.data.begin_zoom);
}

mass_event.prototype.update=function(force) {
  var active=true;
  this.current_time=new Date(now().getTime()+this.time_shift*1000);

  // current time after end of event
  if(this.end_time&&
     (this.current_time.getTime()>this.end_time.getTime())) {
    this.current_time=this.end_time;
    active=false;
  }

  // not started yet
  if(this.begin_time&&
     (now().getTime()<this.begin_time.getTime())) {
    active=false;
  }

  $("#timeslider").slider('value', this.current_time.getTime()/1000);
  if(displays.datetime)
    displays.datetime.set_value(this.current_time);

  if(!active)
    return;

  // last request still running -> ignore
  if(this.request)
    return;

  var param={};
  if(this.last_timestamp)
    param.last_timestamp=this.last_timestamp;
  if(this.time_shift)
    param.time_shift=this.time_shift;
  param.id=this.id;

  this.request=new ajax("update", param, null, this.update_callback.bind(this, force));
}

mass_event.prototype.update_callback=function(force, data) {
  if(data.last_timestamp)
    this.last_timestamp=data.last_timestamp;

  this.request=null;

  call_hooks("receive", data);

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

  this.current_time=new Date(now().getTime()+this.time_shift*1000);

  this.refresh(this.current_time);

  if(force)
    this.goto_position();
  else
    this.follow_visible();
}

mass_event.prototype.refresh=function(current) {
  for(var i in this.tracker) {
    this.tracker[i].refresh(current);
  }

  var tracker_list=[];

  for(var i in this.tracker) {
    if(this.tracker[i].center_pos) {
      tracker_list.push("<li>"+this.tracker[i].format_name()+"</li>");
    }
  }

  // calculate arithmetic center of all front positions and pan viewport there
  if(displays.tracker_list) {
    if(tracker_list.length)
      displays.tracker_list.set_value(tracker_list.length, "<ul>\n"+tracker_list.join("\n")+"</ul>\n");
    else
      displays.tracker_list.set_value(0, "");
  }
}

mass_event.prototype.follow_visible=function() {
  var new_pos_list={};
  var pos={ lon: 0.0, lat: 0.0 };
  var move_list=[];
  var center_count=0;
  var bbox=map.calculateBounds();

  // don't move map when it is being dragged and forget how much will still
  // have to do
  if(map.dragging) {
    delete this.follow_to_move;
    return;
  }

  // last_pos_list contains visible trackers from last time
  if(!this.last_pos_list)
    this.last_pos_list={};
  // when we follow, what distance is there still to do
  if(!this.follow_to_move)
    this.follow_to_move={ lat: 0.0, lon: 0.0 };

  for(var i in this.tracker) {
    // if this tracker was visible last time, add to list of trackers we follow
    if(this.last_pos_list[i]&&bbox.containsLonLat(this.last_pos_list[i])) {
      if(this.tracker[i].center_pos)
	move_list.push({
	  lat: this.tracker[i].center_pos.lat-this.last_pos_list[i].lat,
	  lon: this.tracker[i].center_pos.lon-this.last_pos_list[i].lon
	});
    }

    if(this.tracker[i].center_pos) {
      new_pos_list[i]=this.tracker[i].center_pos;
    }
  }

  // if there are trackers we are following
  if(move_list.length>0) {
    var to_move={ lat: 0, lon: 0 };

    // calculate average of their moves
    for(var i=0; i<move_list.length; i++) {
      to_move.lat+=move_list[i].lat;
      to_move.lon+=move_list[i].lon;
    }
    to_move={
      lat: to_move.lat/move_list.length,
      lon: to_move.lon/move_list.length
    };

    // add to 'to do'-distance
    this.follow_to_move.lat+=to_move.lat;
    this.follow_to_move.lon+=to_move.lon;

    // get center of map (center_*) and calculate new center
    var center_ll=map.getCenter();
    var center_poi=new OpenLayers.Geometry.Point(center_ll.lon, center_ll.lat);
    var follow_poi=new OpenLayers.Geometry.Point(center_ll.lon, center_ll.lat);
    follow_poi.move(this.follow_to_move.lon, this.follow_to_move.lat);
    follow_ll=new OpenLayers.LonLat(follow_poi.x, follow_poi.y);
    var center_px=map.getPixelFromLonLat(center_ll);
    var follow_px=map.getPixelFromLonLat(follow_ll);

    // calculate viewport distance from move (actually it's square)
    var dist2=Math.pow(center_px.x-follow_px.x, 2)+
              Math.pow(center_px.y-follow_px.y, 2);

    // if move is more than 16px (square=256), move
    if(dist2>256) {
      map.panTo(follow_ll);
      delete this.follow_to_move;
    }
  }

  // remember current tracker positions
  this.last_pos_list=new_pos_list;
}

mass_event.prototype.goto_position=function() {
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
}
