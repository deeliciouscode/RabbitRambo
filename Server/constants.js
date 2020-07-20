"use strict";

const BASE_VEL = 1.3;

const playerSize = {
    width: 48,
    height: 112
};

const playerPosition = {
    x: 500,
    y: 600
};

const enemySize = {
    width: 70,
    height: 70,
};


const bulletSize = {
    width: 5,
    height: 5
};

const playerSpeed = 2;

const items ={
    size: {
        width: 40,
        height: 40
    }
};

const refreshRate = 150;

let enemyIdCounter = 0;
let flameThrowerIdCounter = 0;
let mineIdCounter = 0;

const flameThrowerSize = {
    width: 200,
    height: 20,
};

const directions = {
    right: "right",
    left: "left",
    up: "up",
    down: "down"
};

module.exports = {
    BASE_VEL: BASE_VEL,
    playerSize: playerSize,
    playerPosition: playerPosition,
    bulletSize: bulletSize,
    playerSpeed: playerSpeed,
    items: items,
    refreshRate: refreshRate,
    flameThrowerIdCounter: flameThrowerIdCounter,
    flameThrowerSize: flameThrowerSize,
    enemySize: enemySize,
    enemyIdCounter: enemyIdCounter,
    mineIdCounter: mineIdCounter,
    directions: directions,
};
