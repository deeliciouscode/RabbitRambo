"use strict";

const CONST = require("./constants.js");

class PhysicalObject {
    constructor(position, size, hasGravity, worldBlocks) {
        this.pos = position;
        this.size = size;
        this.hasGravity = hasGravity;
        this.worldBlocks = worldBlocks;
        this.velY = CONST.BASE_VEL;
        this.maxSpeedY = 15;
        this.gravity = 1.3;
        this.onGround = false;
        this.deltaY;
        this.indexOfBlockStandingOn;
        this.blockStandingOn;
    }

    // sets this.indexOfBlockStandingOn to the index of the physical object this one stands on 
    // -> important if the block this block stands on a moving block
    // plus sets the delta this block is allowed to fall
    updateDeltaY() {
        let xStart = this.pos.x;
        let xEnd   = xStart + this.size.width;
        let yStart = this.pos.y;
        let yEnd   = yStart + this.size.height;
        let deltaY = Infinity;
        let deltaTemp;
        let aboveBlockTemp;
        let indexOfBlock = 0;

        for (let i = 0; i < this.worldBlocks.length; i++) {
            let otherBlock = this.worldBlocks[i];
            if (this !== otherBlock) {
                let xStartOfBlock = otherBlock.pos.x;
                let xEndOfBlock = xStartOfBlock + otherBlock.size.width;
                let yStartOfBlock = otherBlock.pos.y;
                aboveBlockTemp = xEnd >= xStartOfBlock && xStart <= xEndOfBlock && yEnd <= yStartOfBlock;
                if (aboveBlockTemp === true) {
                    deltaTemp = yStartOfBlock - yEnd;
                    if (deltaTemp === Math.min(deltaY, deltaTemp))
                        indexOfBlock = i;
                    deltaY = Math.min(deltaY, deltaTemp)
                }
            }
        }

        this.deltaY = deltaY;
        this.indexOfBlockStandingOn = indexOfBlock;
    }


    // is called in case of the player, its the way he 
    // jumps
    goUp() {
        const THRESHHOLD = 0.2;
        if (this.velY > -THRESHHOLD) {
            this.velY = CONST.BASE_VEL;
        }
        let dUp = this.velY * this.gravity;
        this.pos.y += dUp;
    }

    // puts the object this down by some number, that is determined by getting the allowed deltaY first
    goDown() {
        this.updateDeltaY();
        let dDown = this.velY * this.gravity;
        let dMax = Math.min(this.deltaY, dDown, this.maxSpeedY)
        if (this.hasGravity) {
            this.pos.y += dMax;
        }
        if (dMax === this.deltaY) {
            this.blockStandingOn = this.worldBlocks[this.indexOfBlockStandingOn]
            this.onGround = true;
        }
        if (this.velY > 0) {
            this.velY *= 1.03;
        } else if (this.velY > (-0.2)){
            this.velY = -this.velY
        } else {
            this.velY *= 0.9
        }
    }

    // determines weather the object this should go up or down 
    upAndDown() {
        let isJumping = this.velY <= 0
        if (isJumping) {
            this.goUp();
        } 
        this.goDown();
    }

    // returns the center of any given object
    getBodyCenter = () => {
        let xCenter = this.pos.x + this.size.width / 2;
        let yCenter = this.pos.y + this.size.height / 2;
        
        return {
            x: xCenter,
            y: yCenter
        }
    }
}

module.exports = PhysicalObject;