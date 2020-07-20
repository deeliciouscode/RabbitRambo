"use strict";

const EnemyServer = require("./enemyServer.js")
const CONST = require("./constants.js")

class Laserbeam {
    constructor(player, worldBlocks, enemies) {
        this.pos = {
            x: 0,
            y: 0
        };
        this.posEnd = {
            x: 0,
            y: 0
        };
        this.offsetXRight = 22;
        this.offsetXLeft = 20;
        this.offsetY = 56;
        this.offsetXJumpingRight = 24;
        this.offsetXJumpingLeft = 24;
        this.offsetYJumping = 40;
        this.laserStrength = 3;
        this.pos.x = player.pos.x + this.offsetX;
        this.pos.y = player.pos.y + this.offsetY;
        this.player = player;
        this.worldBlocks = worldBlocks;
        this.enemies = enemies;

        this.maxRangeLaser = 500;
        this.shortestBeamR = this.maxRangeLaser;
        this.shortestBeamL = this.maxRangeLaser;
        this.isShooting = false;
        this.directs = CONST.directions;
        this.damage = 0.1;
        this.laserDamageCounter = 1;
        this.laserDamageMultiplicator = 1;
    }

    // update loop that only runs when the laser is actually shooting
    update() {
        if (this.isShooting) {
            this.laserDamageCounter++;
            this.updatePos();
            if (this.laserDamageCounter % 50 === 0) // so its a bit more lightweight
                this.updateDamage();
            this.selfHarmPlayer();
            this.checkHits();
        }
    }

    // needs all these different cases because the eye of the rabbit on the spreadsheet is not always 
    // on the same pos, depending on whether it jumps and looks left or right
    updatePos() {
        if (!this.player.onGround && this.player.lookingDirection === this.directs.right) {
            this.pos.x = this.player.pos.x + this.offsetXJumpingRight;
            this.pos.y = this.player.pos.y + this.offsetYJumping;
        } else if (!this.player.onGround && this.player.lookingDirection === this.directs.left) {
            this.pos.x = this.player.pos.x + this.offsetXJumpingLeft;
            this.pos.y = this.player.pos.y + this.offsetYJumping;
        } else if (this.player.lookingDirection === this.directs.right) {
            this.pos.x = this.player.pos.x + this.offsetXRight;
            this.pos.y = this.player.pos.y + this.offsetY;
        } else {
            this.pos.x = this.player.pos.x + this.offsetXLeft;
            this.pos.y = this.player.pos.y + this.offsetY;
        }
    }

    // the damage should be a function of the time the laser is in use already,
    // but to make things not too easy the player takes some damage too.
    updateDamage() {
        // sqrt(x^3)/1000
        let multiplier = Math.sqrt(Math.pow(this.laserDamageCounter, 3)) / 1000;
        this.laserDamageMultiplicator = multiplier;
    }

    // the player harms himself if the laser is used for too long,
    // it basically burns the eyes
    selfHarmPlayer() {
        if (this.laserDamageCounter > 200) {
            this.player.decreasePlayerLife(this.damage * this.laserDamageMultiplicator / 2)
        } 
    }

    // DAVID TODO
    checkHits() {
        this.shortestBeamR = this.maxRangeLaser;
        this.shortestBeamL = this.maxRangeLaser;
        this.checkEnemyHit();
    }

