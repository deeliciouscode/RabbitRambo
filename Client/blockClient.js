"use strict";

import { Drawable } from "./drawable.js";

export class BlockClient extends Drawable {
    constructor(pos, size, type, context, assets) {
        super(pos, size);
        this.type = type;
        this.assets = assets;
        this.context = context;
    }

    draw() {
        this.drawBlock();
    }

    drawBlock() {
        this.context.drawImage(
            this.assets.blocks,
            this.spriteX,
            this.spriteY,
            this.spriteWidth,
            this.spriteHeight,
            this.pos.x,
            this.pos.y,
            this.size.width,
            this.size.height
        );
    }

    // checks which sprite is necessary based on 
    // whether its a floor or a box
    setSprite() {
        if (this.type === "floor") {
            this.spriteWidth = 2920;
            this.spriteHeight = 2000;
            this.spriteX = 0;
            this.spriteY = 0;
        }
        if (this.type === "box") {
            this.spriteWidth = this.size.width;
            this.spriteHeight = 50;
            this.spriteX = 0;
            this.spriteY = 2000;
        }
    }
}
