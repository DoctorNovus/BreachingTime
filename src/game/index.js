import { GameConfig } from "./Systems/GameConfig";
import { BaseGame } from "./Systems/BaseGame";
import { EventManager } from "./Systems/EventManager";
import { StartScene } from "./Scenes/Start";
import { GameScene } from "./Scenes/GameScene";
import { Singleton } from "./Systems/Singleton";

export class MainGame extends Singleton {
    start(username){
        BaseGame.instance.username = username;
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

    onMessage(data){
        console.log(data);
    }

    onWorldMenu(data){
        console.log(data);
    }
}
