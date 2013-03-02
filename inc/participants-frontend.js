function participants_frontend(frontend) {
  this.frontend=frontend;

  this.div_content=document.createElement("div");
  this.div_content.className="participants";
  this.frontend.div_content.appendChild(this.div_content);
}

participants_frontend.prototype.update=function() {
  var list=this.frontend.event.messages.request({ request: "newest", type: "gps", min_timestamp: new Date(ServerDate().getTime()-60000).toISOString()  });

  var ul=document.createElement("ul");

  for(var i=0; i<list.length; i++) {
    var li=document.createElement("li");
    li.appendChild(document.createTextNode(list[i].client_id));

    ul.appendChild(li);
  }

  while(this.div_content.firstChild)
    this.div_content.removeChild(this.div_content.firstChild);

  this.div_content.appendChild(ul);
}

hooks.register("frontend_register", function(frontend) {
  return new participants_frontend(frontend);
});
