<?php
if(!file_exists("db/sqlitedb")) {
  $db = sqlite_open('db/sqlitedb');
  sqlite_query($db, file_get_contents("init.sql"));
}
else
  $db = sqlite_open('db/sqlitedb');

function sql_where_timestamp($param) {
  if(isset($param['time_shift'])) {
    $now="'now', '{$param['time_shift']} second'";
    $where[]="timestamp<datetime($now)";
  }
  else {
    $now="'now'";
    $where[]="timestamp<$now";
  }

  if(isset($param['last_timestamp']))
    $where[]="timestamp>='".sqlite_escape_string($param['last_timestamp'])."' and timestamp>=datetime($now, '-10 minute')";
  elseif(isset($param['all'])&&$param['all'])
    ;
  else
    $where[]="timestamp>=datetime($now, '-10 minute')";

  $where[]="event_id='".sqlite_escape_string($param['id'])."'";

  return $where;
}

function ajax_update($param) {
  global $db;

  if(isset($param['time_shift'])) {
    $now="datetime('now', '{$param['time_shift']} second')";
  }
  else
    $now="datetime('now')";

  $res=sqlite_query($db, "select $now as last_timestamp");
  $ret=sqlite_fetch_array($res, SQLITE_ASSOC);

  call_hooks("update_send", &$ret, $param);

  return $ret;
}
