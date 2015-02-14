/* global app, document, window, cordova, platform, FastClick */

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
    FastClick.attach(document.body);

}]);

app.factory('Auth', ['$rootScope', '$window', '$http', '$log', 'ws', function($rootScope, $window, $http, $log, ws) {
    return {

	name: null,
	server: null,
	rooms: {
	    lobby: {
		messages: []
	    }
	},

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

	    if ($window.localStorage.rooms) {
		var rooms = JSON.parse($window.localStorage.rooms);
		for (var i=0; i<rooms.length; i++) {
		    this.join(rooms[i]);
		}
	    }

	    $rootScope.$broadcast('auth:loaded', data.name, data.server);
	},

	join: function(room) {

	    if (!room) return;

	    room = room.toLowerCase();

	    this.rooms[room] = {
		messages: []
	    };

	    ws.emit('join', {
		room: room
	    });

	    var rooms = Object.keys(this.rooms);
	    $window.localStorage.rooms = JSON.stringify(rooms);
	},

	leave: function(room) {

	    ws.leave('join', {
		room: room
	    });

	    delete this.rooms[room];

	    var rooms = Object.keys(this.rooms);
	    $window.localStorage.rooms = JSON.stringify(rooms);
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

app.controller('MainCtrl', ['$scope', 'ws', '$timeout', '$log', 'Auth', function($scope, ws, $timeout, $log, Auth) {

    $scope.currentRoom = 'lobby';
    $scope.room = null;
    $scope.rooms = Auth.rooms;

    $scope.text = null;
    $scope.loaded = false;

    $scope.join = function(room) {
	Auth.join(room);
	$scope.room = null;
    };

    $scope.leave = Auth.leave;

    $scope.select = function(room) {
	$scope.currentRoom = null;
	$scope.toggleSidebar();

	// hacky fix to update ng-repeat
	$timeout(function() {
	    $scope.currentRoom = room;
	    reset();
	});
    };

    $scope.toggleSidebar = function() {
	document.body.classList.toggle('sidebar-open');
    };

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
		$log.debug('message received in background', data);
		window.plugin.notification.local.cancelAll(); // hacky fix for notification bug
		window.plugin.notification.local.schedule({
		    message: data.message.text,
		    badge: 1,
		    title: data.message.name + ' - ' + data.room
		});
	    });
	};
    }

    $scope.$on('currentRoom', function(e, room) {
	$scope.currentRoom = room;
    });

    ws.on('message', function(data) {
	$log.debug('message received', data);
	$scope.rooms[data.room].messages.push(data.message);
	reset();
    });

    ws.on('messages', function(data) {
	$scope.rooms[data.room].messages = data.messages;
	reset();
	$scope.loaded = true;
    });


    document.message.text.focus();
    reset();

    $scope.submit = function() {

	if (!$scope.text) return;

	var item = {
	    room: $scope.currentRoom,
	    message: {
		text: $scope.text,
		name: $scope.name,
		timestamp: new Date()
	    }
	};

	$scope.rooms[$scope.currentRoom].messages.push(item.message);

	ws.emit('message', item);

	$scope.text = null;
	document.message.text.blur();
	reset();
    };

}]);
