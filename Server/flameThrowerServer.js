"use strict";

class FlameThrowerServer {
    constructor(posX, posY, width, height, id, players, isMovingRight){
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
        this.players = players;
        this.id = id;
        this.isMovingRight = isMovingRight;
        this.damage = 1; //zieht also maximal shootingcountdown viele leben ab (jetzt 150)
        this.touchesPlayer = false;
    }

    update(){
        //console.log(this.direction);
        this.isTouchingPlayer();
    }

    isTouchingPlayer(){
        for (let i = 0; i < this.players.length; i++){
            let player = this.players[i];
            let isTouchingX = this.posX < player.pos.x + player.size.width && this.posX + this.width > player.pos.x;
            let isTouchingY = this.posY < player.pos.y + player.size.height && this.posY + this.width > player.pos.y;

            if (isTouchingX && isTouchingY && player.onGround){
                this.touchesPlayer = true;
                player.flameThrowerHitsPlayer(this.damage);
            }
        }
    }

    setDirection(){
        if (this.isMovingRight){
            this.direction = "right"
        }
        else {
            this.direction = "left"
        }
    }


    getInfo(){
        this.setDirection();
        return {
            pos: {x: this.posX, y: this.posY},
            size: {width: this.width, height: this.height},
            id: this.id,
            direction: this.direction
        }
    }
}

module.exports = FlameThrowerServer;