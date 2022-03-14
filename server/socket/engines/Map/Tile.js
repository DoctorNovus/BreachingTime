import { Rectangle } from "../../shapes/Rectangle";

export class Tile {
    constructor(name, x, y, width, height){
        this.name = name;
        this.x = x * width;
        this.y = y * height;
        this.width = width || 32;
        this.height = height || 32;

        this.rect = new Rectangle(this.x, this.y, this.width, this.height);
        this.health = 3;
    }
}