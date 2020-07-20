"use strict";

import { Drawable } from "./drawable.js";

export class PartnerClient extends Drawable {
    constructor(pos, size, id, context, canvas, game, assets) {
        super(pos, size);
        this.id = id;
        this.lifes;
        this.context = context;
        this.canvas = canvas;
        this.game = game;
        this.assets = assets;
        this.color = "green";
        this.isAlive = true;
        this.rabbitColor = undefined;
        this.userName = undefined;
        this.currentAnimationStep = Math.floor(Math.random() * 6);
        this.animationSpeed = 5;
        this.assetPose = "run right";
        this.isRunning = false;
        this.onGround = false;
    }

    setSpritePositions = () => {
        this.spritePositions = {
            "run right": {
                x: 0,
                y: this.rabbitColor
            },
            "run left": {
                x: 0,
                y: this.rabbitColor + 100
            },
            "jump right": {
                x: 0,
                y: this.rabbitColor + 200
            },
            "jump left": {
                x: 0,
                y: this.rabbitColor + 300
            }
        };
    }

    draw() {
        if(this.rabbitColor === undefined) {
            this.rabbitColor = this.game.getPartnerColor(this.id);
            this.setSpritePositions();
        }
        if (this.userName === undefined) {
            this.userName = this.game.getPartnerName(this.id);
        }
        if (this.isAlive) {
            this.drawPlayer();
            this.displayLife();
            this.drawName();
        }
    }

    drawPlayer() {
        if (this.onGround) {
            this.context.drawImage(
                this.assets.player,
                this.spritePositions[this.assetPose].x + this.currentAnimationStep * 50,
                this.spritePositions[this.assetPose].y,
                50,
                100,
                this.pos.x,
                this.pos.y,
                this.size.width,
                this.size.height
            );
        } else {
            this.context.drawImage(
                this.assets.player,
                this.spritePositions[this.assetPose].x,
                this.spritePositions[this.assetPose].y,
                50,
                100,
                this.pos.x,
                this.pos.y,
                this.size.width,
                this.size.height
            );
        }
    }

    update(frameCount) {
        if (!this.onGround) {
            this.currentAnimationStep = 0;
        }
        if (frameCount % this.animationSpeed === 0 && this.isRunning) {
            this.currentAnimationStep = (this.currentAnimationStep + 1) % 10;
        }
        if (!this.isRunning && this.onGround) {
            if (this.direction === "right") {
                this.currentAnimationStep = 2;
            }
            if (this.direction === "left") {
                this.currentAnimationStep = 1;
            }
        }
    }

    setDirection(direction) {
        if (direction === "right") {
            this.direction = "right";
            if (!this.onGround) {
                this.assetPose = "jump right"
            }
            else {
                this.assetPose = "run right"
            }
        }
        if (direction === "left") {
            this.direction = "left";
            if (!this.onGround) {
                this.assetPose = "jump left"
            }
            else {
                this.assetPose = "run left"
            }
        }
    }

    // draws name above partner 
    drawName() {
        this.context.fillStyle = "white";
        this.context.font = "9px Arial";
        this.context.fillText(this.userName, this.pos.x - 4, this.pos.y - 4);
    }

    // draws life above partner 
    displayLife() {
        this.context.fillStyle = "white";
        this.context.fillRect(this.pos.x - 4, this.pos.y - 1, 52, 8);

        if (this.lifes > 0) {
            this.context.fillStyle = this.color;
            this.context.fillRect(this.pos.x - 3, this.pos.y, this.lifes * 0.05, 6);
        }
    }

    getLifes() {
        return this.lifes;
    }

    setLifes(lifes) {
        this.lifes = lifes;
    }
}
