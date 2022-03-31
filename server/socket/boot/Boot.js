import { Singleton } from "../systems/Singleton";

export class Boot extends Singleton {

    login(server, user) {
        let worlds = server.worlds.map(world => ({ name: world.name, players: world.players.length, maxPlayers: world.maxPlayers }));
        server.send(user.socket, {
            type: "worldMenu",
            data: {
                worlds
            }
        });
    }

    handleWorldSelect(server, socket, name) {
        let world = server.worlds.find(world => world.name == name);
        if (world) {
            let user = server.users.find(user => user.socket == socket);
            user.world = name;

            let x = server.map.spawnTile.x;
            let y = server.map.spawnTile.y;

            world.players.push({ name: user.name, x, y });

            server.send(user.socket, {
                type: "selfJoin",
                data: {
                    name: user.name,
                    x,
                    y
                }
            });

            for (let player of server.users) {
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

            server.send(user.socket, {
                type: "loadMap",
                data: {
                    map: server.map.inst
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

    //     for (let player of server.users) {
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