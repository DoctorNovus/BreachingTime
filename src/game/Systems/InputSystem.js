import { Singleton } from "./Singleton";

export class InputSystem extends Singleton {
    linkEvent(event, callback) {
        this.game.input.keyboard.on(event, callback);
    }
}