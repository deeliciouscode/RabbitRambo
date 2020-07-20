"use strict";
const Gatherable = require('./gatherableServer.js');

class ItemServer extends Gatherable {
    constructor(pos, size, players, enemies, worldBlocks) {
        super(pos, size, players);
        this.enemies = enemies;
        this.wasActivated = false;
        this.potionType = this.createRandomPotion();
        this.worldBlocks = worldBlocks;
        this.checkPosition();
    }

    // check if player is on the same position as item
    // if true, call playerCollectsItem
    update = () => {
        this.checkIfPlayerCollects(this.playerCollectsItem)
    }

    // stores item in players inventory, if player collects it
    playerCollectsItem = (player) => {
        this.wasCollected = true;
        player.storesItem(player.id, this.id);
    }

    // create random position in canvas. If no wall or box in range, set pos 
    // nearToBlock = if item position and size is in a existend block 
    // if nearToBlock is true, try it again and position the item on a new random pos
    checkPosition = () => {
        this.worldBlocks.forEach((block) => {
            let nearToBlock =
                block.pos.x + block.size.width > this.pos.x &&
                block.pos.x < this.pos.x + this.size.width &&
                block.pos.y + block.size.height > this.pos.y &&
                block.pos.y < this.pos.y + this.size.height;
            if (nearToBlock) {
                this.pos.x = Math.round(50 + (Math.random() * 1820)),
                    this.pos.y = Math.round(200 + (Math.random() * 700))
                this.checkPosition();
            }
        })
    }

    // create random potion on propability every time, a new item was created
    // returns the random potionType 
    createRandomPotion = () => {
        let randomProbability = Math.random();
        let potionType;
        switch (true) {
            case randomProbability <= 0.6: potionType = "increaseLife"; break;
            case randomProbability <= 0.7: potionType = "increaseGravity"; break;
            case randomProbability <= 0.8: potionType = "increaseSpeed"; break;
            case randomProbability <= 0.9: potionType = "increasePower"; break;
            case randomProbability > 0.9: potionType = "invulnerable"; break;
        }
        return potionType
    }

    // after item was activated, player will get specific itemboost for specific time
    // attributes of player or enemy are affected
    powerUp = (potionType, playerId) => {
        this.players.forEach((player) => {
            if (player.id === playerId) {
                switch (potionType) {
                    case "increaseSpeed": // red
                        player.maxSpeedX *= 1.5;
                        setTimeout(() => {
                            player.maxSpeedX /= 1.5;
                        }, 5000);
                        break;
                    case "increasePower": // yellow 
                        player.damage *= 2;
                        setTimeout(() => {
                            player.damage /= 2;
                        }, 8000);
                        break;
                    case "increaseLife": // green
                        if (player.lifes >= 800) {
                            player.lifes = 1000;
                        } else {
                            player.lifes += 200;
                        }
                        break;
                    case "increaseGravity": // blue
                        this.enemies.forEach((enemy) => {
                            enemy.movingSpeed /= 5;
                            setTimeout(() => {
                                enemy.movingSpeed *= 5;
                            }, 7000);
                        });
                        break;
                    case "invulnerable": // pink
                        this.enemies.forEach((enemy) => {
                            enemy.damage /= 1000;
                            setTimeout(() => {
                                enemy.damage *= 1000;
                            }, 8000);
                        });
                        break;
                }
            }
        });
    }
}

module.exports = ItemServer;