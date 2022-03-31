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

        EventManager.instance.blocks = [
            {
                key: "dirt",
                type: "single",
            },
            {
                key: "portal_sequence",
                type: "spritesheet",
                frameWidth: 32,
                frameHeight: 32,
            },
            {
                key: "cracked1",
                type: "single",
                overlay: true,
            },
            {
                key: "cracked2",
                type: "single",
                overlay: true,
            },
            {
                key: "cracked3",
                type: "single",
                overlay: true,
            }
        ];

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
                    "idle7"
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
            },
            {
                key: "jump",
                route: "jump",
                frames: [
                    "jump1",
                    "jump2",
                    "jump3",
                    "jump4",
                    "jump5",
                    "jump6",
                    "jump7"
                ],
            },
            {
                key: "fall",
                route: "jump",
                frames: [
                    "jump8",
                    "jump9",
                    "jump10",
                    "jump11"
                ],
            },
            {
                key: "jump_high",
                route: "jump",
                frames: [
                    "jump6",
                ]
            },
            {
                key: "fall_low",
                route: "jump",
                frames: [
                    "jump10",
                ]
            }];
    }
}