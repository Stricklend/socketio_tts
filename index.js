var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('public'));

var typing = false;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// listen to connection event
io.on('connection', function(socket){
    socket.on('disconnect', function(){
      console.log('user disconnected');
      io.emit('user leave', socket.username);
    });
    socket.on('chat message', function(msg){
        io.emit('chat message', {'msg': msg, 'username': socket.username});
    });
    socket.on('user join', function(username){
        socket.username = username;
        username = socket.username;
        io.emit('user join', username);
    });
    socket.on('typing', function(){
        var lastTimeTyping = new Date().getTime();
        io.emit('typing', socket.username);
        typing = true;
        setTimeout(
            function() {
                var currentTimeTyping = new Date().getTime();
                if (currentTimeTyping-lastTimeTyping >= 2000 && typing) {
                    io.emit('stop typing');
                    typing = false;
                }
            }, 2000);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
