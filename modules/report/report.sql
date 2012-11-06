create table report (
  tracker_id	varchar(32)	not null,
  event_id	integer		not null,
  timestamp	datetime	not null,
  comment	text		null,
  file_data	text		null
);

create index report_timestamp on report(timestamp);
