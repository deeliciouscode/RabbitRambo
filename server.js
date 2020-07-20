const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = 3000;
const Game = require("./Server/gameServer.js");

let playersLevelA = 0;
let playersLevelB = 0;
let playersLevelC = 0;
let socketsAndLevels = [];
let playersOnServer = 0;

app.use(express.static(__dirname + '/'));
app.use(express.static(__dirname + '/Assets'));
app.use(express.static(__dirname + '/Client'));

server.listen(port, function () {
    console.log('listening on *:' + port);
});

app.get('/', function (req, res) {
    console.log(__dirname);
    res.sendFile(__dirname + '/index.html');
});

let game;
let canStart = false;
let chosenLevel;

io.on('connection', function (socket) {
    playersOnServer++;

    if (playersOnServer > 2){
        socket.emit("roomIsFull");
    }else{
        if (!canStart){
            socket.on('disconnect', function () {
                playersOnServer--;
                socketsAndLevels.forEach((object) => {
                    if (object.id === socket.id){
                        decreasePlayersInLevel(object.level);
                    }
                })
            });

            function decreasePlayersInLevel(level) {
                switch (level){
                    case "levelA":
                        playersLevelA--;
                        break;
                    case "levelB":
                        playersLevelB--;
                        break;
                    case "levelC":
                        playersLevelC--;
                        break;
                }
            }

        }

        socket.on('setLevel', (level) => {
            switch(level){
                case "levelA":
                    playersLevelA++;
                    socketsAndLevels.push({id: socket.id, level: "levelA"});
                    break;
                case "levelB":
                    playersLevelB++;
                    socketsAndLevels.push({id: socket.id, level: "levelB"});
                    break;
                case "levelC":
                    playersLevelC++;
                    socketsAndLevels.push({id: socket.id, level: "levelC"});
                    break;
            }
        });

        let interval = setInterval(function checkPlayersOnServer(){
            socket.emit("waitingForPartner");
            if (playersLevelA === 2){
                canStart = true;
                clearInterval(interval);
                chosenLevel = "levelA";
            }else if (playersLevelB === 2){
                canStart = true;
                clearInterval(interval);
                chosenLevel = "levelB";
            }else if(playersLevelC === 2){
                canStart = true;
                clearInterval(interval);
                chosenLevel = "levelC";
            }

            startGame();

        }, 50);

        function startGame(){
            if (canStart){
                if (game === undefined){
                    game = new Game(io, chosenLevel);
                }

                if (Object.keys(io.sockets.sockets).includes(socket.id)){
                    game.addSocket(socket);
                }

                // game.deleteOldSockets();
                console.log(Object.keys(io.sockets.sockets));
                console.log(socket.id + " verbunden");


                socket.on('pressedKeys', (playerKeys) => {
                    game.players.forEach((player) => {
                        if (player.id === playerKeys.id) {
                            player.setKeys(playerKeys.keys)
                        }
                    });
                });

                // listen, if player clicked "continue"-button, to continue the game server-side
                socket.on("clicked", () => {
                    if (game.playerPausesGame) {
                        game.playerPausesGame = false;
                    }
                    io.emit("hidePauseMenu", "");
                });

                // listen to specific userInfos and send those infos back to all clients
                socket.on('setPlayerName', (playerInfo) => {
                    game.players.forEach((player) => {
                        if (player.id === playerInfo.id) {
                            player.setName(playerInfo.name);
                            player.setSprite(playerInfo.sprite);
                        }
                    })

                    io.emit('addToUserName', (playerInfo));
                });

                socket.on('disconnect', function () {
                    console.log(socket.id + " got deleted");
                    game.deleteUserName(socket.id);
                    game.removeSocket(socket.id);
                    playersOnServer--;
                });
            }
        }
    }
});