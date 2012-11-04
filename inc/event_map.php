<?
function ajax_event_map_update() {
  global $db;
  $ret=array();
  $last_timestamp='';

  if(isset($_REQUEST['time_shift'])) {
    $now="'now', '{$_REQUEST['time_shift']} second'";
    $where[]="timestamp<datetime($now)";
  }
  else
    $now="'now'";

  if(isset($_REQUEST['last_timestamp']))
    $where[]="timestamp>'".sqlite_escape_string($_REQUEST['last_timestamp'])."' and timestamp>datetime($now, '-10 minute')";
  else
    $where[]="timestamp>datetime($now, '-10 minute')";

  $where[]="event_id='".sqlite_escape_string($_REQUEST['id'])."'";

  if(sizeof($where))
    $where="where ".implode(" and ", $where);

  $res=sqlite_query($db, "select * from gps_log $where order by tracker_id, timestamp asc");
  while($elem=sqlite_fetch_array($res, SQLITE_ASSOC)) {
    if($elem['timestamp']>$last_timestamp)
      $last_timestamp=$elem['timestamp'];

    $ret[$elem['tracker_id']][]=array(
      'timestamp'=>$elem['timestamp'],
      'longitude'=>$elem['longitude'],
      'latitude'=>$elem['latitude'],
    );
  }

  $ret['last_timestamp']=$last_timestamp;

  call_hooks("update_send", &$ret, $param);

  return $ret;
}
