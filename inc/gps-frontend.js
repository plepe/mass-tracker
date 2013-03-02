function gps_frontend(frontend) {
  this.frontend=frontend;
  this.gps=gps_object;

  this.div_debug=document.createElement("div");
  this.div_debug.id="gps_frontend";
  this.frontend.div_debug.appendChild(this.div_debug);

  hooks.register("gps_update", this.gps_update.bind(this), this);
}

gps_frontend.prototype.update=function() {
}

gps_frontend.prototype.gps_update=function() {
  this.div_debug.innerHTML="<pre>GPS Coords:\n"+JSON.stringify(this.gps.coords, null, "  ")+"</pre>";

  return;
  //displays.debug.set_value(null, "<pre>"+"Last submitted: "+this.last_submit+"\n"+JSON.stringify(this.coords, null, "  ")+"</pre>");
  this.pos=new OpenLayers.LonLat(lonlat.coords.longitude, lonlat.coords.latitude);


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

hooks.register("frontend_register", function(frontend) {
  return new gps_frontend(frontend);
});
