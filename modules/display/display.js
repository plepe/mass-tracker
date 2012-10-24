var displays={};

function Display(id, options) {
  this.id=id;
  this.options=options;
  if(!this.options)
    options={};

  displays[id]=this;
}

Display.prototype.set_value=function(value) {
  switch(this.options.type) {
    case "datetime":
      value=strftime("%H:%M", value.getTime()/1000);
      break;
    default:
      if(this.options.format)
	value=sprintf(this.options.format, value);
  }

  if(this.value_node)
    this.value_node.innerHTML=value;
}

Display.prototype.show=function(parentNode) {
  this.div=document.createElement("div");
  this.div.id=this.id;
  this.div.className="display";

  var span=document.createElement("span");
  span.className="title";
  this.div.appendChild(span);
  span.innerHTML=this.options.title;

  this.value_node=document.createElement("span");
  this.value_node.className="value numeric";
  this.div.appendChild(this.value_node);

  var span=document.createElement("span");
  span.className="unit";
  this.div.appendChild(span);
  span.innerHTML=this.options.unit;

  if(parentNode)
    parentNode.appendChild(this.div);

  return this.div;
}
