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

  // Get map bounds, so we can check visibility. Check visibility of old
  // positions
  var visible_participants={};
  var visible_participants_count=0;
  var view_moved=[ 0, 0 ];
  if(this.map) {
    var view_bounds=this.map.getBounds();

    for(var i in this.current_participants) {
      var part=this.current_participants[i];

      if(part.marker) {
	var loc=part.marker.getLatLng();

	if(view_bounds.contains(loc)) {
	  visible_participants[i]=loc;
	  visible_participants_count++;
	}
      }
    }
  }

  var participants_boundary=new L.LatLngBounds([]);

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

      if(list[i].client_id in visible_participants) {
	view_moved[0]=view_moved[0]+(list[i].data.latitude-visible_participants[list[i].client_id].lat);
	view_moved[1]=view_moved[1]+(list[i].data.longitude-visible_participants[list[i].client_id].lng);
      }

      participants_boundary.extend([
        list[i].data.latitude,
	list[i].data.longitude
      ]);
    }
  }

  for(var i in participants_remove) {
    var participant=this.current_participants[i];

    if(participant.li)
      this.ul.removeChild(participant.li);

    if(participant.marker)
      this.map.removeLayer(participant.marker);

    delete(this.current_participants[i]);

    if(i in visible_participants) {
      delete(visible_participants);
      visible_participants_count--;
    }
  }

  // if there are visible participants, follow their move
  if(visible_participants_count>0) {
    view_moved[0]=view_moved[0]/visible_participants_count;
    view_moved[1]=view_moved[1]/visible_participants_count;

    var current_center=this.map.getCenter();
    this.map.panTo([
      current_center.lat+view_moved[0],
      current_center.lng+view_moved[1]
    ]);
  }
  // otherwise, if there are only (new?) participants
  else if(list.length>0) {
    // if not all current participants fit on the map, fit map accordingly
    if(!this.map.getBounds().contains(participants_boundary))
      this.map.fitBounds(participants_boundary);
  }

  this.display.set_value(list.length, this.ul);
}

hooks.register("frontend_register", function(frontend) {
  return new participants_frontend(frontend);
});
