import { Singleton } from "./Singleton";
import { Mapper } from "../Math/Mapper";
import { EventManager } from "./EventManager";

export class BaseGame extends Singleton {
    constructor(config) {
        super();
        // requestAnimationFrame(this.update.bind(this));
    }

    start(config){
        this.config = config;
        this.game = new Phaser.Game(config);
        this.objects = {
            entities: [],
            enemies: [],
            borders: []
        }

        this.anims = {};

        this.overlays = new Mapper();
        this.updates = new Mapper();
        this.blocks = new Mapper();
    }
    
    findObject(name) {
        for (let obj in this.objects) {
            for (let j = 0; j < this.objects[obj].length; j++) {
                let oj = this.objects[obj][j];
                if (oj.id == name)
                    return oj;
            }
        }
    }

    addEntity(entity) {
        this.objects.entities.push(entity);
        return entity;
    }

    addEnemy(enemy) {
        this.objects.enemies.push(enemy);
        return enemy;
    }

    addBorder(border) {
        this.objects.borders.push(border);
        return border;
    }

    checkCollides(obji) {
        for (let obj in this.objects) {
            for (let j = 0; j < this.objects[obj].length; j++) {
                let oj = this.objects[obj][j];
                if (oj != obji && oj.collides(obji))
                    return true;
            }
        }

        return false;
    }

    setCamera(camera, zoom) {
        this.camera = camera;
        this.camera.setZoom(zoom || 1);
    }

    update() {
        EventManager.instance.update();

        requestAnimationFrame(this.update.bind(this));
    }

    loadMap(map){
        this.map = map;
        this.loadedMap = false;
    }

    deleteBlock(data){
        let block = this.blocks.get(data.x, data.y);
        if (block){
            block = block.value;
            if(block.cr)
                block.cr.destroy();

            block.destroy();
            this.blocks.parts.splice(this.blocks.parts.indexOf(block), 1);
        }
    }
}