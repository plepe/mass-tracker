var age_styles=[
  { strokeWidth: 3, strokeColor: 1.000, strokeOpacity: 1.0, strokeLinecap: 'round', graphicZIndex: 9 },
  { strokeWidth: 3, strokeColor: 0.933, strokeOpacity: 0.9, strokeLinecap: 'round', graphicZIndex: 8 },
  { strokeWidth: 3, strokeColor: 0.867, strokeOpacity: 0.9, strokeLinecap: 'round', graphicZIndex: 7 },
  { strokeWidth: 3, strokeColor: 0.800, strokeOpacity: 0.8, strokeLinecap: 'round', graphicZIndex: 6 },
  { strokeWidth: 3, strokeColor: 0.667, strokeOpacity: 0.8, strokeLinecap: 'round', graphicZIndex: 5 },
  { strokeWidth: 3, strokeColor: 0.600, strokeOpacity: 0.7, strokeLinecap: 'round', graphicZIndex: 4 },
  { strokeWidth: 3, strokeColor: 0.467, strokeOpacity: 0.7, strokeLinecap: 'round', graphicZIndex: 3 },
  { strokeWidth: 3, strokeColor: 0.400, strokeOpacity: 0.6, strokeLinecap: 'round', graphicZIndex: 2 },
  { strokeWidth: 3, strokeColor: 0.267, strokeOpacity: 0.6, strokeLinecap: 'round', graphicZIndex: 1 },
  { strokeWidth: 3, strokeColor: 0.200, strokeOpacity: 0.5, strokeLinecap: 'round', graphicZIndex: 0 },
];
var pos_style={
  graphicWidth: 25,
  graphicHeight: 25,
  graphicXOffset: -13,
  graphicYOffset: -13,
  graphicZIndex: 10
};
var this_tracker;
var tracker_data_form={
  'name': {
    'name':	"Name",
    'type':	'text'
  },
  'color1': {
    'name':	"Farbe #1",
    'type':	'color'
  },
  'color2': {
    'name':	"Farbe #2",
    'type':	'color'
  }
};
var tracker_data_form_default={
  'name': "Anonymous",
  'color1': "#0000ff",
  'color2': "#ffff00"
};

function tracker_frontend(frontend) {
  this.frontend=frontend;
  this.data={};
  for(var i in tracker_data_form_default)
    this.data[i]=tracker_data_form_default[i];

  this.log=[];
  this.participate=false;

  this.create_display();
  this.update_style();
}

tracker_frontend.prototype.update=function() {
}

tracker_frontend.prototype.cleanup=function() {
  var newlog=[];
  var current=this.frontend.show_date();

  for(var j=0; j<this.log.length; j++) {
    var timestamp=this.log[j].timestamp;
    timestamp=timestamp.substr(0, 10)+"T"+timestamp.substr(11, 8)+"Z";

    var age=(current.getTime()-new Date(timestamp).getTime())/1000;

    if(age<=600)
      newlog.push(this.log[j]);
  }

  this.log=newlog;
}

tracker_frontend.prototype.update_style=function() {
  this.age_styles=[];
  for(var i=0; i<age_styles.length; i++) {
    this.age_styles[i]={};
    for(var j in age_styles[i])
      this.age_styles[i][j]=age_styles[i][j];

    this.age_styles[i].strokeColor=color_mul(this.data.color1, this.age_styles[i].strokeColor);
  }

  this.pos_style={};
  for(var j in pos_style)
    this.pos_style[j]=pos_style[j];

  this.pos_style.externalGraphic=format_icon(this.data);
  this.pos_style.graphicTitle=this.data.name;
}

tracker_frontend.prototype.format_name=function() {
  return format_name(this.data);
}

tracker_frontend.prototype.icon=function() {
  return format_icon(this.data);
}

tracker_frontend.prototype.set_data=function(data) {
  for(var i in data)
    if(data[i])
      this.data[i]=data[i];

  this.update_style();
}

tracker_frontend.prototype.show_form=function(dom) {
  var data=this.data;
  if(!data) {
    data={};
    for(var i in tracker_data_form_default)
      data[i]=tracker_data_form_default[i];
  }

  this.form=new form("this_tracker_data", tracker_data_form);
  this.form.show(dom);
  this.form.set_data(data);
}

tracker_frontend.prototype.show_start_participate=function() {
  var begin_time=this.frontend.event.get_date('begin_time');
  if(begin_time.getTime()>now().getTime()) {
    this.display.set_value("ab "+strftime("%H:%M", begin_time/1000), "");
    window.setTimeout(this.show_start_participate.bind(this),
      begin_time.getTime()-now().getTime());
    this.frontend.event.time_shift=0;

    return;
  }

  var dom=document.createElement("form");

  var div=document.createElement("div");
  div.className="note";
  var note=document.createTextNode("Damit stellst Du Deine Geo-Information zur Verfügung, damit die Ausdehnung der Critical Mass beobachtet werden kann.");
  div.appendChild(note);
  dom.appendChild(div);

  this.show_form(dom);

  var input=document.createElement("input");
  input.type="button";
  input.value="Start Tracking!";
  input.onclick=this.submit_participate.bind(this);
  dom.appendChild(input);

  this.display.set_value("Klicke hier!", dom);
  var div=document.createElement("div");
  div.id="icon_preview";
  var inp=document.getElementById("this_tracker_data_color1");
  inp.parentNode.insertBefore(div, inp.parentNode.firstChild);

  var txt=document.createTextNode("Vorschau: ");
  div.appendChild(txt);

  var img=document.createElement("img");
  img.src=this.icon();
  img.onload=function(img) {
    img.className="loaded";
  }.bind(this, img);
  div.appendChild(img);

  $("#this_tracker_data_color1 input").spectrum({
    clickoutFiresChange: true,
    move: function(img, c) {
      var data=this.form.get_data();
      img.className="loading";
      img.src=format_icon({ color1: c.toHexString(true), color2: data.color2 });
    }.bind(this, img)
  });

  $("#this_tracker_data_color2 input").spectrum({
    clickoutFiresChange: true,
    move: function(img, c) {
      var data=this.form.get_data();
      img.className="loading";
      img.src=format_icon({ color1: data.color1, color2: c.toHexString(true) });
    }.bind(this, img)
  });

}

