'use strict';

var http = require('http');
var express = require('express');
var mongodb = require('mongodb');
var bcrypt = require('bcrypt');
var WebSocket = require('ws');
var SimplexNoise = require('simplex-noise');
var fs = require('fs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var bcrypt__default = /*#__PURE__*/_interopDefaultLegacy(bcrypt);
var WebSocket__default = /*#__PURE__*/_interopDefaultLegacy(WebSocket);
var SimplexNoise__default = /*#__PURE__*/_interopDefaultLegacy(SimplexNoise);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

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

class Mapper {
    width = 0;
    height = 0;

    constructor(width, height = 1) {
        this.parts = [];

        this.width = width;
        this.height = height;

        if (width) {
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    this.set(i, j, 0);
                }
            }
        }
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
        if (part && part.value)
            return part.value;
        else
            return null;
    }

    getFull(x, y) {
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

    asData(toggle){
        let parse = (part) => {
            if(!toggle)
                return part.value;
            else
                return part;
        };
        let data = this.parts.map(part => parse(part).asData ? parse(part).asData() : parse(part));
        return data;
    }

    static from(mapper, parts) {
        let w = 0;
        let h = 0;

        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            let x = part.x;
            let y = part.y;

            if(w < x)
                w = x;
            if(h < y)
                h = y;

            mapper.set(x, y, part);
        }

        mapper.width = w + 1;
        mapper.height = h + 1;

        return mapper;
    }
}

class Boot extends Singleton {

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

