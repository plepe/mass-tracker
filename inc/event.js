var event_ui_form;
var event_ui_form_def={
  'view': {
    'name':	"Ansicht",
    'type':	'radio',
    'values':	{ 'live': "Verlauf", 'full': "Gesamt" }
  }
};
var event_ui_default={ 'view': 'live' };

function mass_event(id, data) {
  this.id=id;
  this.data=data;

  this.time_shift=0;
  this.tracker={};

  this.update();
  window.setInterval(this.update.bind(this), 1000);

  this.begin_time=new Date(new Date(this.data.begin_time).getTime()-
    this.data.timezone*60000);
  this.end_time=new Date(new Date(this.data.end_time).getTime()-
    this.data.timezone*60000);

  this.current_time=new Date();
  if(this.current_time>this.end_time)
    this.set_date(this.end_time);
  else if(this.current_time<this.begin_time)
    this.set_date(this.begin_time);

  var param={ "all": true };
  if(this.time_shift)
    param.time_shift=this.time_shift;
  new ajax("get_trackers", param, null, this.update_callback.bind(this));
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

mass_event.prototype.set_date=function(new_date) {
  // calc time_shift
  new_date=new Date(new_date);
  this.time_shift=floor((new_date.getTime()-new Date().getTime())/1000);

  this.current_time=new Date(new Date().getTime()+this.time_shift*1000);
  $("#timeslider").slider('value', this.current_time.getTime()/1000);

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

  this.current_time=new Date(new Date().getTime()+this.time_shift*1000);

  this.request=new ajax("event_map_update", param, null, this.update_callback.bind(this));

  $("#timeslider").slider('value', this.current_time.getTime()/1000);
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

  this.current_time=new Date(new Date().getTime()+this.time_shift*1000);

  if(displays.datetime)
    displays.datetime.set_value(this.current_time);

  this.refresh(this.current_time);
}

mass_event.prototype.refresh=function(current) {
  var center_pos=[];

  for(var i in this.tracker) {
    this.tracker[i].refresh(current);
  }

  // calculate arithmetic center of all front positions and pan viewport there
  var pos={ lon: 0.0, lat: 0.0 };
  var center_count=0;

  var tracker_list=[];

  for(var i in this.tracker) {
    if(this.tracker[i].center_pos) {
      pos.lon+=this.tracker[i].center_pos.lon;
      pos.lat+=this.tracker[i].center_pos.lat;
      if(this.tracker[i].data&&this.tracker[i].data.name)
	tracker_list.push("<li>"+this.tracker[i].format_name()+"</li>");

      center_count++;
    }
  }

  if(center_count>0) {
    pos.lon=pos.lon/center_count;
    pos.lat=pos.lat/center_count;

    pos = new OpenLayers.LonLat(pos.lon, pos.lat);

    map.panTo(pos);
  }

  if(displays.tracker_count)
    displays.tracker_count.set_value(center_count);
  if(displays.tracker_list)
    displays.tracker_list.set_value("<ul>\n"+tracker_list.join("\n")+"</ul>\n");
}
