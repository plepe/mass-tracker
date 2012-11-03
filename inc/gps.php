<?
function ajax_gps_submit() {
  global $db;

  if(!isset($_SESSION['event_id']))
    return;

  if(!isset($_SESSION['tracker_id'])) {
    // Calculate an id for this tracker, based on the session_id
    $_SESSION['tracker_id']=base64_encode(md5(session_id(), true));
    while(substr($_SESSION['tracker_id'], -1)=="=")
      $_SESSION['tracker_id']=substr($_SESSION['tracker_id'], 0, -1);
  }

  $str=array(
    "'{$_SESSION['tracker_id']}'",
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
