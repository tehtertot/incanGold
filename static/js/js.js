var socket = io.connect();

$(document).ready(function(){
    var username = prompt("What is your name?");

    socket.emit("userCreate", {name: username});
})