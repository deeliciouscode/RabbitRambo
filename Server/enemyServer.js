"use strict";

const PhysicalObject = require("./physicalObject.js");

class EnemyServer extends PhysicalObject {
    constructor(pos, size, id, players, fixedBlocks, movingBlocks, allBlocks, score, game) {
        super(pos, size, true, allBlocks);
        this.id = id;
        this.players = players;
        this.fixedBlocks = fixedBlocks;
        this.movingBlocks = movingBlocks;
        this.allBlocks = allBlocks;
        this.game = game;
        this.isMovingRight = true;
        this.movingSpeed = Math.random() * (0.8 - 0.5) + 0.5; //generates a random movingSpeed
        this.nearestPlayer = undefined;
        this.hasToGoDown = false; //solange enemy nicht auf selben level wie Player => hasToGoDown = true;
        this.hasToGoUp = false;
        this.gotJumpedOn = false;
        this.deltaToBlockInFront = null;
        this.blockInFront = null;
        this.blockAbove = undefined;
        this.jumpingHeight = 177; //177 bei this.velY = -7
        this.stopMoving = false;
        this.tolerance = 5;
        this.isAllowedToJump = true;
        this.playerWasRightBeneath = false;
        this.score = score;
        this.provisionalPosition = pos;
        this.jumpingRange = 30;
        this.hasToGoDirectlyToPlayer = false;
        this.damage = 50;
        this.damageMultiplicator = 0.05;
    }

    decideWhereToGo() {         //decides where enemy has to go
        this.setHasToGoDown();
        this.setHasToGoUp();
        this.checkHasToGoDirectlyToPlayer();
        this.getDirection();
    }

