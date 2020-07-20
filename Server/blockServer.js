"use strict";

const PhysicalObject = require('./physicalObject.js');

// serves as the superclass for all blocks, moving or not
class BlockServer extends PhysicalObject {
    constructor(pos, size, hasGravity, worldBlocks, isWall, type) {
        super(pos, size, hasGravity, worldBlocks);
        this.isWall = isWall;
        this.isMovable = false;
        this.type = type;
    }
}

module.exports = BlockServer;