"use strict";

// import { CreatureServer } from "./creatureServer.js";
const Creature = require("./creatureServer.js");
const Laserbeam = require("./laserbeamServer.js");
const Carrot = require("./carrotServer.js");
const Mine = require("./mineServer.js");
const CONST = require("./constants.js");

class PlayerServer extends Creature {
    constructor(pos, size, hasGravity, worldBlocks, enemies, items, mines, carrots, lasers, id, game) {
        super(pos, size, hasGravity, worldBlocks);
        this.enemies = enemies;
        this.id = id;
        this.game = game;
        this.keys = {};
        this.maxSpeedX = 3;
        this.jumpsAwayFromEnemy = false;
        this.jumpDirection = "";
        this.lifes = 1000;
        this.damage = 50;
        this.enemies = enemies;
        this.lastDirectionWasRight = true;
        this.score = 0;
        this.canGetHurt = true;
        this.lasers = lasers;
        this.laser;
        this.addLaser();
        this.mines = mines;
        this.minesCounter = 0;
        this.carrotsCounter = 0;
        this.directs = CONST.directions;
        this.lookingDirection = this.directs.right;
        this.counterForMinePlacement = 0;
        this.mineDroppingRate = 50;
        this.counterForCarrotFire = 0;
        this.carrotFireRate = 15;
        this.items = items;
        this.inventory = [{}, {}];
        this.invWasFull = false;
        this.name = undefined;
        this.sprite = undefined;
        this.isAlive = true;
        this.carrots = carrots;
        this.isRunning = false;
        this.touchDamageCounter = 0;
    }

    update() {
        this.touchDamageCounter++;
        this.upAndDown();
        this.behave();
        this.correctPosition();
        this.laser.update();
        this.updateMines();
        this.updateCarrots();
        this.jumpsOnEnemy();
    }

    updateMines() {
        this.mines.forEach((mine) => {
            if (mine.player.id === this.id) {
                mine.update(this.pos);
            }
        });
    }

    updateCarrots() {
        this.carrots.forEach((carrot) => {
            if (carrot.player.id === this.id && carrot.wasTriggered) {
                carrot.update();
            }
        });
    }

    fireNextCarrot = () => {
        let indexToFire = undefined;
        for (let i = 0; i < this.carrots.length; i++) {
            let carrot = this.carrots[i];
            if (carrot.wasTriggered === false && carrot.player.id === this.id) {
                indexToFire = i;
                this.carrotsCounter -= 1;
                this.game.emitCarrotsCounter(this.carrotsCounter, this.id);
                break;
            }
        }

        if (indexToFire !== undefined) {
            try {
                this.carrots[indexToFire].fire();
            } catch (e) {
                console.log(e);
            }
        } else {
            console.log("no carrots anymore");
        }
    };

    removeCarrot = (id) => {
        let indexToSplice = undefined;
        for (let i = 0; i < this.carrots.length; i++) {
            if (this.carrots[i].id === id) {
                indexToSplice = i;
                break;
            }
        }
        if (indexToSplice !== undefined) {
            this.carrots.splice(indexToSplice, 1);
        }
    };

    placeNextMine = () => {
        let indexToPlace = undefined;
        for (let i = 0; i < this.mines.length; i++) {
            if (this.mines[i].isPlaced === false && this.mines[i].player.id === this.id) {
                indexToPlace = i;
                this.minesCounter -= 1;
                this.game.emitMinesCounter(this.minesCounter, this.id);
                break;
            }
        }
        if (indexToPlace !== undefined) {
            try {
                this.mines[indexToPlace].place();
            } catch (e) {
                console.log(e);
            }
        } else {
            console.log("no mines anymore");
        }
    };

    removeMine = (id) => {
        let indexToSplice = undefined;
        for (let i = 0; i < this.mines.length; i++) {
            if (this.mines[i].id === id) {
                indexToSplice = i;
                break;
            }
        }
        if (indexToSplice !== undefined) {
            this.mines.splice(indexToSplice, 1);
        }
    };

    setName(name) {
        this.name = name;
    }
    setSprite(sprite) {
        this.sprite = sprite;
    }

