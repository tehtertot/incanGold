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

var users = {};

var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    
    socket.on("userCreate", function(data){
        s
    })
    

})