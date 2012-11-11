<?
global $tracker_fields;
$tracker_fields=array("name", "color1", "color2");

class Tracker {
  function __construct($event_id, $id=null) {
    if($id===null) {
      if(!isset($_SESSION['tracker_id'])) {
	// Calculate an id for this tracker, based on the session_id
	$_SESSION['tracker_id']=base64_encode(md5(session_id(), true));
	while(substr($_SESSION['tracker_id'], -1)=="=")
	  $_SESSION['tracker_id']=substr($_SESSION['tracker_id'], 0, -1);
      }
      else
	$id=$_SESSION['tracker_id'];
    }

    $this->event_id=$event_id;
    $this->id=$id;
    $this->data=array();
  }

  function set_data($data) {
    global $db;

    foreach($data as $k=>$v)
      $this->data[$k]=$v;

    $str=array(
      "'{$this->id}'",
      "'".sqlite_escape_string($_SESSION['event_id'])."'",
      "datetime('now')"
    );

    global $tracker_fields;
    foreach($tracker_fields as $k) {
      if(!$this->data[$k])
	$str[]="null";
      else
	$str[]="'".sqlite_escape_string($this->data[$k])."'";
    }

    $str=implode(", ", $str);

    sqlite_query($db, "insert into tracker_data values ($str)");

    return $this->data;
  }
}

function ajax_tracker_log() {
  $where=array();

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

  return $ret;
}

function ajax_tracker_start($param) {
  $tracker=new Tracker($param['id']);
  $tracker->set_data(json_decode($param['tracker_data'], true));
  $_SESSION['event_id']=$param['id'];

  return array("tracker_id"=>$tracker->id);
}

function ajax_tracker_stop($param) {
  $tracker=new Tracker($param['id']);
  unset($_SESSION['event_id']);

  return array("tracker_id"=>$tracker->id);
}

function tracker_update_send($ret, $param) {
  global $db;

  $where=sql_where_timestamp($param);

  if(sizeof($where))
    $where="where ".implode(" and ", $where);

  $res=sqlite_query($db, "select * from tracker_data $where order by tracker_id, timestamp asc");
  while($elem=sqlite_fetch_array($res, SQLITE_ASSOC)) {
    global $tracker_fields;

    $d=array();
    foreach($tracker_fields as $k)
      $d[$k]=$elem[$k];

    $ret[$elem['tracker_id']][]=array(
      'timestamp'=>$elem['timestamp'],
      'tracker_data'=>$d,
    );
  }

  return $ret;
}

function ajax_get_trackers($param) {
  $ret=array();

  tracker_update_send(&$ret, $param);

  return $ret;
}

register_hook("update_send", "tracker_update_send");
