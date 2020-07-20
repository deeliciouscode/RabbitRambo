"use strict";

import { Drawable } from "./drawable.js";

export class BlockSidewaysClient extends Drawable {
    constructor(pos, size, type, context, assets) {
        super(pos, size);
        this.type = type;
        this.context = context;
        this.assets = assets;
        this.spritePositions = {
            "long": {
                x: 0,
                y: 0
            },
            "short": {
                x: 0,
                y: 73
            },
        };
    }

    draw() {
        this.drawBlock();
    }

    drawBlock() {
        this.context.drawImage(
            this.assets.steelBars,
            this.spritePositions[this.type].x,
            this.spritePositions[this.type].y,
            this.spriteLength,
            73,
            this.pos.x,
            this.pos.y,
            this.size.width,
            this.size.height
        );
    }

    // sets the sprite based on its a short or a long 
    // moving block
    setSprite() {
        if (this.type === "short") {
            this.spriteLength = 743;
        }
        if (this.type === "long") {
            this.spriteLength = 1603;
        }
    }

}
