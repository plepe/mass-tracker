var map;
var map_location;

function event_edit_init() {
  var data=form_data.get_data();

  if((!data.begin_longitude)||(!data.begin_latitude)) {
    pos=[ 0, 0, 1 ];
  }
  else {
    pos=[
      data.begin_latitude,
      data.begin_longitude,
      16
    ];
  }

  if(data.begin_zoom)
    pos[2]=data.begin_zoom;

  map = L.map('map').setView(pos, pos[2]);

  L.tileLayer(
    "http://tiles-base.openstreetbrowser.org/tiles/basemap_base/{z}/{x}/{y}.png",
    {
      attribution: 'Tiles courtesy <a href="http://www.openstreetbrowser.org/">OpenStreetBrowser</a>, CC-BY-SA <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors</a>'
    }).addTo(this.map);
  document.getElementById("map").style.position="absolute";

   map_location=L.marker(pos, {
     draggable: true
   }).addTo(map);
   map_location.on('drag', event_edit_set_position);
   map_location.on('dragend', event_edit_set_position);
   map.on('zoomend', event_edit_set_position);

   form_data.onchange=event_edit_update_position;
}

function event_edit_update_position() {
  var data=form_data.get_data();

  var pos=[
    data.begin_latitude,
    data.begin_longitude,
    data.begin_zoom
  ];

  map.setView(pos, pos[2]);
  map_location.setLatLng(pos);
}

function event_edit_set_position() {
  var pos=map_location.getLatLng();
  pos={
    'begin_latitude': pos.lat.toFixed(5),
    'begin_longitude': pos.lng.toFixed(5),
    'begin_zoom': map.getZoom()
  };

  form_data.set_data(pos);
}

window.onload=event_edit_init;
