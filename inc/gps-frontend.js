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
