// configuration
var gps_interval=2; // seconds

// globals
var gps_object=null;

function gps(event) {
  this.last_submit=null;
  this.event=event;

  if(navigator.geolocation)
    this.watch=navigator.geolocation.watchPosition(
      this.update.bind(this), null, {
	enableHighAccuracy: true,
	maximumAge: 1000 // no more than a second
      });
}

gps.prototype.update_callback=function() {
}

gps.prototype.update=function(lonlat) {
  // generate this.coords object from lonlat.coords
  this.coords={};
  for(var i in lonlat.coords)
    this.coords[i]=lonlat.coords[i];
  this.coords.timestamp=new Date(lonlat.timestamp).toISOString();

  var current=ServerDate();
  var sent=false;

  if(this.event.client.participate&&  // participating?
     (this.coords.accuracy<50)&&      // accuracy good enough
     ((this.last_submit===null)||     // never submitted?
      (current.getTime()>=this.last_submit.getTime()+gps_interval*1000))) { // not too often?
    this.event.send(this.coords, "gps");
    this.last_submit=current;
  }

  call_hooks("gps_update", this);
}

gps.prototype.get_coords=function() {
  return this.coords;
}

function gps_init(event) {
  if(!navigator.geolocation)
    return;

  gps_object=new gps(event);
}

//register_hook("init", gps_init);
