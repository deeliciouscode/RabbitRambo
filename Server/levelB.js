const boxsize = 50;

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
},
    {
        pos: { //plattform links unten
            x: 0,
            y: 800,
        },
        size: {
            width: 10 * boxsize,
            height: boxsize,
        },
        hasGravity: false,
        isWall: false,
        type: "box"
    },
    {
        pos: { //plattform links unten
            x: 0,
            y: 850,
        },
        size: {
            width: 10 * boxsize,
            height: boxsize,
        },
        hasGravity: false,
        isWall: false,
        type: "box"
    },
    {
        pos: { //plattform links unten
            x: 0,
            y: 750,
        },
        size: {
            width: 6 * boxsize,
            height: boxsize,
        },
        hasGravity: false,
        isWall: false,
        type: "box"
    },
    {
        pos: { //plattform links unten
            x: 0,
            y: 700,
        },
        size: {
            width: 6 * boxsize,
            height: boxsize,
        },
        hasGravity: false,
        isWall: false,
        type: "box"
    },
    {
        pos: { //plattform links unten
            x: 0,
            y: 650,
        },
        size: {
            width: 3 * boxsize,
            height: boxsize,
        },
        hasGravity: false,
        isWall: false,
        type: "box"
    },


    {
        pos: { //plattform links unten
            x: 1920 - 10 * boxsize,
            y: 800,
        },
        size: {
            width: 10 * boxsize,
            height: boxsize,
        },
        hasGravity: false,
        isWall: false,
        type: "box"
    },
    {
        pos: { //plattform links unten
            x: 1920 - 10 * boxsize,
            y: 850,
        },
        size: {
            width: 10 * boxsize,
            height: boxsize,
        },
        hasGravity: false,
        isWall: false,
        type: "box"
    },
    {
        pos: { //plattform links unten
            x: 1920 - 6 * boxsize,
            y: 750,
        },
        size: {
            width: 6 * boxsize,
            height: boxsize,
        },
        hasGravity: false,
        isWall: false,
        type: "box"
    },
    {
        pos: { //plattform links unten
            x: 1920 - 6 * boxsize,
            y: 700,
        },
        size: {
            width: 6 * boxsize,
            height: boxsize,
        },
        hasGravity: false,
        isWall: false,
        type: "box"
    },
    {
        pos: { //plattform links unten
            x: 1920 - 3 * boxsize,
            y: 650,
        },
        size: {
            width: 3 * boxsize,
            height: boxsize,
        },
        hasGravity: false,
        isWall: false,
        type: "box"
    },];

const sidewayMovingBlocks =
    [{
    pos: {
        x: 100,
        y: 500
    },
    size: {
        width: 439,
        height: 20
    },
    distanceToMove: 126,
    hasGravity: false,
    type: "long"
    },{
        pos: {
            x: 1100,
            y: 500
        },
        size: {
            width: 439,
            height: 20
        },
        distanceToMove: 126,
        hasGravity: false,
        type: "long"
    },{
        pos: {
            x: 600,
            y: 350
        },
        size: {
            width: 439,
            height: 20
        },
        distanceToMove: 126,
        hasGravity: false,
        type: "long"
    }];

module.exports = {
    groundLevels: groundLevels,
    sidewayMovingBlocks: sidewayMovingBlocks,
}
