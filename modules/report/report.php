<?
class Report {
  function __construct($param) {
    $this->event_id=$_SESSION['event_id'];
    $this->tracker=new Tracker($_SESSION['event_id']);
  }

  function save($post_data) {
    global $db;

    $post_data=json_decode($post_data, true);

    $str=array(
      "'{$this->tracker->id}'",
      "'".sqlite_escape_string($this->event_id)."'",
      "datetime('now')"
    );

    foreach(array("comment", "file_data") as $k) {
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
