$(function () {
    var socket = io();
    $(document).ready(function(){
        $('.chat.page').hide();
    });
    //　send message
    $('#m').keyup(function(evt){
        if (evt.keyCode === 13) {
            if($('#m').val().length < 1) {
                return false;
            }
            $('send_btn').click();
            socket.emit('chat message', $('#m').val());
            $('#m').val('');
            return false;
        }
    });
    // receive message
    socket.on('chat message', function(payload){
        log(payload, ': '+payload.msg);
        speak(payload.msg);
    });
    $('.avatar').click(function(){
        $('.avatar').filter(".selected").removeClass('selected');
        $(this).addClass('selected');
    });
    $('.usernameInput').keyup(function(evt){
        if (evt.keyCode === 13) {
            if($('.usernameInput').val().length < 1) {
                return false;
            }
            var user_info = {
                'username': $('.usernameInput').val(),
                'avatar': $('.avatar.selected')[0].alt
            }
            socket.emit('user join', user_info);
        }
    });
    socket.on('user join', function(payload){
        $('.login.page').hide();
        $('.chat.page').show();
        log(payload, 'joined the room');
        $('#usernameInput').val('');
    });
    socket.on('user leave', function(payload){
        log(payload, 'left the room');
    });
    $('#m').on('input',function(){
        socket.emit('typing');
    });
    socket.on('typing', function(username){
        $('#typing').text(username + ' is typing......');
    });
    socket.on('stop typing', function(){
        $('#typing').text('');
    });

});

// text-to-speech
// test url: /api/synthesize?text=shindekudasai&voice=en-US_AllisonVoice&download=true&accept=audio%2Fmp3
function speak(msg) {
    fetch('/api/synthesize'+'?text='+msg)
    .then(function(response){
        if (response.ok) {
          response.blob().then(function(blob){
            var url = window.URL.createObjectURL(blob);
            audio.setAttribute('src', url);
            audio.setAttribute('type', 'audio/ogg;codecs=opus');
          });
        }
    });
}

function log(payload, message){
    const imageEl = document.createElement('img');
    imageEl.classList.add('avatar_small');
    imageEl.src = 'img/'+payload.avatar+'.png';
    $('#messages').append(
        $('<li>').append(imageEl).append(payload.username+' '+message));
}