/* global angular, io */

var app = angular.module('HOLY CHAT', [
    'btford.socket-io'
]);

app.factory('ws', ['socketFactory', '$window', '$rootScope', function(socketFactory, $window, $rootScope) {

    var server = JSON.parse($window.localStorage.data).server;
    var socket = io.connect('http://' + server);

    $rootScope.$on('auth:loaded', function(e, name, server) {
	socket = io.connect('http://' + server);
    });

    return socket;
}]);
