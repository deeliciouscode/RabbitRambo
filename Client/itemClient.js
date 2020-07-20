"use strict";

import { Drawable } from "./drawable.js";

export class ItemClient extends Drawable {
    constructor(pos, size, id, context, canvas, potionType, assets) {
        super(pos, size);
        this.id = id;
        this.context = context;
        this.canvas = canvas;
        this.assets = assets;
        this.animationSpeed = 10;
        this.currentAnimationStep = Math.floor(Math.random() * 6);
        this.potionType = potionType;
        this.spritePositions = {
            "increaseSpeed": { // red 
                x: 0,
                y: 0
            },
            "increasePower": { // yellow 
                x: 0,
                y: 50
            },
            "increaseLife": { // green 
                x: 0,
                y: 100
            },
            "increaseGravity": { // blue 
                x: 0,
                y: 150
            },
            "invulnerable": { // pink 
                x: 0,
                y: 200
            }
        }
    }

    // calls the asset function below 
    draw = () => {
        this.drawItem();
    }

    //  draws asset on item //
    drawItem = () => {
        this.context.drawImage(
            this.assets.powerUps,
            this.spritePositions[this.potionType].x + this.currentAnimationStep * 50,
            this.spritePositions[this.potionType].y,
            50,
            50,
            this.pos.x,
            this.pos.y,
            this.size.width,
            this.size.height);
    }

    // everytime, update is called, the asset steps one frame further
    update = (frameCount) => {
        if (frameCount % this.animationSpeed === 0) {
            this.currentAnimationStep = (this.currentAnimationStep + 1) % 8;
        }
    }

}