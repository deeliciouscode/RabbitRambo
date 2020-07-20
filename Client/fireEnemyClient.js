"use strict";

import { Drawable } from "./drawable.js";

export class FireEnemy extends Drawable {
    constructor(pos, size, id, context, game, assets, stopToShoot) {
        super(pos, size);
        this.id = id;
        this.context = context;
        this.game = game;
        this.assets = assets;
        this.stopToShoot = stopToShoot;
        this.spritePositions = {
            "walk": {
                x: 0,
                y: 150
            },
            "spitFire": {
                x: 0,
                y: 300
            },
            "death": {
                x: 0,
                y: 450
            }

        };
        this.currentAnimationStep = Math.floor(Math.random() * 6);
        this.animationSpeed = 3;
        this.currentPose = "walk";
        this.isAlive = true;
        this.spittingFire = false;
        this.deathAnimationStarted = false;
    }

    draw() {
        this.setPose();
        this.drawEnemy();
        this.displayLife();

    }

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
        if (!this.isAlive && !this.deathAnimationStarted) {
            this.deathAnimationStarted = true;
            this.currentAnimationStep = 0;
        }
        else if (!this.isAlive && this.currentAnimationStep >= 9) {
            this.currentAnimationStep = 10;
        }

        else if (frameCount % this.animationSpeed === 0 && this.currentPose === "spitFire" && !this.spittingFire) {
            this.currentAnimationStep = 0;
            this.spittingFire = true;
        }

        else if (frameCount % this.animationSpeed === 0 && this.currentPose === "spitFire" && this.spittingFire) {
            if (this.currentAnimationStep >= 4) {
                this.currentAnimationStep = 4;
            }
            else {
                this.currentAnimationStep++;
            }
        }

        else if (frameCount % this.animationSpeed === 0) {

            this.currentAnimationStep = (this.currentAnimationStep + 1) % 10;
        }
    }

    // sets the pose so the proper 
    // sprites can be drawn
    setPose(){
        if (this.stopToShoot && this.isAlive){
            this.currentPose = "spitFire";
            this.animationSpeed = 10;
        }
        if (!this.stopToShoot && this.isAlive){
            this.currentPose = "walk";
            this.spittingFire = false;
            this.animationSpeed = 3;
        }
        if (!this.isAlive){
            this.currentPose = "death";
            this.animationSpeed = 4;
        }
    }

    displayLife(life) {
        this.context.fillStyle = "white";
        this.context.fillRect(this.pos.x + 5, this.pos.y - 12, 52, 8);

        if (this.lifes > 0) {
            this.context.fillStyle = "green";
            this.context.fillRect(this.pos.x + 6, this.pos.y - 11, this.lifes * 0.25, 6);
        }
    }

    // inits the die sequence and then splices the enemy from the enemy list
    die() {
        this.isAlive = false;
        setTimeout(() => { this.game.deleteEnemyOnClientSide(this.id) }, 1000);
    }
}