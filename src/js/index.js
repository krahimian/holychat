/* global app, document, window, cordova, platform */

app.run(['$rootScope', '$log', 'Auth', function($rootScope, $log, Auth) {

    $rootScope.loaded = false;
    $rootScope.initialized = false;
    $rootScope.name = null;

    $rootScope.$on('auth:initialized', function() {
	$rootScope.initialized = true;
    });

    $rootScope.$on('auth:loaded', function(e, name) {
	$rootScope.name = name;
	$rootScope.loaded = true;

	$log.debug('loaded');
    });

    Auth.init();    

}]);

app.factory('Auth', ['$rootScope', '$window', '$http', '$log', function($rootScope, $window, $http, $log) {
    return {

	name: null,
	server: null,

	init: function() {
	    if ($window.localStorage.data) this.load(JSON.parse($window.localStorage.data));
	    else $rootScope.$broadcast('auth:initialized');
	},

	load: function(data) {
	    this.check(data.server, function(err) {

		$rootScope.$broadcast('auth:initialized');		

		if (err) {
		    $log.error(err);
		    delete $window.localStorage.data;
		    return;
		}

		this.name = data.name;
		this.server = data.server;

		$rootScope.$broadcast('auth:loaded', data.name, data.server);
	    });
	},

	save: function(data, cb) {
	    var self = this;

	    this.check(data.server, function(err) {
		if (err) {
		    cb(err);
		    return;
		}

		$window.localStorage.data = JSON.stringify(data);
		self.load(data);
	    });
	},

	check: function(server, cb) {
	    $http.get('http://' + server + '/pong').success(function() {
		cb();
	    }).error(function() {
		cb('server unavailable');
	    });
	}

    };
}]);

app.controller('AuthCtrl', ['$scope', 'Auth', '$log', function($scope, Auth, $log) {
    $scope.name = null;
    $scope.server = null;
    
    $scope.submit = function() {
	$log.debug('submit');
	Auth.save({
	    name: $scope.name,
	    server: $scope.server
	});
    };
}]);

app.controller('MainCtrl', ['$scope', 'ws', '$timeout', '$log', function($scope, ws, $timeout, $log) {

    $scope.messages = [];
    $scope.text = null;
    $scope.loaded = false;

    var main = document.querySelector('main');

    function reset() {
	$timeout(function() {
	    window.scrollTo(document.body, main.scrollHeight);
	});
    }

    if (platform.isCordova()) {
	cordova.plugins.backgroundMode.onactivate = function() {
	    $log.debug('listening to messages in background');
	    ws.on('message', function(data) {
		window.plugin.notification.local.cancelAll(); // hacky fix for notification bug
		window.plugin.notification.local.schedule({
		    message: data.text,  // The message that is displayed
		    badge: 1,
		    title: data.name
		});
	    });
	};
    }

    ws.on('message', function(data) {
	$scope.messages.push(data);
	
	reset();
    });

    ws.on('messages', function(data) {
	$scope.messages = data;
	reset();
	$scope.loaded = true;
    });


    document.outgoing.message.focus();
    reset();

    $scope.submit = function() {

	if (!$scope.text) return;

	var message = {
	    text: $scope.text,
	    name: $scope.name,
	    timestamp: new Date()
	};

	$scope.messages.push(message);

	ws.emit('message', message);

	$scope.text = null;
	document.outgoing.message.blur();
	reset();
    };

}]);
