function participants_frontend(frontend) {
  this.frontend=frontend;

  this.display=new Display("tracker_list", { title: "TrackerInnen", unit: "", type: "integer", expanded_type: "html" });
  this.display.show(document.getElementById("displays"));

  // Positions on the map
  this.vectors=[];
  hooks.register("map_init", function(map) {
    this.map=map;
  }.bind(this));
}

participants_frontend.prototype.update=function() {
  var list=this.frontend.event.messages.request({ request: "newest", type: "gps", min_timestamp: new Date(ServerDate().getTime()-60000).toISOString()  });

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
    if(this.map) {
      if(participant.marker) {
	participant.marker.setIcon(format_icon_style(data));

	participant.marker.setLatLng([
	  list[i].data.latitude,
	  list[i].data.longitude
	]);
      }
      else {
	participant.marker=L.marker([
	  list[i].data.latitude,
	  list[i].data.longitude
	], {
	  title: data.name,
	  icon: format_icon_style(data)
	});

	participant.marker.addTo(this.map);
      }
    }
  }

  this.display.set_value(list.length, ul);
}

hooks.register("frontend_register", function(frontend) {
  return new participants_frontend(frontend);
});
