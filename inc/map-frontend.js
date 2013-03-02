function map_frontend(frontend) {
  this.frontend=frontend;

  fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
  toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection

  this.div_content=document.createElement("div");
  this.div_content.className="map";
  this.div_content.id="content_map";
  this.frontend.div_content.appendChild(this.div_content);

  this.map = new OpenLayers.Map("content_map", {
	    maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
	    maxResolution: 156543.0399,
	    numZoomLevels: 19,
	    projection: new OpenLayers.Projection("EPSG:900913"),
	    displayProjection: new OpenLayers.Projection("EPSG:900913"),
	    controls: [ new OpenLayers.Control.Navigation(),
			new OpenLayers.Control.TouchNavigation() ]
	  });

  this.map.addControl(new OpenLayers.Control.ScaleLine({ geodesic: true }));

  var basemap=new OpenLayers.Layer.TMS("OpenStreetBrowser",
    "http://tiles-base.openstreetbrowser.org/tiles/basemap_base/", {
    type: 'png',
    getURL: osm_getTileURL,
    displayOutsideMaxExtent: true,
    attribution: 'Tiles courtesy <a href="http://www.openstreetbrowser.org/">OpenStreetBrowser</a>, CC-BY-SA <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors</a>'
  });

  this.map.addLayer(basemap);
  this.map.setBaseLayer(basemap);

  this.map.addLayer(new OpenLayers.Layer.OSM());

  this.map.setCenter(new OpenLayers.LonLat(16.36, 48.21).transform(fromProjection, toProjection), 16);

  setInterval(hooks.call.bind(this, "map_init", this.map), 1);
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