    getNearestPlayer = () => {  //sets this.nearestPlayer

        let shortestDistance = Infinity;
        let nearestPlayer;
        for (let i = 0; i < this.players.length; ++i) {

            let player = this.players[i];
            let playerUndefined = player === undefined;

            if (!playerUndefined) {
                let deltaX = Math.abs(this.pos.x - player.pos.x);
                let deltaY = Math.abs(this.pos.y - player.pos.y);
                let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);



                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    nearestPlayer = player;
                }
            }
        }

        this.nearestPlayer = nearestPlayer;
    };

    getBlockInFrontAndBlockAbove = () => {   //sets this.blockInFront and this.blockAbove
        let shortestDistanceBlockInFront = Infinity;
        let blockInFront;
        let shortestDistanceBlockAbove = Infinity;
        let blockAbove;

        for (let i = 0; i < this.allBlocks.length; ++i) {

            let block = this.allBlocks[i];
            let isOnSameLevel = block.pos.y < this.pos.y + this.size.height && block.pos.y + block.size.height > this.pos.y;
            let blockIsLeft = block.pos.x + block.size.width <= this.pos.x;
            let blockIsRight = block.pos.x >= this.pos.x + this.size.width;
            let walksToBlock = this.isMovingRight && blockIsRight || !this.isMovingRight && blockIsLeft;
            let isBetweenBlock = this.pos.x + this.size.width > block.pos.x && this.pos.x < block.pos.x + block.size.width;
            let blockIsAbove = this.pos.y > block.pos.y + block.size.height;

            if (isOnSameLevel && walksToBlock) {
                let distance;

                if (this.isMovingRight) {
                    distance = block.pos.x - (this.pos.x + this.size.width)
                } else {
                    distance = this.pos.x - (block.pos.x + block.size.width)
                }

                if (distance < shortestDistanceBlockInFront) {
                    shortestDistanceBlockInFront = distance;
                    blockInFront = block;
                }
            } else if (blockIsAbove && isBetweenBlock) {
                let distance = this.pos.y - block.pos.y;

                if (distance < shortestDistanceBlockAbove) {
                    blockAbove = block;
                    shortestDistanceBlockAbove = distance;
                }
            }
        }
        this.blockInFront = blockInFront;
        this.blockAbove = blockAbove;
    }

    jump() {
        this.velY = -7;
        this.onGround = false;
    }

    getDeltaToBlock() {
        if (this.blockInFront !== undefined) {
            if (this.isMovingRight) {
                this.deltaToBlockInFront = this.blockInFront.pos.x - (this.pos.x + this.size.width);
            } else {
                this.deltaToBlockInFront = this.pos.x - (this.blockInFront.pos.x + this.blockInFront.size.width);
            }
        }
    }

    getDirection() {            //lets Enemy go up, down o sideways;
        if (this.onGround) {
            //damit enemy gerade hoch springt auf platform
            this.stopMoving = false;
        }
        if (this.hasToGoDown && this.onGround && !this.hasToGoDirectlyToPlayer) {

            if (this.playerWasRightBeneath) {
                let wayIsBlocked;
                let distanceRight = this.blockStandingOn.pos.x + this.blockStandingOn.size.width - (this.pos.x + this.size.width);
                let distanceLeft = this.pos.x - this.blockStandingOn.pos.x;
                let isTooCloseToBlock = this.deltaToBlockInFront < this.jumpingRange + this.tolerance

                if (this.blockInFront !== undefined && this.blockInFront.isWall && isTooCloseToBlock && !this.blockStandingOn.isMovable) {
                    //springt sonst die ganze zeit zwischen Wall und Treppe hin und her
                    this.hasToGoDown = false;
                    this.hasToGoDirectlyToPlayer = true;
                    return;
                }

                if (this.isMovingRight) {
                    let leftIsShorter = distanceRight > distanceLeft;
                    wayIsBlocked =
                        this.deltaToBlockInFront <= this.blockStandingOn.pos.x + this.blockStandingOn.size.width - (this.pos.x + this.size.width);

                    if (wayIsBlocked || leftIsShorter) {
                        this.isMovingRight = false; //turn around
                    }
                } else {
                    let rightIsShorter = distanceRight < distanceLeft;
                    wayIsBlocked = this.deltaToBlockInFront <= this.pos.x - this.blockStandingOn.pos.x;

                    if (wayIsBlocked || rightIsShorter) {
                        this.isMovingRight = true; //turn around
                    }
                }
            } else {
                let playerIsRight = this.nearestPlayer.pos.x > this.pos.x + this.size.width;
                let playerIsLeft = this.pos.x > this.nearestPlayer.pos.x + this.nearestPlayer.size.width;

                if (playerIsLeft) {
                    this.isMovingRight = false;
                } else if (playerIsRight) {
                    this.isMovingRight = true;
                }
            }


        } else if (this.hasToGoUp) {
            if (this.onGround && this.blockStandingOn !== undefined) {
                let blockOnBlock = this.getBlockOnBlockStandingOn();

                if (blockOnBlock !== undefined) {
                    //gehe zu nächsten blockOnBlock
                    let blockOnBlockIsLeft = blockOnBlock.pos.x + blockOnBlock.size.width < this.pos.x;
                    let blockOnBlockIsRight = blockOnBlock.pos.x > this.pos.x + this.size.width;

                    if (blockOnBlockIsRight) {
                        this.isMovingRight = true;
                    } else if (blockOnBlockIsLeft) {
                        this.isMovingRight = false;
                    }
                } else {
                    //geht in Richtung von Player, soweit es geht
                    let playerIsLeft = this.pos.x > this.nearestPlayer.pos.x + this.nearestPlayer.size.width;
                    let playerIsRight = this.nearestPlayer.pos.x > this.pos.x + this.size.width;

                    if (playerIsRight) {
                        this.isMovingRight = true;
                    } else if (playerIsLeft) {
                        this.isMovingRight = false;
                    }

                    //springt, falls block über enemy ist und erreichbar
                    if (this.blockAbove !== undefined) {
                        let blockAboveIsReachable = (this.pos.y + this.size.height) - this.blockAbove.pos.y < this.jumpingHeight;
                        if (blockAboveIsReachable) {
                            this.stopMoving = true;
                            if (this.isAllowedToJump) {
                                this.jump();
                            }
                        }
                    }
                    this.stayOnPlatform();
                }
            }

        } else {
            let playerLeft = this.pos.x > this.nearestPlayer.pos.x;
            let playerRight = this.pos.x < this.nearestPlayer.pos.x;

            if (playerLeft) {
                this.isMovingRight = false;
            } else if (playerRight) {
                this.isMovingRight = true;
            }
            if (Math.abs((this.pos.y + this.size.height) - (this.nearestPlayer.pos.y + this.nearestPlayer.size.height)) < this.tolerance) {
                this.stayOnPlatform();
            }

        }
    }

    setHasToGoDown() {
        let playerHasSameXPos = Math.abs(this.pos.x - this.nearestPlayer.pos.x) < this.tolerance;
        if (!this.hasToGoDown) {
            let playerBeneath = this.nearestPlayer.pos.y + this.nearestPlayer.size.height > this.pos.y + this.size.height;

            if (playerBeneath && this.onGround) {
                this.hasToGoDown = true;
                this.hasToGoUp = false;
            }

        } else {
            let isOnSameLevel = Math.abs((this.pos.y + this.size.height) - (this.nearestPlayer.pos.y + this.nearestPlayer.size.height)) < 5;
            if (playerHasSameXPos && this.onGround) {
                this.playerWasRightBeneath = true;
            }
            if (isOnSameLevel) {
                this.hasToGoDown = false;
                this.playerWasRightBeneath = false;
            }
        }
    }

    setHasToGoUp() {
        if (!this.hasToGoUp) {
            let playerIsAbove = this.pos.y > this.nearestPlayer.pos.y + this.nearestPlayer.size.height;
            let hasSameX = Math.abs(this.pos.x - this.nearestPlayer.pos.x) < this.tolerance;
            if (playerIsAbove && hasSameX) {
                this.hasToGoUp = true;
                this.hasToGoDown = false;
                this.hasToGoDirectlyToPlayer = false;
            }

        } else {
            let isOnSameLevel =
                Math.abs((this.pos.y + this.size.height) - (this.nearestPlayer.pos.y + this.nearestPlayer.size.height)) < this.tolerance;
            if (isOnSameLevel) {
                this.hasToGoUp = false;
                this.stopMoving = false;
            }
        }
    }

    setOnGround() {
        if (this.blockStandingOn !== undefined) {
            this.onGround = this.blockStandingOn.pos.y === this.pos.y + this.size.height;
        }
    }

    correctPosition() {
        for (let i = 0; i < this.allBlocks.length; ++i) {
            let block = this.allBlocks[i];
            let isInBlockX = block.pos.x < this.pos.x + this.size.width && block.pos.x + block.size.width > this.pos.x;
            let isInBlockY = block.pos.y < this.pos.y + this.size.height && block.pos.y + block.size.height > this.pos.y;

            if (isInBlockX && isInBlockY && this.onGround) {
                let distanceToRightEdge = block.pos.x + block.size.width - (this.pos.x + this.size.width);
                let distanceToLeftEdge = this.pos.x - block.pos.x;

                if (distanceToRightEdge < distanceToLeftEdge) {
                    let posX = block.pos.x + block.size.width;
                    let posY = this.pos.y;
                    this.setPos({ x: posX, y: posY });
                } else {
                    let posX = block.pos.x - this.size.width;
                    let posY = this.pos.y;
                    this.setPos({ x: posX, y: posY });
                }
            }
        }
    }

    setEnemyPosition() {            //lets the Enemy walk to the left or to the right
        if (this.isMovingRight) {
            let posX = this.pos.x + this.movingSpeed;
            let posY = this.pos.y;
            this.setPos({ x: posX, y: posY });
        } else {
            let posX = this.pos.x - this.movingSpeed;
            let posY = this.pos.y;
            this.setPos({ x: posX, y: posY });
        }
    }

    setPos(pos) {                   //sets a povisional Position
        this.provisionalPosition = pos;
    }

    setFinalPosition() {            //sets the final Position
        this.pos = this.provisionalPosition;
    }

    getPlatformInFront() {          //returns the closest Platform in Front
        let shortestDistance = Infinity;
        let platformInFront;
        for (let i = 0; i < this.allBlocks.length; ++i) {
            let block = this.allBlocks[i];
            let blockIsRight = this.pos.x + this.size.width < block.pos.x + block.size.width;
            let blockIsLeft = this.pos.x > block.pos.x;
            let distance;

            if (block === this.blockStandingOn) {
                continue;
            }

            if (this.isMovingRight && blockIsRight && block.pos.y === this.blockStandingOn.pos.y) {
                distance = block.pos.x - (this.pos.x + this.size.width)
            } else if (!this.isMovingRight && blockIsLeft && block.pos.y === this.blockStandingOn.pos.y) {
                distance = this.pos.x - (block.pos.x + block.size.width);
            }

            if (distance < shortestDistance) {
                platformInFront = block;
                shortestDistance = distance;
            }
        }
        return { platform: platformInFront, distance: shortestDistance };
    }

    getBlockOnBlockStandingOn() {       //returns the closest Block on the block enemy is standing on
        let shortestDistance = Infinity;
        let blockOnBlockStandingOn;
        for (let i = 0; i < this.allBlocks.length; i++) {
            let block = this.allBlocks[i];
            let isExactlyAboveBlock = block.pos.y + block.size.height === this.blockStandingOn.pos.y;
            let isTouchingBlockStandingOn = (block.pos.x > this.blockStandingOn.pos.x &&
                block.pos.x < this.blockStandingOn.pos.x + this.blockStandingOn.size.width) ||
                (block.pos.x + block.size.width > this.blockStandingOn.pos.x &&
                    block.pos.x + block.size.width < this.blockStandingOn.pos.x + this.blockStandingOn.size.width);

            if (block.isWall) {
                continue;
            }

            if (isExactlyAboveBlock && isTouchingBlockStandingOn) {
                let distance;
                let blockIsRight = this.pos.x + this.size.width < block.pos.x;
                let blockIsLeft = this.pos.x > block.pos.x + block.size.width;

                if (blockIsLeft) {
                    distance = this.pos.x - (block.pos.x + block.size.width);
                } else if (blockIsRight) {
                    distance = block.pos.x - (this.pos.x + this.size.width);
                }

                if (distance < shortestDistance && block !== this.blockStandingOn) {
                    shortestDistance = distance;
                    blockOnBlockStandingOn = block;
                }
            }
        }

        return blockOnBlockStandingOn;
    }

    stayOnPlatform() {          //lets the enemy stay on platform
        let isOnLeftEdgeOfPlatform = this.onGround &&
            (this.blockStandingOn.pos.x > this.pos.x && this.blockStandingOn.pos.x < this.pos.x + this.size.width);
        let isOnRightEdgeOfPlatform = this.onGround &&
            (this.blockStandingOn.pos.x + this.blockStandingOn.size.width > this.pos.x &&
                this.blockStandingOn.pos.x + this.blockStandingOn.size.width < this.pos.x + this.size.width);

        if (!isOnLeftEdgeOfPlatform && !isOnRightEdgeOfPlatform) {
            this.stopMoving = false;
        }

        if (isOnRightEdgeOfPlatform || isOnLeftEdgeOfPlatform) {
            //falls platformInFront nicht erreichbar ist, dann bleib stehen, ansonsten springen;
            let platformInFrontInfo = this.getPlatformInFront();
            if (platformInFrontInfo.platform !== undefined) {
                let platFormInFront = platformInFrontInfo.platform;
                let distanceToPlatform = platformInFrontInfo.distance;

                if (distanceToPlatform < 75 && this.isAllowedToJump) {
                    this.jump();
                } else {
                    this.stopMoving = true;
                }
            }
        }
    }

    toxicEnemyJump() {          //lets the enemy jump to another Platform or lets enemy attack Player
        let hasSameX = Math.abs((this.pos.x - this.nearestPlayer.pos.x)) < this.tolerance;
        let playerReachable = this.pos.y - (this.nearestPlayer.pos.y + this.nearestPlayer.size.height);
        let playerAbove = this.pos.y > this.nearestPlayer.pos.y + this.nearestPlayer.size.height;
        let canHitPlayer = hasSameX && playerAbove && playerReachable && this.nearestPlayer.onGround;

        if (((this.blockInFront !== undefined && this.deltaToBlockInFront <= this.jumpingRange && !this.blockInFront.isWall) || canHitPlayer) && this.onGround) {
            this.jump();
        }
    }

    fireEnemyJump() {           //lets enemy jump to another Platform (won't attack Player)
        let isInJumpingRange = this.deltaToBlockInFront <= this.jumpingRange;
        if (this.blockInFront !== undefined && isInJumpingRange && this.onGround && this.isAllowedToJump && !this.blockInFront.isWall) {
            this.jump();
        }
    }

    getEnemyScore() {
        return this.score;
    }

    checkHasToGoDirectlyToPlayer() {
        let isNearEnough;
        let isOnSameLevel =
            Math.abs((this.pos.y + this.size.height) - (this.nearestPlayer.pos.y + this.nearestPlayer.size.height)) < this.tolerance;
        let hasSameX = Math.abs(this.pos.x - this.nearestPlayer.pos.x) < this.tolerance;
        if (this.isMovingRight) {
            isNearEnough = this.nearestPlayer.pos.x - (this.pos.x + this.size.width) < 200;
        } else {
            isNearEnough = this.pos.x - (this.nearestPlayer.pos.x + this.nearestPlayer.size.width) < 200;
        }
        if ((isNearEnough && isOnSameLevel) || hasSameX) {
            this.hasToGoDirectlyToPlayer = false;
        }
    }

    hitsPlayer(){
        if (this.nearestPlayer !== undefined){
            let isTouchingX = this.pos.x <= this.nearestPlayer.pos.x + this.nearestPlayer.size.width
                && this.pos.x + this.size.width >= this.nearestPlayer.pos.x;
            let isTouchingY = this.pos.y <= this.nearestPlayer.pos.y + this.nearestPlayer.size.height
                && this.pos.y + this.size.height >= this.nearestPlayer.pos.y;
            let isTouching = isTouchingX && isTouchingY;

            if (isTouching){
                if (this.isMovingRight){
                    this.nearestPlayer.enemyTouchesPlayer("right", this.damage);
                }else{
                    this.nearestPlayer.enemyTouchesPlayer("left", this.damage);
                }

            }
        }
    }

    increaseDamage(round){
        console.log(round);
        this.damage *= (1 + (round * this.damageMultiplicator));
    }
}

module.exports = EnemyServer;
