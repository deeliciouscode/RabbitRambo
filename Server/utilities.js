// some utility functions that where outsourced 
// to here, mainly to extract data

extractIds = (objects) => {
    let plainIds = []
    objects.forEach((object) => {
        plainIds.push(extractId(object));
    })
    return plainIds;
}

extractId = (object) => {
    return object.id
}

extractPositions = (objects) => {
    let plainPos = []
    objects.forEach((object) => {
        plainPos.push(extractPosition(object));
    })
    return plainPos;
}

extractPosition = (object) => {
    return object.pos
}

extractPlainObjects = (objects) => {
    let plainObjects = []
    objects.forEach((object) => {
        plainObjects.push(extractPlainObject(object));
    })
    return plainObjects;
}

extractPlainObject = (object) => {
    return {
        pos: object.pos,
        size: object.size,
        id: object.id
    };
}

extractItemData = (item) => {
    return {
        potionType: item.potionType,
        id: item.id,
        wasCollected: item.wasCollected,
        wasActivated: item.wasActivated
    }
}

extractInventoryData = (items) => {
    let plainInventory = [];
    items.forEach((item) => {
        plainInventory.push(extractItemData(item));
    })
    return plainInventory
}

extractScoreData = (score) => {
    return {
        playerOneName: score.playerOneName,
        playerTwoName: score.playerTwoName,
        killedEnemies: score.killedEnemies,
        score: score.score,
        round: score.round,
        level: score.level,
        id: score.id
    }
}

extractScoresData = (scores) => {
    let plainScores = [];
    scores.forEach((score) => {
        plainScores.push(extractScoreData(score));
    })
    return plainScores;
}

extractMinesData = (mines) => {
    let plainMines = [];
    mines.forEach((mine) => {
        if (mine.isPlaced)
            plainMines.push(mine.getData());
    })
    return plainMines;
}

extractCarrotsData = (carrots) => {
    let plainCarrots = [];
    carrots.forEach((carrot) => {
        if (carrot.wasTriggered)
            plainCarrots.push(carrot.getData());
    })
    return plainCarrots;
}

extractLaserData = (lasers) => {
    let plainLasers = [];
    lasers.forEach((laser) => {
        plainLasers.push(laser.getData());
    });
    return plainLasers;
}

extractSurprisesData = (surprises) => {
    let plainSurprises = [];
    surprises.forEach((surprise) => {
        plainSurprises.push(surprise.getData());
    });
    return plainSurprises;
}

generateID = () => {
    // I generate the UID from two parts here 
    // to ensure the random number provide enough bits.
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
}
    
extractPlayer = (player) => {
    return {
        pos: player.pos,
        size: player.size,
        id: player.id,
        isAlive: player.isAlive,
        direction: player.lookingDirection,
        isRunning: player.isRunning,
        onGround: player.onGround
    };
}

extractBlockData = (block) => {
    return{
        pos: block.pos,
        size: block.size,
        type: block.type
    }
};

module.exports = {
    extractPositions: extractPositions,
    extractPosition: extractPosition,
    extractPlainObjects: extractPlainObjects,
    extractPlainObject: extractPlainObject,
    extractIds: extractIds,
    extractId: extractId,
    generateID: generateID,
    extractMinesData: extractMinesData,
    extractPlayer: extractPlayer,
    extractInventoryData: extractInventoryData,
    extractScoresData: extractScoresData,
    extractLaserData: extractLaserData,
    extractSurprisesData: extractSurprisesData,
    extractCarrotsData: extractCarrotsData,
    extractBlockData: extractBlockData

}