"use strict";

import { PlayerClient } from "./playerClient.js";
import { BlockClient } from "./blockClient.js";
import { PartnerClient } from "./partnerClient.js";
import { ItemClient } from "./itemClient.js";
import { AssetLoader } from "./assetLoader.js";
import { FireEnemy } from "./fireEnemyClient.js";
import { ToxicEnemy } from "./toxicEnemyClient.js";
import { FlameThrowerClient } from "./flameThrowerClient.js";
import { GenericDrawer } from "./genericDrawerClient.js";
import { BlockSidewaysClient } from "./blockSidewaysClient.js";


class Game {
    constructor(canvas, assets, level) {
        this.canvas = canvas;
        this.assets = assets;
        this.context = canvas.getContext("2d");
        this.frameCount = 0;
        this.socket = io('/');;
        this.fixedBlocks = [];
        this.movingBlocks = [];
        this.enemies = [];
        this.items = [];
        this.carrots = [];
        this.player = undefined;
        this.partners = [];
        this.flameThrower = [];
        this.laserbeams = [];
        this.mines = [];
        this.surprises = [];
        this.userNames = [];
        this.pauseGame = false;
        this.score = 0;
        this.drawer = new GenericDrawer(this.context, assets);
        this.level = level;

        this.addServerListener();
        this.socket.emit('setLevel', level);
        canvas.style.display = "none";
        setInterval(this.loop.bind(this), 10);

        this.hidePauseMenu();
        this.getBackToMenu();
    }

    // the main loop, from here the game 
    // is running on client side
    loop() {
        this.frameCount += 1;
        this.update();
        if (!this.pauseGame) {
            this.draw();
        }
    }

    // update all the components of the 
    // game in one place
    update() {
        this.updateSocket();
        this.items.forEach((item) => { item.update(this.frameCount); });
        this.enemies.forEach((enemy) => { enemy.update(this.frameCount); });
        if (this.player !== undefined) {
            this.player.update(this.frameCount);
        }
        this.partners.forEach((partner) => {
            partner.update(this.frameCount);
            //
            // if (partner.isAlive) {
            //     partner.update(this.frameCount);
            // }
        });
        if (this.frameCount % 20 === 0) {
            this.drawer.update();
        }
        this.flameThrower.forEach((flameThrower) => { flameThrower.update(this.frameCount); });
    }

    // the only really important thing the 
    // client sends to the server.
    // this is how the player is steered
    updateSocket() {
        if (this.player) {
            this.socket.emit('pressedKeys', {
                keys: this.player.keys,
                id: this.player.id
            })
        }
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.fixedBlocks.forEach(i => { i.draw() });
        this.movingBlocks.forEach(i => { i.draw() });
        this.items.forEach(i => { i.draw() });

        this.surprises.forEach((surprise) => { this.drawer.drawSurprisePack(surprise) });
        if (this.partners) {
            this.partners.forEach(i => { i.draw() });
        }
        if (this.player) {
            this.player.draw();
        }
        this.carrots.forEach((carrot) => { this.drawer.drawCarrot(carrot) });
        this.enemies.forEach(i => { i.draw() });
        this.mines.forEach((mine) => { this.drawer.drawMine(mine) });
        this.laserbeams.forEach((laserbeam) => { this.drawer.drawLaser(laserbeam); });
        this.flameThrower.forEach((flameThrower) => { flameThrower.draw() });
    }

    deleteEnemyOnClientSide(id) {
        for (let i = 0; i < this.enemies.length; ++i) {
            let enemy = this.enemies[i];
            if (enemy.id === id) {
                this.enemies.splice(i, 1);
            }
        }
    }

    deleteFlameThrowerOnClientSide(id) {
        for (let i = 0; i < this.flameThrower.length; ++i) {
            let flameThrower = this.flameThrower[i];
            if (flameThrower.id === id) {
                this.flameThrower.splice(i, 1);
            }
        }
    }

    emitPlayerName(id, userName, sprite) {
        this.userNames.push({ id: id, name: userName, sprite: sprite });
        this.socket.emit('setPlayerName', {
            name: userName,
            id: id,
            sprite: sprite
        });
    }

    getPartnerName(id) {
        for (let i = 0; i < this.userNames.length; i++) {
            if (this.userNames[i].id === id) {
                return this.userNames[i].name;
            }
        }
    }

