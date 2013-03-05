function event_frontend(frontend) {
  this.frontend=frontend;
  this.event=this.frontend.event;

  this.div=document.getElementById("event");
}

event_frontend.prototype.update=function() {
  var list=this.event.messages.request({ request: "newest", type: "event_update" });

  if(list.length)
    this.div.innerHTML=list[0].data.name;
}

hooks.register("frontend_register", function(frontend) {
  return new event_frontend(frontend);
});
