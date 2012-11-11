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
  else
    $now="'now'";

  if(isset($param['last_timestamp']))
    $where[]="timestamp>'".sqlite_escape_string($param['last_timestamp'])."' and timestamp>datetime($now, '-10 minute')";
  else
    $where[]="timestamp>datetime($now, '-10 minute')";

  $where[]="event_id='".sqlite_escape_string($param['id'])."'";

  return $where;
}
