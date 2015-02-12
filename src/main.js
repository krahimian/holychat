/* global platform, angular, app, document,
   window, console, cordova, setTimeout,
   StatusBar, platform */

platform.ready(function() {
    var bootstrap = function() {
	angular.bootstrap(document, [app.name]);

	if (platform.isCordova()) {
	    StatusBar && StatusBar.hide();

	    cordova.plugins.backgroundMode.enable();

	    cordova.plugins.backgroundMode.onactivate = function() {
		console.log('background mode activep');
	    };

	    window.plugin.notification.local.hasPermission(function(granted) {
		console.log('Permission has been granted: ' + granted);
		if (!granted) {
		    window.plugin.notification.local.registerPermission(function(granted) {
			console.log('Permission has been granted: ' + granted);
		    });
		} else {
		    window.plugin.notification.local.cancelAll();
		}
	    });
	}
    };

    if (platform.isCordova()) setTimeout(bootstrap, 5000);
    else bootstrap();
});
