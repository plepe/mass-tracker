<?
$events=array();

class mass_event {
  function __construct($id) {
    if(!file_exists("db/{$id}")) {
      global $dir_mode;
      global $file_mode;

      mkdir("db/{$id}", $dir_mode);
      $this->db=new SQLite3("db/{$id}/db.sqlite");
      chmod("db/{$id}/db.sqlite", $file_mode);
      $this->db->query(file_get_contents("event.sql"));
    }
    else {
      $this->db=new SQLite3("db/{$id}/db.sqlite");
    }

    $this->id=$this->db->escapeString($id);

    $res=$this->db->query("select *, case when (begin_time<=datetime('now') and end_time>datetime('now')) then 'current' when (begin_time>datetime('now')) then 'coming_up' when (end_time<=datetime('now')) then 'past' end as status from event");
    $this->data=$res->fetchArray(SQLITE3_ASSOC);
  }

  function index_info() {
    return "<a href='event.php?id={$this->id}'>{$this->data['name']}</a>\n";
  }

  function save($data) {
    print_r($data);
    foreach(array("begin_time", "end_time") as $k) {
      $d=new DateTime($data[$k]);
      if($data['timezone']<0) {
	$t=-$data['timezone'];
	$d->sub(new DateInterval("PT{$t}M"));
      }
      else
	$d->add(new DateInterval("PT{$data['timezone']}M"));

      $data[$k]=$d->format("Y-m-d H:i:00");
    }

    foreach(array("name", "description", "begin_time", "end_time", "timezone", "begin_longitude", "begin_latitude", "begin_zoom") as $k) {
      $set[]="$k='".$this->db->escapeString($data[$k])."'";
    }
    $set=implode(", ", $set);

    print $set."\n";
    $this->db->query("update event set {$set}");

    global $db;
    $sql_id=$db->escapeString($this->id);
    $db->query("insert or ignore into event (event_id) values ('{$sql_id}')");
    $db->query("update event set {$set} where event_id='{$sql_id}'");
  }
}

function get_event($id) {
  global $db;
  global $events;

  if(!preg_match("/^([a-z0-9A-Z_\.])*$/", $id)) {
    print "Invalid ID";
    return null;
  }

  if(isset($events[$id]))
    return $events[$id];

  $sql_id=$db->escapeString($id);
  $res=$db->query("select event_id from event where event_id='{$sql_id}'");

  if(!($elem=$res->fetchArray(SQLITE3_ASSOC)))
    return null;

  $events[$id]=new mass_event($id);

  return $events[$id];
}
