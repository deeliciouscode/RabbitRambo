const boxSize = 50;

const groundLevels = [{
    pos: { //boden
        x: -500,
        y: 900,
    },
    size: {
        width: 2920,
        height: 2000,
    },
    hasGravity: false,
    isWall: false,
    type: "floor"
}, {
    pos: { //wand
        x: -500,
        y: -100,
    },
    size: {
        width: 500,
        height: 1000,
    },
    hasGravity: false,
    isWall: true,
    type: "wall"
}, {
    pos: { //wand
        x: 1920,
        y: -100,
    },
    size: {
        width: 500,
        height: 1000,
    },
    hasGravity: false,
    isWall: true,
    type: "wall"
}, {
    pos: { //stapel links
        x: 0,
        y: 850,
    },
    size: {
        width: 12 * boxSize,
        height: boxSize,
    },
    hasGravity: false,
    isWall: false,
    type: "box"
}, {
    pos: { //stapel links
        x: 50,
        y: 800,
    },
    size: {
        width: 10 * boxSize,
        height: boxSize,
    },
    hasGravity: false,
    isWall: false,
    type: "box"
}, {
    pos: { //stapel links
        x: 100,
        y: 750,
    },
    size: {
        width: 8 * boxSize,
        height: boxSize,
    },
    hasGravity: false,
    isWall: false,
    type: "box"
}, {
    pos: { //stapel links
        x: 150,
        y: 700,
    },
    size: {
        width: 6 * boxSize,
        height: boxSize,
    },
    hasGravity: false,
    isWall: false,
    type: "box"
}, {
    pos: { //stapel links
        x: 200,
        y: 650,
    },
    size: {
        width: 4 * boxSize,
        height: boxSize,
    },
    hasGravity: false,
    isWall: false,
    type: "box"
}, {
    pos: { //stapel rechts
        x: 1320,
        y: 850,
    },
    size: {
        width: 12 * boxSize,
        height: boxSize,
    },
    hasGravity: false,
    isWall: false,
    type: "box"
}, {
    pos: { //stapel rechts
        x: 1370,
        y: 800,
    },
    size: {
        width: 10 * boxSize,
        height: boxSize,
    },
    hasGravity: false,
    isWall: false,
    type: "box"
}, {
    pos: { //stapel rechts
        x: 1420,
        y: 750,
    },
    size: {
        width: 8 * boxSize,
        height: 50,
    },
    hasGravity: false,
    isWall: false,
    type: "box"
}, {
    pos: { //stapel rechts
        x: 1470,
        y: 700,
    },
    size: {
        width: 6 * boxSize,
        height: boxSize,
    },
    hasGravity: false,
    isWall: false,
    type: "box"
}, {
    pos: { //stapel rechts
        x: 1520,
        y: 650,
    },
    size: {
        width: 4 * boxSize,
        height: boxSize,
    },
    hasGravity: false,
    isWall: false,
    type: "box"
}];

const sidewayMovingBlocks = [{ // upper layer
    pos: {
        x: 0,
        y: 200
    },
    size: {
        width: 439,
        height: 20
    },
    distanceToMove: 150,
    hasGravity: false,
    type: "long"
}, {
    pos: {
        x: 970,
        y: 200
    },
    size: {
        width: 439,
        height: 20
    },
    distanceToMove: 150,
    hasGravity: false,
    type: "long"
}, { // middle layer
    pos: {
        x: 200,
        y: 350
    },
    size: {
        width: 439,
        height: 20
    },
    distanceToMove: 200,
    hasGravity: false,
    type: "long"
},{ // middle layer
    pos: {
        x: 900,
        y: 350
    },
    size: {
        width: 439,
        height: 20
    },
    distanceToMove: 200,
    hasGravity: false,
    type: "long"
}, { // lower layer
    pos: {
        x: 0,
        y: 500
    },
    size: {
        width: 204,
        height: 20
    },
    distanceToMove: 126,
    hasGravity: false,
    type: "short"
}, {
    pos: {
        x: 646,
        y: 500,
    },
    size: {
        width: 204,
        height: 20,
    },
    distanceToMove: 127,
    hasGravity: false,
    type: "short"
}, {
    pos: {
        x: 1294,
        y: 500
    },
    size: {
        width: 204,
        height: 20
    },
    distanceToMove: 126,
    hasGravity: false,
    type: "short"
}];

module.exports = {
    groundLevels: groundLevels,
    sidewayMovingBlocks: sidewayMovingBlocks,
}
