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
  var param={};
  param.tracker_id=this_tracker.id;
  param.event_id=current_event.id;

  var data=this.form.get_data();
  data.latitude=gps_object.coords.latitude;
  data.longitude=gps_object.coords.longitude;

  report_display.set_value("Senden ...");
  ajax("report_save", param, JSON.stringify(data), this.save_callback.bind(this));

  return false;
}

Report.prototype.save_callback=function(data) {
  report_reset();
}

function report_start() {
  new Report();
}

register_hook("init", report_init);
