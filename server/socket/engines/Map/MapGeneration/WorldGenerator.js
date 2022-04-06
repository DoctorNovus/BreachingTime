import { SimplexNoise } from "simplex-noise";
import { Mapper } from "../../../math/Mapper";
import { Tile } from "../Tile";

export class WorldGenerator {
    mapLength = 50;
    amplitude = 50;
    frequency = 0.1;

    constructor(mapLength, amplitude, frequency) {
        this.mapLength = mapLength;
        this.amplitude = amplitude;
        this.frequency = frequency;

        this.simplex = new SimplexNoise();
        this.map = new Mapper();

        this.GenerateMap1DNoise();

        return this.map;
    }

    GetNoiseValue(x, y) {
        return this.amplitude * this.simplex.noise2D(x * this.frequency, y * this.frequency);
    }

    createSpawnTile(tried = []) {
        let place = Math.floor(Math.random() * this.amplitude);
        if (!tried.includes(place)) {
            tried.push(place);
            if (this.map.get(place, 1)) {
                this.spawnTile = new Tile("portal_sequence", "background", place, 0, 32, 32);
                return this.spawnTile;
            } else {
                return this.createSpawnTile(tried);
            }
        } else {
            return this.createSpawnTile(tried);
        }
    }

    GenerateMap1DNoise() {
        for (let x = 0; x < this.mapLength; x++) {
            let noise = this.GetNoiseValue(x, 1);
            let yCoordinate = Math.floor(noise);
            for (let y = 0; y <= yCoordinate; y++) {
                if (y != 0)
                    this.map.set(x, y, new Tile("air", "foreground", x, y, 32, 32));
            }
        }

        this.map.parts = this.map.parts.filter(tile => tile.value != undefined);

        this.loopMap((x, y) => {
            if (y == 0)
                return;

            if (this.map.get(x, y) == undefined) {
                this.map.set(x, y, new Tile("dirt", "foreground", x, y, 32, 32));
            } else {
                this.map.set(x, y, undefined);
            }
        });

        this.loopMap((x, y) => {
            if (this.map.get(x, y))
                if (this.map.get(x, y).name == "air") {
                    this.map.parts.splice(this.map.parts.indexOf(this.map.get(x, y)), 1);
                }
        });

        this.map.parts = this.map.parts.filter(tile => tile.value != undefined);

        this.spawnTile = this.createSpawnTile();
        this.map.set(this.spawnTile.x, this.spawnTile.y, this.spawnTile);
        this.map.spawnTile = this.spawnTile;
    }

    loopMap(callback) {
        for (let x = 0; x < this.mapLength; x++) {
            if (x != 0) {
                for (let y = 0; y < this.amplitude; y++) {
                    callback(x, y);
                }
            }
        }
    }
}