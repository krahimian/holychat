/* global require */

var express = require('express'),
    socket = require('socket.io'),
    http = require('http'),
    redis = require('redis'),
    winston = require('winston'),
    config = require('./CONFIG');

var log = new (winston.Logger)({
    transports: [ new (winston.transports.Console)(config.logger) ]
});

var db = redis.createClient(config.redis.port, config.redis.host);

db.on('error', function(err) {
    log.error('redis error: ', err);
});

var app = express();

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/www/index.html');
});

app.get('/pong', function(req, res) {
    res.send('pong');
});

var server = http.Server(app);
var io = socket(server, {
    serveClient: false
});

var port = 8080;

server.listen(port, function() {
    log.info('listening on: ', port);
});

io.on('connection', function(socket) {

    log.debug('connected users: ', Object.keys(io.nsps['/'].sockets).length);

    socket.join('lobby', function(err) {
	if (err) log.error(err);
	else {
	    db.lrange('hc:lobby', 0, 99, function(err, items) {
		if (err) log.error(err);
		else {
		    var messages = [];
		    for (var i=0;i<items.length;i++) {
			messages.push(JSON.parse(items[i]));
		    }
		    socket.emit('messages', {
			room: 'lobby',
			messages: messages
		    });
		}
	    });
	}
    });

    socket.on('join', function(data) {
	var room = data.room;

	socket.join(room, function(err) {
	    if (err) log.error(err);

	    db.lrange('hc:' + room, 0, 99, function(err, items) {
		if (err) log.error(err);
		else {
		    var messages = [];
		    for (var i=0;i<items.length;i++) {
			messages.push(JSON.parse(items[i]));
		    }
		    io.to(room).emit('messages', {
			room: room,
			messages: messages
		    });
		}
	    });
	});
    });

    socket.on('leave', function(data) {
	var room = data.room;

	socket.leave(room, function(err) {
	    if (err) log.error(err);
	});
    });

    socket.on('message', function(data) {
	var room = data.room;

	db.rpush('hc:' + room, JSON.stringify(data.message));

	socket.broadcast.to(room).emit('message', data);
    });

    socket.on('disconnect', function() {
	log.debug('connected users: ', Object.keys(io.nsps['/'].sockets).length);
    });
    
});
