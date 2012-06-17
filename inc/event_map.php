<?
function ajax_event_map_update() {
  global $db;
  $ret=array();
  $last_timestamp='';

  $res=sqlite_query($db, "select * from gps_log where timestamp>datetime('now', '-10 minute') order by session_id, timestamp desc");
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
