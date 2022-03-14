import { Player } from "../Entities/Player";
import { BaseGame } from "../Systems/BaseGame";
import { Singleton } from "../Systems/Singleton";

export class Network extends Singleton {
    constructor() {
        super();
    }

    connect(url, game, instanced, callback) {
        Network.instance.game = game;
        let socket = new WebSocket(url);
        Network.instance.socket = socket;

        socket.onopen = () => {
            console.log("Connected to server");
            callback();
        };

        socket.onmessage = (event) => {
            let { type, data } = JSON.parse(event.data);
            let player;
            let sprite;

            switch (type) {
                case "selfJoin":
                    console.log("Self joined", data.name);
                    player = new Player(data.name, data.x, data.y);
                    sprite = Network.instance.game.add.sprite(data.x, data.y, "idle1");
                    player.setSprite(sprite);
                    player.animate("idle");
                    instanced.addEntity(player);
                    BaseGame.instance.camera.startFollow(player.sprite);
                    break;

                case "playerJoin":
                    if (data.name !== Network.instance.username) {
                        console.log("Player joined", data.name);
                        player = new Player(data.name, data.x, data.y);
                        sprite = Network.instance.game.add.sprite(data.x, data.y, "idle1");
                        player.setSprite(sprite);
                        player.animate("idle");
                        instanced.addEntity(player);
                    }
                    break;

                case "move":
                    player = BaseGame.instance.findObject(data.name);
                    if (player)
                        player.move(data.x, data.y, data.direction);
                    break;

                case "loadMap":
                    instanced.loadMap(data.map);
                    break;

                case "playerLeave":
                    player = BaseGame.instance.findObject(data.name);
                    if (player)
                        player.destroy();
                    break;

                case "setChange":
                    BaseGame.instance.updates.set(data.x, data.y, data);
                    break;

                case "deleteBlock":
                    instanced.deleteBlock(data);
                    break;
                    
                default:
                    console.log(`Unknown message type: ${type}`);
                    break;
            }
        };

        socket.onclose = () => {
            console.log("Disconnected from server");
        };
    }

    setActive(game) {
        Network.instance.game = game;
    }

    send(data) {
        this.socket.send(JSON.stringify(data));
    }
}