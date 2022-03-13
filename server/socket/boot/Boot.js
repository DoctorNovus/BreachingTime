import { Singleton } from "../systems/Singleton";

export class Boot extends Singleton {
    login(server, user) {
        server.send(user.socket, {
            type: "selfJoin",
            data: {
                name: user.name,
                x: user.x,
                y: user.y
            }
        });

        for (let player of server.users) {
            server.send(user.socket, {
                type: "playerJoin",
                data: {
                    name: player.name,
                    x: player.x,
                    y: player.y
                }
            });
        }

        server.sendToAllExcept(user, {
            type: "playerJoin",
            data: {
                name: user.name,
                x: user.x,
                y: user.y
            }
        });
    }
}