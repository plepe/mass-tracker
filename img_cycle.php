<?
$color="#000000";
if(isset($_REQUEST['color'])&&preg_match("/^[0-9A-F]{6}$/", $_REQUEST['color']))
  $color=$_REQUEST['color'];

$tmpfile=tempnam("/tmp/", "pos_cycle");
$svg=file_get_contents("img/pos_cycle.svg");
$svg=strtr($svg, array("COLOR"=>$color));
file_put_contents($tmpfile, $svg);

system("convert -background none SVG:$tmpfile PNG:$tmpfile.png");

Header("Content-Type: image/png");
Header("Cache-Control: max-age=86400, public", true);
print file_get_contents("$tmpfile.png");

unlink("$tmpfile");
unlink("$tmpfile.png");
