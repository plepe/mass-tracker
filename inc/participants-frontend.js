function participants_frontend(frontend) {
  this.frontend=frontend;

  this.display=new Display("tracker_list", { title: "TrackerInnen", unit: "", type: "integer", expanded_type: "html" });
  this.display.show(document.getElementById("displays"));
}

participants_frontend.prototype.update=function() {
  var list=this.frontend.event.messages.request({ request: "newest", type: "gps", min_timestamp: new Date(ServerDate().getTime()-60000).toISOString()  });

  var ul=document.createElement("ul");

  for(var i=0; i<list.length; i++) {
    var li=document.createElement("li");
    li.appendChild(document.createTextNode(list[i].client_id));

    ul.appendChild(li);
  }

  this.display.set_value(list.length, ul);
}

hooks.register("frontend_register", function(frontend) {
  return new participants_frontend(frontend);
});
