/* global require */

var express = require('express'),
    socket = require('socket.io'),
    http = require('http');

var app = express();

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/www/index.html');
});

app.get('/pong', function(req, res) {
    res.send('pong');
});

var server = http.Server(app);
var io = socket(server);

var port = 8080;

server.listen(port, function() {
    console.log('listening on: ', port);
});

var messages = [];

io.on('connection', function(socket) {

    socket.on('message', function(data) {
	console.log(data);
	messages.push(data);
	console.log(messages);
	socket.broadcast.emit('message', data);
    });

    console.log(messages);

    socket.emit('messages', messages);
    
});
