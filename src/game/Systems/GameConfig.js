import { EventManager } from "./EventManager";

export class GameConfig {
    constructor({ type, parent, width, height, physics, scene }) {
        let obj = {};
        obj.type = type || Phaser.AUTO;

        if (parent)
            obj.parent = parent;

        if (!width && !height) {
            obj.width = window.innerWidth;
            obj.height = window.innerHeight;
        } else {
            obj.width = width;
            obj.height = height;
        }

        if (physics)
            obj.physics = physics;

        if (scene)
            obj.scene = scene;
        else {
            obj.scene = {
                preload: EventManager.instance.preload,
                create: EventManager.instance.create,
                update: EventManager.instance.update
            }
        }

        return obj;
    }
}