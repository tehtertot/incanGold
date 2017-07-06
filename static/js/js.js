var socket = io.connect();

$(document).ready(function(){
    var username = prompt("What is your name?");

    socket.emit("userCreate", {name: username});

    socket.on("newPlayerSetup", function(data) {
      for (let p in data.response) {
        let pBox = document.createElement('div');
        pBox.className = "player";
        pBox.innerHTML = "<h4>" + data.response[p].name + "</h4><p>" + data.response[p].points + "</p>";
        document.getElementById('players_wrap').appendChild(pBox);
      }
    });
    socket.on("newPlayerAdded", function(data) {
      let pBox = document.createElement('div');
      pBox.className = "player";
      pBox.innerHTML = "<h4>" + data.response.name + "</h4><p>" + data.response.points + "</p>";
      document.getElementById('players_wrap').appendChild(pBox);
    });
})
