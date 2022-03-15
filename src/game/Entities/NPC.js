import { Rectangle } from "../Shapes/Rectangle";

export class NPC {

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