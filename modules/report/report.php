<?
global $report_fields;
$report_fields=array("longitude", "latitude", "comment", "file_data");

class Report {
  function __construct($param) {
    $this->event_id=$_SESSION['event_id'];
    $this->tracker=new Tracker($_SESSION['event_id']);
  }

  function save($post_data) {
    global $db;
    global $report_fields;
    global $ajax_timestamp;
    $ajax_timestamp->setTimezone(new DateTimeZone('UTC'));

    $post_data=json_decode($post_data, true);

    $str=array(
      "'{$this->tracker->id}'",
      "'".sqlite_escape_string($this->event_id)."'",
      "'".$ajax_timestamp->format("Y-m-d H:i:s")."'",
    );

    foreach($report_fields as $k) {
      if(isset($post_data[$k])&&$post_data[$k])
	$str[]="'".sqlite_escape_string($post_data[$k])."'";
      else
	$str[]="null";
    }

    $str=implode(", ", $str);

    sqlite_query($db, "insert into report values ($str)");

    return true;
  }
};

function ajax_report_save($param, $post_data) {
  $report=new Report($param);
  return $report->save($post_data);
}

function report_update_send($ret, $param) {
  global $db;

  if(isset($param['time_shift'])) {
    $now="'now', '{$param['time_shift']} second'";
    $where[]="timestamp<datetime($now)";
  }
  else
    $now="'now'";

  if(isset($param['last_timestamp']))
    $where[]="timestamp>'".sqlite_escape_string($param['last_timestamp'])."' and timestamp>datetime($now, '-10 minute')";
  elseif(isset($param['all'])&&$param['all'])
     ;
  else
    $where[]="timestamp>datetime($now, '-10 minute')";

  if(sizeof($where))
    $where="where ".implode(" and ", $where);

  $res=sqlite_query($db, "select * from report $where order by tracker_id, timestamp asc");
  while($elem=sqlite_fetch_array($res, SQLITE_ASSOC)) {
    global $report_fields;

    $d=array();
    foreach($report_fields as $k)
      $d[$k]=$elem[$k];

    $d['timestamp']=$elem['timestamp'];
    $d['type']="report";

    $ret[$elem['tracker_id']][]=$d;
  }

  return $ret;
}

register_hook("update_send", "report_update_send");
