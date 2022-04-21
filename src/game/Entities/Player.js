import { BlueprintList } from "../Animations/BlueprintList";
import { BaseGame } from "../Systems/BaseGame";
import { Entity } from "./Entity";
import { CustomAnimations } from "../Animations/CustomAnimations";

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

    setWeapon(weapon) {
        this.weapon = weapon;
        this.weapon.x = this.x;
        this.weapon.y = this.y;

        this.weapon.sprite.x = this.weapon.x;
        this.weapon.sprite.y = this.weapon.y;
        this.weapon.sprite.setOrigin(this.weapon.origin.x, this.weapon.origin.y);

        this.hideWeapon();
    }

    hideWeapon() {
        this.weapon.sprite.visible = false;
    }

    showWeapon() {
        this.weapon.sprite.visible = true;
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

        if (this.weapon) {
            this.weapon.x = x;
            this.weapon.y = y;
            this.weapon.sprite.x = this.weapon.x;
            this.weapon.sprite.y = this.weapon.y;
            this.weapon.sprite.setOrigin(this.weapon.origin.x, this.weapon.origin.y);
        }

        if (direction == "left")
            this.animate("walking", -1);
        else if (direction == "right")
            this.animate("walking", 1);
        else if (direction == "up") {
            if (this.currentAnim != "up") {
                this.animate("jump", 1);
            } else {
                this.animate("jump_high", 1);
            }
        }
        else if (direction == "down") {
            if (this.currentAnim != "down") {
                this.animate("fall", 1);
            } else {
                this.animate("fall_low", 1);
            }
        }
        else {
            this.animate("idle", 1, true);
        }

        this.currentAnim = direction;
    }

    animate(animation, direction, loop) {
        this.sprite.setScale(direction, 1);

        if (this.weapon)
            this.weapon.sprite.setScale(direction, 1);

        let pp = BlueprintList.instance.getBlueprint(`player_${animation}`);
        let wp = BlueprintList.instance.getBlueprint(`weapon_${animation}`);

        if (this.looped)
            clearInterval(this.looped);

        if (!loop) {
            CustomAnimations.instance.renderOnUpdate(pp, this.sprite);

            if (this.weapon) {
                CustomAnimations.instance.renderOnUpdate(wp, this.weapon.sprite);
            }
        } else {
            this.looped = setInterval(() => {
                CustomAnimations.instance.renderOnUpdate(pp, this.sprite);

                if (this.weapon) {
                    this.weapon.sprite.angle = 0;
                    CustomAnimations.instance.renderOnUpdate(wp, this.weapon.sprite);
                }
            });
        }
    }

    destroy() {
        this.sprite.destroy();
        this.name.destroy();
        if (this.weapon)
            this.weapon.sprite.destroy();
    }
}