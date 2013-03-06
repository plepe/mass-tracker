function participants_frontend(frontend) {
  this.frontend=frontend;

  this.display=new Display("tracker_list", { title: "TrackerInnen", unit: "", type: "integer", expanded_type: "html" });
  this.display.show(document.getElementById("displays"));

  // Positions on the map
  this.vectors=[];
  hooks.register("map_init", function(map) {
    this.layer=new OpenLayers.Layer.Vector("Participants", { weight: 10, rendererOptions: { zIndexing: true } });
    // this.layer.setOpacity(0.7);
    map.addLayer(this.layer);
  }.bind(this));
}

participants_frontend.prototype.update=function() {
  var list=this.frontend.event.messages.request({ request: "newest", type: "gps", min_timestamp: new Date(ServerDate().getTime()-60000).toISOString()  });

  if(this.layer)
    this.layer.removeFeatures(this.vectors);
  this.vectors=[];

  var ul=document.createElement("ul");

  for(var i=0; i<list.length; i++) {
    // Create entry in participants list
    var participant=this.frontend.event.participants.get(list[i].client_id);
    var data=null;

    if(participant)
      data=participant.data();

    var li=document.createElement("li");
    li.innerHTML=format_name(data);
    ul.appendChild(li);

    // show icon on map
    if(typeof list[i].geometry=="undefined") {
      var lonlat=new OpenLayers.LonLat(list[i].data.longitude, list[i].data.latitude);
      lonlat.transform(fromProjection, toProjection);
      list[i].geometry=new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
    }

    this.vectors.push(new OpenLayers.Feature.Vector(list[i].geometry, 0, format_icon_style(data)));
  }

  this.display.set_value(list.length, ul);

  if(this.layer)
    this.layer.addFeatures(this.vectors);
}

hooks.register("frontend_register", function(frontend) {
  return new participants_frontend(frontend);
});
