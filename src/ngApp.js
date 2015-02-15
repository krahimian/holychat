/* global angular, io */

var app = angular.module('HOLY CHAT', [
    'btford.socket-io'
]);

app.factory('ws', ['socketFactory', '$window', '$rootScope', function(socketFactory, $window, $rootScope) {

    var socket;

    if ($window.localStorage.data) {
	var server = JSON.parse($window.localStorage.data).server;
	socket = io.connect('http://' + server);
    } else {
	socket = io.connect();
    }

    $rootScope.$on('auth:loaded', function(e, name, server) {
	socket = io.connect('http://' + server);
    });

    return socket;
}]);
