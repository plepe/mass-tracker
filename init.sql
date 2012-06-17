create table gps_log (
  session_id	varchar(32)	not null,
  timestamp	datetime	not null,
  longitude	float		not null,
  latitude	float		not null,
  altitude	float		null,
  speed		float		null,
  accuracy	float		null,
  altitudeAccuracy	float	null,
  heading	float		null
);
