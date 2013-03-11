function participants_frontend(frontend) {
  this.frontend=frontend;
  this.current_participants={};

  this.ul=document.createElement("ul");
  this.display=new Display("tracker_list", { title: "TrackerInnen", unit: "", type: "integer", expanded_type: "html" });
  this.display.set_value(0, this.ul);

  this.display.show(document.getElementById("displays"));

  // Positions on the map
  this.vectors=[];
  hooks.register("map_init", function(map) {
    this.map=map;
  }.bind(this));
}

participants_frontend.prototype.update=function() {
  var list=this.frontend.event.messages.request({ request: "newest", type: "gps", min_timestamp: new Date(ServerDate().getTime()-60000).toISOString()  });
  var participants_remove={};
  for(var i in this.current_participants)
    participants_remove[i]=true;

  for(var i=0; i<list.length; i++) {
    if(participants_remove[list[i].client_id])
      delete(participants_remove[list[i].client_id]);

    // Create entry in participants list
    if(!this.current_participants[list[i].client_id])
      this.current_participants[list[i].client_id]=
        this.frontend.event.participants.get(list[i].client_id);

    var participant=this.current_participants[list[i].client_id];

    var data=null;

    if(participant)
      data=participant.data();

    if(!participant.li) {
      participant.li=document.createElement("li");
      this.ul.appendChild(participant.li);
    }

    participant.li.innerHTML=format_name(data);

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

  for(var i in participants_remove) {
    var participant=this.current_participants[i];

    if(participant.li)
      this.ul.removeChild(participant.li);

    if(participant.marker)
      this.map.removeLayer(participant.marker);

    delete(this.current_participants[i]);
  }

  this.display.set_value(list.length, this.ul);
}

hooks.register("frontend_register", function(frontend) {
  return new participants_frontend(frontend);
});
