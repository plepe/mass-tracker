<?
function event_map_update_send($ret, $param) {
  global $db;
  $last_timestamp='';

  $where=sql_where_timestamp($param);

  if(sizeof($where))
    $where="where ".implode(" and ", $where);

  $res=$db->query("select * from gps_log $where order by tracker_id, timestamp asc");
  while($elem=$res->fetchArray(SQLITE3_ASSOC)) {
    if($elem['timestamp']>$last_timestamp)
      $last_timestamp=$elem['timestamp'];

    $ret[$elem['tracker_id']][]=array(
      'timestamp'=>$elem['timestamp'],
      'longitude'=>$elem['longitude'],
      'latitude'=>$elem['latitude'],
    );
  }

  return $ret;
}

register_hook("update_send", "event_map_update_send");
