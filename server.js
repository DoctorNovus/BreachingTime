'use strict';

var http = require('http');
var express = require('express');
var mongodb = require('mongodb');
var bcrypt = require('bcrypt');
var WebSocket = require('ws');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var bcrypt__default = /*#__PURE__*/_interopDefaultLegacy(bcrypt);
var WebSocket__default = /*#__PURE__*/_interopDefaultLegacy(WebSocket);

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

const url = 'mongodb://localhost:27017';

class Database extends Singleton {
    async connect(){
        this.client = new mongodb.MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
        await this.client.connect();
        console.log("Connected to database");
        this.db = this.client.db("breaching-time");
        this.users = this.db.collection("users");
        this.worlds = this.db.collection("worlds");

        this.connected = true;
    }
}

class UserRegistry extends Singleton {
    constructor() {
        super();
        this.users = [];
    }

    addUser(user) {
        this.users.push(user);
    }

    removeUser(user) {
        this.users.splice(this.users.indexOf(user), 1);
    }

    getUser(name) {
        return this.users.find(u => u.name === name);
    }

    getUsers() {
        return this.users;
    }
}

class Server {
    constructor(port) {
        this.port = port;
    }

    async start() {
        this.app = express__default["default"]();
        this.app.use(express__default["default"].static(`${process.cwd()}/public`));

        if (!Database.instance.connected)
            await Database.instance.connect();

        this.database = Database.instance;

        this.app.post("/api/login", async (req, res) => {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk;
            });

            req.on("end", async () => {
                let { uname, pass } = JSON.parse(body);
                if (!uname || !pass) {
                    res.status(400).send("Invalid username or password");
                    return;
                }

                let us = await this.database.users.findOne({ username: uname });
                if (us) {
                    let result = await bcrypt__default["default"].compareSync(pass, us.password);
                    if (result) {
                        res.send({
                            success: true,
                            user: {
                                name: us.username
                            }
                        });

                        UserRegistry.instance.addUser({ name: us.username });
                    } else {
                        res.send({
                            success: false,
                            message: "Incorrect username/password"
                        });
                    }
                } else {
                    res.send({
                        success: false,
                        message: "No user with that username exists."
                    });
                }
            });
        });

        this.app.post("/api/register", async (req, res) => {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk;
            });

            req.on("end", async () => {
                let { uname, email, pass } = JSON.parse(body);

                if (!uname || !email || !pass) {
                    res.status(400).send("Invalid username or password");
                    return;
                }

                let us = await this.database.users.findOne({ username: uname });
                if (us) {
                    res.send({
                        success: false,
                        message: "Username already taken."
                    });
                } else {
                    let hash = await bcrypt__default["default"].hashSync(pass, 10);
                    let user = await this.database.users.insertOne({
                        username: uname,
                        email: email,
                        password: hash
                    });
                    res.send({
                        success: true,
                        user: {
                            name: user.username
                        }
                    });
                }
            });
        });

        this.serv = http__default["default"].createServer(this.app);
        this.serv.listen(this.port, () => {
            console.log("Server started on port " + this.port);
        });
    }
}

