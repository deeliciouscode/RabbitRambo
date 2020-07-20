"use strict";

const PhysicalObject = require("./physicalObject.js");

class CreatureServer extends PhysicalObject {
    constructor(pos, size, hasGravity, worldBlocks) {
        super(pos, size, hasGravity, worldBlocks);
    }
}

module.exports = CreatureServer;

// this class only acts as a parent class for player and partner.
