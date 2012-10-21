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
