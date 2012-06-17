var gps_object=null;

function gps() {
  if(navigator.geolocation)
    this.watch=navigator.geolocation.watchPosition(this.update.bind(this));
}

gps.prototype.update_callback=function() {
}

gps.prototype.update=function(lonlat) {
  gps.coords=lonlat.coords;
  ajax("gps_submit", gps.coords, null, this.update_callback.bind(this));
  gps.pos=new OpenLayers.LonLat(lonlat.coords.longitude, lonlat.coords.latitude);

  if(this.vector) {
    vector_layer.removeFeatures([this.vector]);
  }

  var pos = gps.pos;
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

  map.setCenter(pos);

  //call_hooks("gps_update", this);

  this.last_pos=gps.pos;
}

gps.prototype.get_pos=function() {
  return gps.pos;
}

gps.prototype.get_coords=function() {
  return gps.coords;
}

function gps_init() {
  if(!navigator.geolocation)
    return;

  gps_object=new gps();
}

//register_hook("init", gps_init);
