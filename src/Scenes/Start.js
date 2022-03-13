import { Network } from "../Network/Network";
import { BaseGame } from "../Systems/BaseGame";

export class StartScene extends Phaser.Scene {
    constructor(){
        super("StartScene");
    }

    preload(){
        console.log("STARTING SCENE");
    }

    create(){
        let that = this;
        BaseGame.instance.network = new Network();
        BaseGame.instance.network.connect("ws://localhost:8080", this, BaseGame.instance, () => {
            that.scene.start("GameScene");
        });
    }

    update(){

    }
}