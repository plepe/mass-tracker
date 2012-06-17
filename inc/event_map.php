<?
function ajax_event_map_update() {
  global $db;
  $ret=array();
  $last_timestamp='';

  if(isset($_REQUEST['last_timestamp']))
    $where="timestamp>'".sqlite_escape_string($_REQUEST['last_timestamp'])."' and timestamp>datetime('now', '-10 minute')";
  else
    $where="timestamp>datetime('now', '-10 minute')";

  $res=sqlite_query($db, "select * from gps_log where $where order by session_id, timestamp desc");
  while($elem=sqlite_fetch_array($res, SQLITE_ASSOC)) {
    if($elem['timestamp']>$last_timestamp)
      $last_timestamp=$elem['timestamp'];

    $ret[$elem['session_id']][]=array(
      'timestamp'=>$elem['timestamp'],
      'longitude'=>$elem['longitude'],
      'latitude'=>$elem['latitude'],
    );
  }

  $ret['last_timestamp']=$last_timestamp;

  return $ret;
}