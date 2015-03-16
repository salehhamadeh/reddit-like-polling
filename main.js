var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var topics = [];
var nUsers = 0;

app.use(express.static('public'));

io.on('connection', function(socket) {
	console.log('a user connected');

	socket.on('disconnect', function() {
		console.log('user disconnected');
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
			ret.didVote = (userid in ret.votes);
			ret.votes = topic.votes.length;
			return ret;
		}));
	});

	socket.on('request userid', function() {
		socket.emit('request userid', nUsers++);
	})

	socket.on('toggle vote', function(data) {
		// If the user had already voted, remove vote. Otherwise, add vote.
		var topic = clone(topics[data.topicId]);
		if (data.userid in topic.votes) {
			console.log("YES");
			var index = topic.votes.indexOf(data.userid);
			topics[data.topicId].votes.splice(index, 1);
		} else {
			console.log("NO");
			topics[data.topicId].votes.push(data.userid);
		}

		// Only send the number of votes to client
		topic.didVote = (data.userid in topics[data.topicId].votes);
		topic.votes = topics[data.topicId].votes.length;

		io.emit('update topic', topic);
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
