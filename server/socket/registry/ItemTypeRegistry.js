export class ItemTypeRegistry {
    static types = [
        {
            id: "default",
            items: []
        },
        {
            id: "doors",
            passthrough: true,
            items: [1]
        },
        {
            id: "signs",
            passthrough: true,
            items: [15]
        }
    ]

    static getByType(type) {
        let ite = ItemTypeRegistry.types.find(i => i.id == type);
        if (ite) {
            return ite;
        }

        return ItemTypeRegistry.types.find(i => i.id == "default");
    }

    static getByItem(item) {
        let ite = ItemTypeRegistry.types.find(i => i.items.find(it => it == item));
        if (ite) {
            return ite;
        }

        return ItemTypeRegistry.types.find(i => i.id == "default");
    }
}