<?
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
