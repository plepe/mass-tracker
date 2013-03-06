function format_name(data) {
  var ret="";

  ret+="<img src='"+format_icon(data)+"'> ";

  if(data&&data.name)
    ret+=data.name;
  else
    ret+="Anonymous";

  return ret;
}

function format_icon(data) {
  var ret='img_cycle.php?color1=%color1%&color2=%color2%';

  ret=ret.replace(/%color1%/, urlencode(data.color1));
  ret=ret.replace(/%color2%/, urlencode(data.color2));

  return ret;
}
