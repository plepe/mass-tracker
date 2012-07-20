var map;
var vector_layer;
var layout_css;

function init() {
  if(typeof OpenLayers!="undefined") {
    fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
    toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection

    map = new OpenLayers.Map("map",
	    {
	      maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
	      maxResolution: 156543.0399,
	      numZoomLevels: 19,
	      controls: [ new OpenLayers.Control.Navigation(),
			  new OpenLayers.Control.TouchNavigation() ]
	    });

    map.addControl(new OpenLayers.Control.ScaleLine({ geodesic: true }));

    //var basemap=new OpenLayers.Layer.OSM();
    var basemap=new OpenLayers.Layer.TMS("OpenStreetBrowser",
      "http://tiles-base.openstreetbrowser.org/tiles/basemap_base/", {
      type: 'png',
      getURL: osm_getTileURL,
      displayOutsideMaxExtent: true,
      attribution: 'Tiles courtesy <a href="http://www.openstreetbrowser.org/">OpenStreetBrowser</a>, CC-BY-SA <a href="http://www.openstreetmap.org/">OpenStreetMap</a> contributors</a>'
    });
    map.addLayer(basemap);
    map.setBaseLayer(basemap);

    vector_layer=new OpenLayers.Layer.Vector("Map", { weight: 10, rendererOptions: { zIndexing: true } });
    vector_layer.setOpacity(0.7);
    map.addLayer(vector_layer);

    resize();

    if(current_event) {
      current_event.center_map();
    }
    else {
      map.setCenter(new OpenLayers.LonLat(0, 0).transform(fromProjection, toProjection), 1);
    }

    gps_init();
    em=new event_map();
    //em.set_date("2012-06-17T14:40:00Z");
  }

  // Event Edit
  if(typeof form_data!="undefined") {
    if(form_data.get_data().timezone=="")
      form_data.set_data({ timezone: new Date().getTimezoneOffset() });
  }
}

function resize() {
  if(map)
    var center=map.center;

  if(!layout_css)
    layout_css=document.getElementById("layout_css");

  if(window.innerWidth>window.innerHeight)
    layout_css.href="inc/layout_landscape.css";
  else
    layout_css.href="inc/layout_portrait.css";


  if(map)
    map.setCenter(center);
}

function nav_zoomin() {
  map.zoomIn();
}

function nav_zoomout() {
  map.zoomOut();
}

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

window.onload=init;
window.onresize=resize;
