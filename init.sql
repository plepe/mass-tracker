create table gps_log (
  session_id	varchar(32)	not null,
  event_id	integer		null,
  timestamp	datetime	not null,
  longitude	float		not null,
  latitude	float		not null,
  altitude	float		null,
  speed		float		null,
  accuracy	float		null,
  altitudeAccuracy	float	null,
  heading	float		null,
  foreign key(event_id) references event(event_id)
);

create table event (
  event_id	integer		primary key,
  name		text		null,
  description	text		null,
  begin_time	datetime	null,
  end_time	datetime	null,
  begin_longitude float		null,
  begin_latitude  float		null
);
