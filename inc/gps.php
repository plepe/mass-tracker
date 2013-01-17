<?
function ajax_gps_submit() {
  global $db;

  if(!isset($_SESSION['event_id']))
    return;

  $tracker=new Tracker($_SESSION['event_id']);

  $str=array(
    "'{$tracker->id}'",
    "'".$db->escapeString($_SESSION['event_id'])."'",
    "datetime('now')"
  );

  foreach(array("longitude", "latitude", "altitude", "speed", "accuracy", "altitudeAccuracy", "heading") as $k) {
    if(isset($_REQUEST[$k])&&$_REQUEST[$k])
      $str[]=$db->escapeString($_REQUEST[$k]);
  }

  $str=implode(", ", $str);

  $db->query("insert into gps_log values ($str)");

  return true;
}
