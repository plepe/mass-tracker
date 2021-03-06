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

function Report(elem) {
  if(elem)
    this.data=elem;
  else
    this.data={};
}

Report.prototype.show_form=function() {
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
  this.data=data;

  return false;
}

Report.prototype.save_callback=function(data) {
  report_reset();
}

Report.prototype.show=function() {
  this.popup=new OpenLayers.Popup.FramedCloud(
    "popup",
    new OpenLayers.LonLat(this.data.longitude, this.data.latitude)
      .transform(fromProjection, toProjection),
    null,
    this.data.comment,
    null,
    true
  );
  map.addPopup(this.popup);
}

function report_start() {
  new Report().show_form();
}

function report_receive(data) {
  for(var tracker_id in data) {
    for(var i=0; i<data[tracker_id].length; i++) {
      var elem=data[tracker_id][i];

      if(elem.type&&(elem.type=="report")) {
	var report=new Report(elem);
	report.show();
      }
    }
  }
}

register_hook("init", report_init);
register_hook("receive", report_receive);
