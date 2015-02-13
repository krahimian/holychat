/* global require */

var express = require('express'),
    socket = require('socket.io'),
    http = require('http'),
    redis = require('redis'),
    config = require('./CONFIG');

var db = redis.createClient(config.redis.port, config.redis.host);

db.on('error', function(err) {
    console.log('redis error: ', err);
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
    console.log('listening on: ', port);
});

io.on('connection', function(socket) {

    db.lrange('hc:lobby', 0, 99, function(err, items) {
	if (err) console.log(err);
	else {
	    var messages = [];
	    for (var i=0;i<items.length;i++) {
		messages.push(JSON.parse(items[i]));
	    }
	    socket.emit('messages', messages);
	}
    });

    socket.on('message', function(data) {
	console.log(data);

	db.rpush('hc:lobby', JSON.stringify(data));

	socket.broadcast.emit('message', data);
    });
    
});
