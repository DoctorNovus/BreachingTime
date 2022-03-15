import { GameConfig } from "./Systems/GameConfig";
import { BaseGame } from "./Systems/BaseGame";
import { EventManager } from "./Systems/EventManager";
import { StartScene } from "./Scenes/Start";
import { GameScene } from "./Scenes/GameScene";

export class MainGame {
    start(){
        let config = new GameConfig({
            parent: "game", scene: [
                StartScene,
                GameScene
            ]
        });
        
        BaseGame.instance.start(config);
        let em = new EventManager();
        em.setStart(game);
        
    }
}
