<?
$color1="#000000";
if(isset($_REQUEST['color1'])&&preg_match("/^#[0-9A-Fa-f]{6}$/", $_REQUEST['color1']))
  $color1=$_REQUEST['color1'];

$color2="#ffffff";
if(isset($_REQUEST['color2'])&&preg_match("/^#[0-9A-Fa-f]{6}$/", $_REQUEST['color2']))
  $color2=$_REQUEST['color2'];

$tmpfile=tempnam("/tmp/", "pos_cycle");
$svg=file_get_contents("img/pos_cycle.svg");
$svg=strtr($svg, array("COLOR1"=>$color1, "COLOR2"=>$color2));

Header("Content-Type: image/svg+xml");
Header("Cache-Control: max-age=86400, public", true);
print $svg;
