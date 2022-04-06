import { Singleton } from "../Systems/Singleton";

export class CustomAnimations extends Singleton {

    blueprints = [];
    anims = {};

    getBlueprint(name) {
        return this.blueprints.find(blueprint => blueprint.name === name);
    }

    stop(name) {
        clearInterval(this.anims[name]);
    }

    stopAll() {
        for (let key in this.anims) {
            clearInterval(this.anims[key]);
        }
    }

    renderBlueprint(blueprint, sprite, delay = 0) {
        setTimeout(() => {
            let frameIndex = 0;

            let anim = setInterval(() => {
                if (frameIndex >= blueprint.frames.length && blueprint.loop != true) {
                    clearInterval(anim);
                    return;
                }

                let frame = blueprint.frames[frameIndex];

                if (frame.origin)
                    sprite.setOrigin(frame.origin.x, frame.origin.y);

                if (frame.rotation)
                    sprite.rotation = frame.rotation;

                if (frame.scale)
                    sprite.setScale(frame.scale.x, frame.scale.y);

                if (frame.texture)
                    sprite.setTexture(frame.texture);

                if (frameIndex < blueprint.frames.length - 1)
                    frameIndex++;
                else
                    frameIndex = 0;
            }, blueprint.frameRate || 60);

            this.anims[blueprint.name] = anim;
        }, delay);
    }

    renderOnUpdate(blueprint, sprite) {
        if (!blueprint)
            return false;

        let core = {
            index: 0,
            name: blueprint.name,
            type: blueprint.type,
        }

        if (this.anims[blueprint.type] && this.anims[blueprint.type].name != blueprint.name) {
            this.anims[blueprint.type] = null;
        } else if (this.anims[blueprint.type]) {
            core = this.anims[blueprint.type];
        }

        let timeCortex = this.anim(blueprint.frameRate, core, function render() {
            this.anims[blueprint.type].index++;

            // if (core.time > new Date() - blueprint.frameRate) {

            if (core.index >= blueprint.frames.length)
                core.index = 0;

            this.renderFrame(blueprint, sprite, core.index);

            core.time = Date.now();
            this.anims[blueprint.type] = core;
        });

        if (!timeCortex) {
            // core.time = Date.now();
            this.anims[blueprint.type] = core;
        }

        return true;
    }

    anim(fps, core, callback) {
        let interv = 1000 / fps;
        let then = core.time || Date.now();

        let now = Date.now();
        let elapsed = now - then;

        if (elapsed > interv) {
            then = now - (elapsed % interv);
            callback.bind(this)();
            return true;
        }

        core.time = then;

        return false;
    }

    renderFrame(blueprint, sprite, frameCount) {
        let frame = blueprint.frames[frameCount];

        if (frame.origin)
            sprite.setOrigin(frame.origin.x, frame.origin.y);

        if (frame.rotation) {
            sprite.rotation = frame.rotation;
        }

        if (frame.angle) {
            sprite.angle = frame.angle;
        }

        if (frame.scale)
            sprite.setScale(frame.scale.x, frame.scale.y);

        if (frame.texture)
            sprite.setTexture(frame.texture);
    }

    renderByName(name, sprite) {
        let blueprint = this.getBlueprint(name);
        this.renderBlueprint(blueprint, sprite);
    }
}