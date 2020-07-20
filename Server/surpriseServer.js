"use strict";
const CONST = require("./constants.js");
const UTIL = require("./utilities.js")
const Player = require('./playerServer.js');
const Gatherable = require('./gatherableServer.js');

class Surprise extends Gatherable {
    constructor(pos, players, surprises, round) {
        super(pos, {width: 50, height: 50}, players);
        this.surprises = surprises;
        this.round = round;
        this.types = {
            carrotPack: "carrotPack",
            minePack: "minePack"
        }
        this.amountMultiplicator = Math.sqrt(this.round);
        this.type;
        this.amount;
        this.carrotAmount = 20;
        this.mineAmount = 5;
        this.createRandomPack();
    }

    // update loop that checks constantly if a surprise pack is collected
    update = () => {
        this.checkIfPlayerCollects(this.playerCollectsSurprise)
    }

    // if a player touches a surprise pack, this function is called to
    // fill up either the mines or the carrots
    playerCollectsSurprise = (player) => {
        switch(true) {
            case this.type == this.types.carrotPack:
                player.fillUpCarrots(this.amount);
                this.removeSurprise(this.id);
                break;
            case this.type == this.types.minePack:
                player.fillUpMines(this.amount);
                this.removeSurprise(this.id);
                break;
        }

        console.log("playerCollectsItem");
    }

    // during construction the type of the pack is determined,
    // based on round and some randomness
    createRandomPack = () => {
        if (this.round <= 2) {
            this.type = this.types.minePack; 
            this.amount = Math.round(this.mineAmount * this.amountMultiplicator);
        } else {
            let random = Math.random();
            switch (true) {
                case random <= 0.5: 
                    this.type = this.types.minePack; 
                    this.amount = Math.round(this.mineAmount * this.amountMultiplicator)
                    break;
                case random > 0.5: 
                    this.type = this.types.carrotPack; 
                    this.amount = Math.round(this.carrotAmount * this.amountMultiplicator)
                    break;
            }
        }
    }

    // removes the surprise from the global surprise list
    removeSurprise = (id) => {
        let indexToSplice;
        for (let i = 0; i < this.surprises.length; i++) {
            let surprise = this.surprises[i];
            if (surprise.id === id) {
                indexToSplice = i;
                break;
            }
        }

        this.surprises.splice(indexToSplice, 1);
    }

    getData = () => {
        return {
            pos: this.pos,
            size: this.size
        }
    }
}

module.exports = Surprise;