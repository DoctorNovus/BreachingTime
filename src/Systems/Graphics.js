import { Singleton } from "./Singleton";

export class Graphics extends Singleton {
    constructor(game){
        super();
        this.game = game;
    }

    rectangle(x, y, width, height, color){
        return this.game.add.rectangle(x, y, width, height, color);
    }
}