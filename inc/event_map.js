var age_styles=[
  { strokeWidth: 3, strokeColor: '#ff0000', strokeOpacity: 1.0 },
  { strokeWidth: 3, strokeColor: '#ee0000', strokeOpacity: 0.9 },
  { strokeWidth: 3, strokeColor: '#dd0000', strokeOpacity: 0.9 },
  { strokeWidth: 3, strokeColor: '#cc0000', strokeOpacity: 0.8 },
  { strokeWidth: 3, strokeColor: '#aa0000', strokeOpacity: 0.8 },
  { strokeWidth: 3, strokeColor: '#990000', strokeOpacity: 0.7 },
  { strokeWidth: 3, strokeColor: '#770000', strokeOpacity: 0.7 },
  { strokeWidth: 3, strokeColor: '#660000', strokeOpacity: 0.6 },
  { strokeWidth: 3, strokeColor: '#440000', strokeOpacity: 0.6 },
  { strokeWidth: 3, strokeColor: '#330000', strokeOpacity: 0.5 },
];

function event_map() {
  this.time_shift=0;
  this.log={};

  this.update();
  window.setInterval(this.update.bind(this), 1000);
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

  if(this.features)
    for(var i in this.features) {
      vector_layer.removeFeatures(this.features[i]);
    }
  this.features=[];

  var current=new Date();
  for(var i in this.log) {
    var geo=[[], [], [], [], [], [], [], [], [], []];
    var pos;
    var last=null;

    for(var j=0; j<this.log[i].length; j++) {
      var age=(current.getTime()-new Date(this.log[i][j].timestamp).getTime())/1000+current.getTimezoneOffset()*60+this.time_shift;
      var age_category=floor(age/60);

      if(age>=600)
	continue;
      if(last&&(geo[age_category].length==0))
	geo[age_category].push(last);

      var pos = new OpenLayers.LonLat(this.log[i][j].longitude, this.log[i][j].latitude).transform(fromProjection, toProjection);
      geo[age_category].push(new OpenLayers.Geometry.Point(pos.lon, pos.lat));
      last=pos;
    }

    if(pos)
      map.panTo(pos);

    this.features[i]=[];
    for(var j=0; j<geo.length; j++) {
      geo[j]=new OpenLayers.Geometry.LineString(geo[j]);
      this.features[i][j]=new OpenLayers.Feature.Vector(geo[j], 0, age_styles[j]);
    }

    vector_layer.addFeatures(this.features[i]);
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

