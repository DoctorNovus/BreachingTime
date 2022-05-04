export class ItemOptionsRegistry {
    static items = [
        {
            id: "default",
            options: [
                {
                    id: "info",
                    name: "Info",
                    onLink: () => {
                        console.log("info");
                    }
                },
                {
                    id: "use",
                    name: "Use",
                    onLink: () => {
                        console.log("use");
                    }
                },
            ]
        },
        {
            id: 4,
            options: [
                {
                    id: "create-fab",
                    name: "Create Fabricator",
                    onLink: () => {
                        console.log("create-fab");
                    }
                }
            ]
        }
    ];

    static getOptions(item){
        let ite = ItemOptionsRegistry.items.find(i => i.id == item.id);
        if(ite){
            return ite;
        } else {
            return ItemOptionsRegistry.items.find(i => i.id == "default");
        }
    }

    static applyItemOption(item, option){
        let ite = ItemOptionsRegistry.items.find(i => i.id == item.id);
        if(ite){
            let opt = ite.options.find(o => o.id == option.id);
            if(opt){
                opt.onLink();
            }
        }
    }
}