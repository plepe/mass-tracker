<?php include "modulekit/loader.php"; /* loads all php-includes */
session_start();

if(!file_exists("db/sqlitedb")) {
  $db = sqlite_open('db/sqlitedb');
  sqlite_query($db, file_get_contents("init.sql"));
}
else
  $db = sqlite_open('db/sqlitedb');
?>
<?php _ajax_process(); ?>