    // determines how the player should behave based on the keys pressed
    behave() {
        if (this.keys["Space"] === true) {
            if (this.onGround) {
                this.jump();
            }
        }

        if (this.keys["KeyD"] === true && !this.jumpsAwayFromEnemy) {
            this.move(this.directs.right);
            this.lookingDirection = this.directs.right;
            this.lastDirectionWasRight = true;
            this.isRunning = true;
        }

        if (this.keys["KeyA"] === true && !this.jumpsAwayFromEnemy) {
            this.move(this.directs.left);
            this.lookingDirection = this.directs.left;
            this.lastDirectionWasRight = false;
            this.isRunning = true;
        }

        if (this.keys["KeyA"] === false && this.keys["KeyD"] === false) {
            this.isRunning = false;
        }

        if (this.keys["KeyL"] === true) {
            this.laser.shoot();
        }

        if (this.keys["KeyL"] === false && this.laser.isShooting) {
            this.laser.stopShooting();
        }

        if (this.keys["KeyH"] === true) {
            if (this.counterForCarrotFire >= this.carrotFireRate) {
                this.counterForCarrotFire = 0;
                this.fireNextCarrot();
            }
        }
        this.counterForCarrotFire++;

        if (this.keys["KeyP"]) {
            this.game.emitPlayerPausesGame();
        }

        if (this.keys["KeyM"] === true) {
            if (this.counterForMinePlacement >= this.mineDroppingRate) {
                this.counterForMinePlacement = 0;
                this.placeNextMine();
            }
        }
        this.counterForMinePlacement++;

        // call activatesItem, if player presses Digit 1 or Digit 2 && 
        // the object on the inventory Position is not empty 
        for (let i = 0; i < this.game.inventorySize; i++) {
            if (this.keys["Digit" + (i + 1)] && Object.keys(this.inventory[i]).length !== 0) {
                this.activatesItem(i);
            }
        }

        if (this.onGround) {
            this.jumpsAwayFromEnemy = false;
            this.canGetHurt = true;
        }

        if (this.jumpsAwayFromEnemy) {
            this.jumpAway();
        }

    }


    // lets the player jump
    jump() {
        this.velY = -7;
        this.onGround = false;
    }

    // this.player stores item into empty inventory. If inventory is full, player can't store item
    // emptySlot is free inventory space (Number: 0 or 1) 
    // every first time, the function is called, it stores the item into the free inventory space
    // but item will remove in both cases
    storesItem(playerId) {
        let isStored = false;
        let emptySlot = this.inventory.findIndex(o => !Object.keys(o).length);
        this.items.forEach((item) => {
            if (!isStored && this.id === playerId && emptySlot >= 0) {
                this.inventory[emptySlot] = item;
                isStored = true;
            }
            this.game.removeItem();
            this.game.emitPlayerStoresItem();
        });
    }

    // player gets powerUp from specific item. item will remove from players inventory
    // emit, that the player activates an item
    activatesItem(digit) {
        this.inventory[digit].powerUp(this.inventory[digit].potionType, this.id);
        this.inventory[digit].wasActivated = true;
        this.game.emitPlayerActivatesItem();
        this.inventory[digit] = {};
    }

    enemyTouchesPlayer(direction, damage) {
        if (this.canGetHurt) {
            let closestWallInfo = this.getClosestWallInfo();
            if (closestWallInfo.distance < 100 && closestWallInfo.isLeft) {
                this.jumpDirection = this.directs.right;
            } else if (closestWallInfo.distance < 100 && !closestWallInfo.isLeft) {
                this.jumpDirection = this.directs.left;
            } else {
                this.jumpDirection = direction;
            }

            this.jumpsAwayFromEnemy = true;
            if (this.touchDamageCounter > 10) {
                this.touchDamageCounter = 0;
                this.decreasePlayerLife(damage);
            }
            this.jump();

        }
    }

    flameThrowerHitsPlayer(damage) {
        this.decreasePlayerLife(damage);
    }

    jumpAway() {
        this.move(this.jumpDirection);
    }

    getClosestWallInfo() {
        let shortestDistance = Infinity;
        let wallIsLeft;
        for (let i = 0; i < this.worldBlocks.length; ++i) {
            let block = this.worldBlocks[i];
            if (block.isWall) {
                let blockIsLeft = this.pos.x > block.pos.x;

                let distance;

                if (blockIsLeft) {
                    distance = this.pos.x - (block.pos.x + block.size.width);
                } else {
                    distance = block.pos.x - (this.pos.x + this.size.width);
                }

                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    wallIsLeft = blockIsLeft;
                }
            }
        }

