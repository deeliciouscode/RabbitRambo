"use strict";

import { Drawable } from "./drawable.js";

export class PlayerClient extends Drawable {
    constructor(pos, size, id, context, canvas, game, assets) {
        super(pos, size);
        this.id = id;
        this.userName = document.getElementById("setUserName").value;
        this.rabbitColor = this.setRabbitColor();
        this.context = context;
        this.canvas = canvas;
        this.assets = assets;
        this.direction = "right";
        this.lifes;
        this.color = "red";
        this.keys = {};
        this.isAlive = true;
        this.inventory = [{}, {}];
        this.minesCounter = 0;
        this.carrotsCounter = 0;
        this.game = game;
        this.game.emitPlayerName(this.id, this.userName, this.rabbitColor);

        document.addEventListener("keydown", e => {
            this.keys[e.code] = true;
        });
        document.addEventListener("keyup", e => {
            this.keys[e.code] = false;
        });
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
        this.spritePositionsItems = {
            "increaseSpeed": { // red 
                x: 0,
                y: 0
            },
            "increasePower": { // yellow 
                x: 50,
                y: 0
            },
            "increaseLife": { // green 
                x: 100,
                y: 0
            },
            "increaseGravity": { // blue 
                x: 150,
                y: 0
            },
            "invulnerable": { // pink 
                x: 200,
                y: 0
            }
        };
        this.currentAnimationStep = Math.floor(Math.random() * 6);
        this.animationSpeed = 5;
        this.assetPose = "run left";
        this.isRunning = false;
        this.onGround = false;
    }

    draw() {
        if (this.isAlive) {
            this.drawPlayer();
            this.displayLife(this.lifes);
            this.drawInventory();
            this.drawEmptyInventory();
            this.drawName();
        }
    };

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

    /* everytime, update is called, the asset steps one frame further. */
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

    // draws name into statuslist
    drawName() {
        this.context.fillStyle = "white";
        this.context.font = "20px Arial";
        this.context.fillText(this.userName, this.canvas.width * 0.02, this.canvas.height * 0.9);
    }

    // draws life into statuslist
    displayLife = () => {
        this.context.fillStyle = "white";
        this.context.fillRect(this.canvas.width * 0.02, this.canvas.height * 0.91, 410, 50);

        if (this.lifes > 0) {
            this.context.fillStyle = this.color;
            this.context.fillRect((this.canvas.width * 0.02) + 5, this.canvas.height * 0.91 + 5, this.lifes * 0.4, 40);
        }

    };

    // draws empty inventory into statuslist
    // updates the counter of mines and carrots
    drawEmptyInventory = () => {
        this.context.fillStyle = "white";
        this.context.font = "20px Arial";
        this.context.strokeStyle = "white";

        for (let i = 0; i < 5; i++) {
            if (i < 2) {
                this.context.fillText(i + 1, this.canvas.width * 0.25 + (i * 80), this.canvas.height * 0.9);
                this.context.strokeRect(this.canvas.width * 0.25 + (i * 80), this.canvas.height * 0.91, 50, 50);
            }
        }
        this.context.fillText("M:", this.canvas.width * 0.22 + (3 * 80), this.canvas.height * 0.928);
        this.context.fillText("L:", this.canvas.width * 0.22 + (3 * 80), this.canvas.height * 0.955);
        this.drawMine();
        this.drawCarrot();
        this.context.fillText(this.minesCounter, this.canvas.width * 0.232 + (3 * 80), this.canvas.height * 0.928);
        this.context.fillText(this.carrotsCounter, this.canvas.width * 0.232 + (3 * 80), this.canvas.height * 0.955);
    }

    drawCarrot = () => {
        this.context.drawImage(
            this.assets.carrot,
            0,
            0,
            50,
            15,
            this.canvas.width * 0.2 + (3 * 80),
            this.canvas.height * 0.94,
            35,
            15
        );
    }
    
    drawMine = () => {
        this.context.drawImage(
            this.assets.mine,
            0,
            20,
            50,
            20,
            this.canvas.width * 0.2 + (3 * 80),
            this.canvas.height * 0.917,
            30,
            12
        );
    }

    // draws specific item into specific inventory space
    // draw it on the position, where object is not empty
    drawInventory = () => {
        for (let i = 0; i < this.inventory.length; i++) {
            if (Object.keys(this.inventory[i]).length !== 0) {
                this.context.drawImage(
                    this.assets.itemInfo,
                    this.spritePositionsItems[this.inventory[i].potionType].x,
                    this.spritePositionsItems[this.inventory[i].potionType].y,
                    50,
                    50,
                    this.canvas.width * 0.25 + (i * 80),
                    this.canvas.height * 0.91,
                    50,
                    50);
            }
        }
    };


    // returns the correct sprite value of the selected rabbitColor
    setRabbitColor = () => {
        var radios = document.getElementsByName('rabbits');
        for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[i].checked) {
                switch (radios[i].value) {
                    case "white":
                        return 0;
                    case "purple":
                        return 400;
                    case "blue":
                        return 800;
                    case "green":
                        return 1200;
                    case "yellow":
                        return 1600;
                }
            }
        }
    }
}