class Boot extends Singleton {

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
    constructor() {
        this.queue = [];
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

    runMovementQueue(net) {
        for (let que of this.queue) {
            if (!que) return;

            if (que.x == 0 && que.y == 0) {
                this.queue.splice(this.queue.indexOf(que), 1);
                return;
            }

            if (que.x > 0)
                que.x = 1;
            else if (que.x < 0)
                que.x = -1;

            if (que.y > 0)
                que.y = 1;
            else if (que.y < 0)
                que.y = -1;

            let user = net.users.find(user => user.name == que.name);
            if (user) {
                let rect = user.rect;
                if (!rect) {
                    rect = new Rectangle(user.x, user.y, user.width, user.height);
                    user.rect = rect;
                }

                let speed = 2;

                if (user.speed)
                    speed = user.speed;

                rect.x += que.x * speed;
                rect.y += que.y * speed;

                if (this.checkCollision(rect, net.map)) {
                    rect.setPosition(user.x, user.y);
                    return;
                }

                user.x += que.x * speed;
                user.y += que.y * speed;

                let direction = "idle";
                if (que.x == 0 && que.y == 0)
                    direction = "idle";
                else {
                    if (que.y == 0)
                        if (que.x > 0)
                            direction = "right";
                        else
                            direction = "left";
                    else
                        if(que.y > 0)
                            direction = "down";
                        else
                            direction = "up";
                }

                net.sendToAll({
                    type: "move",
                    data: {
                        name: user.name,
                        x: user.x,
                        y: user.y,
                        direction
                    }
                }, user.world);
            }
        }

        for (let user of net.users) {
            let que = this.queue.find(que => que && que.name == user.name);
            if ((!que) || (que && que.y == 0)) {
                if (!user.rect)
                    user.rect = new Rectangle(user.x, user.y, user.width, user.height);

                let rect = user.rect;

                if (!rect.width || !rect.height) {
                    rect.width = 30;
                    rect.height = 30;
                }

                rect.setPosition(user.x, user.y + 1);

                if (this.checkCollision(rect, net.map)) {
                    rect.setPosition(user.x, user.y);
                    if(!user.grounded){
                        net.sendToAll({
                            type: "move",
                            data: {
                                name: user.name,
                                x: user.x,
                                y: user.y,
                                direction: "idle"
                            }
                        }, user.world);

                        user.grounded = true;
                    }
                    return;
                } else {
                    user.grounded = false;
                    user.y = rect.y;

                    net.sendToAll({
                        type: "move",
                        data: {
                            name: user.name,
                            x: user.x,
                            y: user.y,
                            direction: "down"
                        }
                    }, user.world);
                }
            }
        }
    }

    movePlayer(net, socket, users, data) {
        let user = users.find(user => user.socket == socket);

        if (data.x == 0 && data.y == 0) {
            let que = this.queue.filter(que => que && que.name == user.name);
            for (let q of que) {
                this.queue.splice(this.queue.indexOf(q), 1);
            }

            net.sendToAll({
                type: "move",
                data: {
                    name: user.name,
                    x: user.x,
                    y: user.y,
                    direction: "idle"
                }
            }, user.world);
        } else {
            let queu = {
                name: user.name,
                x: data.x,
                y: data.y
            };

            if (!this.queue.find(que => que && que.name == user.name)) {
                this.queue.push(queu);
            } else {
                let que = this.queue.find(que => que && que.name == user.name);
                if (que.y == 0 && data.y > 0)
                    que.y = data.y;

                if (que.x == 0 && data.x > 0)
                    que.x = data.x;
            }
        }
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

class TileIndexItem {
    constructor(name, type, layer){
        this.name = name;
        this.type = type;
        this.layer = layer;
    }
}

const TileIndex = {
    "dirt": new TileIndexItem("dirt", "block", "foreground"),
    "portal_sequence": new TileIndexItem("portal_sequence", "entrance", "background"),
};

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

    interact(world, tile, serv) {
        for (let x = 0; x < this._tiles.parts.length; x++) {
            let til = this._tiles.parts[x].value;
            if (til.name == tile.name && til.x == tile.x && til.y == tile.y) {
                let index = TileIndex[til.name];
                if (index) {
                    if (index.type == "entrance") {
                        console.log("entrance");
                        return til;
                    } else if (index.type == "block") {
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
                            }, world.name);
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
    }

    async start() {
        if (!Database.instance.connected)
            await Database.instance.connect();

        this.users = [];
        this.worlds = [{ name: "HiroWorld", players: [], maxPlayers: 30 }, { name: "HiroWorld2", players: [], maxPlayers: 30 }];

        this.movement = new Movement(this);
        setInterval(() => this.movement.runMovementQueue(this), 1000 / 60);
        this.map = new Map(50, 50);

        this.wss.on("connection", (socket) => {
            socket.on("message", (message) => {
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
                        user = this.users.find(user => user.socket == socket);
                        let world = this.worlds.find(world => world.name == user.world);
                        if(!world.map)
                            world.map = new Map(50, 50);

                        let til = world.map.interact(world, data, this);
                        if (til)
                            this.sendToAll({
                                type: "setChange",
                                data: {
                                    name: til.name,
                                    x: til.x,
                                    y: til.y,
                                    health: til.health
                                }
                            }, world.name);
                        else {
                            world.map.delete(data.x, data.y);
                            this.sendToAll({
                                type: "deleteBlock",
                                data: {
                                    name: data.name,
                                    x: data.x,
                                    y: data.y,
                                }
                            }, world.name);
                        }
                        break;

                    case "chat":
                        user = this.users.find(user => user.socket == socket);
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

                    default:
                        console.log("Unknown message type: " + type);
                        break;
                }
            });

            socket.on("close", () => {
                let user = this.users.find(user => user.socket == socket);
                if (user) {
                    if (user.world) {
                        let world = this.worlds.find(world => world.name == user.world);
                        if (world)
                            world.players.splice(world.players.indexOf(user.name), 1);
                    }

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

    sendTo(user, data, world) {
        for (let player of this.users) {
            if (player.name == user) {
                if (world && player.world == world)
                    this.send(player.socket, data);
                else if (!world)
                    this.send(player.socket, data);
            }
        }
    }

    sendToAll(data, world) {
        for (let player of this.users) {
            if (world && player.world == world)
                this.send(player.socket, data);
            else if (!world)
                this.send(player.socket, data);

        }
    }

    sendToAllExcept(user, data, world) {
        for (let player of this.users) {
            if (player.name != user.name)
                if (world && player.world == world)
                    this.send(player.socket, data);
                else if (!world)
                    this.send(player.socket, data);
        }
    }
}

(async() => {
    let server = new Server(8080);
    await server.start();
    let socketServer = new SocketServer(server);
    await socketServer.start();
})();
