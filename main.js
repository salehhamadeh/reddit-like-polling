var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var topics = [];
var clients = [];
var nUsers = 0;

app.use(express.static('public'));

io.on('connection', function(socket) {
	clients.push(socket);
	console.log('a user connected');

	socket.on('disconnect', function() {
		console.log('user disconnected');
		var i = clients.indexOf(socket);
		clients.splice(i, 1);
		console.log("Connected users: " + clients.length);
	});

	socket.on('new topic', function(data) {
		data.id = topics.length;
		data.votes = [];
		topics.push(data);

		// Only send the number of votes to client
		data = clone(data);
		data.votes = data.votes.length;

		io.emit('new topic', data);
		console.log('new topic added!');
	});

	socket.on('request topics', function(userid) {
		socket.emit('request topics', topics.map(function(topic) {
			var ret = clone(topic);
			ret.didVote = (ret.votes.indexOf(userid) > -1);
			ret.votes = topic.votes.length;
			return ret;
		}));
	});

	socket.on('request userid', function() {
		var userid = nUsers++;
		var i = clients.indexOf(socket);
		clients[i].userid = userid;
		socket.emit('request userid', userid);
	});

	socket.on('verify userid', function(userid) {
		var i = clients.indexOf(socket);
		clients[i].userid = userid;

		socket.emit('request userid', userid);
	});
	
	socket.on('toggle vote', function(data) {
		// If the user had already voted, remove vote. Otherwise, add vote.
		var topic = clone(topics[data.topicId]);
		if (topic.votes.indexOf(data.userid) > -1) {
			console.log("YES");
			var index = topic.votes.indexOf(data.userid);
			topics[data.topicId].votes.splice(index, 1);
		} else {
			console.log("NO");
			topics[data.topicId].votes.push(data.userid);
		}

		topic.votes = topics[data.topicId].votes.length;
		console.log(data);

		// Update the votes on all clients
		for (var i = 0; i < clients.length; i++) {
			console.log(clients[i].userid);
			topic.didVote = (topics[data.topicId].votes.indexOf(clients[i].userid) > -1);

			clients[i].emit('update topic', topic);
		}
	});
});

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
}

http.listen(3000, function() {
	console.log('listening on *:3000');
});
