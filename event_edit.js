var map;
var map_location;

function event_edit_init() {
  map = L.map('map').setView([ 48.21, 16.36 ], 16);

  L.tileLayer(
    "http://tiles-base.openstreetbrowser.org/tiles/basemap_base/{z}/{x}/{y}.png",
    {
      attribution: 'Tiles courtesy <a href="http://www.openstreetbrowser.org/">OpenStreetBrowser</a>, CC-BY-SA <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors</a>'
    }).addTo(this.map);
  document.getElementById("map").style.position="absolute";

   map_location=L.marker([ 48.21, 16.36 ], {
     draggable: true
   }).addTo(map);
   map_location.on('drag', event_edit_set_position);
   map_location.on('dragend', event_edit_set_position);
   map.on('zoomend', event_edit_set_position);
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