    // checks if laser can hit an enemy and
    // if yes shoots it in his body center
    checkEnemyHit() {
        let shortestDistance = Infinity;
        let shortestDistanceIndex = 0;
        let shortestDistanceDirect = undefined;
        let enemiesInViewAndRange = [];
        let upperBound = this.player.pos.y - 30;
        let lowerBound = upperBound + this.player.size.height + 30;

        this.enemies.forEach((enemy) => {
            let enemyCenter = enemy.getBodyCenter();
            let isInView = enemyCenter.y > upperBound && enemyCenter.y < lowerBound;
            let isInRange = Math.abs(enemyCenter.x - this.player.getBodyCenter().x) < this.maxRangeLaser
            if (isInView && isInRange) {
                enemiesInViewAndRange.push(enemy);
            }
        }); 

        for (let i = 0; i < enemiesInViewAndRange.length; i++) {
            const enemy = enemiesInViewAndRange[i];
            if (this.player.lookingDirection === this.directs.right) {
                let enemyIsRight = enemy.getBodyCenter().x - this.player.getBodyCenter().x >= 0;
                let deltaX = Math.abs(enemy.getBodyCenter().x - this.player.getBodyCenter().x);
                let deltaY = Math.abs(enemy.getBodyCenter().y - this.player.getBodyCenter().y);
                let distance = Math.sqrt(Math.pow(deltaX, 2) * Math.pow(deltaY, 2));

                if (enemyIsRight && distance < shortestDistance) {
                    shortestDistanceIndex = i;
                    shortestDistance = distance;
                    shortestDistanceDirect = this.directs.right;
                }
            } else {
                let enemyIsLeft = enemy.getBodyCenter().x - this.player.getBodyCenter().x <= 0;
                let deltaX = Math.abs(enemy.getBodyCenter().x - this.player.getBodyCenter().x);
                let deltaY = Math.abs(enemy.getBodyCenter().y - this.player.getBodyCenter().y);
                let distance = Math.sqrt(Math.pow(deltaX, 2) * Math.pow(deltaY, 2));

                if (enemyIsLeft && distance < shortestDistance) {
                    shortestDistanceIndex = i;
                    shortestDistance = distance;
                    shortestDistanceDirect = this.directs.left;
                }
            }
        }

        if (enemiesInViewAndRange[0]) {
            this.posEnd = {
                x: enemiesInViewAndRange[shortestDistanceIndex].getBodyCenter().x,
                y: enemiesInViewAndRange[shortestDistanceIndex].getBodyCenter().y
            }
            if (this.player.lookingDirection === shortestDistanceDirect) {
                let enemy = enemiesInViewAndRange[shortestDistanceIndex];
                enemy.decreaseEnemyLife(this.damage * this.laserDamageMultiplicator + 0.05);
                this.player.killsEnemy(enemy);
            }
        }

        if (shortestDistance === Infinity) {
            this.checkWallHit();
        }
    }

    // checks if the laser hits a wall and stops it there instead of beeing
    // the full lenght
    checkWallHit() {
        let xStart = this.pos.x;
        let yStart = this.pos.y;
        let yEnd = yStart + this.laserStrength;
        let shortestBeamR = this.maxRangeLaser;
        let shortestBeamL = this.maxRangeLaser;
        let shortestBeamIndexR = undefined;
        let shortestBeamIndexL = undefined;

        for (let i = 0; i < this.worldBlocks.length; i++) {
            let wb_xStart = this.worldBlocks[i].pos.x;
            let wb_xEnd = wb_xStart + this.worldBlocks[i].size.width;
            let wb_yStart = this.worldBlocks[i].pos.y;
            let wb_yEnd = wb_yStart + this.worldBlocks[i].size.height;

            let is_left_of_this_block = xStart <= wb_xStart && yStart < wb_yEnd && yEnd > wb_yStart;
            let is_right_of_this_block = xStart >= wb_xEnd && yStart < wb_yEnd && yEnd > wb_yStart;

            if (is_left_of_this_block) {
                let tempDeltaR = wb_xStart - xStart;
                if (Math.min(shortestBeamR, tempDeltaR) < shortestBeamR)
                    shortestBeamIndexR = i;
                shortestBeamR = Math.min(shortestBeamR, tempDeltaR);
            }

            if (is_right_of_this_block) {
                let tempDeltaL = xStart - wb_xEnd;
                if (Math.min(shortestBeamL, tempDeltaL) < shortestBeamL)
                    shortestBeamIndexL = i
                shortestBeamL = Math.min(shortestBeamL, tempDeltaL)
            }
        }

        if (this.shortestBeamR > shortestBeamR)
            this.shortestBeamR = shortestBeamR;

        if (this.shortestBeamL > shortestBeamL)        
            this.shortestBeamL = shortestBeamL;

        if (this.player.lookingDirection == this.directs.right) {
            this.posEnd = {
                x: this.pos.x + this.shortestBeamR,
                y: this.pos.y
            }
        } else {
            this.posEnd = {
                x: this.pos.x - this.shortestBeamL,
                y: this.pos.y
            }
        }
    }

    // returns the relevant data
    getData() {
        return {
            xStart: this.pos.x,
            yStart: this.pos.y,

            xEnd: this.posEnd.x,
            yEnd: this.posEnd.y,

            hitsSomething: (Math.abs(this.pos.x - this.posEnd.x)) < this.maxRangeLaser - 3,
            direction: this.player.lookingDirection,
            strength: this.laserStrength,
            isShooting: this.isShooting
        }
    }

    // can be called from outside to make the laser work
    shoot() {
        this.isShooting = true;
    }

    // can be called from outside to stop 
    stopShooting() {
        console.log(this.laserDamageMultiplicator);
        this.isShooting = false;
        this.laserDamageCounter = 0;
        this.laserDamageMultiplicator = 1;
    }
}

module.exports = Laserbeam;