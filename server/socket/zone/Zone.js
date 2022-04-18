import { Mapper } from "../math/Mapper";

export class Zone {

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
        let zone = new Zone(data.width, data.height, data.name);
        zone.spawnPoint = data.spawnPoint;
        zone.blocks = Mapper.from(zone.blocks, data.blocks);

        return zone;
    }
}