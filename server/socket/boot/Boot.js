import { Singleton } from "../systems/Singleton";

export class Boot extends Singleton {

    login(server, user){
        let worlds = server.worlds.map(world => ({ name: world.name, players: world.players.length, maxPlayers: world.maxPlayers }));
        server.send(user.socket, {
            type: "worldMenu",
            data: {
                worlds
            }
        });
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