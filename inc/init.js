var map;
var vector_layer;
var layout_css;

function init() {
  if(typeof OpenLayers!="undefined") {
    fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
    toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection

    map = new OpenLayers.Map("map",
	    {
	      numZoomLevels: 19,
	      controls: [ new OpenLayers.Control.Navigation(),
			  new OpenLayers.Control.TouchNavigation() ]
	    });

    map.addControl(new OpenLayers.Control.ScaleLine({ geodesic: true }));

    var basemap=new OpenLayers.Layer.OSM();
    map.addLayer(basemap);
    map.setBaseLayer(basemap);

    vector_layer=new OpenLayers.Layer.Vector("Map", { weight: 10, rendererOptions: { zIndexing: true } });
    vector_layer.setOpacity(0.7);
    map.addLayer(vector_layer);

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

  layout_css=document.createElement("link");
  layout_css.href="inc/layout_landscape.css";
  layout_css.rel="stylesheet";
  layout_css.type="text/css";
  document.head.appendChild(layout_css);

  resize();

  // Event Edit
  if(typeof form_data!="undefined") {
    if(form_data.get_data().timezone=="")
      form_data.set_data({ timezone: new Date().getTimezoneOffset() });
  }
}

function resize() {
  if(window.innerWidth>window.innerHeight)
    layout_css.href="inc/layout_landscape.css";
  else
    layout_css.href="inc/layout_portrait.css";
}

function nav_zoomin() {
  map.zoomIn();
}

function nav_zoomout() {
  map.zoomOut();
}

window.onload=init;
window.onresize=resize;
