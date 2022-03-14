(function () {
    'use strict';

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

    class Graphics extends Singleton {
        constructor(game){
            super();
            this.game = game;
        }

        rectangle(x, y, width, height, color){
            return this.game.add.rectangle(x, y, width, height, color);
        }
    }

    class InputSystem extends Singleton {
        linkEvent(event, callback) {
            this.game.input.keyboard.on(event, callback);
        }
    }

    class Loading extends Singleton {

        setBoot(items) {
            this.boot = items;
        }

        checkBoot(name) {
            for (let i = 0; i < this.boot.length; i++) {
                if (!this.boot[i][name])
                    return false;

                return true;
            }
        }

        setLoadingValues(name, value) {
            for (let i = 0; i < this.boot.length; i++) {
                this.boot[i].instance.setVariable(name, value);
            }
        }
    }

    class EventManager extends Singleton {

        constructor() {
            super();
        }

        setStart(game) {
            this.game = game;

            Loading.instance.setBoot([
                Graphics,
                InputSystem
            ]);

            EventManager.instance.blocks = [
                {
                    key: "dirt",
                    type: "single",
                },
                {
                    key: "portal_sequence",
                    type: "spritesheet",
                    frameWidth: 32,
                    frameHeight: 32,
                },
                {
                    key: "cracked1",
                    type: "single",
                    overlay: true,
                },
                {
                    key: "cracked2",
                    type: "single",
                    overlay: true,
                },
                {
                    key: "cracked3",
                    type: "single",
                    overlay: true,
                }
            ];

            EventManager.instance.animations = [
                {
                    key: "idle",
                    frames: [
                        "idle1",
                        "idle2",
                        "idle3",
                        "idle4",
                        "idle5",
                        "idle6",
                        "idle7",
                        "idle8"
                    ]
                },
                {
                    key: "walking",
                    frames: [
                        "walking1",
                        "walking2",
                        "walking3",
                        "walking4",
                        "walking5",
                        "walking6",
                        "walking7",
                        "walking8"
                    ],
                }];
        }
    }

    class GameConfig {
        constructor({ type, parent, width, height, physics, scene }) {
            let obj = {};
            obj.type = type || Phaser.AUTO;

            if (parent)
                obj.parent = parent;

            if (!width && !height) {
                obj.width = window.innerWidth;
                obj.height = window.innerHeight;
            } else {
                obj.width = width;
                obj.height = height;
            }

            if (physics)
                obj.physics = physics;

            if (scene)
                obj.scene = scene;
            else {
                obj.scene = {
                    preload: EventManager.instance.preload,
                    create: EventManager.instance.create,
                    update: EventManager.instance.update
                };
            }

            return obj;
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

    class BaseGame extends Singleton {
        constructor(config) {
            super();
            // requestAnimationFrame(this.update.bind(this));
        }

        start(config){
            this.config = config;
            this.game = new Phaser.Game(config);
            this.objects = {
                entities: [],
                enemies: [],
                borders: []
            };

            this.anims = {};

            this.overlays = new Mapper();
            this.updates = new Mapper();
            this.blocks = new Mapper();
        }
        
        findObject(name) {
            for (let obj in this.objects) {
                for (let j = 0; j < this.objects[obj].length; j++) {
                    let oj = this.objects[obj][j];
                    if (oj.id == name)
                        return oj;
                }
            }
        }

        addEntity(entity) {
            this.objects.entities.push(entity);
            return entity;
        }

        addEnemy(enemy) {
            this.objects.enemies.push(enemy);
            return enemy;
        }

        addBorder(border) {
            this.objects.borders.push(border);
            return border;
        }

        checkCollides(obji) {
            for (let obj in this.objects) {
                for (let j = 0; j < this.objects[obj].length; j++) {
                    let oj = this.objects[obj][j];
                    if (oj != obji && oj.collides(obji))
                        return true;
                }
            }

            return false;
        }

        setCamera(camera, zoom) {
            this.camera = camera;
            this.camera.setZoom(zoom || 1);
        }

        update() {
            EventManager.instance.update();

            requestAnimationFrame(this.update.bind(this));
        }

        loadMap(map){
            this.map = map;
            this.loadedMap = false;
        }

        deleteBlock(data){
            let block = this.blocks.get(data.x, data.y);
            if (block){
                block = block.value;
                if(block.cr)
                    block.cr.destroy();

                block.destroy();
                this.blocks.parts.splice(this.blocks.parts.indexOf(block), 1);
            }
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

    class NPC {

        constructor(x, y, width, height){
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.rect = new Rectangle();
        }

        collides(obj){
            if(this.rect.overlaps(obj.rect))
                return true;

            return false;
        }
    }

    class Entity extends NPC {

    }

    class Player extends Entity {
        constructor(id, x, y, width = 32, height = 32) {
            super(x, y, width, height);

            this.id = id;

            this.velX = 0;
            this.velY = 0;
        }

        setSprite(sprite) {
            this.sprite = sprite;
            this.sprite.x = this.x;
            this.sprite.y = this.y;
            this.sprite.width = this.width;
            this.sprite.height = this.height;
        }

        canMove() {
            if (!BaseGame.instance.checkCollides(this))
                return true;

            return false;
        }

        move(x, y, direction = "right") {
            this.sprite.x = x;
            this.sprite.y = y;

            if (direction == "left")
                this.animate("walking", -1);
            else if (direction == "right")
                this.animate("walking", 1);
            else
                this.animate("idle", 1);
        }

        animate(animation, direction) {
            this.sprite.play(animation, 10, true);
            this.sprite.setScale(direction, 1);
        }

        destroy() {
            this.sprite.destroy();
        }
    }

    class Network extends Singleton {
        constructor() {
            super();
        }

        connect(url, game, instanced, callback) {
            Network.instance.game = game;
            let socket = new WebSocket(url);
            Network.instance.socket = socket;

            socket.onopen = () => {
                console.log("Connected to server");
                callback();
            };

            socket.onmessage = (event) => {
                let { type, data } = JSON.parse(event.data);
                let player;
                let sprite;

                switch (type) {
                    case "selfJoin":
                        console.log("Self joined", data.name);
                        player = new Player(data.name, data.x, data.y);
                        sprite = Network.instance.game.add.sprite(data.x, data.y, "idle1");
                        player.setSprite(sprite);
                        player.animate("idle");
                        instanced.addEntity(player);
                        BaseGame.instance.camera.startFollow(player.sprite);
                        break;

                    case "playerJoin":
                        if (data.name !== Network.instance.username) {
                            console.log("Player joined", data.name);
                            player = new Player(data.name, data.x, data.y);
                            sprite = Network.instance.game.add.sprite(data.x, data.y, "idle1");
                            player.setSprite(sprite);
                            player.animate("idle");
                            instanced.addEntity(player);
                        }
                        break;

                    case "move":
                        player = BaseGame.instance.findObject(data.name);
                        if (player)
                            player.move(data.x, data.y, data.direction);
                        break;

                    case "loadMap":
                        instanced.loadMap(data.map);
                        break;

                    case "playerLeave":
                        player = BaseGame.instance.findObject(data.name);
                        if (player)
                            player.destroy();
                        break;

                    case "setChange":
                        BaseGame.instance.updates.set(data.x, data.y, data);
                        break;

                    case "deleteBlock":
                        instanced.deleteBlock(data);
                        break;
                        
                    default:
                        console.log(`Unknown message type: ${type}`);
                        break;
                }
            };

            socket.onclose = () => {
                console.log("Disconnected from server");
            };
        }

        setActive(game) {
            Network.instance.game = game;
        }

        send(data) {
            this.socket.send(JSON.stringify(data));
        }
    }

    class StartScene extends Phaser.Scene {
        constructor(){
            super("StartScene");
        }

        preload(){
            console.log("STARTING SCENE");
        }

        create(){
            let that = this;
            BaseGame.instance.network = new Network();
            BaseGame.instance.network.connect("ws://localhost:8080", this, BaseGame.instance, () => {
                that.scene.start("GameScene");
            });
        }

        update(){

        }
    }

    class GameScene extends Phaser.Scene {
        constructor() {
            super("GameScene");
        }

        preload() {
            console.log("TEST");

            if (!Loading.instance.checkBoot("game"))
                Loading.instance.setLoadingValues("game", this);

            for (let i = 0; i < EventManager.instance.animations.length; i++) {
                let anim = EventManager.instance.animations[i];
                for (let j = 0; j < anim.frames.length; j++) {
                    this.load.image(anim.frames[j], `assets/animations/${anim.key}/${anim.frames[j]}.png`);
                }
            }

            for (let i = 0; i < EventManager.instance.blocks.length; i++) {
                let block = EventManager.instance.blocks[i];
                let area = block.overlay ? "overlays" : "blocks";
                if (block.type === "single") {
                    this.load.image(block.key, `assets/${area}/${block.key}.png`);
                } else if (block.type === "spritesheet") {
                    this.load.spritesheet(block.key, `assets/${area}/${block.key}.png`, {
                        frameWidth: block.frameWidth,
                        frameHeight: block.frameHeight
                    });
                } else {
                    for (let j = 0; j < block.frames.length; j++) {
                        this.load.image(block.frames[j], `assets/${area}/${block.key}/${block.frames[j]}.png`);
                    }
                }
            }
        }

        create() {
            if (!Loading.instance.checkBoot("game"))
                Loading.instance.setLoadingValues("game", this);

            for (let i = 0; i < EventManager.instance.animations.length; i++) {
                let anim = EventManager.instance.animations[i];
                this.anims.create({
                    key: anim.key,
                    frames: anim.frames.map(an => ({ key: an })),
                    frameRate: 10,
                    repeat: -1
                });
            }

            for (let i = 0; i < EventManager.instance.blocks.length; i++) {
                let block = EventManager.instance.blocks[i];
                if (block.type === "spritesheet") {
                    let frames = this.anims.generateFrameNames(block.key);
                    BaseGame.instance.anims[block.key] = this.anims.create({
                        key: `${block.key}_anim`,
                        frames,
                        frameRate: 10,
                        repeat: -1
                    });
                } else if (block.type == "multi") {
                    BaseGame.instance.anims[block.key] = this.anims.create({
                        key: `${block.key}_anim`,
                        frames: block.frames.map(an => ({ key: an })),
                        frameRate: 10,
                        repeat: -1
                    });
                }
            }

            BaseGame.instance.setCamera(this.cameras.main, 1.5);

            let username = "test" + Math.floor(Math.random() * 200);
            Network.instance.username = username;
            Network.instance.send({
                type: "login",
                data: {
                    name: username,
                    pass: "test"
                }
            });

            Network.instance.setActive(this);

            // let player = new Player(100, 100, 32, 32, this.add.sprite("idle1"), "player");
            // player = BaseGame.instance.addEntity(player);
            // player.animate("idle", 1);

            InputSystem.instance.linkEvent("keydown", (e) => {
                switch (e.key) {
                    case "w":
                        Network.instance.send({
                            type: "move",
                            data: {
                                x: 0,
                                y: -1
                            }
                        });
                        break;

                    case "a":
                        Network.instance.send({
                            type: "move",
                            data: {
                                x: -1,
                                y: 0
                            }
                        });
                        break;

                    case "s":
                        Network.instance.send({
                            type: "move",
                            data: {
                                x: 0,
                                y: 1
                            }
                        });
                        break;

                    case "d":
                        Network.instance.send({
                            type: "move",
                            data: {
                                x: 1,
                                y: 0
                            }
                        });
                        break;
                }
            });

            InputSystem.instance.linkEvent("keyup", (e) => {
                switch (e.key) {
                    case "w":
                        Network.instance.send({
                            type: "move",
                            data: {
                                x: 0,
                                y: 0
                            }
                        });
                        break;

                    case "a":
                        Network.instance.send({
                            type: "move",
                            data: {
                                x: 0,
                                y: 0
                            }
                        });
                        break;

                    case "s":
                        Network.instance.send({
                            type: "move",
                            data: {
                                x: 0,
                                y: 0
                            }
                        });
                        break;

                    case "d":
                        Network.instance.send({
                            type: "move",
                            data: {
                                x: 0,
                                y: 0
                            }
                        });
                        break;
                }
            });

            this.input.on("pointerdown", (pointer) => {
                // let { worldX, worldY } = pointer;
                // worldX = Math.floor(worldX / 32) * 32;
                // worldY = Math.floor(worldY / 32) * 32;
                // console.log(worldX, worldY);

                let instancedBlock = BaseGame.instance.instancedBlock;

                switch (pointer.button) {
                    // Left
                    case 0:
                        Network.instance.send({
                            type: "leftInteract",
                            data: {
                                name: instancedBlock.name,
                                x: instancedBlock.x,
                                y: instancedBlock.y
                            }
                        });
                        break;

                    // Right

                    case 2:
                        Network.instance.send({
                            type: "rightInteract",
                            data: {
                                name: instancedBlock.name,
                                x: instancedBlock.x,
                                y: instancedBlock.y
                            }
                        });
                        break;
                }
            });
        }

        update() {
            if (!Loading.instance.checkBoot("game"))
                Loading.instance.setLoadingValues("game", this);

            let base = BaseGame.instance;
            for (let entity of base.objects.entities) {
            }

            if (base.map && !base.loadedMap) {
                console.log(`Loading map with ${base.map.tiles.length} tiles`);
                for (let x = 0; x < base.map.tiles.length; x++) {
                    let block = base.map.tiles[x];
                    if (block) {
                        if (block.health <= 0)
                            return;

                        block = block.value;
                        let bl = this.add.sprite(block.x, block.y, block.name).setInteractive();
                        bl.displayWidth = 32;
                        bl.displayHeight = 32;

                        if (BaseGame.instance.anims[`${block.name}`]) {
                            bl.play(`${block.name}_anim`, 10, true);
                        }
                        bl.on("pointerover", () => {
                            BaseGame.instance.instancedBlock = block;
                        });

                        bl.setDepth(-1);
                        if (block.health < 3 && block.health > 0) {
                            bl.cr = this.add.sprite(block.x, block.y, `cracked${3 - block.health}`);
                        }

                        if (block.health <= 0) {
                            bl.destroy();
                        } else {
                            BaseGame.instance.blocks.set(block.x, block.y, bl);
                        }
                    }
                }

                base.loadedMap = true;
            }

            for (let update of BaseGame.instance.updates.parts) {
                update = update.value;
                let bl = BaseGame.instance.blocks.get(update.x, update.y);
                if (bl) {
                    bl = bl.value;
                    bl.setTexture(update.name);
                    bl.setDepth(-1);
                    if (update.health < 3) {
                        if (!bl.cr) {
                            bl.cr = this.add.sprite(update.x, update.y, `cracked${3 - update.health}`);
                            bl.cr.setDepth(0);
                        } else {
                            bl.cr.setTexture(`cracked${3 - update.health}`);
                            bl.cr.setDepth(0);
                        }
                    }

                    BaseGame.instance.updates.parts.splice(BaseGame.instance.updates.parts.indexOf(update), 1);
                }
            }


            // let player = BaseGame.instance.findObject("player");
            // if (player) {
            //     player.move();

            //     let camera = BaseGame.instance.camera;
            //     if (camera) {
            //         camera.startFollow(player.sprite);
            //     }
            // }
        }
    }

    let config = new GameConfig({
        parent: "game", scene: [
            StartScene,
            GameScene
        ]
    });

    BaseGame.instance.start(config);
    let em = new EventManager();
    em.setStart(game);

})();
