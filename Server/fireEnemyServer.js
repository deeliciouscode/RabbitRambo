const Enemy = require("./enemyServer.js");
const CONST = require("./constants.js");
const FlameThrower = require("./flameThrowerServer.js");

class FireEnemyServer extends Enemy {
    constructor(pos, size, id, players, fixedBlocks, movingBlocks, allBlocks, score, game) {
        super(pos, size, id, players, fixedBlocks, movingBlocks, allBlocks, score, game);
        this.wasMovingRight = undefined;
        this.DEFAULTSHOOTINGCOUNTER = 150;
        this.DEFAULTWAITINGCOUNTER = 200;
        this.waitingCounter = this.DEFAULTWAITINGCOUNTER; //muss angepasst werden an die fps -> mit anderen klären
        this.shootingCounter = this.DEFAULTSHOOTINGCOUNTER;
        this.flameThrowerId = -1;
        this.flameThrower = null;
        this.isShooting = false;
        this.stopToShoot = false;
        this.type = 'fire';
        this.lifes = 200;
    }

    moveEnemy = () => {
        this.setOnGround();
        this.getBlockInFrontAndBlockAbove(); //gibt immer einen blockInFront
        this.getDeltaToBlock();
        this.upAndDown(); //applies Gravity to enemy
        this.getNearestPlayer();


        if (this.nearestPlayer !== undefined){
            this.decideWhereToGo();
            if (!this.gotJumpedOn){
                this.hitsPlayer();
            }
            this.getInRangeToShoot();
            this.waitAndShoot();
            if (!this.stopMoving && !this.stopToShoot) {
                this.setEnemyPosition();
                this.correctPosition();
            }
            this.fireEnemyJump();
            this.setFinalPosition();
        }
    };

    getInRangeToShoot() {
        let isInRangeY = this.pos.y + this.size.height === this.nearestPlayer.pos.y + this.nearestPlayer.size.height;
        let isInRangeX = this.isInRangeX();

        if (isInRangeY && isInRangeX) {
            this.stopToShoot = true;
        }
    }

    waitAndShoot() {
        if (this.stopToShoot) {
            this.isAllowedToJump = false;
            if (this.wasMovingRight === undefined) {
                this.wasMovingRight = this.isMovingRight
            }
            if (this.waitingCounter === 0){
                if(!this.isShooting){
                    this.isShooting = true;
                    this.createFlameThrower();
                }
                if (this.shootingCounter === 0) {
                    this.game.deleteFlameThrower(this.flameThrowerId);
                    this.setDefault();
                }
                --this.shootingCounter;
                return;
            }
            --this.waitingCounter;
        }
        //muss erst ein paar Sekunden warten, bis er "schießt" und dann den sttrahl auch eine Sekunde anzeigen;
    }

    isInRangeX() {
        if (this.isMovingRight) {
            return this.nearestPlayer.pos.x - (this.pos.x + this.size.width) <= 150 //Strahl muss 80-90 Pixel lang sein
        } else {
            return this.pos.x - (this.nearestPlayer.pos.x + this.nearestPlayer.size.width) <= 150
        }
    }

    createFlameThrower(){
        let posX;
        let posY = this.pos.y + (this.size.height - CONST.flameThrowerSize.height)/2;
        if (this.isMovingRight){
            posX = this.pos.x + this.size.width;
        } else {
            posX = this.pos.x - CONST.flameThrowerSize.width;
        }
        this.flameThrowerId = CONST.flameThrowerIdCounter++;

        this.flameThrower = new FlameThrower(posX, posY, CONST.flameThrowerSize.width,
            CONST.flameThrowerSize.height, this.flameThrowerId, this.players, this.isMovingRight);

        this.game.emitFlameThrower(this.flameThrower);
    }

    setDefault() {
        this.waitingCounter = this.DEFAULTWAITINGCOUNTER;
        this.shootingCounter = this.DEFAULTSHOOTINGCOUNTER;
        this.stopToShoot = false;
        this.isShooting = false;
        this.wasMovingRight = undefined;
        this.isAllowedToJump = true;
        this.flameThrower = null;
    }

    getsJumpedOn(damage){
        this.gotJumpedOn = true;
        this.decreaseEnemyLife(damage);
        // this.gotKilled();
    }

    decreaseEnemyLife(damage) {
        let oldLife = this.lifes
        this.lifes -= damage;
        if ((oldLife - this.lifes) >= 0.25) {
            this.game.emitEnemyLife();
        }
        if (this.lifes <= 0) {
            this.gotKilled();
        }
    }

    gotKilled() {
        this.game.deleteEnemy(this.id);
        this.game.deleteFlameThrower(this.flameThrowerId);
    }

    getInfo() {
        return {
            pos: this.pos,
            size: this.size,
            id: this.id,
            type: this.type,
            isShooting: this.isShooting,
            stopToShoot: this.stopToShoot
        }
    }
}

module.exports = FireEnemyServer;