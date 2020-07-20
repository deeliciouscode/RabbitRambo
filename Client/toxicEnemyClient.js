"use strict";

import { Drawable } from "./drawable.js";

export class ToxicEnemy extends Drawable {
    constructor(pos, size, id, context, game, assets) {
        super(pos, size);
        this.id = id;
        this.context = context;
        this.game = game;
        this.assets = assets;
        this.lifes;
        this.spritePositions = {
            "walk": {
                x: 0,
                y: 0
            },
            "death": {
                x: 0,
                y: 450
            }

        };
        this.currentAnimationStep = Math.floor(Math.random() * 6);
        this.animationSpeed = 5;
        this.isAlive = true;
        this.deathAnimationStarted = false;

    }

    draw() {
        this.setPose();
        this.drawEnemy();
        this.displayLife(this.lifes);
    };

    drawEnemy() {
        this.context.drawImage(
            this.assets.enemy,
            this.spritePositions[this.currentPose].x + this.currentAnimationStep * 170,
            this.spritePositions[this.currentPose].y,
            170,
            150,
            this.pos.x,
            this.pos.y,
            this.size.width,
            this.size.height
        );
    }
    /* everytime, update is called, the asset steps one frame further. */
    update(frameCount) {
        if (!this.isAlive && !this.deathAnimationStarted){
            this.deathAnimationStarted = true;
            this.currentAnimationStep = 0;
        }
        else if (!this.isAlive && this.currentAnimationStep >= 9){
            this.currentAnimationStep = 10;
        }
        else if (frameCount % this.animationSpeed === 0){

            this.currentAnimationStep = (this.currentAnimationStep + 1) % 10;
        }
    }

    setPose(){
        if (this.isAlive){
            this.currentPose = "walk";
            this.animationSpeed = 5;
        }
        else {
            this.currentPose = "death";
            this.animationSpeed = 4;
        }
    }

    displayLife() {
        this.context.fillStyle = "white";
        this.context.fillRect(this.pos.x + 5, this.pos.y - 12, 52, 8);

        if (this.lifes > 0) {
            this.context.fillStyle = "green";
            this.context.fillRect(this.pos.x + 6, this.pos.y - 11, this.lifes * 0.5, 6);
        }
    }

    die() {
        this.isAlive = false;
        setTimeout(() => { this.game.deleteEnemyOnClientSide(this.id) }, 1000);
    }
}
