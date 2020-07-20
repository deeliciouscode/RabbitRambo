"use strict";

const BlockServer = require('./blockServer.js');

class BlockSideways extends BlockServer {
    constructor(pos, size, hasGravity, distanceToMove, worldBlocks, players, enemies, mines, type) {
        super(pos, size, hasGravity, worldBlocks, false);
        this.absoluteDistanceToMove = distanceToMove;
        this.distanceToMove = distanceToMove;
        this.speed = Math.random() + 1;
        this.alreadyMoved = 0;
        this.players = players;
        this.enemies = enemies;
        this.mines = mines;
        this.isMovable = true;
        this.type = type;
    }

    // the function determines in which direction with which speed a moving block should 
    // actualy move. It's based on a random speed and a given distance, that can be 
    // specified during construction. 
    // also it makes sure that everything on the block moves with it.
    loopSideways() {
        if (Math.abs(this.alreadyMoved) >= this.absoluteDistanceToMove) {
            this.alreadyMoved = 0;
            this.distanceToMove = -this.distanceToMove;
        }
        this.pos.x += this.distanceToMove / 50 / this.speed;
        this.players.forEach((player) => {
            if (player.blockStandingOn === this) {
                player.pos.x += this.distanceToMove / 50 / this.speed;
            }
        });

        this.enemies.forEach((enemy) => {
            if(enemy.blockStandingOn === this) {
                let posX = enemy.pos.x + this.distanceToMove / 50 / this.speed;
                let posY = enemy.pos.y;
                enemy.setPos({x: posX, y: posY});

                if (enemy.type === 'fire' && enemy.flameThrower !== null){
                    enemy.flameThrower.posX += this.distanceToMove / 50 / this.speed;
                }
            }
        });

        this.mines.forEach((mine) => {
            if (mine.blockStandingOn === this) {
                mine.pos.x += this.distanceToMove / 50 / this.speed;
            }
        });
        
        this.alreadyMoved += this.distanceToMove / 50 / this.speed;
    }
}

module.exports = BlockSideways;