    getPartnerColor(id) {
        for (let i = 0; i < this.userNames.length; i++) {
            if (this.userNames[i].id === id) {
                return this.userNames[i].sprite;
            }
        }
    }

    // game loop server-side continues, when button on pauseMenu was clicked.
    hidePauseMenu = () => {
        document.getElementById("continueGame").onclick = () => {
            this.socket.emit('clicked', (""));
        }
    }

    // back to menu on button click
    getBackToMenu = () => {
        document.getElementById("backToMenu").onclick = () => {
            location.reload();
        }
    }

    // adds all the listeners necessary to update information on the client that is
    // beeing send by the server
    addServerListener() {

        /////////////////////////////////////////////////////////////////
        //                                                             //
        //                            INIT                             //
        //                                                             //
        /////////////////////////////////////////////////////////////////

        this.socket.on('setNumberOfPlayers', (number) => {
            this.playersOnServer = number;
        });

        this.socket.on('addToUserName', (playerInfo) => {
            this.userNames.push(playerInfo);
        });

        this.socket.on("waitingForPartner", () => {
            document.getElementById("waitingForPartner").style.display = "block";
        });

        // when 2 player already in game, and a third person enters, show roomIsFull div. If he click on button, site refreshes
        this.socket.on("roomIsFull", () => {
            document.getElementById("roomIsFull").style.display = "block";
            document.getElementById("backToMenu").onclick = () => {
                document.getElementById("roomIsFull").style.display = "none";
                location.reload();
            }
        })

        this.socket.on("waitingIsOver", () => {
            canvas.style.display = "block";
            document.getElementById("waitingForPartner").style.display = "none";
        });

        this.socket.on('newPlayerOrPartner', (player) => {
            if (this.socket.id === player.id) {
                this.player = new PlayerClient(player.pos, player.size, player.id, this.context, this.canvas, this, this.assets)
            }
            else {
                this.partners.push(new PartnerClient(player.pos, player.size, player.id, this.context, this.canvas, this, this.assets));
            }
        });

        this.socket.on('newEnemies', (enemies) => {
            enemies.forEach((enemy) => {
                if (enemy.type === "fire") {
                    this.enemies.push(new FireEnemy(enemy.pos, enemy.size, enemy.id, this.context, this, this.assets, enemy.stopToShoot));
                } else if (enemy.type === "toxic") {
                    this.enemies.push(new ToxicEnemy(enemy.pos, enemy.size, enemy.id, this.context, this, this.assets));
                }

            });
        });

        // pushs item in array, so the item will be drawen
        this.socket.on("insertItem", (itemList) => {
            itemList.forEach((item) => {
                this.items.push(new ItemClient(item.pos, item.size, item.id, this.context, this.canvas, item.potionType, this.assets));
            });
        });

        // pops item out of array, so the item won't be drawed anymore
        this.socket.on("removeItem", () => {
            this.items.pop();
        });

        this.socket.on('buildFixedWorld', (fixedWorld) => {
            fixedWorld.forEach(block => {
                this.fixedBlocks.push(new BlockClient(block.pos, block.size, block.type, this.context, this.assets));
            });
            this.fixedBlocks.forEach(block => {
                block.setSprite();
            });
        });

        this.socket.on('buildMovingWorld', (movingWorld) => {
            this.movingBlocks = [];
            movingWorld.forEach(block => {
                this.movingBlocks.push(new BlockSidewaysClient(block.pos, block.size, block.type, this.context, this.assets));
            });
            this.movingBlocks.forEach(block => {
                block.setSprite();

            })
        });

        this.socket.on('newFlameThrower', (flameThrowerInfo) => {
            this.flameThrower.push(new FlameThrowerClient(flameThrowerInfo.pos, flameThrowerInfo.size, flameThrowerInfo.id, this.context, this, this.assets, flameThrowerInfo.direction));
        });

        /////////////////////////////////////////////////////////////////
        //                                                             //
        //                        POS UPDATES                          //
        //                                                             //
        /////////////////////////////////////////////////////////////////

        // >>>
        this.socket.on('laserbeam', (lasers) => {
            this.laserbeams = lasers;
        });

        this.socket.on('carrots', (carrots) => {
            this.carrots = carrots;
        });

        this.socket.on('mines', (mines) => {
            this.mines = mines;
        });

        this.socket.on('surprises', (surprises) => {
            this.surprises = surprises;
        });

        this.socket.on('setPlayerPos', (player) => {
            this.player.setPos(player.pos);
            this.player.setDirection(player.direction);
            this.player.onGround = player.onGround;
            this.player.isRunning = player.isRunning;
        });

        this.socket.on('setPartnerPos', (buddy) => {
            this.partners.forEach((partner) => {
                if (partner.id === buddy.id) {
                    partner.setPos(buddy.pos);
                    partner.setDirection(buddy.direction);
                    partner.onGround = buddy.onGround;
                    partner.isRunning = buddy.isRunning;
                }
            })
        });

        this.socket.on('setEnemyPos', (enemyList) => {
            for (let i = 0; i < this.enemies.length; i++) {
                for (let j = 0; j < enemyList.length; j++) {
                    if (this.enemies[i].id === enemyList[j].id) {
                        this.enemies[i].setPos(enemyList[j].pos);
                        if (enemyList[j].type === "fire") {
                            this.enemies[i].isShooting = enemyList[j].isShooting;
                            this.enemies[i].stopToShoot = enemyList[j].stopToShoot;
                        }

                    }
                }
            }
        });

        this.socket.on('setMovingWorldPos', (posArray) => {
            for (let i = 0; i < this.movingBlocks.length; i++) {
                this.movingBlocks[i].setPos(posArray[i])
            }
        });

        this.socket.on('setFlameThrowerPositions', (flameThrowerList) => {
            for (let i = 0; i < this.flameThrower.length; i++) {
                for (let j = 0; j < flameThrowerList.length; j++) {
                    let oldFlameThrower = this.flameThrower[i];
                    let newFlameThrower = flameThrowerList[j];
                    if (oldFlameThrower.id === newFlameThrower.id) {
                        oldFlameThrower.pos = newFlameThrower.pos;
                    }
                }
            }
        });

        this.socket.on("showRound", (round) => {
            round += 1;
            document.getElementById("roundCounter").textContent = "ROUND: " + round;
        });

        this.socket.on("showKilledEnemies", (killedEnemies) => {
            document.getElementById("enemyCounter").textContent = "KILLED: " + killedEnemies;
        });

        this.socket.on("showScore", (score) => {
            this.score = score;
            document.getElementById("scoreCounter").textContent = "SCORE: " + score;
        });

        this.socket.on("roundCompleted", (round) => {
            if (round !== 0) {
                document.getElementById("roundCompleted").textContent = "ROUND " + round + " COMPLETED!";
            }
        });

        this.socket.on("hideRoundCompleted", () => {
            document.getElementById("roundCompleted").textContent = "";
        });

        this.socket.on("firstRoundStarts", (counter) => {
            jingle.play();
            counter /= 100;
            document.getElementById("roundCompleted").textContent = "Game starts in " + counter;
        });

        /////////////////////////////////////////////////////////////////
        //                                                             //
        //                        INTERACTION                          //
        //                                                             //
        /////////////////////////////////////////////////////////////////

        // show PauseMenu (with animation and sound), if P was pressed.
        // stops the current loop on client-side
        this.socket.on("showPauseMenu", () => {
            let pauseMenu = document.getElementById("pauseMenu");
            if (!this.pauseGame) {
                this.pauseGame = true;
            }
            gameContainer.style.opacity = 0.5;
            pauseMenu.classList.add("bounceIn");
            pauseMenu.classList.remove("bounceOut");
            pauseMenu.style.display = "block";
            pauseMenu.style.opacity = 1;
            this.assets.pauseGame.play();
        })

        this.socket.on('displayPlayerLife', (lifes) => {
            this.player.lifes = lifes;
        });

        // show current enemy life above enemies
        this.socket.on('displayEnemyLife', (enemyList) => {
            enemyList.forEach((enemyServer) => {
                for (let i = 0; i < this.enemies.length; i++) {
                    let enemyClient = this.enemies[i];
                    if (enemyClient.id === enemyServer.id) {
                        enemyClient.lifes = enemyServer.lifes;
                    }
                }
            });

        });

        // show current partner life above partner
        this.socket.on('displayPartnerLife', (lifes) => {
            this.partners.forEach((partner) => {
                partner.lifes = lifes;
            });
        });

        // show current mines in inventorylist
        this.socket.on("displayMinesCounter", (minesCounter) => {
            this.player.minesCounter = minesCounter;
        })

        // show current carrots in inventorylist
        this.socket.on("displayCarrotsCounter", (carrotsCounter) => {
            this.player.carrotsCounter = carrotsCounter;
        })

        this.socket.on('playerDied', (id) => {
            if (this.player.id === id) {
                this.player.isAlive = false;
            } else {
                for (let i = 0; i < this.partners.length; ++i) {
                    let partner = this.partners[i];
                    if (partner.id === id) {
                        partner.isAlive = false;
                    }
                }
            }
        });

        // show gameover div
        this.socket.on("displayGameOver", () => {
            this.pauseGame = true;
            gameover.style.display = "block";
            document.getElementById("statusBar").classList.add("gameOverStatus")
        });

        // after game over: create tablebody with top100 games of the selected level
        this.socket.on("displayLeaderboard", (data) => {
            let table = document.getElementById("lbTable").getElementsByTagName('tbody')[0];
            let levelName = document.getElementById("leaderBoardTitle");
            let levelType = data.level;
            levelType = levelType.substring(5);
            levelName.textContent = "Leaderboard from " + levelType;
            let j = 1;
            for (let i = 0; i < data.list.length; i++) {
                if (data.level === data.list[i].level) {
                    let row = table.insertRow();
                    let rankingCell = row.insertCell();
                    let namesCell = row.insertCell();
                    let enemyCell = row.insertCell();
                    let roundCell = row.insertCell();
                    let scoreCell = row.insertCell();
                    let ranking = document.createTextNode((j));
                    let names = document.createTextNode(data.list[i].playerOneName + " + " + data.list[i].playerTwoName);
                    let killedEnemies = document.createTextNode(data.list[i].killedEnemies);
                    let round = document.createTextNode(data.list[i].round);
                    let score = document.createTextNode(data.list[i].score);
                    rankingCell.appendChild(ranking);
                    namesCell.appendChild(names);
                    enemyCell.appendChild(killedEnemies);
                    roundCell.appendChild(round);
                    scoreCell.appendChild(score);
                    if (data.id === data.list[i].id) {
                        row.style.color = "green";
                    }
                    j++;
                }
            }
            leaderboard.style.display = "block";
        });

        this.socket.on('playerRevived', (id) => {
            if (this.player.id === id) {
                this.player.isAlive = true;
                this.player.keys = {};
            } else {
                for (let i = 0; i < this.partners.length; ++i) {
                    let partner = this.partners[i];
                    if (partner.id === id) {
                        partner.isAlive = true;
                        partner.keys = {};
                    }
                }
            }
        });

        this.socket.on('enemyDies', (id) => {
            this.enemies.forEach((enemy) => {
                if (enemy.id === id) {
                    enemy.die();
                    this.assets.enemyDeath.play();
                }
            });
        });

        this.socket.on('deleteFlameThrower', (id) => {
            this.flameThrower.forEach((flameThrower) => {
                if (flameThrower.id === id) {
                    flameThrower.delete();
                }
            })
        });

        // after item was collected, draw it into inventory + play sound
        this.socket.on("insertIntoInventory", (inventoryList) => {
            for (let i = 0; i < inventoryList.length; i++) {
                if (inventoryList[i].wasCollected) {
                    this.assets.collectItem.play();
                    this.player.inventory[i] = inventoryList[i];
                }
            }
        });

        // after item was activated, remove it from inventory + play sound
        // empty the array on this position -> set it to an empty object 
        this.socket.on("removeFromInventory", (inventoryList) => {
            for (let i = 0; i < inventoryList.length; i++) {
                if (inventoryList[i].wasActivated) {
                    this.assets.activateItem.play();
                    this.player.inventory[i] = {};
                }
            }
        });

        // if player dies, remove all items from his inventory. 
        // set it back to default -> empty objects
        this.socket.on("clearInventory", () => {
            this.player.inventory = [{}, {}];
        });

        /////////////////////////////////////////////////////////////////
        //                                                             //
        //                           GENERAL                           //
        //                                                             //
        /////////////////////////////////////////////////////////////////

        this.socket.on('myActiveSockets', (ids) => {
            let indizesToDelete = [];
            let exists;
            for (let i = this.partners.length - 1; i >= 0; i--) {
                let partner = this.partners[i];
                exists = false;
                for (let j = 0; j < ids.length; j++) {
                    if (partner.id === ids[j])
                        exists = true;
                }
                if (!exists) {
                    indizesToDelete.push(partner.id)
                }
            }

            for (let i = 0; i < indizesToDelete.length; i++) {
                this.partners.splice(indizesToDelete[i], 1)
            }
        })

        // listens, if button on pause menu was clicked
        // hide the menu with animation and sound
        // activate the loop again, so the game continues
        this.socket.on("hidePauseMenu", () => {
            let pauseMenu = document.getElementById("pauseMenu");
            pauseMenu.classList.remove("bounceIn");
            pauseMenu.classList.add("bounceOut");
            this.assets.continueGame.play();
            setTimeout(() => { 
                pauseMenu.style.display = "none";
                pauseMenu.style.opacity = 0; 
                gameContainer.style.opacity = 1;
                this.pauseGame = false; 
            }, 675);
        });
    }
}

