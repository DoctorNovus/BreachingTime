import { BaseGame } from "../Systems/BaseGame";
import { Entity } from "./Entity";

export class Player extends Entity {
    constructor(id, x, y, width = 32, height = 32) {
        super(x, y, width, height);

        this.id = id;

        this.velX = 0;
        this.velY = 0;
    }

    setSprite(sprite) {
        this.sprite = sprite;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.sprite.width = this.width;
        this.sprite.height = this.height;
    }

    canMove() {
        if (!BaseGame.instance.checkCollides(this))
            return true;

        return false;
    }

    move(x, y, direction = "right") {
        this.sprite.x = x;
        this.sprite.y = y;

        if (direction == "left")
            this.animate("walking", -1);
        else if (direction == "right")
            this.animate("walking", 1);
        else
            this.animate("idle", 1);
    }

    animate(animation, direction) {
        this.sprite.play(animation, 10, true);
        this.sprite.setScale(direction, 1);
    }

    destroy() {
        this.sprite.destroy();
    }
}