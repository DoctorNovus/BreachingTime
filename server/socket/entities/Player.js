export class Player {
    constructor(name, socket, x, y){
        this.name = name;
        this.socket = socket;
        this.x = x;
        this.y = y;
        this.inventory = [];
        this.slots = [];
        this.hotbar = [];
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

    setSlots(slots){
        this.slots = slots;
    }
    
    setHotbar(hotbar){
        this.hotbar = hotbar;
    }
    
    constructInventory(){
        return this.inventory || [];
    }

    constructProfile(){
        return {
            name: this.name,
            level: this.level,
            world: this.world,
            slots: this.slots,
            hotbar: this.hotbar
        }
    }

    hasItem(value){
        for (let item of this.inventory) {
            if (item.id == value)
                return true;
        }

        return false;
    }

    takeItem(value, count){
        for (let item of this.inventory) {
            if (item.id == value) {
                item.count -= count;
                if (item.count <= 0) {
                    this.inventory.splice(this.inventory.indexOf(item), 1);
                }
                return;
            }
        }
    }

    asData(){
        return {
            name: this.name,
            x: this.x,
            y: this.y,
            inventory: this.inventory,
            level: this.level,
            world: this.world,
            slots: this.slots,
            hotbar: this.hotbar
        }
    }
}