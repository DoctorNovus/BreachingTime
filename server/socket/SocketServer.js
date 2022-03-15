import WebSocket from "ws";
import { Singleton } from "./systems/Singleton";
import { Auth } from "./auth/Auth";
import { Boot } from "./boot/Boot";
import { Movement } from "./engines/Movement";
import { Map } from "./engines/Map/Map";

export class SocketServer extends Singleton {
    constructor(server) {
        super();
        this.wss = new WebSocket.Server({
            server: server.serv
        });

        console.log("Socket server started");

        this.users = [];
        this.movement = new Movement(this);
        setInterval(() => this.movement.runMovementQueue(this), 1000 / 60);
        this.map = new Map(20, 20);

        this.wss.on("connection", (socket) => {
            socket.on("message", (message) => {
                let { type, data } = JSON.parse(message);
                switch (type) {
                    case "login":
                        if (Auth.checkUser(data.name, data.pass)) {
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
                }
            });

            socket.on("close", () => {
                let user = this.users.find(user => user.socket == socket);
                if (user) {
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

    sendTo(user, data) {
        for (let player of this.users) {
            if (player.name == user)
                this.send(player.socket, data);
        }
    }

    sendToAll(data) {
        for (let player of this.users) {
            this.send(player.socket, data);
        }
    }

    sendToAllExcept(user, data) {
        for (let player of this.users) {
            if (player.name != user.name)
                this.send(player.socket, data);
        }
    }
}