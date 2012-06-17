<?php include "modulekit/loader.php"; /* loads all php-includes */
session_start();
?>
<html>
  <head>
    <title>Where is ...</title>
<script type='text/javascript' src='lib/php.default.min.js'></script>
<script type='text/javascript' src='lib/OpenLayers.js'></script>
    <?php print modulekit_include_js(); /* prints all js-includes */ ?>
    <?php print modulekit_include_css(); /* prints all css-includes */ ?>
  </head>
  <body>
<div id='map' style='width: 500px; height: 400px;'></div>
  </body>
</html>
