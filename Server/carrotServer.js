"use strict";

const UTIL = require("./utilities.js");
const CONST = require("./constants.js");

class CarrotServer {
    constructor(worldBlocks, player, enemies) {
        this.pos;
        this.basePos;
        this.size = { width: 35, height: 13 };
        this.worldBlocks = worldBlocks;
        this.player = player;
        this.id = UTIL.generateID();
        this.enemies = enemies;
        this.directions = CONST.directions;
        this.speed = 5;
        this.direction;
        this.yOffset = 70;
        this.standardDistance = 800;
        this.awayFromBasePos = 0;
        this.isFiring = false;
        this.wasTriggered = false;
        this.hitWall = false;
        this.oldDistanceToClosestBlock = Infinity;
        this.oldClosestBlockId = undefined;
        this.damage = 30;
        this.modes = {
            linear: "linear",
            root: "root"
        }
        this.mode = this.modes.root;
    }

    // the update loop, that is called every time the game update loop is called
    // only runs code when necessary, meaning when a carrot is actually shot.
    update = () => {
        if (this.isFiring) {
            this.awayFromBasePos+=this.speed;
            if (!this.crashed) {
                this.fly();
                this.checkForHits();
            }
        } else if (this.wasTriggered) {
            this.isFiring = true;
            this.setPosAndDirection();
        }
    }

    // determines where the carrot should be.
    // the calculation of the x and y value is relative 
    // to the position where the carrot is fired
    fly = () => {
        let x, y;
        if (this.direction === this.directions.right) {
            x = Math.round(this.basePos.x + this.awayFromBasePos);
            y = Math.round(this.basePos.y + this.calculateYForX(this.awayFromBasePos));
        } else {
            x = Math.round(this.basePos.x - this.awayFromBasePos);
            y = Math.round(this.basePos.y + this.calculateYForX(this.awayFromBasePos));
        }
        
        this.pos.x = x;
        this.pos.y = y;
    }

    // checks if the carrot hits a wall or an enemy.
    // only does it for the part of the map that actually can be hit
    checkForHits = () => {
        if (this.direction === this.directions.right) {
            this.checkForHitsRight();
        } else {
            this.checkForHitsLeft();
        }
        
    }
    
    // checks for hits when the carrot is flying right and only for enemies and 
    // blocks that are right of the player at that time
    checkForHitsRight = () => {
        let rightX = this.pos.x + this.size.width;
        let rightY = this.pos.y + this.size.height / 2; 

        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            let isRightOfPlayer = enemy.getBodyCenter().x >= this.player.getBodyCenter().x;
            if (isRightOfPlayer) {
                let inVerticalCorridor = rightX > enemy.pos.x && rightX < enemy.pos.x + enemy.size.width;
                let inHorizontalCorridor = rightY > enemy.pos.y && rightY < enemy.pos.y + enemy.size.height;
                let onEnemy = inHorizontalCorridor && inVerticalCorridor;
                if (onEnemy) {
                    this.crashEnemy(enemy);
                }
            }
        }

        for (let i = 0; i < this.worldBlocks.length; i++) {
            const block = this.worldBlocks[i];
            let isRightOfPlayer = block.getBodyCenter().x >= this.player.getBodyCenter().x;
            if (isRightOfPlayer) {
                let inVerticalCorridor = rightX > block.pos.x && rightX < block.pos.x + block.size.width;
                let inHorizontalCorridor = rightY > block.pos.y && rightY < block.pos.y + block.size.height;
                let onblock = inHorizontalCorridor && inVerticalCorridor;
                if (onblock) {
                    this.crashBlock();
                }
            }
        }
    }

    // does the same like checkForHitsRight but for left
    checkForHitsLeft = () => {
        let leftX = this.pos.x;
        let leftY = this.pos.y + this.size.height / 2; 

        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            let isLeftOfPlayer = enemy.getBodyCenter().x <= this.player.getBodyCenter().x;
            if (isLeftOfPlayer) {
                let inVerticalCorridor = leftX > enemy.pos.x && leftX < enemy.pos.x + enemy.size.width;
                let inHorizontalCorridor = leftY > enemy.pos.y && leftY < enemy.pos.y + enemy.size.height;
                let onEnemy = inHorizontalCorridor && inVerticalCorridor;
                if (onEnemy) {
                    this.crashEnemy(enemy);
                }
            }
        }

        for (let i = 0; i < this.worldBlocks.length; i++) {
            const block = this.worldBlocks[i];
            let isLeftOfPlayer = block.getBodyCenter().x <= this.player.getBodyCenter().x;
            if (isLeftOfPlayer) {
                let inVerticalCorridor = leftX > block.pos.x && leftX < block.pos.x + block.size.width;
                let inHorizontalCorridor = leftY > block.pos.y && leftY < block.pos.y + block.size.height;
                let onblock = inHorizontalCorridor && inVerticalCorridor;
                if (onblock) {
                    this.crashBlock();
                }
            }
        }
    }

    // gets called when a carrot hits an enemy and then 
    // does the damage and splices itself from the global 
    // carrots list
    crashEnemy = (enemy) => {
        this.crashed = true;
        enemy.decreaseEnemyLife(this.damage);
        this.player.killsEnemy(enemy);
        this.player.removeCarrot(this.id);
    }

    // removes itself from the array
    crashBlock = () => {
        this.crashed = true;
        this.player.removeCarrot(this.id);
    }    

    // returns the y value for a given x value, based 
    // on the mode the carrot is in
    calculateYForX = (x) => {
        // f(x) = m * x [+ c]
        let c = this.player.size.height - this.yOffset;
        let m = c / this.standardDistance;

        // return (Math.pow(x, 2) * 0.001)

        if (this.mode === this.modes.linear)
            return m * x;
        if (this.mode === this.modes.root)
            return Math.sqrt(x);
    }

    // gets called when a carrot is fired, sets the base position (the point from which every 
    // other position is calculated)
    setPosAndDirection = () => {
        let basePos = {
            x: this.player.pos.x,
            y: this.player.pos.y + this.yOffset
        }

        let pos = {
            x: this.player.pos.x,
            y: this.player.pos.y + this.yOffset
        }

        this.basePos = basePos;
        this.pos = pos;
        this.direction = this.player.lookingDirection;
    }

    // allows the update loop to run
    fire = () => {
        this.wasTriggered = true;
    }

    // returns the data for the front end to presen the carrot
    getData = () => {
        return {
            pos: this.pos,
            direction: this.direction
        }
    } 
}
module.exports = CarrotServer;

