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
}];

const sidewayMovingBlocks = [
    {                       //erste Reihe links
        pos: {
            x: 200,
            y: 300
        },
        size: {
            width: 439,
            height: 20
        },
        distanceToMove: 126,
        hasGravity: false,
        type: "long"
    },
    {                       //erste Reihe rechts
        pos: {
            x: 1000,
            y: 300
        },
        size: {
            width: 439,
            height: 20
        },
        distanceToMove: 126,
        hasGravity: false,
        type: "long"
    },
    {
        pos: {                 //zweite Reihe rechts
            x: 1300,
            y: 450
        },
        size: {
            width: 439,
            height: 20
        },
        distanceToMove: 126,
        hasGravity: false,
        type: "long"
    },
    {
        pos: {                 //zweite Reihe links
            x: 0,
            y: 450
        },
        size: {
            width: 439,
            height: 20
        },
        distanceToMove: 126,
        hasGravity: false,
        type: "long"
    },
    {
        pos: {                 //zweite Reihe mitte
            x: 700,
            y: 450
        },
        size: {
            width: 439,
            height: 20
        },
        distanceToMove: 126,
        hasGravity: false,
        type: "long"
    },
    {                       //dritte Reihe links
        pos: {
            x: 200,
            y: 600
        },
        size: {
            width: 439,
            height: 20
        },
        distanceToMove: 126,
        hasGravity: false,
        type: "long"
    },
    {                       //dritte Reihe rechts
        pos: {
            x: 1000,
            y: 600
        },
        size: {
            width: 439,
            height: 20
        },
        distanceToMove: 126,
        hasGravity: false,
        type: "long"
    },
    {
        pos: {                 //vierte Reihe rechts
            x: 1300,
            y: 750
        },
        size: {
            width: 439,
            height: 20
        },
        distanceToMove: 126,
        hasGravity: false,
        type: "long"
    },
    {
        pos: {                 //vierte Reihe links
            x: 0,
            y: 750
        },
        size: {
            width: 439,
            height: 20
        },
        distanceToMove: 126,
        hasGravity: false,
        type: "long"
    },
    {
        pos: {                 //vierte Reihe mitte
            x: 700,
            y: 750
        },
        size: {
            width: 439,
            height: 20
        },
        distanceToMove: 126,
        hasGravity: false,
        type: "long"
    },
];

module.exports = {
    groundLevels: groundLevels,
    sidewayMovingBlocks: sidewayMovingBlocks,
}
