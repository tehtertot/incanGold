var socket = io.connect();

$(document).ready(function(){
    var username = prompt("What is your name?");

    socket.emit("userCreate", {name: username});
    socket.on("newPlayerSetup", function(data) {
      for (let p in data.response) {
        let pBox = document.createElement('div');
        pBox.className = "player";
        if (p == data.response.length-1) {
          pBox.id = data.response[0].id;
        }
        pBox.innerHTML = "<h4>" + data.response[p].username + "</h4><p>" + data.response[p].points + "</p>";
        document.getElementById('players_wrap').appendChild(pBox);
      }
    });
    socket.on("newPlayerAdded", function(data) {
        let pBox = document.createElement('div');
        pBox.className = "player";
        pBox.innerHTML = "<h4>" + data.response.username + "</h4><p>" + data.response.points + "</p>";
        document.getElementById('players_wrap').appendChild(pBox);

    });

    // $("#add_card").click(function(){
    //     socket.emit("addCard");
    // })

    socket.on("showCard", function(data){
        let pBox = document.createElement('img');
        pBox.className = "card";
        pBox.setAttribute("src", data.card.img);
        document.getElementById('cards_wrap').appendChild(pBox);
        console.log(data.card);
    })

    socket.on("startGame", function() {
        alert('Game is starting!');
        socket.emit('addCard');
    })
})
