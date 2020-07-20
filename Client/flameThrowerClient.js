"use strict";

import { Drawable } from "./drawable.js";

export class FlameThrowerClient extends Drawable {
    constructor(pos, size, id, context, game, assets, direction) {
        super(pos, size);
        this.id = id;
        this.context = context;
        this.game = game;
        this.assets = assets;
        this.direction = direction;
        this.spriteWidth = 230;
        this.spritePositions = {
            "right": {
                x: 0,
                y: 0
            },
            "left": {
                x: 0,
                y: 40
            }
        };
        this.currentAnimationStep = 0;
        this.animationSpeed = 5;
        this.spriteY = 0;
        this.posCorrectionY = 7;
        this.drawPositions = {};

    }

    draw() {
        this.drawFlame();
    }

    drawFlame() {
        this.updateDrawPositions();
        this.context.drawImage(
            this.assets.enemyFlame,
            this.spritePositions[this.direction].x + this.currentAnimationStep * this.spriteWidth ,
            this.spritePositions[this.direction].y + this.spriteY,
            this.spriteWidth,
            40,
            this.drawPositions[this.direction].x,
            this.drawPositions[this.direction].y,
            this.drawPositions[this.direction].width,
            this.size.height
        );
    }

    update(frameCount) {
        if (this.currentAnimationStep >= 5) {
            this.spriteY = 80;
        }
        if (frameCount % this.animationSpeed === 0) {
            this.currentAnimationStep = (this.currentAnimationStep + 1) % 10;
        }

    }

    delete() {
        this.game.deleteFlameThrowerOnClientSide(this.id);
    }

    updateDrawPositions(){
        this.drawPositions = {
            "right": {
                x: this.pos.x - 35,
                y: this.pos.y + this.posCorrectionY,
                width: this.size.width + 35,
            },
            "left": {
                x: this.pos.x + 17,
                y: this.pos.y + this.posCorrectionY,
                width: this.size.width + 17,
            }
        };
    }
}