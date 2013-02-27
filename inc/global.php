<?php
if(!file_exists("db/db.sqlite")) {
  $db = new SQLite3('db/db.sqlite');
  $db->query(file_get_contents("init.sql"));
}
else
  $db = new SQLite3('db/db.sqlite');

function sql_where_timestamp($param) {
  global $db;

  if(isset($param['time_shift'])) {
    $now="'now', '{$param['time_shift']} second'";
    $where[]="timestamp<datetime($now)";
  }
  else {
    $now="'now'";
    $where[]="timestamp<$now";
  }

  if(isset($param['last_timestamp']))
    $where[]="timestamp>='".$db->escapeString($param['last_timestamp'])."' and timestamp>=datetime($now, '-10 minute')";
  elseif(isset($param['all'])&&$param['all'])
    ;
  else
    $where[]="timestamp>=datetime($now, '-10 minute')";

  $where[]="event_id='".$db->escapeString($param['id'])."'";

  return $where;
}

function ajax_update($param) {
  global $db;

  if(isset($param['time_shift'])) {
    $now="datetime('now', '{$param['time_shift']} second')";
  }
  else
    $now="datetime('now')";

  $res=$db->query("select $now as last_timestamp");
  $ret=$res->fetchArray(SQLITE3_ASSOC);

  call_hooks("update_send", &$ret, $param);

  return $ret;
}
