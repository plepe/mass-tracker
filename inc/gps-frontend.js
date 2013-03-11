function gps_frontend(frontend) {
  this.frontend=frontend;
  this.gps=gps_object;

  this.div_debug=document.createElement("div");
  this.div_debug.id="gps_frontend";
  this.frontend.div_debug.appendChild(this.div_debug);

  hooks.register("gps_update", this.gps_update.bind(this), this);
  hooks.register("map_init", function(map) {
    this.icon=L.icon({
      iconUrl: 'img/gps.png',
      iconSize: [ 25, 25 ],
      iconAnchor: [ 13, 20 ]
    });

    this.marker=L.marker([ 48.21, 16.36 ], {
      title: "GPS Position",
      icon: this.icon
    });

    if(this.marker)
      this.marker.addTo(map);
  }.bind(this));
}

gps_frontend.prototype.update=function() {
}

gps_frontend.prototype.gps_update=function() {
  this.div_debug.innerHTML="<pre>GPS Coords:\n"+JSON.stringify(this.gps.coords, null, "  ")+"</pre>";

  //displays.debug.set_value(null, "<pre>"+"Last submitted: "+this.last_submit+"\n"+JSON.stringify(this.coords, null, "  ")+"</pre>");

  if(this.marker) {
    this.marker.setLatLng([
      this.gps.coords.latitude,
      this.gps.coords.longitude
    ]);
  }

  //map.setCenter(pos);
}

hooks.register("frontend_register", function(frontend) {
  return new gps_frontend(frontend);
});
