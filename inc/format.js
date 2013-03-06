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

  var color1="#ffffff";
  if(data&&(typeof data.color1!="undefined"))
    color1=data.color1;
  var color2="#000000";
  if(data&&(typeof data.color2!="undefined"))
    color2=data.color2;

  ret=ret.replace(/%color1%/, urlencode(color1));
  ret=ret.replace(/%color2%/, urlencode(color2));

  return ret;
}
