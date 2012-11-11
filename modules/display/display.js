var displays={};

function Display(id, options) {
  this.id=id;
  this.options=options;
  if(!this.options)
    options={};

  displays[id]=this;
}

Display.prototype.set_value=function(value, expanded_value) {
  // remove current content
  var current=(this.value_node?this.value_node.firstChild:null);
  while(current) {
    var next=current.nextSibling;
    this.value_node.removeChild(current);
    current=next;
  }

  // remove current content
  var current=(this.expanded_node?this.expanded_node.firstChild:null);
  while(current) {
    var next=current.nextSibling;
    this.expanded_node.removeChild(current);
    current=next;
  }

  switch(this.options.type) {
    case "datetime":
      value=strftime("%H:%M", value.getTime()/1000);
      break;
    default:
      if(this.options.format)
	value=sprintf(this.options.format, value);
  }

  if(this.value_node&&value) {
    if(value.nodeType)
      this.value_node.appendChild(value);
    else
      this.value_node.innerHTML=value;
  }

  if(this.expanded_node&&expanded_value) {
    if(value.nodeType)
      this.expanded_node.appendChild(expanded_value);
    else
      this.expanded_node.innerHTML=expanded_value;
  }
}

Display.prototype.toggle_expanded=function() {
  this.expanded_container.className=
    (this.expanded_container.className=="expanded_hidden"?
      "expanded":"expanded_hidden");
}

Display.prototype.show_expanded=function() {
  this.expanded_container.className="expanded";
}

Display.prototype.hide_expanded=function() {
  this.expanded_container.className="show_expanded";
}

Display.prototype.show=function(parentNode) {
  this.div=document.createElement("div");
  this.div.id=this.id;
  this.div.className="display "+this.options.type;

  var container=document.createElement("span");
  container.className="title";
  this.div.appendChild(container);
  container.onclick=this.toggle_expanded.bind(this);

  var span=document.createElement("span");
  container.appendChild(span);
  span.innerHTML=this.options.title;

  var container=document.createElement("span");
  container.className="value";
  this.div.appendChild(container);

  this.value_node=document.createElement("span");
  this.value_node.className="";
  container.appendChild(this.value_node);

  var container=document.createElement("span");
  container.className="unit";
  this.div.appendChild(container);

  var span=document.createElement("span");
  span.className="";
  container.appendChild(span);
  span.innerHTML=this.options.unit;

  var container=document.createElement("span");
  container.className="expanded_hidden";
  this.div.appendChild(container);
  this.expanded_container=container;

  this.expanded_node=document.createElement("span");
  this.expanded_node.className="";
  container.appendChild(this.expanded_node);

  if(parentNode)
    parentNode.appendChild(this.div);

  return this.div;
}
