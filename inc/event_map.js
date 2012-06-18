var age_styles=[
  { strokeWidth: 3, strokeColor: '#ff0000', strokeOpacity: 1.0, strokeLinecap: 'round', graphicZIndex: 9 },
  { strokeWidth: 3, strokeColor: '#ee0000', strokeOpacity: 0.9, strokeLinecap: 'round', graphicZIndex: 8 },
  { strokeWidth: 3, strokeColor: '#dd0000', strokeOpacity: 0.9, strokeLinecap: 'round', graphicZIndex: 7 },
  { strokeWidth: 3, strokeColor: '#cc0000', strokeOpacity: 0.8, strokeLinecap: 'round', graphicZIndex: 6 },
  { strokeWidth: 3, strokeColor: '#aa0000', strokeOpacity: 0.8, strokeLinecap: 'round', graphicZIndex: 5 },
  { strokeWidth: 3, strokeColor: '#990000', strokeOpacity: 0.7, strokeLinecap: 'round', graphicZIndex: 4 },
  { strokeWidth: 3, strokeColor: '#770000', strokeOpacity: 0.7, strokeLinecap: 'round', graphicZIndex: 3 },
  { strokeWidth: 3, strokeColor: '#660000', strokeOpacity: 0.6, strokeLinecap: 'round', graphicZIndex: 2 },
  { strokeWidth: 3, strokeColor: '#440000', strokeOpacity: 0.6, strokeLinecap: 'round', graphicZIndex: 1 },
  { strokeWidth: 3, strokeColor: '#330000', strokeOpacity: 0.5, strokeLinecap: 'round', graphicZIndex: 0 },
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
  current.setSeconds(current.getSeconds()+this.time_shift);

  var status=document.getElementById("time");
  status.innerHTML=current.toString();

  var center_pos=[];

  for(var i in this.log) {
    var geo=[[], [], [], [], [], [], [], [], [], []];
    var last=null;
    var pos=null;

    for(var j=0; j<this.log[i].length; j++) {
      var timestamp=this.log[i][j].timestamp;
      timestamp=timestamp.substr(0, 10)+"T"+timestamp.substr(11, 8)+"Z";

      var age=(current.getTime()-new Date(timestamp).getTime())/1000;
      var age_category=floor(age/60);

      if(age>=600)
	continue;
      if(last&&(geo[age_category].length==0))
	geo[age_category].push(poi);

      pos = new OpenLayers.LonLat(this.log[i][j].longitude, this.log[i][j].latitude).transform(fromProjection, toProjection);
      var poi=new OpenLayers.Geometry.Point(pos.lon, pos.lat);
      geo[age_category].push(poi);
      last=poi;
    }

    if(pos)
      center_pos.push(pos);

    this.features[i]=[];
    for(var j=0; j<geo.length; j++) {
      geo[j]=new OpenLayers.Geometry.LineString(geo[j]);
      this.features[i][j]=new OpenLayers.Feature.Vector(geo[j], 0, age_styles[j]);
    }

    vector_layer.addFeatures(this.features[i]);
  }

  // calculate arithmetic center of all front positions and pan viewport there
  if(center_pos.length) {
    var pos={ lon: 0.0, lat: 0.0 };

    for(var i=0; i<center_pos.length; i++) {
      pos.lon+=center_pos[i].lon;
      pos.lat+=center_pos[i].lat;
    }

    pos.lon=pos.lon/center_pos.length;
    pos.lat=pos.lat/center_pos.length;

    pos = new OpenLayers.LonLat(pos.lon, pos.lat);

    map.panTo(pos);
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

