import { Network } from "../Network/Network";
import { BaseGame } from "../Systems/BaseGame";
import { EventManager } from "../Systems/EventManager";
import { InputSystem } from "../Systems/InputSystem";
import { Loading } from "../Systems/Loading";

export class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    preload() {
        console.log("TEST");

        if (!Loading.instance.checkBoot("game"))
            Loading.instance.setLoadingValues("game", this);

        for (let i = 0; i < EventManager.instance.animations.length; i++) {
            let anim = EventManager.instance.animations[i];
            for (let j = 0; j < anim.frames.length; j++) {
                this.load.image(anim.frames[j], `assets/animations/${anim.route ? anim.route : anim.key}/${anim.frames[j]}.png`);
            }
        }

        for (let i = 0; i < EventManager.instance.blocks.length; i++) {
            let block = EventManager.instance.blocks[i];
            let area = block.overlay ? "overlays" : "blocks";
            if (block.type === "single") {
                this.load.image(block.key, `assets/${area}/${block.key}.png`);
            } else if (block.type === "spritesheet") {
                this.load.spritesheet(block.key, `assets/${area}/${block.key}.png`, {
                    frameWidth: block.frameWidth,
                    frameHeight: block.frameHeight
                });
            } else {
                for (let j = 0; j < block.frames.length; j++) {
                    this.load.image(block.frames[j], `assets/${area}/${block.key}/${block.frames[j]}.png`);
                }
            }
        }
    }

    create() {
        if (!Loading.instance.checkBoot("game"))
            Loading.instance.setLoadingValues("game", this);

        for (let i = 0; i < EventManager.instance.animations.length; i++) {
            let anim = EventManager.instance.animations[i];
            this.anims.create({
                key: anim.key,
                frames: anim.frames.map(an => ({ key: an })),
                frameRate: 10,
                repeat: anim.repeat ? anim.repeat : -1
            });
        }

        for (let i = 0; i < EventManager.instance.blocks.length; i++) {
            let block = EventManager.instance.blocks[i];
            if (block.type === "spritesheet") {
                let frames = this.anims.generateFrameNames(block.key);
                BaseGame.instance.anims[block.key] = this.anims.create({
                    key: `${block.key}_anim`,
                    frames,
                    frameRate: 10,
                    repeat: -1
                });
            } else if (block.type == "multi") {
                BaseGame.instance.anims[block.key] = this.anims.create({
                    key: `${block.key}_anim`,
                    frames: block.frames.map(an => ({ key: an })),
                    frameRate: 10,
                    repeat: -1
                });
            }
        }

        BaseGame.instance.setCamera(this.cameras.main, 1.5);

        let username = BaseGame.instance.username;
        console.log(`Username: ${username}`);
        Network.instance.username = username;
        Network.instance.send({
            type: "login",
            data: {
                name: username
            }
        });

        Network.instance.setActive(this);

        // let player = new Player(100, 100, 32, 32, this.add.sprite("idle1"), "player");
        // player = BaseGame.instance.addEntity(player);
        // player.animate("idle", 1);

        InputSystem.instance.linkEvent("keydown", (e) => {
            switch (e.key) {
                case "w":
                    Network.instance.send({
                        type: "move",
                        data: {
                            x: 0,
                            y: -1
                        }
                    });
                    break;

                case "a":
                    Network.instance.send({
                        type: "move",
                        data: {
                            x: -1,
                            y: 0
                        }
                    });
                    break;

                case "s":
                    Network.instance.send({
                        type: "move",
                        data: {
                            x: 0,
                            y: 1
                        }
                    });
                    break;

                case "d":
                    Network.instance.send({
                        type: "move",
                        data: {
                            x: 1,
                            y: 0
                        }
                    });
                    break;
            }
        });

        InputSystem.instance.linkEvent("keyup", (e) => {
            switch (e.key) {
                case "w":
                    Network.instance.send({
                        type: "move",
                        data: {
                            x: 0,
                            y: 0
                        }
                    });
                    break;

                case "a":
                    Network.instance.send({
                        type: "move",
                        data: {
                            x: 0,
                            y: 0
                        }
                    });
                    break;

                case "s":
                    Network.instance.send({
                        type: "move",
                        data: {
                            x: 0,
                            y: 0
                        }
                    });
                    break;

                case "d":
                    Network.instance.send({
                        type: "move",
                        data: {
                            x: 0,
                            y: 0
                        }
                    });
                    break;
            }
        });

        this.input.on("pointerdown", (pointer) => {
            // let { worldX, worldY } = pointer;
            // worldX = Math.floor(worldX / 32) * 32;
            // worldY = Math.floor(worldY / 32) * 32;
            // console.log(worldX, worldY);

            let instancedBlock = BaseGame.instance.instancedBlock;

            switch (pointer.button) {
                // Left
                case 0:
                    Network.instance.send({
                        type: "leftInteract",
                        data: {
                            name: instancedBlock.name,
                            x: instancedBlock.x,
                            y: instancedBlock.y
                        }
                    });
                    break;

                // Right

                case 2:
                    Network.instance.send({
                        type: "rightInteract",
                        data: {
                            name: instancedBlock.name,
                            x: instancedBlock.x,
                            y: instancedBlock.y
                        }
                    });
                    break;
            }
        })
    }

    update() {
        if (!Loading.instance.checkBoot("game"))
            Loading.instance.setLoadingValues("game", this);

        let base = BaseGame.instance;
        for (let entity of base.objects.entities) {
            if (entity) {

            }
        }

        if (base.map && !base.loadedMap) {
            console.log(`Loading map with ${base.map.tiles.length} tiles`)
            for (let x = 0; x < base.map.tiles.length; x++) {
                let block = base.map.tiles[x];
                if (block) {
                    if (block.health <= 0)
                        return;

                    block = block.value;
                    let bl = this.add.sprite(block.x, block.y, block.name).setInteractive();
                    bl.displayWidth = 32;
                    bl.displayHeight = 32;

                    if (BaseGame.instance.anims[`${block.name}`]) {
                        bl.play(`${block.name}_anim`, 10, true);
                    }
                    bl.on("pointerover", () => {
                        BaseGame.instance.instancedBlock = block;
                    });

                    bl.setDepth(-1);
                    if (block.health < 3 && block.health > 0) {
                        bl.cr = this.add.sprite(block.x, block.y, `cracked${3 - block.health}`);
                    }

                    if (block.health <= 0) {
                        bl.destroy();
                    } else {
                        BaseGame.instance.blocks.set(block.x, block.y, bl);
                    }
                }
            }

            base.loadedMap = true;
        }

        for (let update of BaseGame.instance.updates.parts) {
            update = update.value;
            let bl = BaseGame.instance.blocks.get(update.x, update.y);
            if (bl) {
                bl = bl.value;
                if (bl.scene == undefined)
                    return;

                bl.setTexture(update.name);
                bl.setDepth(-1);
                if (update.health < 3) {
                    if (!bl.cr) {
                        bl.cr = this.add.sprite(update.x, update.y, `cracked${3 - update.health}`);
                        bl.cr.setDepth(0);
                    } else {
                        bl.cr.setTexture(`cracked${3 - update.health}`);
                        bl.cr.setDepth(0);
                    }
                } else if (update.health == 3) {
                    if (bl.cr) {
                        bl.cr.destroy();
                        delete bl.cr;
                    }
                }

                BaseGame.instance.updates.parts.splice(BaseGame.instance.updates.parts.indexOf(update), 1);
            }
        }

        for(let block of BaseGame.instance.blocks.parts){
            block = block.value;
            let i = this.cameras.main.worldView.contains(block.x, block.y);
            let l = this.cameras.main.worldView.contains(block.x - 32, block.y);
            let r = this.cameras.main.worldView.contains(block.x + 32, block.y);
            let t = this.cameras.main.worldView.contains(block.x, block.y - 32);
            let b = this.cameras.main.worldView.contains(block.x, block.y + 32);

            if(i || l || r || t || b){
                block.visible = true;
            } else {
                block.visible = false;
            }
        }


        // let player = BaseGame.instance.findObject("player");
        // if (player) {
        //     player.move();

        //     let camera = BaseGame.instance.camera;
        //     if (camera) {
        //         camera.startFollow(player.sprite);
        //     }
        // }
    }
}