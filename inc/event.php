<?
class mass_event {
  function __construct($id) {
    global $db;

    $this->id=$db->escapeString($id);

    $res=$db->query("select *, case when (begin_time<=datetime('now') and end_time>datetime('now')) then 'current' when (begin_time>datetime('now')) then 'coming_up' when (end_time<=datetime('now')) then 'past' end as status from mass_event where event_id='{$this->id}'");
    $this->data=$res->fetchArray(SQLITE3_ASSOC);
  }

  function index_info() {
    return "<a href='event.php?id={$this->id}'>{$this->data['name']}</a>\n";
  }
}
