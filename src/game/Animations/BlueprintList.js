import { Singleton } from "../Systems/Singleton";
import { FramesList } from "./FramesList";
import { Blueprint } from "./Blueprint";

export class BlueprintList extends Singleton {
    blueprints = {
        // Player animations
        "player_idle": new Blueprint("player_idle", "movement", FramesList.instance.getFrames("player_idle"), 10),
        "player_walking": new Blueprint("player_walking", "movement", FramesList.instance.getFrames("player_walking"), 10),

        // Weapon animations
        "weapon_idle": new Blueprint("weapon_idle", "weapon", FramesList.instance.getFrames("weapon_idle"), 10),
        "weapon_walking": new Blueprint("weapon_walking", "weapon", FramesList.instance.getFrames("weapon_walking"), 10),
    };

    getBlueprint(name){
        return this.blueprints[name];
    }
}