        return { distance: shortestDistance, isLeft: wallIsLeft };
    }

    checkIfStillAlive() {
        if (isNaN(this.lifes)) {
            // this.lifes = 0;
        }
        if (this.lifes <= 0) {
            this.isAlive = false;
            this.pos = { x: 0, y: -500 };
            this.game.addUserName(this.name, this.id, this.sprite);
            this.game.checkHowManyPlayersAreAlive();
            this.game.respawnPlayerIfPossible(this.id);
        }
    }

    revive() {
        this.pos = {
            x: 900,
            y: 10
        };
        this.keys = {};
        this.lifes = 1000;
        this.inventory = [{}, {}];
        this.game.clearInventory(this.id);
        this.isAlive = true;
    }

    // returns how far the player can go to the left and how far to the right
    checkForWalls() {
        let xStart = this.pos.x;
        let xEnd = xStart + this.size.width;
        let yStart = this.pos.y;
        let yEnd = yStart + this.size.height;
        let smallestDeltaR = Infinity;
        let smallestDeltaL = Infinity;

        for (let i = 0; i < this.worldBlocks.length; i++) {
            let wb_xStart = this.worldBlocks[i].pos.x;
            let wb_xEnd = wb_xStart + this.worldBlocks[i].size.width;
            let wb_yStart = this.worldBlocks[i].pos.y;
            let wb_yEnd = wb_yStart + this.worldBlocks[i].size.height;

            let is_left_of_this_block = xEnd <= wb_xStart && yStart < wb_yEnd && yEnd > wb_yStart;
            let is_right_of_this_block = xStart >= wb_xEnd && yStart < wb_yEnd && yEnd > wb_yStart;

            if (is_left_of_this_block) {
                let temp_delta_r = wb_xStart - xEnd;
                smallestDeltaR = Math.min(smallestDeltaR, temp_delta_r)
            }

            if (is_right_of_this_block) {
                let tempDeltaL = xStart - wb_xEnd;
                smallestDeltaL = Math.min(smallestDeltaL, tempDeltaL)
            }
        }

        return ([smallestDeltaR, smallestDeltaL])
    }

    // lets the player move in the given direction, by a number that is determined by checkForWalls()
    move(direction) {
        let [deltaR, deltaL] = this.checkForWalls();
        switch (direction) {
            case this.directs.right:
                deltaR = Math.min(this.maxSpeedX, deltaR);
                this.pos.x += deltaR;
                break;
            case this.directs.left:
                deltaL = Math.min(this.maxSpeedX, deltaL);
                this.pos.x -= deltaL;
                break;
        }
    }

    setKeys(keys) {
        this.keys = keys;
    }

    decreasePlayerLife(damage) {
        this.lifes -= Math.round(damage * 100) / 100;
        this.lifes = Math.round(this.lifes * 100) / 100;
        this.checkIfStillAlive();
    }

    jumpsOnEnemy() {
        for (let i = 0; i < this.enemies.length; ++i) {
            let enemy = this.enemies[i];
            let isTouchingX = enemy.pos.x + enemy.size.width > this.pos.x && this.pos.x + this.size.width > enemy.pos.x;
            let isTouchingY = (enemy.pos.y <= this.pos.y + this.size.height)
                && enemy.pos.y + (enemy.size.height * 0.2) >= this.pos.y + this.size.height;

            if (isTouchingX && isTouchingY && enemy.onGround) {
                //lasse player weg springen
                let closestWallInfo = this.getClosestWallInfo();

                if (closestWallInfo.distance < 100 && closestWallInfo.isLeft) {
                    this.jumpDirection = this.directs.right;
                } else if (closestWallInfo.distance < 100 && !closestWallInfo.isLeft) {
                    this.jumpDirection = this.directs.left;
                } else {
                    if (this.lastDirectionWasRight) {
                        this.jumpDirection = this.directs.left;
                    } else {
                        this.jumpDirection = this.directs.right;
                    }
                    this.jump();
                    this.jumpAway();
                    this.jumpsAwayFromEnemy = true;
                    this.killsEnemy(enemy); // DAVOR
                    enemy.getsJumpedOn(this.damage);
                    this.canGetHurt = false; //kann ab hier, bis er wieder am Boden ist, nicht mehr getroffen werden
                    this.killsEnemy(enemy); // SO GEHTS
                    return; //hört also auf, wenn er einen getötet hat;

                }
            }
        }
    }

    fillUpCarrots(quantity) {
        console.log("carrots: " + quantity)
        for (let i = 0; i < quantity; i++) {
            this.carrots.push(new Carrot(this.worldBlocks, this, this.enemies))
            this.carrotsCounter += Math.round(quantity / 60);
            this.game.emitCarrotsCounter(this.carrotsCounter, this.id);
        }
    }

    fillUpMines(quantity) {
        for (let i = 0; i < quantity; i++) {
            this.mines.push(new Mine(this.pos, true, this.worldBlocks, this, this.enemies))
        }
        this.minesCounter += quantity;
        this.game.emitMinesCounter(this.minesCounter, this.id);
    }

    addLaser() {
        this.laser = new Laserbeam(this, this.worldBlocks, this.enemies);
        this.lasers.push(this.laser);
    }

    killsEnemy(enemy) {
        if (enemy.lifes <= 0) {
            this.game.playerKilledEnemy(enemy);
        }
    }

    correctPosition() {
        for (let i = 0; i < this.worldBlocks.length; ++i) {
            let block = this.worldBlocks[i];
            let isInBlockX = block.pos.x < this.pos.x + this.size.width && block.pos.x + block.size.width > this.pos.x;
            let isInBlockY = block.pos.y < this.pos.y + this.size.height && block.pos.y + block.size.height > this.pos.y;

            if (isInBlockX && isInBlockY && block.isWall) {
                let distanceToRightEdge = block.pos.x + block.size.width - (this.pos.x + this.size.width);
                let distanceToLeftEdge = this.pos.x - block.pos.x;

                if (distanceToRightEdge < distanceToLeftEdge) {
                    let posX = block.pos.x + block.size.width;
                    this.pos.x = posX;
                } else {
                    let posX = block.pos.x - this.size.width;
                    this.pos.x = posX;
                }
            }
        }
    }
}



module.exports = PlayerServer;