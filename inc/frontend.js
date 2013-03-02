function Frontend(event) {
  this.event=event;

  this.div_content=document.createElement("div");
  this.div_content.id="content";
  document.body.appendChild(this.div_content);

  this.div_status=document.createElement("div");
  this.div_status.id="status";
  document.body.appendChild(this.div_status);

  this.div_debug=document.createElement("div");
  this.div_debug.id="debug";
  document.body.appendChild(this.div_debug);

  this.frontends=hooks.call("frontend_register", this);

  this.update();

  setInterval(this.update.bind(this), 1000);
}

Frontend.prototype.update=function() {
  for(var i=0; i<this.frontends.length; i++)
    this.frontends[i].update();
}

function frontend_init(event) {
  new Frontend(event);
}
