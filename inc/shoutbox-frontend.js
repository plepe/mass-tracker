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
  this.shout_log.className="shout_log";
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

shoutbox_frontend.prototype.format_date=function(message) {
  var d=new Date(message.timestamp).getTime()/1000;
  var now=new Date().getTime()/1000;
  var days=now-d;

  if(now-d>2*86400)
    str=strftime("%d %b, %H:%M", d);
  if(now-d>1*86400)
    str=strftime("gestern, %H:%M", d);
  else
    str=strftime("%H:%M", d);

  return document.createTextNode(str);
}

shoutbox_frontend.prototype.receive_message=function(message) {
  var div=document.createElement("div");
  div.className="shout";
  div.message=message;

  var div1=document.createElement("div");
  div1.className="client";
  var user=this.frontend.event.messages.request({ type: "tracker_start", request: "newest", client_id: message.client_id });
  if(user.length)
    div1.innerHTML=format_name(user[0].data);
  else
    div1.innerHTML="Anonymous";
  div.appendChild(div1);

  var div1=document.createElement("div");
  div1.className="time";
  div1.appendChild(this.format_date(message));
  div.appendChild(div1);

  var div1=document.createElement("div");
  div1.className="message";
  var str=message.data.text;
  if(typeof str=="string") {
    str=str.replace(/&/g, "&amp;");
    str=str.replace(/</g, "&lt;");
    str=str.replace(/>/g, "&gt;");
    str=str.replace(/\n/g, "<br>\n");
  }
  div1.innerHTML=str;
  div.appendChild(div1);

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