    checkCollision(rect, zone) {
        let collides = false;
        if (!zone)
            return;

        let blocks = zone.blocks;
        let bb = blocks.parts || blocks;

        for (let tile of bb) {
            let tRect = new Rectangle(tile.x * 32, tile.y * 32, tile.value.width, tile.value.height);
            if(tile.value.value == (1))
                tile.layer = "background";

            if (tile.layer) {
                if (tile.layer == ("foreground")) {
                    if (rect.overlaps(tRect)) {
                        collides = true;
                    }
                }
            } else {
                if (rect.overlaps(tRect))
                    collides = true;
            }
        }

        if (rect.x < 0 || rect.x > (zone.width * 32) - 32 || rect.y < (-1 * zone.height * 32) || rect.y > zone.height * 32)
            collides = true;

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

            let user = net.zoneManager.getPlayer(que.name);
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

                let zone = net.zoneManager.zones.find(zone => zone.name == user.world);
                if (this.checkCollision(rect, zone)) {
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
                        if (que.y > 0)
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

        for (let zone of net.zoneManager.zones) {
            if (zone.players && zone.players.length > 0)
                for (let user of zone.players) {
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

                        let zone = net.zoneManager.zones.find(zone => zone.name == user.world);
                        if (this.checkCollision(rect, zone)) {
                            rect.setPosition(user.x, user.y);
                            if (!user.grounded) {
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

        for (let quete of this.queue) {
            if (!quete)
                return;

            let user = net.zoneManager.getPlayer(quete.name);
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

                let zone = net.zoneManager.zones.find(zone => zone.name == user.world);
                if (this.checkCollision(rect, zone)) {
                    rect.setPosition(user.x, user.y);
                    if (!user.grounded) {
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

    movePlayer(net, socket, data) {
        let user = net.zoneManager.getPlayerBySocket(socket);

        if (!user)
            return;

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

class Block {
    constructor(zone, x, y, width, height, value) {
        this.zone = zone;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.value = value;
    }

    asData() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            value: this.value
        };
    }
}

class Zone$1 {

    constructor(width, height, name) {
        this.width = width;
        this.height = height;
        this.name = name;

        this.blocks = new Mapper();
    }

    addBlock(x, y, block) {
        this.blocks.set(x, y, block);
    }

    getBlock(x, y) {
        return this.blocks.get(x, y);
    }

    getBlockofValue(value) {
        for (let block of this.blocks.asData()) {
            if (block.value == value)
                return block;
        }

        return null;
    }

    deleteBlock(x, y) {
        this.blocks.set(x, y, 0);
    }

    asData() {
        return {
            width: this.width,
            height: this.height,
            name: this.name,
            spawnPoint: this.spawnPoint || { x: 0, y: 0 },
            blocks: this.blocks.asData(true)
        }
    }

    static fromData(data){
        let zone = new Zone$1(data.width, data.height, data.name);
        zone.spawnPoint = data.spawnPoint;
        zone.blocks = Mapper.from(zone.blocks, data.blocks);

        return zone;
    }
}

class ZoneGenerator {

    constructor() {
    }

    generate(name, width = 100, height = 60, seed) {
        if(!name)
            name = "test";
            
        if (!seed)
            seed = this.generateSeed();

        let octaves = 4;
        let frequency = 4;

        let simplex = new SimplexNoise__default["default"](seed);

        let zone = new Zone$1(width, height, name);

        // else if (j == 40) {
        //     if (i == xPos && zone.getBlockofValue(1) == null) {
        //         let portal = new Block(zone, xPos, j, 32, 32, 1);
        //         zone.addBlock(i, j, portal);
        //         zone.spawnPoint = { x: i, y: j };
        //     } else {
        //         let air = new Block(zone, i, j, 1, 1, 0);
        //         zone.addBlock(i, j, air);
        //     }

        let yCoords = [];

        for (let i = 0; i < width; i++) {

            for (let j = 0; j < height; j++) {
                if (j < 50) {
                    if (j == 40) {
                        let yPos = this.generateHills(simplex, i, j, octaves, frequency);
                        yCoords.push({ top: j + yPos, pos: yPos });
                        let grass = new Block(zone, i, j + yPos, 32, 32, 2);
                        zone.addBlock(i, j + yPos, grass);
                    }
                } else if (j >= 50 && j < height) {
                    let noise = simplex.noise2D(i / 10, j / 10) * 10;
                    if (noise < -7) {
                        let ore = this.getOreValue(i, j);
                        let neighbors = this.getNeighbors(zone, i, j);
                        let ch = this.checkChunk(neighbors, ore);

                        if (ch.val) {
                            let oreBlock = new Block(zone, i, j, 32, 32, ore);
                            zone.addBlock(i, j, oreBlock);
                        } else {
                            let x = i;
                            let y = j;
                            
                            if(ch.pos.top)
                                y -= 1;
                            else if(ch.pos.bottom)
                                y += 1;
                            else if(ch.pos.left)
                                x -= 1;
                            else if(ch.pos.right)
                                x += 1;

                            let stone = new Block(zone, x, y, 32, 32, 4);
                            zone.addBlock(x, y, stone);
                        }
                    } else {
                        let block = new Block(zone, i, j, 32, 32, 4);
                        zone.addBlock(i, j, block);
                    }
                }
            }
        }

        for (let i = 0; i < width; i++) {
            let xPos = Math.floor(Math.random() * width);

            for (let j = 0; j < height; j++) {
                let yCoord = yCoords[i];
                if (i == xPos) {
                    if (j == yCoord.top - 1 && zone.getBlockofValue(1) == null) {
                        let portal = new Block(zone, i, j, 32, 32, 1);
                        zone.addBlock(i, j, portal);
                        zone.spawnPoint = { x: i * 32, y: j * 32 };
                    }
                }

                if (j >= yCoord.top) {
                    let block = zone.blocks.get(i, j);
                    if (!block) {
                        let dirt = new Block(zone, i, j, 32, 32, 3);
                        zone.addBlock(i, j, dirt);
                    }
                }
            }
        }

        return zone;
    }

    generateHills(simplex, x, y, octaves, freq) {
        let v = 0;
        let val;

        for (let octave = 0; octave < octaves; octave++) {
            let period = 1024 / (freq ** octave);
            let amplitude = 1 / (freq ** octave);

            v += simplex.noise2D((x) / period, (y) / period) * amplitude;
        }

        val = Math.round(v * 10);
        if (val > 5)
            val = 5;

        if (val < -5)
            val = -5;

        return val;
    }

    generateSeed() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    getOreValue(x, y) {
        let oreValue = Math.floor(Math.random() * 8) + 4;
        return oreValue;
    }

    getNeighbors(zone, x, y) {
        let top = y - 1;
        let bottom = y + 1;
        let left = x - 1;
        let right = x + 1;

        let tBlock = zone.getBlock(x, top);
        let bBlock = zone.getBlock(x, bottom);
        let lBlock = zone.getBlock(left, y);
        let rBlock = zone.getBlock(right, y);

        return { top: tBlock, bottom: bBlock, left: lBlock, right: rBlock };
    }

    checkChunk(neighbors, ore) {
        let top = neighbors.top;
        let bottom = neighbors.bottom;
        let left = neighbors.left;
        let right = neighbors.right;

        let val = {
            pos: null,
            val: true
        };

        if (top && top.value != (4 )) {
            val.pos = top;
            val.val = false;
        }

        if (bottom && bottom.value != (4 )) {
            val.pos = bottom;
            val.val = false;
        }

        if (left && left.value != (4 )) {
            val.pos = left;            val.val = false;
        }

        if (right && right.value != (4 )) {
            val.pos = right;            val.val = false;
        }

        return val;
    }

    applyChunk(zone, neighbors, block, ore) {
        let top = neighbors.top;
        let bottom = neighbors.bottom;
        let left = neighbors.left;
        let right = neighbors.right;

        if (top && top.value == 4) {
            zone.addBlock(top.x, top.y, ore);
        } else if(!top || top.value == 0){
            zone.addBlock(block.x, block.y - 1, 4);
        }

        if (bottom && bottom.value == 4) {
            zone.addBlock(bottom.x, bottom.y, ore);
        } else if(!bottom || bottom.value == 0){
            zone.addBlock(block.x, block.y + 1, 4);
        }

        if (left && left.value == 4) {
            zone.addBlock(left.x, left.y, ore);
        } else if(!left || left.value == 0){
            zone.addBlock(block.x - 1, block.y, 4);
        }

        if (right && right.value == 4) {
            zone.addBlock(right.x, right.y, ore);
        } else if(!right || right.value == 0){
            zone.addBlock(block.x + 1, block.y, 4);
        }
    }
}

class FileSystem {
    static existsFull(path) {
        let parts = path.split(/\//g);
        let newPath = "";
        let dirs = parts.length - 1;

        for (let i = 0; i < parts.length; i++) {
            newPath += parts[i];
            if (dirs > 0) {
                if (!FileSystem.exists(`${newPath}/`))
                    fs__default["default"].mkdirSync(newPath);

                newPath += "/";
                dirs--;
            } else {
                if (!FileSystem.exists(newPath))
                    fs__default["default"].writeFileSync(newPath, "{}");
            }
        }

        return true;
    }

    static existsDir(path) {
        let parts = path.split(/\//g);
        parts.pop();
        let newPath = "";
        for (let i = 0; i < parts.length; i++) {
            newPath += parts[i];
            if (!FileSystem.exists(`${newPath}/`))
                fs__default["default"].mkdirSync(newPath);
            newPath += "/";
        }
        return true;
    }

    static readFile(path) {
        if (FileSystem.existsDir(path)) {
            FileSystem.createFile(path);
            return fs__default["default"].readFileSync(path);
        }
    }

    static createFile(path) {
        FileSystem.existsFull(path);
    }

    static exists(path) {
        return fs__default["default"].existsSync(path);
    }

    static writeFile(path, data) {
        FileSystem.createFile(path);
        fs__default["default"].writeFileSync(path, data);
    }

    static readdir(path) {
        if (!FileSystem.exists(path)) {
            fs__default["default"].mkdirSync(path);
            return fs__default["default"].readdirSync(path);
        } else {
            return fs__default["default"].readdirSync(path);
        }
    }
}

class ZoneManager {

    constructor() {
        this.zones = [];
        this.generators = {
            "default": new ZoneGenerator(),
            "plain": new ZoneGenerator()
        };
    }

    generateZone(name, width, height, type = "default", seed) {
        let zone = this.generators[type].generate(name, width, height, seed);
        this.addZone(zone);
        this.saveZone(zone);
    }

    generateRandomZone(name, width, height, seed) {
        let zone = this.generators[Object.keys(this.generators)[Math.floor(Math.random() * Object.keys(this.generators).length)]].generate(name, width, height, seed);
        this.addZone(zone);
        this.saveZone(zone);
    }

    addZone(zone) {
        this.zones.push(zone);
    }

    getZone(name) {
        return this.zones.find(zone => zone.name == name);
    }

    deleteZone(zone) {
        this.zones.splice(this.zones.indexOf(zone), 1);
    }

    saveZones() {
        for (let zone of this.zones) {
            this.saveZone(zone);
        }
    }

    saveZone(zone) {
        let zData = zone.asData();
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

        FileSystem.writeFile(`${__dirname}/zones/${zone.name}/config.json`, JSON.stringify(zData));
    }

    loadZones() {
        let files = FileSystem.readdir(`${__dirname}/zones`);
        if (!files) {
            console.log("No zones found");
            return;
        }

        for (let file of files) {
            let f = FileSystem.readFile(`${__dirname}/zones/${file}/config.json`);
            this.loadZone(f);
        }
    }

    loadZone(data) {
        data = JSON.parse(data);
        let zone = Zone$1.fromData(data);
        this.addZone(zone);
    }

    getPlayer(name) {
        for (let zone of this.zones) {
            if (zone.players && zone.players.length > 0)
                for (let player of zone.players) {
                    if (player.name == name) {
                        return player;
                    }
                }
        }
    }

    getPlayerBySocket(socket) {
        for (let zone of this.zones) {
            if (zone.players && zone.players.length > 0)
                for (let player of zone.players) {
                    if (player.socket == socket) {
                        return player;
                    }
                }
        }
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
        this.movement = new Movement(this);
        this.zoneManager = new ZoneManager();
        this.zoneManager.loadZones();

        setInterval(() => this.movement.runMovementQueue(this), 1000 / 60);

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
                                x: 0,
                                y: 0,
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
                        this.movement.movePlayer(this, socket, data);
                        break;

                    case "leftInteract":
                        user = this.zoneManager.getPlayerBySocket(socket);
                        let world = this.zoneManager.zones.find(world => world.name == user.world);
                        console.log(world);
                        console.log(data);
                        // if(!world.map)
                        //     world.map = new Map(50, 50);

                        // let til = world.map.interact(world, data, this);
                        // if (til)
                        //     this.sendToAll({
                        //         type: "setChange",
                        //         data: {
                        //             name: til.name,
                        //             x: til.x,
                        //             y: til.y,
                        //             health: til.health
                        //         }
                        //     }, world.name);
                        // else {
                        //     world.map.delete(data.x, data.y);
                        //     this.sendToAll({
                        //         type: "deleteBlock",
                        //         data: {
                        //             name: data.name,
                        //             x: data.x,
                        //             y: data.y,
                        //         }
                        //     }, world.name);
                        // }
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
            });
        });
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
}

(async() => {
    let server = new Server(8080);
    await server.start();
    let socketServer = new SocketServer(server);
    await socketServer.start();
})();
