/* global angular, io */

var app = angular.module('HOLY CHAT', [
    'btford.socket-io'
]);

app.factory('ws', ['socketFactory', '$window', '$rootScope', function(socketFactory, $window, $rootScope) {

    var ws = {
	socket: null
    };

    if ($window.localStorage.data) {
	var server = JSON.parse($window.localStorage.data).server;
	ws.socket = io.connect('http://' + server);
    }

    return ws;
}]);
