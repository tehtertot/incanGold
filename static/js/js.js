var socket = io.connect();

$(document).ready(function(){
    var username = prompt("What is your name?");

    socket.emit("userCreate", {name: username});
    socket.on("newPlayerSetup", function(data) {
        let identity = document.getElementById("players_wrap").setAttribute("socket", data.response[data.response.length-1].id);
        for (let p in data.response) {
            let pBox = document.createElement('div');
            pBox.className = "player";
            pBox.id = data.response[p].id;
            pBox.innerHTML = "<h4>" + data.response[p].username + "</h4><p>Total Treasure: " + data.response[p].points + "</p><p>Current Treasure: " + data.response[p].currentTreasure + "</p>";
            document.getElementById('players_wrap').appendChild(pBox);
        }
    });
    socket.on("newPlayerAdded", function(data) {
        let pBox = document.createElement('div');
        pBox.className = "player";
        pBox.id = data.response.id;
        pBox.innerHTML = "<h4>" + data.response.username + "</h4><p>Total Treasure: " + data.response.points + "</p><p>Current Treasure: " + data.response.currentTreasure + "</p>";
        document.getElementById('players_wrap').appendChild(pBox);

    });

    socket.on("showCard", function(data){
        let pBox = document.createElement('img');
        pBox.className = "card";
        pBox.setAttribute("src", data.card.img);
        document.getElementById('cards_wrap').appendChild(pBox);
        for(let p in data.allPlayers){
            document.getElementById(data.allPlayers[p].id).innerHTML = "<h4>" + data.allPlayers[p].username + "</h4><p>Total Treasure: " + data.allPlayers[p].points + "</p><p>Current Treasure: " + data.allPlayers[p].currentTreasure + "</p>"
        }
    });

    socket.on("startGame", function() {
        alert('Game is starting!');

      });
    socket.on("showBtns", function(data){
        for(let p in data.players){
            if(data.players[p]){
                if(document.getElementById("players_wrap").getAttribute("socket") == p){
                    let play = document.createElement('button');
                    let leave = document.createElement('button');
                    play.textContent = "play";
                    leave.textContent = "leave";
                    play.setAttribute("class", "play");
                    leave.setAttribute("class", "leave");
                    document.getElementById(p).appendChild(play);
                    document.getElementById(p).appendChild(leave);
                }
            }else{
                let msg = document.createElement('p');
                msg.innerHTML = "Player has left this round.";
                document.getElementById(p).appendChild(msg);
            }
        }
    })
    socket.on("newRound", function(round){
        $("#cards_wrap").html("");
        $("#cards_wrap").html("<legend>Round " + round + "</legend>");
        alert("New Round Starting");
        socket.emit("startRound");
    })
    socket.on("hasWinner", function(winner){
        alert(`${winner.username} has won!`);
        location.reload();
    })
})
$(document).on("click", ".play", function(){
    socket.emit("keepPlaying");
    $(".play").remove();
    $(".leave").remove();
})
$(document).on("click", ".leave", function(){
    socket.emit("notPlaying");
    $(".play").remove();
    $(".leave").remove();
})
