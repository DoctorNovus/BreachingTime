import { Singleton } from "./Singleton";

export class InputSystem extends Singleton {
    linkEvent(event, callback) {
        this.game.input.keyboard.on(event, callback);
    }

    linkGenericEvent(event, callback) {
        this.game.input.on(event, callback);
    }
}