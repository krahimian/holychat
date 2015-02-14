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
	    var self = this;

	    if ($window.localStorage.data) {
		var data = JSON.parse($window.localStorage.data);

		self.check(data.server, function(err) {

		    $rootScope.$broadcast('auth:initialized');

		    if (err) {
			$log.error(err);
			delete $window.localStorage.data;
			return;
		    }

		    self.load(data);
		});
	    } else $rootScope.$broadcast('auth:initialized');
	},

	load: function(data) {

	    this.name = data.name;
	    this.server = data.server;

	    $rootScope.$broadcast('auth:loaded', data.name, data.server);
	},

	save: function(data, cb) {
	    var self = this;

	    data.server = data.server + ':8080';

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

app.controller('AuthCtrl', ['$scope', 'Auth', '$log', '$timeout', function($scope, Auth, $log, $timeout) {
    $scope.name = null;
    $scope.server = null;
    $scope.shake = false;
    $scope.message = null;

    var setInvalid = function(message) {
	$scope.message = message;
	$scope.shake = true;
	$timeout(function() {
	    $scope.shake = false;
	}, 2000);
    };

    $scope.submit = function() {
	$log.debug('submit');
	$scope.auth.server.$setValidity('healthy', true);

	if ($scope.auth.$invalid) {
	    setInvalid('name required');
	    return;
	}

	Auth.save({
	    name: $scope.name,
	    server: $scope.server
	}, function(err) {
	    $scope.auth.server.$setValidity('healthy', false);
	    setInvalid(err);
	});
    };
}]);

app.controller('MainCtrl', ['$scope', 'ws', '$timeout', '$log', function($scope, ws, $timeout, $log) {

    $scope.messages = [];
    $scope.text = null;
    $scope.loaded = false;

    var messagesEl = document.querySelector('#messages');

    function reset() {
	$timeout(function() { // after angular digest
	    setTimeout(function() { // after dom render
		messagesEl.scrollTop = messagesEl.scrollHeight;
	    });
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


    document.message.text.focus();
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
	document.message.text.blur();
	reset();
    };

}]);
