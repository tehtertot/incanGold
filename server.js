//Graham was here...

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
    this.choice = 1;
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
var deck = new Deck();

var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    console.log(socket.id);

    socket.on("userCreate", function(data){
        players.push(new Player(data.name, socket.id));

        // send all players/info to newb
        socket.emit("newPlayerSetup", {response: players});
        // send newb info to all players
        socket.broadcast.emit("newPlayerAdded", {response: players[players.length-1]});

        if (players.length == 2){
          io.emit("startGame");
          
        }

    })

    socket.on("addCard", function(data){
        var card = deck.drawCard();
        io.emit("showCard", {card: card});
        console.log(card);
    })
})