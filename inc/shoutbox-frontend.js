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
}

shoutbox_frontend.prototype.submit=function() {
  var data=this.form.get_data();

  this.frontend.event.send(data, "shoutbox");
}

shoutbox_frontend.prototype.update=function() {
}

hooks.register("frontend_register", function(frontend) {
  return new shoutbox_frontend(frontend);
});
