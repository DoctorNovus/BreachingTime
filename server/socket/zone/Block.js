export class Block {
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