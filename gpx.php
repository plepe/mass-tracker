<?php
include "conf.php";
include "modulekit/loader.php"; /* loads all php-includes */
Header("Content-Type: application/octet-stream; charset=utf-8");
Header("Content-Disposition: attachment; filename=\"event.gpx\"");
session_start();

print "<"."?xml version='1.0' encoding='UTF-8' ?".">\n";
?>
<gpx
  version="1.0"
  creator="Mass Tracker"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns="http://www.topografix.com/GPX/1/0"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/0 http://www.topografix.com/GPX/1/0/gpx.xsd">
<?
$event=new mass_event($_REQUEST['id']);

function gpx_date($date) {
  $d=new DateTime($date);
  return $d->format("Y-m-d\TH:i:s\Z");
}

function gpx_timediff($date1, $date2) {
  if($date1===null)
    return 0;

  $d1=new DateTime($date1);
  $d2=new DateTime($date2);
  $i=$d2->getTimestamp()-$d1->getTimestamp();
  return $i;
}

print "<metadata>\n";
if(isset($event->data['name'])&&($event->data['name']))
  print "  <name>{$event->data['name']}</name>\n";
if(isset($event->data['desc'])&&($event->data['desc']))
  print "  <desc>{$event->data['desc']}</desc>\n";
print "  <link>http://www.openstreetbrowser.org/~skunk/mass-tracker/event?id={$event->id}</link>\n";
$date=gpx_date($event->data['begin_time']);
print "  <time>{$date}</time>\n";
print "</metadata>\n";

print "<wpt lat='{$event->data['begin_latitude']}' lon='{$event->data['begin_longitude']}'>\n";
print "  <name>Start</name>\n";
$date=gpx_date($event->data['begin_time']);
print "  <cmt>{$date}</cmt>\n";
print "</wpt>\n";

$where[]="event_id='".$db->escapeString($_REQUEST['id'])."'";

if(sizeof($where))
  $where="where ".implode(" and ", $where);

$res=$db->query("select * from gps_log $where order by tracker_id, timestamp asc");
$current_trk=null;
while($elem=$res->fetchArray(SQLITE3_ASSOC)) {
  if($current_trk!=$elem['tracker_id']) {
    if($current_trk!=null) {
      print "  </trkseg>\n";
      print "</trk>\n";
    }

    print "<trk>\n";
    print "  <name>{$elem['tracker_id']}</name>\n";
    print "  <trkseg>\n";
    $current_trk=$elem['tracker_id'];
    $last_pt=null;
  }

  if(gpx_timediff($last_pt, $elem['timestamp'])>10) {
    print "  </trkseg>\n";
    print "  <trkseg>\n";
  }

  print "    <trkpt lat='{$elem['latitude']}' lon='{$elem['longitude']}'>\n";
  print "      <ele>{$elem['altitude']}</ele>\n";
  $date=gpx_date($elem['timestamp']);
  print "      <time>{$date}</time>\n";
  print "    </trkpt>\n";
  $last_pt=$elem['timestamp'];
}

if($current_trk!=null) {
  print "  </trkseg>\n";
  print "</trk>\n";
}
?>
</gpx>
