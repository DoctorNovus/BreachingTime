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

        server.send(user.socket, {
            type: "loadMap",
            data: {
                map: server.map.inst
            }
        });
    }
}

class Rectangle {

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    constructor(x, y, width, height) {
        /** x location of the rectangle */
        this.x = x;
        /** y location of the rectangle */
        this.y = y;
        /** width of the rectangle */
        this.width = width;
        /** height of the rectangle */
        this.height = height;
        /** right side of the rectangle */
        this.right = this.x + this.width;
        /** bottom side of the rectangle */
        this.bottom = this.y + this.height;
    }

    /**
     * check if the rectangle overlaps another rectangle
     * @param {Rectangle} rectangle rectangle to compare with
     * @return {boolean} are the rectangles overlapping
     */
    overlaps(rectangle) {
        return (this.x < rectangle.x + rectangle.width &&
            this.x + this.width > rectangle.x &&
            this.y < rectangle.y + rectangle.height &&
            this.y + this.height > rectangle.y);
    }

    /**
     * check if the rectangle is inside another rectangle
     * @param {Rectangle} rectangle rectangle to compare with
     * @return {boolean} is the rectangle inside the other rectangle
     */
    within(rectangle) {
        return (rectangle.x <= this.x &&
            rectangle.right >= this.right &&
            rectangle.y <= this.y &&
            rectangle.bottom >= this.bottom);
    }

    /**
     * check if the coordinates are inside this rectangle
     * @param {number} x x coordinate
     * @param {number} y y coordinate
     * @return {boolean} does the rectangle contain the coordinates
     */
    contains(x, y) {
        return (x >= this.x &&
            x <= this.right &&
            y >= this.y &&
            y <= this.bottom);
    }

    /**
     * set the position of the rectangle
     * @param {number} x x coordinate
     * @param {number} y y coordinate
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * set the size of the rectangle
     * @param {number} width new rectangle width
     * @param {number} height new rectangle height
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;
    }
}

class Movement {
    constructor(network) {
        this.queue = [];
        this.network = network;

        setInterval(this.runMovementQueue.bind(this));
    }

    checkCollision(rect, map) {
        let collides = false;

        for (let tile of map._tiles.parts) {
            tile = tile.value;
            if (tile.layer == ("foreground") && tile.health > 0) {
                if (rect.overlaps(tile.rect)) {
                    collides = true;
                }
            }
        }

        return collides;
    }

    runMovementQueue() {
        for (let que of this.queue) {
            if (!que) return;

            if (que.x == 0 && que.y == 0) {
                this.queue.splice(this.queue.indexOf(que), 1);
                return;
            }

            let user = this.network.users.find(user => user.name == que.name);
            if (user) {
                let rect = user.rect;
                if (!rect) {
                    rect = new Rectangle(user.x, user.y, user.width, user.height);
                    user.rect = rect;
                }

                rect.x += que.x;
                rect.y += que.y;

                if (this.checkCollision(rect, this.network.map)) {
                    rect.setPosition(user.x, user.y);
                    return;
                }

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

        for (let user of this.network.users) {
            let que = this.queue.find(que => que && que.name == user.name);
            if ((!que || que.y == 0) && user && user.rect) {
                let rect = user.rect;
                if (!rect.width || !rect.height) {
                    rect.width = 30;
                    rect.height = 30;
                }

                rect.setPosition(user.x, user.y + 1);


                if (this.checkCollision(rect, this.network.map)) {
                    rect.setPosition(user.x, user.y);
                    return;
                } else {
                    user.y = rect.y;

                    this.network.sendToAll({
                        type: "move",
                        data: {
                            name: user.name,
                            x: user.x,
                            y: user.y,
                            direction: "idle"
                        }
                    });
                }
            }
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

class Mapper {
    constructor() {
        this.parts = [];
    }

    loop(callback) {
        for (let i = 0; i < this.parts.length; i++) {
            callback(this.parts[i]);
        }
    }

    set(x, y, value) {
        if (!this.get(x, y))
            this.parts.push({ x, y, value });
        else
            this.parts.find(part => part.x === x && part.y === y).value = value;

        return this.get(x, y);
    }

    get(x, y) {
        let part = this.parts.find(part => part.x == x && part.y == y);
        if (part)
            return part;
        else
            return null;
    }


    add(x, y, value) {
        let part = this.get(x, y);
        if (!part)
            part = 0;

        part += value;
        this.set(x, y, part);
        return part;
    }

    divide(x, y, value) {
        let part = this.get(x, y);
        if (!part)
            part = 0;
        part /= value;
        this.set(x, y, part);
        return part;
    }

}

class Tile {
    constructor(name, layer, x, y, width, height){
        this.name = name;
        this.layer = layer;
        this.x = x * width;
        this.y = y * height;
        this.width = width || 32;
        this.height = height || 32;

        this.rect = new Rectangle(this.x, this.y, this.width, this.height);
        this.health = 3;
    }
}

class Map {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this._tiles = new Mapper();

        for (let i = 0; i < width; i++) {
            if (i == 0) {
                let place = Math.floor(Math.random() * height);
                this.spawnTile = new Tile("portal_sequence", "background", place, i, 32, 32);
                this._tiles.set(place, i, this.spawnTile);
            } else {
                for (let j = 0; j < height; j++) {
                    this._tiles.set(j, i, new Tile("dirt", "foreground", j, i, 32, 32));
                }
            }
        }
    }

    get inst() {
        return {
            width: this.width,
            height: this.height,
            spawnTile: this.spawnTile,
            tiles: this._tiles.parts
        }
    }

    interact(tile, serv) {
        for (let x = 0; x < this._tiles.parts.length; x++) {
            let til = this._tiles.parts[x].value;
            if (til.name == tile.name && til.x == tile.x && til.y == tile.y) {
                til.health -= 1;

                if (til.healing)
                    clearTimeout(til.healing);

                til.healing = setTimeout(() => {
                    til.health = 3;
                    serv.sendToAll({
                        type: "setChange",
                        data: {
                            name: til.name,
                            x: til.x,
                            y: til.y,
                            health: til.health
                        }
                    });
                }, 2500);

                if (til.health > 0) {
                    this._tiles.set(til.x, til.y, til);
                    return til;
                } else {
                    clearTimeout(til.healing);
                    let till = this._tiles.parts.find(part => part.x == til.x && part.y == til.y);
                    this._tiles.parts.splice(this._tiles.parts.indexOf(till), 1);
                }
            }
        }
    }

    delete(x, y) {
        let alo = this._tiles.parts.find(part => part.x == x && part.y == y);
        if (alo)
            this._tiles.parts.splice(this._tiles.parts.indexOf(alo), 1);
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
        this.map = new Map(20, 20);

        this.wss.on("connection", (socket) => {
            socket.on("message", (message) => {
                let { type, data } = JSON.parse(message);
                switch (type) {
                    case "login":
                        if (Auth.checkUser(data.name, data.pass)) {
                            this.send(socket, {
                                type: "login",
                                success: true
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
                        }
                        break;

                    case "move":
                        this.movement.movePlayer(socket, this.users, data);
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
            });
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

let server = new Server(8080);
new SocketServer(server);
