function shoutbox_frontend(frontend) {
  this.frontend=frontend;

  var div=document.createElement("div");
  var form_div=document.createElement("form");
  div.appendChild(form_div);

  this.form=new form("shoutbox", {
    'text':	{
      'type': 'textarea',
      'name': "Text"
    }
  });
  this.form.show(form_div);

  var submit=document.createElement("input");
  submit.type="button";
  submit.value="Shout!";
  submit.onclick=this.submit.bind(this);
  form_div.appendChild(submit);

  this.shout_log=document.createElement("div");
  div.appendChild(this.shout_log);

  this.display=new Display("shoutbox", { title: "Shoutbox", unit: "", type: "integer", expanded_type: "html" });

  this.display.show(document.getElementById("displays"));
  this.display.show_expanded();

  this.display.set_value("", div);

  hooks.register("message_received", this.receive_message.bind(this), this);
  hooks.register("messages_received", this.reset.bind(this), this);
}

shoutbox_frontend.prototype.submit=function() {
  var data=this.form.get_data();

  this.frontend.event.send(data, "shoutbox");
}

shoutbox_frontend.prototype.reset=function(message) {
  this.shout_log.innerHTML="";

  var list=this.frontend.event.messages.request({ type: "shoutbox" });

  for(var i=0; i<list.length; i++) {
    this.receive_message(list[i]);
  }
}

shoutbox_frontend.prototype.receive_message=function(message) {
  var div=document.createElement("div");
  div.innerHTML=message.client_id+": "+JSON.stringify(message.data);

  if(this.shout_log.firstChild)
    this.shout_log.insertBefore(div, this.shout_log.firstChild);
  else
    this.shout_log.appendChild(div);
}

shoutbox_frontend.prototype.update=function() {
}

hooks.register("frontend_register", function(frontend) {
  return new shoutbox_frontend(frontend);
});
