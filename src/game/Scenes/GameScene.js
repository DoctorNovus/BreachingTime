import { BlockIndex } from "../Indexes/BlockIndex";
import { Mapper } from "../Math/Mapper";
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

        InputSystem.instance.linkEvent("keydown", (e) => {
            let newZoom;
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

                case "-":
                    newZoom = this.cameras.main.zoom - .1;
                    console.log(newZoom);
                    if (newZoom > 0.6) {
                        this.cameras.main.zoom = newZoom;
                    }
                    break;

                case "=":
                    newZoom = this.cameras.main.zoom + .1;
                    console.log(newZoom);
                    if (newZoom < 3) {
                        this.cameras.main.zoom = newZoom;
                    }
                    break;

                default:
                    console.log(`Unknown key: ${e.key}`);
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
            let blockMap = new Mapper();
            blockMap = Mapper.from(blockMap, base.map);
            for (let x = 0; x < blockMap.parts.length; x++) {
                let block = blockMap.parts[x];
                if (block) {
                    if (typeof block.health != "undefined" && block.health <= 0)
                        return;

                    block = {
                        x: block.x,
                        y: block.y,
                        value: block.value.value
                    };

                    let blockName = BlockIndex.blocks[block.value];
                    let bl = this.add.sprite(block.x * 32, block.y * 32, blockName).setInteractive();
                    bl.displayWidth = 32;
                    bl.displayHeight = 32;

                    if (BaseGame.instance.anims[`${blockName}`]) {
                        bl.play(`${blockName}_anim`, 10, true);
                    }

                    bl.on("pointerdown", (pointer) => {
                        switch (pointer.button) {
                            // Left
                            case 0:
                                Network.instance.send({
                                    type: "leftInteract",
                                    data: {
                                        name: blockName,
                                        x: block.x,
                                        y: block.y
                                    }
                                });
                                break;

                            // Right

                            case 2:
                                Network.instance.send({
                                    type: "rightInteract",
                                    data: {
                                        name: blockName,
                                        x: block.x,
                                        y: block.y
                                    }
                                });
                                break;
                        }
                    });

                    bl.setDepth(-1);
                    if (typeof block.health != "undefined" && block.health < 3 && block.health > 0) {
                        bl.cr = this.add.sprite(block.x, block.y, `cracked${3 - block.health}`);
                    }

                    if (typeof block.health != "undefined" && block.health <= 0) {
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
                bl.setTexture(BlockIndex.blocks[update.value]);
                bl.setDepth(-1);
                if (update.health < 3) {
                    if (!bl.cr) {
                        bl.cr = this.add.sprite(update.x * 32, update.y * 32, `cracked${3 - update.health}`);
                        bl.cr.displayWidth = 32;
                        bl.cr.displayHeight = 32;
                        bl.cr.setDepth(0);
                    } else {
                        bl.cr.setTexture(`cracked${3 - update.health}`);
                        bl.cr.displayWidth = 32;
                        bl.cr.displayHeight = 32;
                        bl.cr.setDepth(0);
                    }
                } else if (update.health == 3) {
                    if (bl.cr) {
                        bl.cr.destroy();
                        delete bl.cr;
                    }
                }

                BaseGame.instance.blocks.set(update.x, update.y, bl);

                BaseGame.instance.updates.parts.splice(BaseGame.instance.updates.parts.indexOf(update), 1);
            }
        }
    }
}