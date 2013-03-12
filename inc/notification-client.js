var NOTIFICATION_ERROR=		1;
var NOTIFICATION_WARNING=	2;
var NOTIFICATION_NOTICE=	3;
var NOTIFICATION_LEVELS={
  NOTIFICATION_ERROR:		"error",
  NOTIFICATION_WARNING:		"warning",
  NOTIFICATION_NOTICE:		"notice"
};

function notification(title, level) {
  var data={ title: title, level: level };

  if(!data.level)
    data.level=NOTIFICATION_NOTICE;

  hooks.call("notification", data);
}
