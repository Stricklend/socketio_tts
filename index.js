var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
app.use(express.static('public'));

var avatar = ''; 
var typing = false;

var getFileExtension = function(acceptQuery){
    var accept = acceptQuery || '';
    switch (accept) {
      case 'audio/ogg;codecs=opus':
      case 'audio/ogg;codecs=vorbis':
        return 'ogg';
      case 'audio/wav':
        return 'wav';
      case 'audio/mpeg':
        return 'mpeg';
      case 'audio/webm':
        return 'webm';
      case 'audio/flac':
        return 'flac';
      default:
        return 'mp3';
    }
  };
  
  var textToSpeech = new TextToSpeechV1({
    username: '4d900087-d45e-4d8b-8901-194fdcb7cc07',
    password: 'AlbYUYzIFMDC',
    url: 'https://stream.watsonplatform.net/text-to-speech/api/'
  });

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// listen to connection event
io.on('connection', function(socket){
    socket.on('disconnect', function(){
      console.log('user disconnected');
      var payload = {
        'username':socket.username,
        'avatar':socket.avatar
      };
      io.emit('user leave', payload);
    });
    socket.on('chat message', function(msg){
        io.emit('chat message', {'msg': msg, 'username': socket.username, 'avatar':socket.avatar});
    });
    socket.on('user join', function(user_info){
        socket.username = user_info.username;
        socket.avatar = user_info.avatar;
        avatar = user_info.avatar;
        var payload = {
          'username':socket.username,
          'avatar':socket.avatar
        };
        io.emit('user join', payload);
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

/**
 * Pipe the synthesize method
 */
app.get('/api/synthesize', function(req, res, next){
  req.query['voice'] = getSpeechVoice(avatar);
  req.query['accept']='audio/mp3';
  var transcript = textToSpeech.synthesize(req.query);
  transcript.on('response', function(response){
      // if (req.query.download) {
      // response.headers['content-disposition'] = `attachment; filename=transcript.${getFileExtension(req.query.accept)}`;
      // }
  });
  transcript.on('error', next);
  transcript.pipe(res);
});

function getSpeechVoice(avatar) {
  switch(avatar) {
    case 'female1':
      return 'en-US_AllisonVoice';
    case 'female2':
      return 'en-US_LisaVoice';
    case 'female3':
      return 'ja-JP_EmiVoice';
    case 'male1':
      return 'en-US_MichaelVoice';
    case 'male2':
      return 'de-DE_DieterVoice';
  }
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});
