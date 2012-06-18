<?
function ajax_gps_submit() {
  global $db;

  if(!isset($_SESSION['event_id']))
    return;

  $str=array(
    "'".session_id()."'",
    "'".sqlite_escape_string($_SESSION['event_id'])."'",
    "datetime('now')"
  );

  foreach(array("longitude", "latitude", "altitude", "speed", "accuracy", "altitudeAccuracy", "heading") as $k) {
    if(isset($_REQUEST[$k])&&$_REQUEST[$k])
      $str[]=sqlite_escape_string($_REQUEST[$k]);
  }

  $str=implode(", ", $str);

  sqlite_query($db, "insert into gps_log values ($str)");

  return true;
}
