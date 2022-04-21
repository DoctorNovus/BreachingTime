export class Player {
    constructor(name, socket, x, y){
        this.name = name;
        this.socket = socket;
        this.x = x;
        this.y = y;
        this.inventory = [];
        this.slots = [];
        this.level = 1;
        this.world = "";
    }

    setName(name){
        this.name = name;
    }

    setPosition(x, y){
        this.x = x;
        this.y = y;
    }

    setInventory(inventory){
        this.inventory = inventory;
    }

    setLevel(level){
        this.level = level;
    }

    setWorld(world){
        this.world = world;
    }

    constructInventory(){
        return this.inventory || [];
    }

    constructProfile(){
        return {
            name: this.name,
            level: this.level,
            world: this.world,
            slots: this.slots
        }
    }
}