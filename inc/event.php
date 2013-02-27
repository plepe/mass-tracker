<?
class mass_event {
  function __construct($id) {
    $this->db=new SQLite3("db/{$id}/db.sqlite");

    $this->id=$this->db->escapeString($id);

    $res=$this->db->query("select *, case when (begin_time<=datetime('now') and end_time>datetime('now')) then 'current' when (begin_time>datetime('now')) then 'coming_up' when (end_time<=datetime('now')) then 'past' end as status from event");
    $this->data=$res->fetchArray(SQLITE3_ASSOC);
  }

  function index_info() {
    return "<a href='event.php?id={$this->id}'>{$this->data['name']}</a>\n";
  }
}
