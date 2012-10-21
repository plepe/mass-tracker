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

function tracker(id) {
  this.id=id;

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

    if(age>=600)
      continue;
    if(last&&(geo[age_category].length==0))
      geo[age_category].push(poi);

    pos = new OpenLayers.LonLat(this.log[j].longitude, this.log[j].latitude).transform(fromProjection, toProjection);
    var poi=new OpenLayers.Geometry.Point(pos.lon, pos.lat);
    geo[age_category].push(poi);
    last=poi;
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
