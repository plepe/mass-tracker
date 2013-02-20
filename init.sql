create table mass_event (
  name		text		null,
  description	text		null,
  begin_time	datetime	null,
  end_time	datetime	null,
  timezone	integer		null,
  begin_longitude float		null,
  begin_latitude  float		null,
  begin_zoom	integer		null
);

create table tracker_message (
  msg_num	integer		primary key autoincrement,
  tracker_id	varchar(32)	not null,
  timestamp	datetime	not null,
  type		text		not null,
  data		text		null
);
