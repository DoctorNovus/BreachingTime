import WebSocket from "ws";
import { Singleton } from "./systems/Singleton";
import { Boot } from "./boot/Boot";
import { Movement } from "./engines/Movement";
import { Map } from "./engines/Map/Map";
import { Database } from "./database/Database";
import { UserRegistry } from "../shared/UserRegistry";

export class SocketServer extends Singleton {
    constructor(server) {
        super();
        this.wss = new WebSocket.Server({
            server: server.serv
        });

        console.log("Socket server started");
    }

    async start() {
        if (!Database.instance.connected)
            await Database.instance.connect();

        this.users = [];
        this.worlds = [{ name: "HiroWorld", players: [], maxPlayers: 30 }, { name: "HiroWorld2", players: [], maxPlayers: 30 }];

        this.movement = new Movement(this);
        setInterval(() => this.movement.runMovementQueue(this), 1000 / 60);
        this.map = new Map(50, 50);

        this.wss.on("connection", (socket) => {
            socket.on("message", (message) => {
                let { type, data } = JSON.parse(message);
                switch (type) {
                    case "login":
                        if (UserRegistry.instance.getUser(data.name)) {
                            this.send(socket, {
                                type: "login",
                                data: {
                                    success: true
                                }
                            });

                            let user = {
                                name: data.name,
                                socket,
                                x: this.map.spawnTile.x,
                                y: this.map.spawnTile.y,
                                width: 30,
                                height: 32
                            };

                            this.users.push(user);

                            Boot.instance.login(this, user);
                        } else {
                            this.send(socket, {
                                type: "login",
                                data: {
                                    success: false
                                }
                            });
                        }
                        break;

                    case "move":
                        this.movement.movePlayer(this, socket, this.users, data);
                        break;

                    case "leftInteract":
                        // FIXME: APPLY SINGLE TO MULTIPLE
                        let til = this.map.interact(data, this);
                        if (til)
                            this.sendToAll({
                                type: "setChange",
                                data: {
                                    name: til.name,
                                    x: til.x,
                                    y: til.y,
                                    health: til.health
                                }
                            });
                        else {
                            this.map.delete(data.x, data.y);
                            this.sendToAll({
                                type: "deleteBlock",
                                data: {
                                    name: data.name,
                                    x: data.x,
                                    y: data.y,
                                }
                            });
                        }
                        break;

                    case "chat":
                        let user = this.users.find(user => user.socket == socket);
                        this.sendToAll({
                            type: "chat",
                            data: {
                                name: user.name,
                                message: data.message
                            }
                        }, user.world);
                        break;

                    case "worldSelect":
                        let { name } = data;
                        Boot.instance.handleWorldSelect(this, socket, name);
                        break;

                    default:
                        console.log("Unknown message type: " + type);
                        break;
                }
            });

            socket.on("close", () => {
                let user = this.users.find(user => user.socket == socket);
                if (user) {
                    if (user.world) {
                        let world = this.worlds.find(world => world.name == user.world);
                        if (world)
                            world.players.splice(world.players.indexOf(user.name), 1);
                    }

                    this.users.splice(this.users.indexOf(user), 1);
                    this.sendToAll({
                        type: "playerLeave",
                        data: {
                            name: user.name
                        }
                    });
                }
            })
        });
    }

    send(socket, data) {
        socket.send(JSON.stringify(data));
    }

    sendTo(user, data, world) {
        for (let player of this.users) {
            if (player.name == user) {
                if (world && player.world == world)
                    this.send(player.socket, data);
                else if (!world)
                    this.send(player.socket, data);
            }
        }
    }

    sendToAll(data, world) {
        for (let player of this.users) {
            if (world && player.world == world)
                this.send(player.socket, data);
            else if (!world)
                this.send(player.socket, data);

        }
    }

    sendToAllExcept(user, data, world) {
        for (let player of this.users) {
            if (player.name != user.name)
                if (world && player.world == world)
                    this.send(player.socket, data);
                else if (!world)
                    this.send(player.socket, data);
        }
    }
}