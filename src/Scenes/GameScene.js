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
                this.load.image(anim.frames[j], `assets/animations/${anim.key}/${anim.frames[j]}.png`);
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
                repeat: -1
            });
        }

        BaseGame.instance.setCamera(this.cameras.main, 1.5);

        let username = "test" + Math.floor(Math.random() * 200);
        Network.instance.username = username;
        Network.instance.send({
            type: "login",
            data: {
                name: username,
                pass: "test"
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
    }

    update() {
        if (!Loading.instance.checkBoot("game"))
            Loading.instance.setLoadingValues("game", this);

        let base = BaseGame.instance;
        for (let entity of base.objects.entities) {
            if (entity) {

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