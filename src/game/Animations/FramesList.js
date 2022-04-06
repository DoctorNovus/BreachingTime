import { Singleton } from "../Systems/Singleton";

export class FramesList extends Singleton {
    frames = {

        // Player animations
        "player_idle": [
            { texture: "idle1" },
            { texture: "idle2" },
            { texture: "idle3" },
            { texture: "idle4" },
            { texture: "idle5" },
            { texture: "idle6" },
            { texture: "idle7" },
            { texture: "idle8" },
            { texture: "idle9" },
            { texture: "idle10" }
        ],
        "player_walking": [
            { texture: "walking1" },
            { texture: "walking2" },
            { texture: "walking3" },
            { texture: "walking4" },
            { texture: "walking5" },
            { texture: "walking6" },
            { texture: "walking7" },
            { texture: "walking8" }
        ],

        "weapon_idle": [
            { origin: { x: 0.5, y: 0.5 }, angle: 0 }
        ],
        // Weapon animations
        "weapon_walking": [
            {
                origin: { x: 0.3, y: 0.75 },
                angle: 285
            },
            {
                origin: { x: 0.35, y: 0.70 },
                angle: 315
            },
            {
                origin: { x: 0.35, y: 0.5 },
            },
            {
                origin: { x: 0.5, y: 0.5 },
                angle: 370
            },
            {
                origin: { x: 0.5, y: 0.45 },
                angle: 375
            },
            {
                origin: { x: 0.4, y: 0.40 },
                angle: 7
            },
            {
                origin: { x: 0.4, y: 0.6 },
                angle: 330
            },
            {
                origin: { x: 0.3, y: 0.7 },
                angle: 315
            }
        ]
    }

    getFrames(name) {
        return this.frames[name];
    }
}