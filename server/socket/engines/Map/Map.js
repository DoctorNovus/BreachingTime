import { Mapper } from "../../../../src/Math/Mapper";
import { Tile } from "./Tile";

export class Map {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this._tiles = new Mapper();

        for (let i = 0; i < width; i++) {
            if (i == 0) {
                let place = Math.floor(Math.random() * height);
                this.spawnTile = new Tile("portal_sequence", place, i, 32, 32);
                this._tiles.set(place, i, this.spawnTile);
            } else {
                for (let j = 0; j < height; j++) {
                    this._tiles.set(j, i, new Tile("dirt", j, i, 32, 32));
                }
            }
        }
    }

    get inst() {
        return {
            width: this.width,
            height: this.height,
            spawnTile: this.spawnTile,
            tiles: this._tiles.parts
        }
    }

    interact(tile, serv) {
        for (let x = 0; x < this._tiles.parts.length; x++) {
            let til = this._tiles.parts[x].value;
            if (til.name == tile.name && til.x == tile.x && til.y == tile.y) {
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
                    });
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

    delete(x, y) {
        let alo = this._tiles.parts.find(part => part.x == x && part.y == y);
        if (alo)
            this._tiles.parts.splice(this._tiles.parts.indexOf(alo), 1);
    }
}