<?
function ajax_event_map_update($param) {
  global $db;
  $ret=array();
  $last_timestamp='';

  $where=sql_where_timestamp($param);

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

  $ret['last_timestamp']=gmdate("Y-m-d H:i:s");

  call_hooks("update_send", &$ret, $param);

  return $ret;
}
