"use strict";

const CONST = require("./constants.js");
const UTIL = require("./utilities.js");
const Player = require("./playerServer.js");
const Block = require("./blockServer.js");
const BlockSideways = require("./blockSidewaysServer.js");
const ToxicEnemyServer = require("./toxicEnemyServer.js");
const FireEnemyServer = require("./fireEnemyServer.js");
const Item = require("./itemServer.js");
const Firestore = require("./firestoreServer.js");
const Surprise = require("./surpriseServer.js")
const LevelA = require("./levelA.js");
const LevelB = require("./levelB.js");
const LevelC = require("./levelC.js");

class GameServer {
    constructor(io, level) {
        this.firestore = new Firestore();
        this.io = io;
        this.fixedBlocks = [];
        this.movingBlocks = [];
        this.players = [];
        this.enemies = [];
        this.items = [];
        this.carrots = [];
        this.flameThrower = [];
        this.counter = 0;
        this.round = 0;
        this.waitingCounter = 1000;
        this.mines = [];
        this.surprises = [];
        this.lasers = [];
        this.score = 0;
        this.DEFAULTHIGHMULTIPLICATORCOUNTDOWN = 500;
        this.DEFAULTLOWMULTIPLICATORCOUNTDOWN = 1000;
        this.highMultiplicatorCountdown = this.DEFAULTHIGHMULTIPLICATORCOUNTDOWN;
        this.lowMultiplicatorCountdown = this.DEFAULTLOWMULTIPLICATORCOUNTDOWN;
        this.highMultiplicatorIsActive = false;
        this.lowMultiplicatorIsActive = false;
        this.justKilledAnEnemy = false;
        this.alivePlayers;
        this.loopID;
        this.playerPausesGame = false;
        this.inventorySize = 2;
        this.minPlayers = 1;
        this.userNames = [];
        this.killedEnemies = 0;
        this.didNotSaveYet = true;
        this.percentageLootDrops = 10;
        this.level = level;
        this.init();
    }

    loop() {

        /* only create game, when two players joined the game */
        /* TODO: only create level, when two players joined the SAME LEVEL */

        if (this.players.length >= this.minPlayers) {
            if (!this.playerPausesGame) {
                this.counter++;
                this.update();
                this.emit();
            }
        }
    }

    update = () => {

        if (this.players.length > 0) {
            this.players.forEach((player) => {
                player.update();
                player.laser.update();
            });
        }
        this.items.forEach((item) => { item.update(); });
        this.surprises.forEach((item) => { item.update(); });

        if (this.counter % 7 === 0)
            this.movingBlocks.forEach((block) => block.loopSideways());
        this.fixedBlocks.forEach((block) => { block.upAndDown() });
        this.enemies.forEach(enemy => { enemy.moveEnemy() });
        this.flameThrower.forEach((flameThrower) => { flameThrower.update() });

        this.checkIfRoundIsOver();
        this.calculateMultiplicatorTime();

        if (this.counter % 100 === 0) {
            this.updateLessCritical();
        }
    };

    updateLessCritical = () => {
        this.deleteUnusedPartners();
    };

    emit = () => {
        this.emitPlayerAndPartnerPositions();
        this.emitBlockPositions();
        this.emitCarrotPositions();
        this.emitEnemyPositions();
        this.emitLaserbeams();
        this.emitMines();
        this.emitSurprises();
        this.emitPlayerLife();
        this.emitFlameThrowerPositions();
    };

    emitPlayerAndPartnerPositions = () => {
        this.players.forEach((player) => {
            let connection = this.io.sockets.connected[player.id];
            if (connection) {
                connection.emit('setPlayerPos', UTIL.extractPlayer(player));
                connection.broadcast.emit('setPartnerPos', UTIL.extractPlayer(player));
            }
        })
    };

    emitLaserbeams = () => {
        this.io.emit('laserbeam', UTIL.extractLaserData(this.lasers));
    };

    emitMines = () => {
        this.io.emit('mines', UTIL.extractMinesData(this.mines));
    };

    emitSurprises = () => {
        this.io.emit('surprises', UTIL.extractSurprisesData(this.surprises));
    };

