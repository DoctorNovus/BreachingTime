import { Database } from "../database/Database";
import { Player } from "../entities/Player";
import { Singleton } from "../systems/Singleton";

export class Boot extends Singleton {

    async login(server, user) {
        let zones = server.zoneManager.zones;
        let pDB = await Database.instance.users.findOne({ username: user.name });

        if (pDB && pDB.world && pDB.world.trim() != "") {
            let world = zones.find(world => world.name == pDB.world);
            if (world) {
                let player = new Player(user.name, user.socket, pDB.x, pDB.y);
                player.setWorld(pDB.world);
                player.setLevel(pDB.level);
                player.setInventory(pDB.inventory);
                player.setSlots(pDB.slots);

                world.players.push(player);

                server.send(user.socket, {
                    type: "worldSkip",
                    data: {
                        name: pDB.world
                    }
                });

                server.send(user.socket, {
                    type: "selfJoin",
                    data: {
                        name: player.name,
                        x: player.x,
                        y: player.y
                    }
                });

                for (let player of world.players) {
                    if (world.players.find(p => p.name == player.name)) {
                        server.send(user.socket, {
                            type: "playerJoin",
                            data: {
                                name: player.name,
                                x: player.x,
                                y: player.y
                            }
                        });
                    }
                }

                server.sendToAllExcept(player, {
                    type: "playerJoin",
                    data: {
                        name: player.name,
                        x: player.x,
                        y: player.y
                    }
                }, pDB.world);

                let w = world;
                let bb = w.blocks.asData();
                for (let b of bb) {
                    delete b.zone;
                }

                server.send(user.socket, {
                    type: "loadMap",
                    data: {
                        map: bb
                    }
                });

                server.send(user.socket, {
                    type: "inventoryUpdate",
                    data: {
                        items: player.constructInventory(),
                        profile: player.constructProfile()
                    }
                });
            }
        } else {
            server.send(user.socket, {
                type: "worldMenu",
                data: {
                    worlds: zones.map(zone => ({ name: zone.name, players: zone.players ? zone.players.length : 0, maxPlayers: 50 }))
                }
            });
        }
    }

    handleWorldCreate(server, socket, name) {
        let zone = server.zoneManager.zones.find(world => world.name == name);
        if (!zone) {
            server.zoneManager.generateZone(name, 50, 80);
            this.handleWorldSelect(server, socket, name);
        } else {
            server.send(socket, {
                type: "worldCreateStatus",
                data: {
                    success: false
                }
            });
        }
    }

    handleWorldSelect(server, socket, name) {
        let world = server.zoneManager.zones.find(world => world.name == name);
        if (world) {
            if (!world.players)
                world.players = [];

            let user = world.players.find(user => user.socket == socket);
            if (!user) {
                let usey = server.users.find(user => user.socket == socket);
                if (usey) {
                    user = new Player(usey.name, usey.socket, usey.x, usey.y);
                    world.players.push(user);
                }
            }

            user.setWorld(name);

            if (!world.spawnPoint)
                for (let i = 0; i < world.blocks.asData().length; i++) {
                    let block = world.blocks.asData()[i];
                    if (block && block.value == 1) {
                        console.log("Found spawn point");
                        world.spawnPoint = { x: block.x * 32, y: block.y * 32 };
                        break;
                    }
                }

            if (!world.spawnPoint)
                for (let i = 0; i < world.blocks.asData().length; i++) {
                    let block = world.blocks.asData()[i];
                    if (block && block.value == 2) {
                        console.log("Found spawn point");
                        world.spawnPoint = { x: block.x * 32, y: block.y * 32 - 32 };
                        break;
                    }
                }

            let x = world.spawnPoint ? world.spawnPoint.x : 0;
            let y = world.spawnPoint ? world.spawnPoint.y : 0;

            user.x = x;
            user.y = y;

            server.send(user.socket, {
                type: "selfJoin",
                data: {
                    name: user.name,
                    x,
                    y
                }
            });

            for (let player of world.players) {
                if (world.players.find(p => p.name == player.name)) {
                    server.send(user.socket, {
                        type: "playerJoin",
                        data: {
                            name: player.name,
                            x: player.x,
                            y: player.y
                        }
                    });
                }
            }

            server.sendToAllExcept(user, {
                type: "playerJoin",
                data: {
                    name: user.name,
                    x: user.x,
                    y: user.y
                }
            }, name);

            let w = world;
            let bb = w.blocks.asData();
            for (let b of bb) {
                delete b.zone;
            }

            server.send(user.socket, {
                type: "loadMap",
                data: {
                    map: bb
                }
            });

            server.send(user.socket, {
                type: "inventoryUpdate",
                data: {
                    items: user.constructInventory(),
                    profile: user.constructProfile()
                }
            });
        }
    }
}