'use strict';

var http = require('http');
var express = require('express');
var WebSocket = require('ws');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var WebSocket__default = /*#__PURE__*/_interopDefaultLegacy(WebSocket);

class Server {
    constructor(port){
        this.port = port;
        this.app = express__default["default"]();
        this.app.use(express__default["default"].static(`${process.cwd()}/public`));

        this.serv = http__default["default"].createServer(this.app);
        this.serv.listen(this.port, () => {
            console.log("Server started on port " + this.port);
        });
    }
}

class Singleton {

    setVariable(variable, value){
        this[variable] = value;
    }
    
    static get instance(){
        if(!this._instance){
            this._instance = new this();
        }
        return this._instance;
    }
}

class Auth {
    static checkUser(user, pass) {
        return true;
    }
}

class Boot extends Singleton {
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

class Movement {
    constructor(network) {
        this.queue = [];
        this.network = network;

        setInterval(this.runMovementQueue.bind(this));
    }

    runMovementQueue() {
        for (let que of this.queue) {
            if (que.x == 0 && que.y == 0) {
                this.queue.splice(this.queue.indexOf(que), 1);
                return;
            }

            let user = this.network.users.find(user => user.name == que.name);
            user.x += que.x;
            user.y += que.y;

            let direction = "idle";
            if (que.x == 0)
                direction = "idle";
            else {
                if (que.x > 0)
                    direction = "right";
                else
                    direction = "left";
            }

            this.network.sendToAll({
                type: "move",
                data: {
                    name: user.name,
                    x: user.x,
                    y: user.y,
                    direction
                }
            });
        }
    }

    movePlayer(socket, users, data) {
        let user = users.find(user => user.socket == socket);

        if (data.x == 0 && data.y == 0) {
            let que = this.queue.find(que => que && que.name == user.name);
            if (que) {
                this.queue.splice(this.queue.indexOf(que), 1);
            }

            this.network.sendToAll({
                type: "move",
                data: {
                    name: user.name,
                    x: user.x,
                    y: user.y,
                    direction: "idle"
                }
            });
        } else {
            let queu = {
                name: user.name,
                x: data.x,
                y: data.y
            };

            if (!this.queue.find(que => que && que.name == user.name)) {
                this.queue.push(queu);
            }
        }
        // if (user) {
        //     user.velX = data.x;
        //     user.velY = data.y;

        //     user.x += data.x;
        //     user.y += data.y;

        //     for (let player of users) {
        //         player.socket.send(JSON.stringify({
        //             type: "move",
        //             data: {
        //                 name: user.name,
        //                 x: user.x,
        //                 y: user.y
        //             }
        //         }));
        //     }
        // }
    }
}

class SocketServer extends Singleton {
    constructor(server) {
        super();
        this.wss = new WebSocket__default["default"].Server({
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
            });
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

let server = new Server(8080);
new SocketServer(server);