    emitBlockPositions = () => {
        this.io.emit('setMovingWorldPos', UTIL.extractPositions(this.movingBlocks));
    };

    emitCarrotPositions() {
        this.io.emit('carrots', UTIL.extractCarrotsData(this.carrots));
    }

    emitEnemyPositions() {
        let enemyList = [];
        this.enemies.forEach((enemy) => {
            enemyList.push(enemy.getInfo())
        });
        this.io.emit('setEnemyPos', enemyList);
    }

    // update client-carrots
    emitCarrotsCounter(quantity, id) {
        this.players.forEach((player) => {
            if (player.id === id) {
                let connection = this.io.sockets.connected[player.id];
                if (connection) {
                    connection.emit("displayCarrotsCounter", (quantity));
                }
            }
        });
    }

    // update client-mines
    emitMinesCounter(quantity, id) {
        this.players.forEach((player) => {
            if (player.id === id) {
                let connection = this.io.sockets.connected[player.id];
                if (connection) {
                    connection.emit("displayMinesCounter", (quantity));
                }
            }
        });
    }

    // display items in specific clients inventory each time, a player collects an item
    // connection only affects the player, which collects the item
    emitPlayerStoresItem() {
        this.players.forEach((player) => {
            let connection = this.io.sockets.connected[player.id];
            if (connection) {
                connection.emit("insertIntoInventory", UTIL.extractInventoryData(player.inventory));
            }
        });
    };

    // remove item out specific clients inventory each time, a player activates an item
    // connection only affects the player, which collects the item
    emitPlayerActivatesItem() {
        this.players.forEach((player) => {
            let connection = this.io.sockets.connected[player.id];
            if (connection) {
                connection.emit("removeFromInventory", UTIL.extractInventoryData(player.inventory));
            }
        })
    }

    // clear inventory, if player dies
    clearInventory(id) {
        this.players.forEach((player) => {
            let connection = this.io.sockets.connected[player.id];
            if (connection) {
                if (player.id === id) {
                    connection.emit("clearInventory", "");
                }
            }
        });
    }

    // push new Item, when 2 players are connected or when player collects item
    // create new item, with random position 
    // emit item-array to client
    createItem = () => {
        let itemList = [];
        let allBlocks = this.fixedBlocks.concat(this.movingBlocks);
        let randomPos = {
            x: Math.round(50 + (Math.random() * 1820)),
            y: Math.round(200 + (Math.random() * 700))
        }

        this.items.push(new Item(randomPos, CONST.items.size, this.players, this.enemies, allBlocks))
        
        this.items.forEach((item) => {
            itemList.push({ pos: item.pos, size: item.size, id: item.id, potionType: item.potionType });
            this.io.emit("insertItem", (itemList))
        })
    }

    // pop game item array, if item was collected
    // remove item on client side 
    // after 3sec, call createItem again 
    // only allow respawn, when players are in game and not in pause menu
    removeItem = () => {
        this.io.emit("removeItem", "");
        this.items.pop();
        if (!this.playerPausesGame) {
            setTimeout(this.createItem, 3000);
        }
    }

    deleteUnusedPartners = () => {
        this.players.forEach((player) => {
            let connection = this.io.sockets.connected[player.id];
            if (connection) {
                connection.broadcast.emit('myActiveSockets', UTIL.extractIds(this.players))
            }
        })
    };

    init() {
        this.initWorld();
        this.loopID = setInterval(this.loop.bind(this), 1000 / CONST.refreshRate);
    }

    initWorld = () => {
        switch (this.level) {
            case "levelA":
                this.buildStaticPart(LevelA.groundLevels);
                this.buildSidewayMovingPart(LevelA.sidewayMovingBlocks);
                break;
            case "levelB":
                this.buildStaticPart(LevelB.groundLevels);
                this.buildSidewayMovingPart(LevelB.sidewayMovingBlocks);
                break;
            case "levelC":
                this.buildStaticPart(LevelC.groundLevels);
                this.buildSidewayMovingPart(LevelC.sidewayMovingBlocks);
                break;

        }
    };

