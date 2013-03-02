var client;

get_cookie=function(k) {
  if(document.cookie) {
    var cookies=document.cookie.split(/;/);

    for(var i=0; i<cookies.length; i++) {
      var m;

      if(m=cookies[i].match(/ *([A-Za-z0-9_]+)=(.*)$/)) {
	if(m[1]==k)
	  return JSON.parse(m[2]);
      }
    }
  }

  return {};
}

set_cookie=function(key, value) {
  var expiry=new Date();
  expiry.setTime(expiry.getTime()+365*86400000);

  document.cookie=key+"="+JSON.stringify(value)+"; expires="+expiry.toGMTString()+"; path=/";
}

function init() {
  conf=get_cookie("mass_tracker");
  if(!conf)
    conf={};

  connection_init();
  client=new Client(websocket_url, conf);
  var ev=new Event("foobar", client);

  gps_init(ev);

  frontend_init(ev);
}

window.onload=init;
