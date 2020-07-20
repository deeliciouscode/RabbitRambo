"use strict";

const UTIL = require("./utilities.js")

class Gatherable {
    constructor(pos, size, players) {
        this.pos = pos;
        this.size = size;
        this.players = players;
        this.id = this.createRandomId();
        this.wasCollected = false;
    }

    // checks for all items that can be collected if a player touches them
    // and if that happens a callback functions to make whatever 
    // you want happen (like filling up the mines of a player)
    checkIfPlayerCollects(callback) {
        this.players.forEach((player) => {
            let playerTouchesItem =
                player.pos.x + player.size.width > this.pos.x &&
                player.pos.x < this.pos.x + this.size.width &&
                player.pos.y + player.size.height > this.pos.y &&
                player.pos.y < this.pos.y + this.size.height && !this.wasCollected;
            if(playerTouchesItem){
                callback(player);
            }
        });
    }

    // returns a randomly generated id
    createRandomId = () => {
        let id = UTIL.generateID();
        return id
    }
}

module.exports = Gatherable;