const Enemy = require("./enemyServer");

class ToxicEnemyServer extends Enemy {
    constructor(pos, size, id, players, fixedBlocks, movingBlocks, allBlocks, score, game) {
        super(pos, size, id, players, fixedBlocks, movingBlocks, allBlocks, score, game);
        this.type = 'toxic';
        this.lifes = 100;
    }

    moveEnemy = () => {
        this.setOnGround();
        this.getBlockInFrontAndBlockAbove(); //gibt immer einen blockInFront
        this.getDeltaToBlock();
        this.upAndDown(); //applies Gravity to enemy
        this.getNearestPlayer();


        if (this.nearestPlayer !== undefined) {
            this.decideWhereToGo();
            if (!this.gotJumpedOn) {
                this.hitsPlayer();
            }
            if (!this.stopMoving) {
                this.setEnemyPosition();
                this.correctPosition();
            }
            this.setFinalPosition();

            this.toxicEnemyJump();
        } else {
            this.setFinalPosition();
        }
    }

    getsJumpedOn(damage) {
        this.gotJumpedOn = true;
        this.decreaseEnemyLife(damage);
        // this.gotKilled();
    }

    decreaseEnemyLife(damage) {
        let oldLife = this.lifes
        this.lifes -= Math.round(damage * 100) / 100
        if ((oldLife - this.lifes) >= 0.25) {
            this.game.emitEnemyLife();
        }
        if (this.lifes <= 0) {
            this.gotKilled();
        }
    }

    gotKilled() {
        this.game.deleteEnemy(this.id);
    }

    getInfo() {
        return {
            pos: this.pos,
            size: this.size,
            id: this.id,
            type: this.type,
        }
    }

    setLife(round){
        this.lifes = this.lifes + (this.lifes * 0.1) * round;
    }
}

module.exports = ToxicEnemyServer;