import { Mapper } from "../math/Mapper";
import { Singleton } from "../systems/Singleton";

export class Boot extends Singleton {

    login(server, user) {
        let zones = server.zoneManager.zones;
        server.send(user.socket, {
            type: "worldMenu",
            data: {
                worlds: zones.map(zone => ({ name: zone.name, players: zone.players ? zone.players.length : 0, maxPlayers: 50 }))
            }
        });

        // let worlds = server.worlds.map(world => ({ name: world.name, players: world.players.length, maxPlayers: world.maxPlayers }));
        // server.send(user.socket, {
        //     type: "worldMenu",
        //     data: {
        //         worlds
        //     }
        // });
    }

    handleWorldCreate(server, socket, name) {
        let zone = server.zoneManager.zones.find(world => world.name == name);
        if (!zone) {
            let zone = server.zoneManager.generateZone(name, 50, 80);
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
                    user = { ...usey };
                    world.players.push(user);
                }
            }

            user.world = name;

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
        }
    }

    // login(server, user) {
    //     console.log(`${user.name} logged in`);

    //     server.send(user.socket, {
    //         type: "selfJoin",
    //         data: {
    //             name: user.name,
    //             x: user.x,
    //             y: user.y
    //         }
    //     });

    //     for (let player of world.players) {
    //         server.send(user.socket, {
    //             type: "playerJoin",
    //             data: {
    //                 name: player.name,
    //                 x: player.x,
    //                 y: player.y
    //             }
    //         });
    //     }

    //     server.sendToAllExcept(user, {
    //         type: "playerJoin",
    //         data: {
    //             name: user.name,
    //             x: user.x,
    //             y: user.y
    //         }
    //     });

    //     server.send(user.socket, {
    //         type: "loadMap",
    //         data: {
    //             map: server.map.inst
    //         }
    //     });
    // }
}