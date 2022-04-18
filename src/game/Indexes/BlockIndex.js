export class BlockIndex {
    static _blocks = {
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
        13: "zinc"
    };

    static get blocks () {
        return BlockIndex._blocks;
    }
}