const canvas = document.getElementById('myCanvas');
const clickableBtn = document.getElementById("clickableBtn");
const levelARadio = document.getElementById("levelA");
const levelBRadio = document.getElementById("levelB");
const levelCRadio = document.getElementById("levelC");
const inputName = document.getElementById("setUserName");
const leaderboard = document.getElementById("lb");
const gameover = document.getElementById("gameover");
const jingle = document.getElementById("jingle");
jingle.volume = 0.3;

let gameContainer = document.getElementById("game-is-hidden");
let menu = document.getElementById("menu");
let level;

canvas.width = 1920;
canvas.height = 1080;

new AssetLoader()
    .loadAssets([
        {
            name: "explosionSound",
            url: "./explosion.mp3",
            type: "audio"
        }, {
            name: "explosionSprite",
            url: "./explosion.png",
            type: "image"
        }, {
            name: "powerUps",
            url: "./animatedItem.png",
            type: "image"
        }, {
            name: "activateItem",
            url: "./activateItem.wav",
            type: "audio"
        }, {
            name: "collectItem",
            url: "./collectItem.wav",
            type: "audio"
        }, {
            name: "player",
            url: "./animatedPlayer.png",
            type: "image"
        }, {
            name: "enemy",
            url: "./animatedEnemy.png",
            type: "image"
        }, {
            name: "continueGame",
            url: "./continue.wav",
            type: "audio"
        }, {
            name: "pauseGame",
            url: "./pause.wav",
            type: "audio"
        }, {
            name: "spark",
            url: "./spark.png",
            type: "image"
        }, {
            name: "mine",
            url: "./mine.png",
            type: "image"
        }, {
            name: "surprise",
            url: "./surprise-box.png",
            type: "image"
        }, {
            name: "enemyFlame",
            url: "./flame.png",
            type: "image"
        }, {
            name: "carrot",
            url: "./carrot-5degrees.png",
            type: "image"
        }
        , {
            name: "tnt",
            url: "./tnt.png",
            type: "image"
        }
        , {
            name: "mine",
            url: "./mine.png",
            type: "image"
        }
        , {
            name: "steelBars",
            url: "./steelBars.png",
            type: "image"
        }
        , {
            name: "blocks",
            url: "./blocks.png",
            type: "image"
        }
        , {
            name: "shoot",
            url: "./shoot.wav",
            type: "audio"
        }
        , {
            name: "enemyDeath",
            url: "./enemyDeath.wav",
            type: "audio"
        }
        , {
            name: "itemInfo",
            url: "./itemInfo.png",
            type: "image"
        }
    ])
    .then(assets => {
        // starts game, if usernames has value 
        // hide menu, show game, deactivate scroll
        // show checked level 
        clickableBtn.onclick = function () {

            if (inputName && inputName.value !== "") {

                gameContainer.style.display = ("block");
                menu.style.display = ("none");
                window.scroll(0, 0);
                document.body.style.overflow = "hidden";

                if (levelARadio.checked) {
                    level = "levelA"
                } else if (levelBRadio.checked) {
                    level = "levelB"
                } else if (levelCRadio.checked) {
                    level = "levelC"
                } 

                const game = new Game(
                    canvas,
                    assets,
                    level
                );

            }
        }

    });
