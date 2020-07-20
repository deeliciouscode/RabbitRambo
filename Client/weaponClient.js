"use strict";

import { Drawable } from "./drawable.js";

export class WeaponClient extends Drawable {
    constructor(pos, size, id, context, game, assets, direction) {
        super(pos, size);
        this.id = id;
        this.context = context;
        this.game = game;
        this.assets = assets;
        this.direction = direction;
        this.type = "carrot";
        this.maxAmmoCount = 240;
        this.ammoCount = 240;
        this.spritePositions = {
            "right": {
                x: 0,
                y: 0
            },
            "left": {
                x: 0,
                y: 232
            },
        };

    }

    draw() {
        this.drawWeapon();
    }

    drawWeapon() {
        this.context.drawImage(
            this.assets.carrot,
            this.spritePositions[this.direction].x,
            this.spritePositions[this.direction].y,
            785,
            232,
            this.pos.x,
            this.pos.y,
            this.size.width,
            this.size.height
        );
    }

    setAmmoCount(amount) {
        this.ammoCount = amount;
    }

    hits() {
        this.showExplosion();
        this.game.deleteWeaponOnClientSide(this.id);
    }

    showExplosion() {
        this.context.fillStyle = "red";
        this.context.fillRect(this.pos.x,
            this.pos.y,
            40,
            40);
    }
}
