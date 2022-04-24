import WebSocket from "ws";
import { Singleton } from "./systems/Singleton";
import { Boot } from "./boot/Boot";
import { Movement } from "./engines/Movement";
import { Database } from "./database/Database";
import { UserRegistry } from "../shared/UserRegistry";
import { ZoneManager } from "./zone/ZoneManager";
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
        this.movement = new Movement(this);
        this.zoneManager = new ZoneManager();
        this.zoneManager.loadZones();
        setInterval(this.save.bind(this), 60000);

        setInterval(() => this.movement.runMovementQueue(this), 1000 / 60);

        this.wss.on("connection", (socket) => {
            socket.on("message", async (message) => {
                let { type, data } = JSON.parse(message);
                let user = {};
                switch (type) {
                    case "login":
                        if (UserRegistry.instance.getUser(data.name)) {
                            this.send(socket, {
                                type: "login",
                                data: {
                                    success: true
                                }
                            });

                            user = {
                                name: data.name,
                                socket,
                                x: 0,
                                y: 0,
                                width: 30,
                                height: 32
                            };

                            this.users.push(user);

                            await Boot.instance.login(this, user);
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
                        this.movement.movePlayer(this, socket, data);
                        break;

                    case "leftInteract":
                        user = this.zoneManager.getPlayerBySocket(socket);
                        let world = this.zoneManager.zones.find(world => world.name == user.world);
                        let interactiveBlock = world.getBlock(data.x, data.y);
                        if (interactiveBlock && interactiveBlock.value != 0) {
                            if (interactiveBlock.heal)
                                clearTimeout(interactiveBlock.heal);

                            if (!interactiveBlock.health)
                                interactiveBlock.health = 3;

                            if (interactiveBlock.health > 1) {
                                interactiveBlock.health -= 1;

                                this.sendToAll({
                                    type: "setChange",
                                    data: {
                                        x: data.x,
                                        y: data.y,
                                        value: interactiveBlock.value,
                                        health: interactiveBlock.health
                                    }
                                }, user.world);

                                interactiveBlock.heal = setTimeout(() => {
                                    interactiveBlock.health = 3;
                                    this.sendToAll({
                                        type: "setChange",
                                        data: {
                                            x: data.x,
                                            y: data.y,
                                            value: interactiveBlock.value,
                                            health: interactiveBlock.health
                                        }
                                    }, user.world);
                                }, 5000);
                            } else {
                                world.deleteBlock(data.x, data.y);

                                this.sendToAll({
                                    type: "deleteBlock",
                                    data: {
                                        x: data.x,
                                        y: data.y,
                                        value: interactiveBlock.value
                                    }
                                }, user.world);

                                let ite = user.inventory.find(item => item.id == interactiveBlock.value);
                                if (ite)
                                    ite.count += 1;
                                else
                                    user.inventory.push({
                                        id: interactiveBlock.value,
                                        count: 1
                                    });

                                this.send(user.socket, {
                                    type: "inventoryUpdate",
                                    data: {
                                        items: user.constructInventory(),
                                        profile: user.constructProfile()
                                    }
                                });
                            }
                        }
                        break;

                    case "chat":
                        user = this.zoneManager.getPlayerBySocket(socket);
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

                    case "worldCreate":
                        let { name: createName } = data;
                        Boot.instance.handleWorldCreate(this, socket, createName);
                        break;

                    case "moveSlot":
                        user = this.zoneManager.getPlayerBySocket(socket);
                        if (data.active && data.active.id) {
                            if (!user.slots)
                                user.setSlots([].fill({ id: 0, count: 0 }, 0, 6));

                            let slotBottle = user.slots.find(item => item && item.id == data.active.id);
                            if (slotBottle)
                                user.slots[user.slots.indexOf(slotBottle)] = { id: 0, count: 0 };

                            user.slots[data.slot - 1] = {
                                id: data.active.id,
                                count: user.inventory.find(item => item.id == data.active.id).count
                            };

                            this.send(user.socket, {
                                type: "moveSlot",
                                data: {
                                    slot: data.slot - 1,
                                    item: user.slots[data.slot - 1],
                                    inventory: user.constructInventory(),
                                    profile: user.constructProfile()
                                }
                            });
                        }
                        break;

                    case "moveHotbar":
                        user = this.zoneManager.getPlayerBySocket(socket);
                        if (data.active && data.active.id) {
                            if (!user.hotbar)
                                user.setHotbar([].fill({ id: 0, count: 0 }, 0, 9));

                            let hotbarBottle = user.hotbar.find(item => item && item.id == data.active.id);
                            if (hotbarBottle)
                                user.hotbar[user.hotbar.indexOf(hotbarBottle)] = { id: 0, count: 0 };

                            user.hotbar[data.hotbar - 1] = {
                                id: data.active.id,
                                count: user.inventory.find(item => item.id == data.active.id).count
                            };

                            this.send(user.socket, {
                                type: "moveHotbar",
                                data: {
                                    hotbar: data.hotbar - 1,
                                    item: user.hotbar[data.hotbar - 1],
                                    inventory: user.constructInventory(),
                                    profile: user.constructProfile()
                                }
                            });
                        }
                        break;

                    default:
                        console.log("Unknown message type: " + type);
                        break;
                }
            });

            socket.on("close", () => {
                let user = this.zoneManager.getPlayerBySocket(socket);
                if (user) {
                    if (user.world) {
                        let world = this.zoneManager.zones.find(world => world.name == user.world);
                        world.savePlayer(user);
                        if (world)
                            world.players.splice(world.players.indexOf(user.name), 1);
                    }

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

    stop() {
        console.log(`Socket server stopped`);
        this.save();
    }

    send(socket, data) {
        if (data.asData) {
            if (data instanceof Zone) {
                let zData = data.asData();
                let zDataBlocks = [];

                if (zData && zData.blocks[0].value.zone)
                    zData.blocks.forEach((block) => {
                        let b = block.value;
                        zDataBlocks.push({
                            x: b.x,
                            y: b.y,
                            width: b.width,
                            height: b.height,
                            value: b.value
                        });
                    });

                zData.blocks = zDataBlocks;
                socket.send(JSON.stringify(zData));
            } else {
                socket.send(JSON.stringify(data));
            }
        } else {
            socket.send(JSON.stringify(data));
        }
    }

    sendTo(user, data, world) {
        let w = this.zoneManager.zones.find(w => w.name == world);
        if (w)
            for (let player of w.players) {
                if (player.name == user) {
                    if (world && player.world == world)
                        this.send(player.socket, data);
                    else if (!world)
                        this.send(player.socket, data);
                }
            }
    }

    sendToAll(data, world) {
        let w = this.zoneManager.zones.find(w => w.name == world);
        if (w)
            for (let player of w.players) {
                if (world && player.world == world)
                    this.send(player.socket, data);
                else if (!world)
                    this.send(player.socket, data);

            }
    }

    sendToAllExcept(user, data, world) {
        let w = this.zoneManager.zones.find(w => w.name == world);
        if (w)
            for (let player of w.players) {
                if (player.name != user.name)
                    if (world && player.world == world)
                        this.send(player.socket, data);
                    else if (!world)
                        this.send(player.socket, data);
            }
    }

    save() {
        this.zoneManager.saveZones();
    }
}