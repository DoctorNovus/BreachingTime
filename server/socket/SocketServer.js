import WebSocket from "ws";
import { Singleton } from "./systems/Singleton";
import { Auth } from "./auth/Auth";
import { Boot } from "./boot/Boot";
import { Movement } from "./engines/Movement";

export class SocketServer extends Singleton {
    constructor(server) {
        super();
        this.wss = new WebSocket.Server({
            server: server.serv
        });

        console.log("Socket server started");

        this.users = [];
        this.movement = new Movement(this);

        this.wss.on("connection", (socket) => {
            socket.on("message", (message) => {
                let { type, data } = JSON.parse(message);
                switch(type){
                    case "login":
                        if(Auth.checkUser(data.name, data.pass)){
                            this.send(socket, {
                                type: "login",
                                success: true
                            });

                            let user = {
                                name: data.name,
                                socket,
                                x: Math.floor(Math.random() * 100),
                                y: Math.floor(Math.random() * 100)
                            };

                            this.users.push(user);

                            Boot.instance.login(this, user);
                        }
                        break;

                        case "move":
                            this.movement.movePlayer(socket, this.users, data);
                            break;
                }
            });

            socket.on("close", () => {
                let user = this.users.find(user => user.socket == socket);
                if(user){
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

    send(socket, data){
        socket.send(JSON.stringify(data));
    }

    sendTo(user, data){
        for(let player of this.users){
            if(player.name == user)
                this.send(player.socket, data);
        }
    }

    sendToAll(data){
        for(let player of this.users){
            this.send(player.socket, data);
        }
    }

    sendToAllExcept(user, data){
        for(let player of this.users){
            if(player.name != user.name)
                this.send(player.socket, data);
        }
    }
}