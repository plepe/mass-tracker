function color_mul(color, fact) {
  var ret="#";

  for(var i=0; i<3; i++) {
    var part=parseInt(color.substr(i*2+1, 2), 16);
    
    part=Math.floor(part*fact);

    part=part.toString(16);

    part="00".substr(part.length)+part;

    ret+=part;
  }

  return ret;
}

function get_date(timestamp) {
  timestamp=timestamp.substr(0, 10)+"T"+timestamp.substr(11)+"Z";
  return new Date(timestamp);
}

function now() {
  if(typeof client_time_offset == "undefined")
    client_time_offset=0;

  return new Date(new Date().getTime()-client_time_offset);
}
