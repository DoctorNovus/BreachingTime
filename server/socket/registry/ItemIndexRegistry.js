export class ItemIndexRegistry {
    static _items = {
        0: "air",
        1: "portal_sequence",
        2: "grass",
        3: "dirt",
        4: "stone",
        5: "cinnabar",
        6: "copper",
        7: "gold",
        8: "iron",
        9: "lead",
        10: "lead",
        11: "nickel",
        12: "silver",
        13: "zinc",
        14: "fabricator",
        15: "sign"
    };

    static get items () {
        return ItemIndexRegistry._items;
    }

    static getByItem(item) {
        let ite = ItemIndexRegistry.items.find(i => i == item);
        if (ite) {
            return {
                id: ItemIndexRegistry.items.indexOf(ite),
                item: ite
            };
        }

        return {
            id: 0,
            item: "air"
        };
    }

    static getByID(id) {
        let ite = ItemIndexRegistry.items[id];
        if (ite) {
            return {
                id: id,
                item: ite
            };
        }

        return {
            id: 0,
            item: "air"
        };
    }
}