create table event (
  event_id	varchar(32)	primary key,
  name		text		null,
  description	text		null,
  begin_time	datetime	null,
  end_time	datetime	null,
  timezone	integer		null,
  begin_longitude float		null,
  begin_latitude  float		null,
  begin_zoom	integer		null
);

create table client_ids (
  secret_id	varchar(32)	primary key,
  client_id	varchar(32)	not null
);
