export class SettingsOptionRegistry {
    static items = [
        {
            id: "default",
            options: [
                {
                    id: "exitworld",
                    name: "Exit World",
                    onLink: () => {
                        console.log("exitworld");
                    }
                },
                {
                    id: "gameconfig",
                    name: "Game Config",
                    onLink: () => {
                        console.log("settings");
                    }
                },
                {
                    id: "exitgame",
                    name: "Exit Game",
                    onLink: () => {
                        console.log("exitgame");
                    }
                }
            ]
        }
    ]

    static getOptions(item){
        let ite = SettingsOptionRegistry.items.find(i => i.id == item.id);
        if(ite){
            return ite;
        } else {
            return SettingsOptionRegistry.items.find(i => i.id == "default");
        }
    }

    static applySettingsOption(item, option){
        let ite = SettingsOptionRegistry.items.find(i => i.id == item.id);
        if(ite){
            let opt = ite.options.find(o => o.id == option.id);
            if(opt){
                opt.onLink();
            }
        }
    }
}