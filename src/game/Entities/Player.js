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

    setName(name) {
        this.name = name;
        this.name.x = this.x - this.width * .6;
        this.name.y = this.y - this.height;
    }

    canMove() {
        if (!BaseGame.instance.checkCollides(this))
            return true;

        return false;
    }

    move(x, y, direction = "right") {
        this.sprite.x = x;
        this.sprite.y = y;

        this.name.x = x - this.width * .6;
        this.name.y = y - this.height;

        if (direction == "left")
            this.animate("walking", -1);
        else if (direction == "right")
            this.animate("walking", 1);
        else if (direction == "up") {
            if (this.currentAnim != "up") {
                this.animate("jump", 1, 80, { x: 0.75, y: 0.75 }, false);
            } else {
                this.animate("jump_high", 1, 80, { x: 0.75, y: 0.75 }, false);
            }
        }
        else if (direction == "down") {
            if (this.currentAnim != "down") {
                this.animate("fall", 1, 80, { x: 0.75, y: 0.75 }, false);
            } else {
                this.animate("fall_low", 1, 80, { x: 0.75, y: 0.75 }, false);
            }
        }
        else {
            this.animate("idle", 1, 10, { x: 0.5, y: 0.5 }, true);
        }

        this.currentAnim = direction;
    }

    animate(animation, direction, speed = 10, origin, loop = true) {
        this.sprite.play(animation, speed, loop);
        this.sprite.setScale(direction, 1);
        if (origin)
            this.sprite.setOrigin(origin.x, origin.y);
    }

    destroy() {
        this.sprite.destroy();
    }
}