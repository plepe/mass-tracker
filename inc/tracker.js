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
  externalGraphic: 'img_cycle.php?color=%',
  graphicWidth: 25,
  graphicHeight: 25,
  graphicXOffset: -13,
  graphicYOffset: -13,
  graphicZIndex: 10
};
var tracker_colors=[ "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF", "#7FFF00" ];
var tracker_colors_index=0;
var this_tracker;
var tracker_data_form={
  'name': {
    'name':	"Name",
    'type':	'text'
  },
};
var tracker_data_form_default={
  'name': "Anonymous"
};

function tracker(id) {
  this.id=id;
  this.data=null;

  this.log=[];
  this.color=tracker_colors[tracker_colors_index++];
  if(tracker_colors_index>=tracker_colors_index.length)
    tracker_colors_index=0;

  this.age_styles=[];
  for(var i=0; i<age_styles.length; i++) {
    this.age_styles[i]={};
    for(var j in age_styles[i])
      this.age_styles[i][j]=age_styles[i][j];

    this.age_styles[i].strokeColor=color_mul(this.color, this.age_styles[i].strokeColor);
  }

  this.pos_style={};
  for(var j in pos_style)
    this.pos_style[j]=pos_style[j];

  this.pos_style.externalGraphic=
    this.pos_style.externalGraphic.replace(/%/, this.color.substr(1));
}

tracker.prototype.format_name=function() {
  var ret="";

  if(this.data&&this.data.name)
    ret=this.data.name;

  return ret;
}

tracker.prototype.set_data=function(data) {
  this.data=data;
}

tracker.prototype.show_form=function(dom) {
  var data=this.data;
  if(!data)
    data=tracker_data_form_default;

  this.form=new form("this_tracker_data", tracker_data_form);
  this.form.show(dom);
  this.form.set_data(data);
}

tracker.prototype.start_participate=function() {
  var dom=document.createElement("form");

  this.show_form(dom);

  var input=document.createElement("input");
  input.type="button";
  input.value="Start Tracking!";
  input.onclick=this.submit_participate.bind(this);
  dom.appendChild(input);

  this.display.set_value(dom);
}

tracker.prototype.submit_participate=function() {
  var param={
    'tracker_data': this.form.get_data(),
    'id': current_event.id
  };

  ajax("tracker_start", param, this.submit_participate_callback.bind(this));
  this.set_data(this.form.get_data());
}

tracker.prototype.submit_participate_callback=function(data) {
  var input=document.createElement("input");
  input.type="button";
  input.value="X "+this.data.name;
  input.onclick=this.edit_participate.bind(this);

  this.display.set_value(input);
}

tracker.prototype.edit_participate=function() {
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

  this.display.set_value(dom);
}

tracker.prototype.stop_participate=function() {
  var param={
    'id': current_event.id
  };

  ajax("tracker_stop", param, this.stop_participate_callback.bind(this));
}

tracker.prototype.stop_participate_callback=function() {
  var input=document.createElement("input");
  input.type="button";
  input.value="An Ereignis teilnehmen";
  input.onclick=this.start_participate.bind(this);

  this.display.set_value(input);
}

tracker.prototype.create_display=function(displays) {
  this.display=new Display("this_tracker", { title: "Teilnahme", unit: "", type: "large" });
  this.display.show(displays);

  var input=document.createElement("input");
  input.type="button";
  input.value="An Ereignis teilnehmen";
  input.onclick=this.start_participate.bind(this);

  this.display.set_value(input);
}

tracker.prototype.push_point=function(point) {
  this.log.push(point);
}

tracker.prototype.refresh=function(current) {
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

  for(var j=0; j<this.log.length; j++) {
    var timestamp=this.log[j].timestamp;
    timestamp=timestamp.substr(0, 10)+"T"+timestamp.substr(11, 8)+"Z";

    var age=(current.getTime()-new Date(timestamp).getTime())/1000;
    var age_category=floor(age/60);

    if((age>=600)||(age<0))
      continue;
    if(last&&(geo[age_category].length==0))
      geo[age_category].push(poi);

    if(this.log[j].latitude&&this.log[j].longitude) {
      pos = new OpenLayers.LonLat(this.log[j].longitude, this.log[j].latitude).transform(fromProjection, toProjection);
      var poi=new OpenLayers.Geometry.Point(pos.lon, pos.lat);
      geo[age_category].push(poi);
      last=poi;
    }
    if(this.log[j].tracker_data) {
      this.data=this.log[j].tracker_data;

      // TODO: update style
      // TODO: color trail in varying colors
    }

    last_age=age;
  }

  if(pos&&(last_age<=30)) {
    this.center_pos=pos;

    var poi=new OpenLayers.Geometry.Point(pos.lon, pos.lat);
    this.pos_feature=new OpenLayers.Feature.Vector(poi, 0, this.pos_style);
  }

  for(var j=0; j<geo.length; j++) {
    geo[j]=new OpenLayers.Geometry.LineString(geo[j]);
    this.features[j]=new OpenLayers.Feature.Vector(geo[j], 0, this.age_styles[j]);
  }

  vector_layer.addFeatures(this.features);
  if(this.pos_feature)
    vector_layer.addFeatures([this.pos_feature]);
}
