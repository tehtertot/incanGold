var express = require("express");
var path = require("path");
var app = express();

app.use(express.static(path.join(__dirname + "/static")));

app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render('index', {title: "my Express project"});
});

var server = app.listen(8000, function(){
    console.log("Listening on port 8000");
});

///////////////////// CLASSES /////////////////////////
class Player {          ////////////PLAYER/////////////
  constructor(name, id) {
    this.id = id;
    this.username = name;
    this.points = 0;
    this.currentTreasure = 0;
  }
  goBack(currentTreasure) {
    this.points += currentTreasure;
  }
}

class Card {              ////////////CARD////////////
  constructor(type, val, name) {
    this.type = type;
    this.val = val;
    this.name = name;
    if (type == "treasure") {
      this.img = `img/${val}${name}.png`;
    }
    else {
      this.img = `img/${name}.png`;
    }
  }
}

class Deck {             ///////////DECK/////////////
  constructor() {
    this.cards = [];
    this.inPlay = [];
    this.setDeck();
  }
  setDeck() {
    let hazards = ['gas', 'monster', 'cavein', 'flood', 'fire'];
    let treasure = ['emerald', 'amethyst', 'topaz', 'ruby', 'sapphire'];
    for (let i = 0; i < 15; i++) {
      this.cards.push(new Card('hazard', 0, hazards[(i%5)]));
      this.cards.push(new Card('treasure', i+1, treasure[(i%5)]));
    }
  }
  addArtifact(round) {
    if (round < 4) {
      this.cards.push(new Card('artifact', 5, 'diamond'));
    }
    else {
      this.cards.push(new Card('artifact', 10, 'gold'));
    }
  }
  shuffle() {
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < this.cards.length; i++) {
        let random = Math.floor(Math.random()*this.cards.length);
        let temp = this.cards[i];
        this.cards[i] = this.cards[random];
        this.cards[random] = temp;
      }
    }
  }
  drawCard() {
    let card = this.cards.pop();
    this.inPlay.push(card);
    return card;
  }
}

/////////////////// GAME PLAY ////////////////////////////////
class Game {
  constructor() {
    this.round = 1;
  }

}

var players = [];
var round = 1;
var deck = new Deck();
var roundTreasure = 0;
var playersStillPlaying = {};
var playersAboutToLeave = {};
var playersAlreadyGone = {};
var playerResponses = 0;

var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    function checkStatus(){
        if(playerResponses + Object.keys(playersAlreadyGone).length == players.length){
            // count how many players left
            let countLeaving = Object.keys(playersAboutToLeave).length;
            for(let p in playersAboutToLeave){
                for(let idx in players){
                    if (players[idx].id == p){
                        players[idx].points += Math.floor(roundTreasure / countLeaving) + players[idx].currentTreasure;
                        players[idx].currentTreasure = 0;
                    }
                }
                playersAlreadyGone[p] = true;
                roundTreasure = roundTreasure % countLeaving;
                playersAboutToLeave = {};
            }

            
            //if the card drawn is a duplicate of a hazard card already in play, all players still playing lose all their currentTreasure and the round is over

            //one of the duplicate hazard cards is removed from the deck
            //otherwise :

            //for everyone staying
            if (Object.keys(playersStillPlaying).length > 0){
                var card = deck.drawCard();
                io.emit("showCard", {card: card, allPlayers: players});
                if(card.val == 0){
                    for(let i=0; i<deck.inPlay.length-1; i++){
                        if(deck.inPlay[i].name == card.name){
                            deck.inPlay.pop();
                            for(let p in playersStillPlaying){
                                for(let idx in players){
                                    if (players[idx].id == p){
                                        players[idx].currentTreasure = 0;
                                    }
                                }
                            }
                            playerResponses = 0;
                            endRound();
                            return;
                        }
                    }
                }else{
                    for(let p in playersStillPlaying){
                        for(let idx in players){
                            if (players[idx].id == p){
                                players[idx].currentTreasure += Math.floor(card.val / Object.keys(playersStillPlaying).length);
                            }
                        }
                    }
                }
                roundTreasure += card.val % Object.keys(playersStillPlaying).length;
                io.emit("showBtns", {players: playersStillPlaying});
            }else{
                playerResponses = 0;
                endRound();
                return;
            }
            playerResponses = 0;
            function endRound(){
                deck.cards.concat(deck.inPlay);
                deck.inPlay = [];
                deck.shuffle();
                round++;
                if (round == 6){
                    let winner = players[0];
                    for(let i=1; i<players.length; i++){
                        if(players[i].points > winner.points){
                            winner = players[i];
                        }
                    }
                    io.emit("hasWinner", winner);
                    return;
                }
                roundTreasure = 0;
                playersAboutToLeave = {};
                playersAlreadyGone = {};
                playersStillPlaying = {};
                for(let p in players){
                    playersStillPlaying[players[p].id] = true;
                }
                io.emit("newRound", round);
            }
        }
    }

    socket.on("userCreate", function(data){
        players.push(new Player(data.name, socket.id));
        playersStillPlaying[socket.id] = true;
        // send all players/info to newb
        socket.emit("newPlayerSetup", {response: players});
        // send newb info to all players
        socket.broadcast.emit("newPlayerAdded", {response: players[players.length-1]});

        if (players.length == 2){
          io.emit("startGame");
          deck.shuffle();
          var card = deck.drawCard();
          for(let p in playersStillPlaying){
              for(let idx in players){
                  if (players[idx].id == p){
                      players[idx].currentTreasure += Math.floor(card.val / Object.keys(playersStillPlaying).length);
                  }
              }
          }
          roundTreasure += card.val % Object.keys(playersStillPlaying).length;
          io.emit("showCard", {card: card, allPlayers: players});
          io.emit("showBtns", {players: playersStillPlaying});
        }
    })

    socket.on("startRound", function(){
        playerResponses++;
        if (playerResponses == players.length){
            deck.shuffle();
            var card = deck.drawCard();
            for(let p in playersStillPlaying){
                for(let idx in players){
                    if (players[idx].id == p){
                        players[idx].currentTreasure += Math.floor(card.val / Object.keys(playersStillPlaying).length);
                    }
                }
            }
            roundTreasure += card.val % Object.keys(playersStillPlaying).length;
            io.emit("showCard", {card: card, allPlayers: players});
            io.emit("showBtns", {players: playersStillPlaying});
            playerResponses = 0;
        }
    })

    socket.on("keepPlaying", function(){
        playerResponses++;
        checkStatus();
    });
    socket.on("notPlaying", function(){
        delete playersStillPlaying[socket.id];
        playersAboutToLeave[socket.id] = true;
        playerResponses++;    
        checkStatus();
    });
})