    buildStaticPart = (blocks) => {
        let allBlocks = this.fixedBlocks.concat(this.movingBlocks);
        for (let i = 0; i < blocks.length; i++) {
            this.fixedBlocks.push(new Block(blocks[i].pos, blocks[i].size, blocks[i].hasGravity, allBlocks, blocks[i].isWall, blocks[i].type));
        }
    };

    buildSidewayMovingPart = (blocks) => {
        let allBlocks = this.fixedBlocks.concat(this.movingBlocks);
        for (let i = 0; i < blocks.length; i++) {
            this.movingBlocks.push(new BlockSideways(blocks[i].pos, blocks[i].size, false, blocks[i].distanceToMove, allBlocks, this.players, this.enemies, this.mines, blocks[i].type));
        }
    };

    addPlayer = (id) => {
        let allBlocks = this.fixedBlocks.concat(this.movingBlocks);
        let startingPos = { x: 1000 * Math.random(), y: 300 };

        this.players.push(new Player(startingPos, CONST.playerSize, true, allBlocks, this.enemies, this.items, this.mines, this.carrots, this.lasers, id, this));

        this.players.forEach((player) => {
            this.io.emit('newPlayerOrPartner', UTIL.extractPlayer(player))
        })
    };


    emitPlayerLife() {
        this.players.forEach((player) => {
            let connection = this.io.sockets.connected[player.id];
            if (connection) {
                connection.emit('displayPlayerLife', player.lifes);
                connection.broadcast.emit('displayPartnerLife', (player.lifes))
            }
        });
    }

    emitEnemyLife() {
        let enemyList = [];
        this.enemies.forEach((enemy) => {
            enemyList.push({ type: enemy.type, lifes: enemy.lifes, id: enemy.id })
            this.io.emit("displayEnemyLife", (enemyList))
        })
    }

    addSocket(socket) {
        this.addPlayer(socket.id);
        this.initClient();
        if (this.players.length >= 1) {
            this.io.emit("waitingIsOver", this.players.length);
        }
        if (this.players.length > 1) {
            this.createItem();
        }
    }

    initClient = () => {
        this.createFixedBlocks();
        this.createMovingBlocks();
        this.createEnemies();
    }

    createFixedBlocks = () => {
        let plainFixedBlocks = [];
        this.fixedBlocks.forEach((block) => {
            plainFixedBlocks.push(UTIL.extractBlockData(block))
        });
        this.io.emit('buildFixedWorld', plainFixedBlocks)
    };

    createMovingBlocks = () => {
        let plainMovingBlocks = [];
        this.movingBlocks.forEach((block) => {
            plainMovingBlocks.push(UTIL.extractBlockData(block))
        });
        this.io.emit('buildMovingWorld', plainMovingBlocks)
    };

    createEnemies = () => {
        let enemyList = [];

        this.enemies.forEach((enemy) => {
            enemyList.push(enemy.getInfo());
        });

        this.io.emit('newEnemies', enemyList);
        this.emitEnemyLife();
    }

    emitFlameThrower = (flameThrower) => {

        this.flameThrower.push(flameThrower);
        this.io.emit('newFlameThrower', flameThrower.getInfo());
    };

    emitFlameThrowerPositions = () => {
        let flameThrowerList = [];
        this.flameThrower.forEach((flameThrower) => {
            flameThrowerList.push(flameThrower.getInfo());
        });
        this.io.emit('setFlameThrowerPositions', flameThrowerList);
    };

    // displays pause menu on client-side 
    // only possible, if players are alive and the game runs 
    // stops the current loop on server-side
    emitPlayerPausesGame = () => {
        this.players.forEach((player) => {
            if (!this.playerPausesGame && player.isAlive) {
                this.playerPausesGame = true;
                this.io.emit("showPauseMenu", "");
            }
        });
    }

    // show score on client-side
    emitScore = () => {
        this.io.emit("showScore", (this.score))
    }

    emitKilledEnemies = () => {
        this.io.emit("showKilledEnemies", this.killedEnemies)
    }

    checkHowManyPlayersAreAlive() {
        let playerAliveCounter = 0;
        this.players.forEach((player) => {
            if (player.isAlive) {
                playerAliveCounter++;
            }
        });
        this.alivePlayers = playerAliveCounter;
    }

