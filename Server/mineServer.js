"use strict";

const PhysicalObject = require("./physicalObject.js");
const UTIL = require("./utilities.js");

class MineServer extends PhysicalObject {
    constructor(pos, hasGravity, worldBlocks, player, enemies) {
        super(pos, { width: 50, height: 20 }, hasGravity, worldBlocks);
        this.player = player;
        this.enemies = enemies;
        this.id = UTIL.generateID();
        this.isTriggered = false;
        this.wasPlaced = false;
        this.isPlaced = false;
        this.hasExploded = false;
        this.damageRadius = 300;
        this.maxDamage = 500;
        this.isExploding = false;
        this.explosionStepCounter = 0;
        this.explosionStep = 0;
        this.explosionSpeed = 8; // lower is faster
    }

    // update loop that runs if a mine is ready to be stepped on
    update = () => {
        if (this.isExploding) {
            this.explosionStepCounter++;
            this.explosionStep = Math.floor(this.explosionStepCounter / this.explosionSpeed);
        } else if (this.isPlaced) {
            this.goDown();
            this.checkIfSteppedOn();
            if (this.isTriggered && !this.hasExploded) {
                this.hasExploded = true;
                setTimeout(this.explode, 2000)
            }
        } else if (this.wasPlaced) {
            this.isPlaced = true;
            this.setMinePos();
        }
    }

    // places the mine initially when dropped
    setMinePos = () => {
        let x = this.player.pos.x;
        let y = this.player.pos.y;
        this.pos = {
            x: x,
            y: y
        };
    }

    // if mine is stepped on this function sets the isTriggered 
    // attribute to true
    checkIfSteppedOn = () => {
        let xMineStart = this.pos.x;
        let xMineEnd = xMineStart + this.size.width;
        let yMineStart = this.pos.y;
        let yMineEnd = yMineStart + this.size.height;

        this.enemies.forEach((enemy) => {
            let xEnemyStart = enemy.pos.x;
            let xEnemyEnd = xEnemyStart + enemy.size.width;
            let yEnemyStart = enemy.pos.y;
            let yEnemyEnd = yEnemyStart + enemy.size.height;

            let enemyTouchedFromRight = (xEnemyStart <= xMineEnd && xEnemyStart >= xMineStart && 
                                        yEnemyEnd >= yMineStart && yEnemyEnd <= yMineEnd);

            let enemyTouchedFromLeft = (xEnemyEnd >= xMineStart && xEnemyEnd <= xMineEnd && 
                                        yEnemyEnd >= yMineStart && yEnemyEnd <= yMineEnd);

            let enemyTouched = enemyTouchedFromRight || enemyTouchedFromLeft;

            if (enemyTouched) {
                this.isTriggered = true;
            }
        });
    }

    // places the mine, or more acurately makes the update loop first place the 
    // mine and then checks for touches constantly
    place = () => {
        this.wasPlaced = true;
    }

    // TODO: Explosion on front end
    // damages the enemy and then splices itself from the 
    // global mine list
    explode = () => {
        this.damageEnemies();
        this.isExploding = true;
        setTimeout(() => {
            this.player.removeMine(this.id);
        }, 1000);
    }

    getData = () => {
        return {
            pos: this.pos,
            size: this.size,
            isTriggered: this.isTriggered,
            isExploding: this.isExploding,
            explosionStep: this.explosionStep
        }
    }

    // since not only one enemy gets damaged 
    // but all in a given radius, the damage is
    // calculated based on the root of the distance of 
    // an enemy in a given range
    damageEnemies = () => {
        let mineCenter = this.getBodyCenter();
        console.log("len", this.enemies.length);
        // counting down so its guaranteed we get no errors due to killing an enemy and
        // removing it from the array
        for (let i = this.enemies.length - 1; i >= 0 ; i--) {
            console.log("count", i);
            let enemy = this.enemies[i];
            let enemyBodyCenter = enemy.getBodyCenter();

            let deltaX = Math.round(Math.abs(mineCenter.x - enemyBodyCenter.x));
            let deltaY = Math.round(Math.abs(mineCenter.y - enemyBodyCenter.y));
            let distance = Math.round(Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)));

            if (distance < this.damageRadius) {
                let damage = this.maxDamage / Math.sqrt(distance);
                enemy.decreaseEnemyLife(Math.round(damage));
                this.player.killsEnemy(enemy);
            }
        };
    }
}

module.exports = MineServer;