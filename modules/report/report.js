var report_form={
  'comment': {
    'type': "text",
    'name': "Kommentar"
  }
};
var report_display;

function report_init(displays) {
  report_display=new Display("report", { title: "", type: "large", unit: "" });
  report_display.show(displays);
  report_reset();
}

function report_reset() {
  report_display.set_value("<input type='button' value='Berichte!' onClick='report_start()'>");
}

function Report() {
  this.form_dom=document.createElement("form");
  this.form_dom.id="report_form";
  this.form_dom.onsubmit=this.save.bind(this);

  this.form=new form("report_form", report_form);
  this.form.show(this.form_dom);

  var input=document.createElement("input");
  input.type="submit";
  input.value="Senden";
  this.form_dom.appendChild(input);

  report_display.set_value(this.form_dom);
}

Report.prototype.save=function() {
  report_display.set_value("Senden ...");
  alert(JSON.stringify(this.form.get_data()));

  return false;
}

function report_start() {
  new Report();
}

register_hook("init", report_init);