    // if one player is still in game, respawn specific player after timeout
    // if no plaeyr is alive, start gameOver sequence
    respawnPlayerIfPossible(id) {
        this.io.emit('playerDied', id);
        let deadPlayerIndex;
        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            if (player.id === id && !player.isAlive) {
                deadPlayerIndex = i;
                break;
            }
        }
        if (this.alivePlayers < 1) {
            this.gameOver();
        } else {
            setTimeout(() => {
                if (this.alivePlayers >= 1) {
                    this.revivePlayer([id, deadPlayerIndex]);
                }
            }, 5000);
        }
    }

    revivePlayer = ([id, indexInPlayerArray]) => {
        this.players[indexInPlayerArray].revive();
        this.io.emit('playerRevived', id);
    };

    // saves the current game into database
    // show gameOver
    // show leaderboard 
    gameOver = () => {
        if (this.didNotSaveYet) {
            clearInterval(this.loopID);

            let namePlayerOne = this.userNames[0].name;
            let namePlayerTwo;
            if (this.userNames[1] !== undefined) {
                namePlayerTwo = this.userNames[1].name;
            } else {
                namePlayerTwo = "";
            }
            let lastScore = this.score;
            let lastKilledEnemies = this.killedEnemies;
            let round = this.round;
            let level = this.level;
            let id = UTIL.generateID();

            // add relevant information of the current game to firestore
            this.firestore.addScore(namePlayerOne, namePlayerTwo, lastScore, lastKilledEnemies, round, level, id);

            this.didNotSaveYet = false;

            // show gameOver sequence 
            this.io.emit("displayGameOver", "");

            // show specific level-leaderboard after timeout and highlight the current game
            setTimeout(() => {
                this.firestore.getTopX(100)
                    .then((snapshot) => {
                        if (snapshot.empty) {
                            console.log(`No top ${x} there for some reason.`);
                            return;
                        }
                        snapshot.forEach(doc => {
                            this.firestore.topTen.push(doc.data())
                        });
                        this.io.emit("displayLeaderboard", ({ list: UTIL.extractScoresData(this.firestore.topTen), level: level, id: id }));
                    })
                    .catch(err => {
                        console.log('Error getting documents', err);
                    });
            }, 2500);
        }
    };

    removeSocket(id) {
        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            if (player.id === id) {
                this.players.splice(i, 1);
            }
        }
    }

    deleteEnemy = (id) => {
        for (let i = 0; i < this.enemies.length; ++i) {
            let enemy = this.enemies[i];
            if (enemy.id === id) {
                this.io.emit('enemyDies', id);
                this.enemies.splice(i, 1);
                enemy = undefined;
            }
        }
    };

    deleteFlameThrower = (id) => {
        for (let i = 0; i < this.flameThrower.length; ++i) {
            let flameThrower = this.flameThrower[i];
            if (flameThrower.id === id) {
                this.io.emit('deleteFlameThrower', id);
                this.flameThrower.splice(i, 1);
                flameThrower = undefined;
            }
        }
    };

    checkIfRoundIsOver() {
        let playerOnline = this.players.length >= 1;
        if (this.enemies.length === 0 && playerOnline) {
            this.emitCompletedRound();
            this.emitGameStart();
            if (this.waitingCounter === 0) {
                this.emitHideRound();
                this.createNewRound();
                this.createEnemies();
                this.waitingCounter = 1000;
            }
            --this.waitingCounter;
        }
    }

    // show round on client-side
    emitRound = () => {
        this.io.emit("showRound", this.round);
    };

    // hide round-completion on client-side
    emitHideRound = () => {
        this.io.emit("hideRoundCompleted", "");
    };

    // show round-completion on client-side
    emitCompletedRound = () => {
        this.io.emit("roundCompleted", this.round);
    };

    emitGameStart = () => {
        if (this.waitingCounter >= 0 && this.round === 0 && this.waitingCounter % 100 === 0) {
            this.io.emit("firstRoundStarts", this.waitingCounter);
        }

    };

    createNewRound() {
        this.emitRound();
        ++this.round;
        let numberOfFireEnemies = this.calculateNumberOfFieEnemies();
        let numberOfToxicEnemies = Math.ceil(this.round * 0.5) + 2;
        let enemyScore = this.round * 100 + 500;

        for (let i = 1; i <= numberOfFireEnemies; ++i) {
            let pos = { x: (Math.random() * 1920), y: -300 };
            let allBlocks = this.fixedBlocks.concat(this.movingBlocks);
            let fireScore = enemyScore * 0.75;
            let enemy = new FireEnemyServer(
                pos, CONST.enemySize, ++CONST.enemyIdCounter, this.players, this.fixedBlocks, this.movingBlocks, allBlocks, fireScore, this);
            enemy.damage = Number((enemy.damage * Math.sqrt(this.round)).toFixed(1));
            enemy.increaseDamage(this.round);
            this.enemies.push(enemy);
        }

        if (numberOfToxicEnemies > 0) {
            for (let i = 1; i <= numberOfToxicEnemies; ++i) {
                let pos = { x: (Math.random() * 1920), y: -300 };
                let allBlocks = this.fixedBlocks.concat(this.movingBlocks);
                let toxicScore = enemyScore * 0.5;
                let enemy = new ToxicEnemyServer(
                    pos, CONST.enemySize, ++CONST.enemyIdCounter, this.players, this.fixedBlocks, this.movingBlocks, allBlocks, toxicScore, this)
                enemy.damage = Number((enemy.damage * Math.sqrt(this.round)).toFixed(1));
                enemy.increaseDamage(this.round);
                this.enemies.push(enemy);
            }
        }
    }

    calculateNumberOfFieEnemies = () => { //genaue Anzahl noch besprechen;
        if (this.round < 6) {
            return 0; // Return to 10
        } else {
            return Math.ceil(this.round * 0.5);
        }
    };

    playerKilledEnemy(enemy) {
        let random = Math.random();
        let threshold = this.percentageLootDrops / 100;
        let dropsLoot = random < threshold;
        if (dropsLoot && this.round >= 3) {
            let surprise = new Surprise(enemy.pos, this.players, this.surprises, this.round);
            this.surprises.push(surprise);
        };

        let defaultScore = enemy.getEnemyScore();
        if (this.highMultiplicatorIsActive) {
            this.score += defaultScore * 2;

        } else if (this.lowMultiplicatorIsActive) {
            this.score += defaultScore * 1.5;
        } else {
            this.score += defaultScore;
        }

        this.justKilledAnEnemy = true;
        this.killedEnemies++;
        this.emitScore();
        this.emitKilledEnemies();
    }

    calculateMultiplicatorTime() {
        if (this.justKilledAnEnemy) {
            this.highMultiplicatorCountdown = this.DEFAULTHIGHMULTIPLICATORCOUNTDOWN;
            this.lowMultiplicatorCountdown = this.DEFAULTLOWMULTIPLICATORCOUNTDOWN;
            this.highMultiplicatorIsActive = true;
            this.lowMultiplicatorIsActive = true;
            this.justKilledAnEnemy = false;
        }

        if (this.highMultiplicatorIsActive) {
            if (this.highMultiplicatorCountdown === 0) {
                this.highMultiplicatorIsActive = false;
                this.highMultiplicatorCountdown = this.DEFAULTHIGHMULTIPLICATORCOUNTDOWN;
            } else {
                --this.highMultiplicatorCountdown;
            }
        }

        if (this.lowMultiplicatorIsActive) {
            if (this.lowMultiplicatorCountdown === 0) {
                this.lowMultiplicatorIsActive = false;
                this.lowMultiplicatorCountdown = this.DEFAULTLOWMULTIPLICATORCOUNTDOWN;
            } else {
                --this.lowMultiplicatorCountdown;
            }
        }
    }

    addUserName(userName, id, sprite) {
        for (let i = 0; i < this.userNames.length; ++i) {
            if (id === this.userNames[i].id) {
                return;
            }
        }
        this.userNames.push({ id: id, name: userName, sprite: sprite });
    }

    deleteUserName(id) {
        for (let i = 0; i < this.userNames.length; i++) {
            if (this.userNames[i].id === id) {
                this.userNames.splice(i, 1);
                return;
            }
        }
    }

    setLevel(level) {
        this.level = level;
    }
}

module.exports = GameServer;
