var express = require("express");
var session = require("express-session");
var path = require("path");
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname + "/static")));
app.use(session({secret: 'teststring'}));

app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render('index', {title: "my Express project"});
});

app.post('/users', function (req, res){
    console.log("POST DATA", req.body)
    res.redirect('/')
});

var server = app.listen(8000, function(){
    console.log("Listening on port 8000");
});

///////////////////// CLASSES /////////////////////////
class Player {          ////////////PLAYER/////////////
  constructor(name) {
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
  }
}

class Deck {             ///////////DECK/////////////
  constructor() {
    this.cards = [];
    this.inPlay = [];
    setDeck();
  }
  setDeck() {
    let hazards = ['gas', 'monster', 'cavein', 'flood', 'fire'];
    for (let i = 1; i < 16; i++) {
      this.cards.push(new Card('hazard', 0, hazards[i%5-1]));
      this.cards.push(new Card('treasure', i, 'treasure'));
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
    this.players = [];
    this.round = 1;
  }
  addPlayer(p) {
    this.players.push(p);
  }
}


var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    console.log("WE ARE USING SOCKETS!");
    console.log(socket.id);

})
