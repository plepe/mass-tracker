// configuration
var gps_interval=2; // seconds

// globals
var gps_object=null;

function gps() {
  this.last_submit=null;

  if(navigator.geolocation)
    this.watch=navigator.geolocation.watchPosition(this.update.bind(this));
}

gps.prototype.update_callback=function() {
}

gps.prototype.update=function(lonlat) {
  this.coords=lonlat.coords;
  this.pos=new OpenLayers.LonLat(lonlat.coords.longitude, lonlat.coords.latitude);

  var current=now();
  if((this.last_submit===null)||(current.getTime()>=this.last_submit.getTime()+gps_interval*1000)) {
    ajax("gps_submit", this.coords, null, this.update_callback.bind(this));
    this.last_submit=current;
  }

  if(this.vector) {
    vector_layer.removeFeatures([this.vector]);
  }

  var pos =new OpenLayers.LonLat(this.pos.lon, this.pos.lat);
  pos.transform(fromProjection, toProjection);
  var geo_point=new OpenLayers.Geometry.Point(pos.lon, pos.lat);
  this.vector=new OpenLayers.Feature.Vector(geo_point, 0, {
    externalGraphic: "img/gps.png",
    graphicWidth: 25,
    graphicHeight: 25,
    graphicXOffset: -13,
    graphicYOffset: -20,
    graphicZIndex: 20
  });
  vector_layer.addFeatures([this.vector]);

  //map.setCenter(pos);

  //call_hooks("gps_update", this);

  this.last_pos=this.pos;
}

gps.prototype.get_pos=function() {
  return this.pos;
}

gps.prototype.get_coords=function() {
  return this.coords;
}

function gps_init() {
  if(!navigator.geolocation)
    return;

  gps_object=new gps();
}

//register_hook("init", gps_init);
