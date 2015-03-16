var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var topics = [];

app.use(express.static('public'));

io.on('connection', function(socket) {
	console.log('a user connected');

	socket.on('disconnect', function() {
		console.log('user disconnected');
	});

	socket.on('new topic', function(data) {
		data.id = topics.length;
		data.votes = 0;
		topics.push(data);
		io.emit('new topic', data);
		console.log('new topic added!');
	});

	socket.on('request topics', function() {
		socket.emit('request topics', topics);
	})
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});
