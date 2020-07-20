"use strict";

export class Drawable {
    constructor(pos, size) {
        this.pos = pos;
        this.size = size;
    }

    // all drawables that are not classles have this set position in case 
    // their position changes
    setPos(pos) {
        this.pos.x = pos.x;
        this.pos.y = pos.y;
    }
}