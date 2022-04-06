import { Mapper } from "../../math/Mapper";
import { WorldGenerator } from "./MapGeneration/WorldGenerator";
import { Tile } from "./Tile";
import { TileIndex } from "./TileIndex/TileIndex";

export class Map {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this._tiles = new WorldGenerator(width, height, 0.05);
        this.spawnTile = this._tiles.spawnTile;
    }

    get inst() {
        return {
            width: this.width,
            height: this.height,
            spawnTile: this.spawnTile,
            tiles: this._tiles.parts
        }
    }

    interact(world, tile, serv) {
        for (let x = 0; x < this._tiles.parts.length; x++) {
            let til = this._tiles.parts[x].value;
            if (til.name == tile.name && til.x == tile.x && til.y == tile.y) {
                let index = TileIndex[til.name];
                if (index) {
                    if (index.type == "entrance") {
                        console.log("entrance");
                        return til;
                    } else if (index.type == "block") {
                        til.health -= 1;

                        if (til.healing)
                            clearTimeout(til.healing);

                        til.healing = setTimeout(() => {
                            til.health = 3;
                            serv.sendToAll({
                                type: "setChange",
                                data: {
                                    name: til.name,
                                    x: til.x,
                                    y: til.y,
                                    health: til.health
                                }
                            }, world.name);
                        }, 2500);

                        if (til.health > 0) {
                            this._tiles.set(til.x, til.y, til);
                            return til;
                        } else {
                            clearTimeout(til.healing);
                            let till = this._tiles.parts.find(part => part.x == til.x && part.y == til.y);
                            this._tiles.parts.splice(this._tiles.parts.indexOf(till), 1);
                        }
                    }
                }
            }
        }
    }

    delete(x, y) {
        let alo = this._tiles.parts.find(part => part.x == x && part.y == y);
        if (alo)
            this._tiles.parts.splice(this._tiles.parts.indexOf(alo), 1);
    }
}