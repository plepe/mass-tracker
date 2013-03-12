function notification_frontend(frontend) {
  this.frontend=frontend;

  this.div=document.createElement("div");
  this.div.id="notification";
  document.body.appendChild(this.div);

  this.ul=document.createElement("ul");
  this.div.appendChild(this.ul);

  hooks.register("notification", this.recv_notification.bind(this), this);
}

notification_frontend.prototype.update=function() {
}

notification_frontend.prototype.recv_notification=function(data) {
  var li=document.createElement("li");
  li.className=NOTIFICATION_LEVELS[data.level];
  li.innerHTML=data.title;

  this.ul.appendChild(li);

  setTimeout(function(li) {
    this.ul.removeChild(li);
  }.bind(this, li), 10000);
}

hooks.register("frontend_register", function(frontend) {
  return new notification_frontend(frontend);
});
