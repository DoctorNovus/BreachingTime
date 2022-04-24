import { MainGame } from "..";
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
            let uText;
            let weapon;

            switch (type) {
                case "login":
                    if (data.success) {
                        console.log("Logged in");
                    } else {
                        console.log("Login failed");
                    }
                    break;

                case "worldSkip":
                    MainGame.instance.setSelected(data.name);
                    break;

                case "selfJoin":
                    console.log("Self joined", data.name);
                    player = new Player(data.name, data.x, data.y);
                    window.globalPlayerEntity = player;
                    sprite = Network.instance.game.add.sprite(data.x, data.y, "idle1");
                    weapon = {
                        sprite: Network.instance.game.add.sprite(data.x, data.y, "fire_sword1"),
                        animation: "fire_sword",
                        origin: { x: 0.5, y: 0.5 }
                    };
                    uText = Network.instance.game.add.text(data.x, data.y, data.name, {
                        font: "16px Arial",
                        fill: "#ffffff",
                        align: "center"
                    });

                    player.setSprite(sprite);
                    player.setName(uText);
                    player.setWeapon(weapon);
                    player.animate("idle", 1, true);
                    instanced.addEntity(player);
                    BaseGame.instance.camera.startFollow(player.sprite);
                    break;

                case "playerJoin":
                    if (data.name !== Network.instance.username) {
                        console.log("Player joined", data.name);
                        player = new Player(data.name, data.x, data.y);
                        sprite = Network.instance.game.add.sprite(data.x, data.y, "idle1");
                        weapon = {
                            sprite: Network.instance.game.add.sprite(data.x, data.y, "fire_sword1"),
                            animation: "fire_sword",
                            origin: { x: 0.5, y: 0.5 }
                        };
                        uText = Network.instance.game.add.text(data.x, data.y, data.name, {
                            font: "16px Arial",
                            fill: "#ffffff",
                            align: "center"
                        });
                        player.setSprite(sprite);
                        player.setName(uText);
                        player.setWeapon(weapon);
                        player.animate("idle", 1, true);
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

                case "chat":
                    MainGame.instance.onMessage(data);
                    break;

                case "worldMenu":
                    MainGame.instance.onWorldMenu(data);
                    break;

                case "inventoryUpdate":
                    MainGame.instance.onInventory(data);
                    break;

                case "moveSlot":
                    MainGame.instance.onSlotChange(data);
                    break;

                case "moveHotbar":
                    MainGame.instance.onHotbarChange(data);
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
        try {
        this.socket.send(JSON.stringify(data));
        } catch (e) {
            console.log("Error sending data");
            console.log(data);
            console.log(e);
        }
    }
}