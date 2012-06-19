function mass_event(id, data) {
  this.id=id;
  this.data=data;
}

mass_event.prototype.center_map=function() {
  map.setCenter(new OpenLayers.LonLat(this.data.begin_longitude, this.data.begin_latitude).transform(fromProjection, toProjection), this.data.begin_zoom);
}
