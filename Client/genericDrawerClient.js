"use strict";

// class that can draw objects that dont need to correspond to a class
// like carrots, mines and the laser
export class GenericDrawer {
    constructor(context, assets) {
        this.context = context; 
        this.assets = assets;
        this.timestamp = 0;
        this.laserColor = "#28a0ff";
        this.carrotSprite = {
            right: {
                x: 0,
                y: 0
            },
            left: {
                x: 0,
                y: 15
            }
        }
        this.mineSrite = {
            off: {
                x: 0,
                y: 0
            },
            on: {
                x: 0,
                y: 20
            },
            offsetY: 3
        };
        this.explosionSprite = {
            start: {
                x: 0,
                y: 0
            },
            height: 258,
            width: 225
        };
        this.sparkSprite = {
            x: 0,
            y: 0
        };
        this.update();
    }

    // the timestamp is used to calculate some options for the sprites
    update = () => {
        this.timestamp++;
    }

    // draws the laser based on direction
    drawLaser(laser) {
        let currentAnimationStep = Math.floor((Math.random() - 0.000001) * 4);

        let offsetX;
        let offsetY;
        if (laser.direction === "right") {
            offsetX = 4;
            offsetY = -1;
        } else {
            offsetX = -1;
            offsetY = -1;
        }
        if (laser.isShooting) {
            this.context.beginPath();
            this.context.arc(laser.xStart + offsetX, laser.yStart + offsetY, 4, 0, 2 * Math.PI);
            this.context.fillStyle = this.laserColor;
            this.context.fill();

            this.context.beginPath();
            this.context.moveTo(laser.xStart, laser.yStart);
            this.context.lineTo(laser.xEnd, laser.yEnd);
            this.context.lineWidth = laser.strength;
            this.context.strokeStyle = this.laserColor;
            this.context.stroke();

            if (laser.hitsSomething) {
                this.context.drawImage(
                    this.assets.spark,
                    this.sparkSprite.x + currentAnimationStep * 50,
                    this.sparkSprite.y,
                    50,
                    50,
                    laser.xEnd - 15,
                    laser.yEnd - 15,
                    30,
                    30);
            }
        } else {
            this.context.beginPath();
            this.context.stroke();
        }
    }

    // the mine has 3 stages:
    // idle, triggered, exploding
    drawMine = (mine) => {
        if (mine.isExploding) {
            this.drawExplodingMine(mine);
        } else if (mine.isTriggered) {
            this.drawTriggeredMine(mine);
        } else {
            this.drawIdleMine(mine)
        }
    }

    drawExplodingMine = (mine) => {
        if (mine.explosionStep <= 5) {
            if (mine.explosionStep === 1) {
                this.assets.explosionSound.play();
            }

            this.context.drawImage(
                this.assets.explosionSprite,
                this.explosionSprite.start.x + mine.explosionStep * this.explosionSprite.width,
                this.explosionSprite.start.y,
                this.explosionSprite.width,
                this.explosionSprite.height,
                mine.pos.x - 112,
                mine.pos.y - 129,
                this.explosionSprite.width,
                this.explosionSprite.height);
        }
    }

    drawTriggeredMine = (mine) => {
        let ledState;
        if (this.timestamp % 2 === 0) {
            ledState = this.mineSrite.on;
        } else {
            ledState = this.mineSrite.off;
        }

        this.context.drawImage(
            this.assets.mine,
            ledState.x,
            ledState.y,
            50,
            20,
            mine.pos.x,
            mine.pos.y + this.mineSrite.offsetY,
            50,
            20);
    }

    drawIdleMine = (mine) => {
        let ledState;
        if (this.timestamp % 15 === 0) {
            ledState = this.mineSrite.on;
        } else {
            ledState = this.mineSrite.off;
        }

        this.context.drawImage(
            this.assets.mine,
            ledState.x,
            ledState.y,
            50,
            20,
            mine.pos.x,
            mine.pos.y + this.mineSrite.offsetY,
            50,
            20);
    }

    drawSurprisePack = (pack) => {
        this.context.drawImage(
            this.assets.surprise,
            0,
            0,
            62,
            50,
            pack.pos.x,
            pack.pos.y,
            62,
            50);
    }

    drawCarrot = (carrot) => {
        let x, y;
        if (carrot.direction === "right") {
            x = this.carrotSprite.right.x;
            y = this.carrotSprite.right.y;
        } else {
            x = this.carrotSprite.left.x;
            y = this.carrotSprite.left.y;
        }

        this.context.drawImage(
            this.assets.carrot,
            x,
            y,
            50,
            15,
            carrot.pos.x,
            carrot.pos.y,
            35,
            15);
    }
 
    drawClasslessObject(data, color) {
        this.context.fillStyle = color;
        this.context.fillRect(data.pos.x, data.pos.y, data.size.width, data.size.height);
    }
}
