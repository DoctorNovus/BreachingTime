import { Graphics } from "./Graphics";
import { InputSystem } from "./InputSystem";
import { Loading } from "./Loading";
import { Singleton } from "./Singleton";

export class EventManager extends Singleton {

    constructor() {
        super();
    }

    setStart(game) {
        this.game = game;

        Loading.instance.setBoot([
            Graphics,
            InputSystem
        ]);

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