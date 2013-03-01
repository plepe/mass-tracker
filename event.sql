create table event (
  name		text		null,
  description	text		null,
  begin_time	datetime	null,
  end_time	datetime	null,
  timezone	integer		null,
  begin_longitude float		null,
  begin_latitude  float		null,
  begin_zoom	integer		null
);

create table message (
  client_id	varchar(32)	not null,
  timestamp	datetime	not null,
  received	datetime	primary key,
  type		text		not null,
  data		text		null
);

insert into event values (
  '', '', 'now', 'now', 0, 0, 0, 16
);
