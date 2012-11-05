function report_init(displays) {
  var d=new Display("report", { title: "", type: "large", unit: "" });
  d.show(displays);
  d.set_value("<input type='button' value='Berichte!' onClick='report_start()'>");
}

function report_start() {
  alert("Ok");
}

register_hook("init", report_init);
