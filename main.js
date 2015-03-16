var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', function(socket) {
	console.log('a user connected');

	socket.on('disconnect', function() {
		console.log('user disconnected');
	});

	socket.on('new topic', function(data) {
		data.votes = 0;
		io.emit('new topic', data);
		console.log('new topic added!');
	});
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});
