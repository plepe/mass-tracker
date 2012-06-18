<?
class event {
  function __construct($id) {
    global $db;

    $this->id=sqlite_escape_string($id);

    $res=sqlite_query($db, "select * from event where event_id='{$this->id}'");
    $this->data=sqlite_fetch_array($res, SQLITE_ASSOC);
  }
}
