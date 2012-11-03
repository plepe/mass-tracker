var displays={};

function Display(id, options) {
  this.id=id;
  this.options=options;
  if(!this.options)
    options={};

  displays[id]=this;
}

Display.prototype.set_value=function(value) {
  // got a dom node/element?
  if(value.nodeType) {
    // remove current content
    var current=this.value_node.firstChild;
    while(current) {
      var next=current.nextSibling;
      this.value_node.removeChild(current);
      current=next;
    }

    // append dom as only child
    this.value_node.appendChild(value);
    return;
  }

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
  this.div.className="display "+this.options.type;

  var span=document.createElement("span");
  span.className="title";
  this.div.appendChild(span);
  span.innerHTML=this.options.title;

  this.value_node=document.createElement("span");
  this.value_node.className="value ";
  this.div.appendChild(this.value_node);

  var span=document.createElement("span");
  span.className="unit";
  this.div.appendChild(span);
  span.innerHTML=this.options.unit;

  if(parentNode)
    parentNode.appendChild(this.div);

  return this.div;
}
