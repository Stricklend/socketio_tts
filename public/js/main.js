$(function () {
    var socket = io();
    //　send message
    $('#send-btn').click(function(){
        if($('#m').val().length < 1) {
            return false;
        }
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
    // receive message
    socket.on('chat message', function(payload){
        $('#messages').append($('<li>').text(payload.username+': '+payload.msg));
    });
    $('#user-join').click(function(){
        if($('#username').val().length < 1) {
            return false;
        }
        socket.emit('user join', $('#username').val());
    });
    socket.on('user join', function(username){
        $('#messages').append($('<li>').text(username+' joined the room'));
        $('#username').val('');
        // $('#join-form').hide();
    });
    socket.on('user leave', function(username){
        $('#messages').append($('<li>').text(username+' left the room'));
    });
    // typing 계산 알고리즘
    // 1. 타이핑한 마지막 시간 저장(타이핑할 때마다 갱신됨)
    // 2. 타이머 시간 후 시간 구함
    // 3. 그 시간과 마지막 시간의 차(타이핑 안 하던 시간)가 
    // 타이머 시간보다 더 길 경우
    // 4. typing에 false를 대입
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