tracker_frontend.prototype.submit_participate=function() {
  var param=this.form.get_data();

  this.participate=true;
  this.frontend.event.send(param, "tracker_start", this.submit_participate_callback.bind(this));
  this.set_data(this.form.get_data());
}

tracker_frontend.prototype.submit_participate_callback=function(data) {
  this.display.hide_expanded();
  this.display.set_value(format_name(data));
  //this.show_edit_participate();

  this.refresh();
}

tracker_frontend.prototype.show_edit_participate=function() {
  var dom=document.createElement("form");

  this.show_form(dom);

  var input=document.createElement("input");
  input.type="button";
  input.value="Speichere Einstellungen";
  input.onclick=this.submit_participate.bind(this);
  dom.appendChild(input);

  var input=document.createElement("input");
  input.type="button";
  input.value="Stop Tracking!";
  input.onclick=this.stop_participate.bind(this);
  dom.appendChild(input);

  this.display.set_value(null, dom);
}

tracker_frontend.prototype.stop_participate=function() {
  var param={
    'id': this.frontend.event.id
  };

  this.participate=false;
  // TODO: ajax("tracker_stop", param, this.stop_participate_callback.bind(this));
}

tracker_frontend.prototype.stop_participate_callback=function() {
  this.display.hide_expanded();

  this.show_start_participate();
}

tracker_frontend.prototype.show_end_event=function() {
  this.display.set_value("vorbei");
  this.participate=false;
}

tracker_frontend.prototype.create_display=function() {
  this.display=new Display("this_tracker", { title: "Teilnahme", unit: "", type: "large" });
  this.display.show(document.getElementById("displays"));

  var end_time=this.frontend.event.get_date('end_time');
  if(end_time.getTime()>now().getTime()) {
    var x=end_time.getTime()-now().getTime();
    window.setTimeout(this.show_end_event.bind(this),
      x);

    this.show_start_participate();
  }
  else {
    this.show_end_event();
  }
}

tracker_frontend.prototype.push_point=function(point) {
  this.log.push(point);
}

tracker_frontend.prototype.reset=function() {
  this.log=[];
}

tracker_frontend.prototype.refresh=function(current) {
  if(!current)
    current=this.frontend.event.current_time;

  if(this.features)
    vector_layer.removeFeatures(this.features);
  if(this.pos_feature)
    vector_layer.removeFeatures([this.pos_feature]);

  this.features=[];
  this.pos_feature=null;
  this.center_pos=null;

  var geo=[[], [], [], [], [], [], [], [], [], []];
  var last=null;
  var pos=null;
  var last_age=null;
  var age_index=0;

  for(var j=0; j<this.log.length; j++) {
    var timestamp=this.log[j].timestamp;
    timestamp=timestamp.substr(0, 10)+"T"+timestamp.substr(11, 8)+"Z";

    var age=(current.getTime()-new Date(timestamp).getTime())/1000;
    var age_category=floor(age/60);

    if(this.log[j].tracker_data) {
      this.set_data(this.log[j].tracker_data);

      this.update_style();
      // TODO: color trail in varying colors
    }

    if((age>=600)||(age<0))
      continue;
    if(!geo[age_category])
      geo[age_category]=[[]];
    if(geo[age_category].length==0) {
      geo[age_category].push([]);

      if(last&&(last_age-age<=10))
	geo[age_category][age_index].push(last);
    }

    if(this.log[j].latitude&&this.log[j].longitude) {
      pos = new OpenLayers.LonLat(this.log[j].longitude, this.log[j].latitude).transform(fromProjection, toProjection);
      var poi=new OpenLayers.Geometry.Point(pos.lon, pos.lat);
      if((last_age)&&(last_age-age>10)) {
	geo[age_category].push([]);
      }

      geo[age_category][geo[age_category].length-1].push(poi);
      last=poi;
      last_age=age;
    }
  }

  if(pos&&(last_age<=30)) {
    this.center_pos=pos;

    var poi=new OpenLayers.Geometry.Point(pos.lon, pos.lat);
    this.pos_feature=new OpenLayers.Feature.Vector(poi, 0, this.pos_style);
  }

  for(var j=0; j<geo.length; j++) {
    for(var k=0; k<geo[j].length; k++) {
      geo[j][k]=new OpenLayers.Geometry.LineString(geo[j][k]);
      this.features.push(new OpenLayers.Feature.Vector(geo[j][k], 0, this.age_styles[j]));
    }
  }

  vector_layer.addFeatures(this.features);
  if(this.pos_feature)
    vector_layer.addFeatures([this.pos_feature]);
}

tracker_frontend.prototype.remove=function() {
  if(this.features)
    vector_layer.removeFeatures(this.features);
  if(this.pos_feature)
    vector_layer.removeFeatures([this.pos_feature]);
}

hooks.register("frontend_register", function(frontend) {
  return new tracker_frontend(frontend);
});
