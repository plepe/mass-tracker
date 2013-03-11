function map_frontend(frontend) {
  this.frontend=frontend;

  this.map = L.map('map').setView([ 48.21, 16.36 ], 16);

  L.tileLayer(
    "http://tiles-base.openstreetbrowser.org/tiles/basemap_base/{z}/{x}/{y}.png",
    {
      attribution: 'Tiles courtesy <a href="http://www.openstreetbrowser.org/">OpenStreetBrowser</a>, CC-BY-SA <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors</a>'
    }).addTo(this.map);
  document.getElementById("map").style.position="absolute";

  setTimeout(hooks.call.bind(this, "map_init", this.map), 1);
}

map_frontend.prototype.update=function() {
}

hooks.register("frontend_register", function(frontend) {
  if(typeof OpenLayers=="undefined")
    return;

  return new map_frontend(frontend);
});

// from http://svn.geotools.org/sandbox/adube/openlayers/examples/spherical-mercator.html
function osm_getTileURL(bounds) {
  var res = this.map.getResolution();
  var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
  var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
  var z = this.map.getZoom();
  var limit = Math.pow(2, z);

  if (y < 0 || y >= limit) {
    return OpenLayers.Util.getImagesLocation() + "404.png";
  } else {
    x = ((x % limit) + limit) % limit;
    return this.url + z + "/" + x + "/" + y + "." + this.type;
  }
}


