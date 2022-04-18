import SimplexNoise from "simplex-noise";
import { Block } from "../Block";
import { Zone } from "../Zone";

export class ZoneGenerator {

    constructor() {
    }

    generate(name, width = 100, height = 60, seed) {
        if(!name)
            name = "test";
            
        if (!seed)
            seed = this.generateSeed();

        let octaves = 4;
        let frequency = 4;

        let simplex = new SimplexNoise(seed);

        let zone = new Zone(width, height, name);

        // else if (j == 40) {
        //     if (i == xPos && zone.getBlockofValue(1) == null) {
        //         let portal = new Block(zone, xPos, j, 32, 32, 1);
        //         zone.addBlock(i, j, portal);
        //         zone.spawnPoint = { x: i, y: j };
        //     } else {
        //         let air = new Block(zone, i, j, 1, 1, 0);
        //         zone.addBlock(i, j, air);
        //     }

        let yCoords = [];

        for (let i = 0; i < width; i++) {
            let yBase = 0;

            for (let j = 0; j < height; j++) {
                if (j < 50) {
                    if (j == 40) {
                        let yPos = this.generateHills(simplex, i, j, octaves, frequency);
                        yBase = yPos;
                        yCoords.push({ top: j + yPos, pos: yPos });
                        let grass = new Block(zone, i, j + yPos, 32, 32, 2);
                        zone.addBlock(i, j + yPos, grass);
                    } else {
                        // let above = zone.getBlock(i, j + yBase - 1);
                        // if (above && above.value == 2 || 3) {
                        //     let grass = new Block(zone, i, j + yBase, 32, 32, 3);
                        //     zone.addBlock(i, j, grass);
                        //     for (let b = 0; b < yBase; b++) {
                        //         let stone = new Block(zone, i, j + yBase + b, 32, 32, 4);
                        //         zone.addBlock(i, j + b, stone);
                        //     }
                        // }
                    }
                } else if (j >= 50 && j < height) {
                    let noise = simplex.noise2D(i / 10, j / 10) * 10;
                    if (noise < -7) {
                        let ore = this.getOreValue(i, j);
                        let neighbors = this.getNeighbors(zone, i, j);
                        let ch = this.checkChunk(neighbors, ore);

                        if (ch.val) {
                            let oreBlock = new Block(zone, i, j, 32, 32, ore);
                            zone.addBlock(i, j, oreBlock);
                        } else {
                            let x = i;
                            let y = j;
                            
                            if(ch.pos.top)
                                y -= 1;
                            else if(ch.pos.bottom)
                                y += 1;
                            else if(ch.pos.left)
                                x -= 1;
                            else if(ch.pos.right)
                                x += 1;

                            let stone = new Block(zone, x, y, 32, 32, 4);
                            zone.addBlock(x, y, stone);
                        }
                    } else {
                        let block = new Block(zone, i, j, 32, 32, 4);
                        zone.addBlock(i, j, block);
                    }
                }
            }
        }

        for (let i = 0; i < width; i++) {
            let xPos = Math.floor(Math.random() * width);

            for (let j = 0; j < height; j++) {
                let yCoord = yCoords[i];
                if (i == xPos) {
                    if (j == yCoord.top - 1 && zone.getBlockofValue(1) == null) {
                        let portal = new Block(zone, i, j, 32, 32, 1);
                        zone.addBlock(i, j, portal);
                        zone.spawnPoint = { x: i * 32, y: j * 32 };
                    }
                }

                if (j >= yCoord.top) {
                    let block = zone.blocks.get(i, j);
                    if (!block) {
                        let dirt = new Block(zone, i, j, 32, 32, 3);
                        zone.addBlock(i, j, dirt);
                    }
                }
            }
        }

        return zone;
    }

    generateHills(simplex, x, y, octaves, freq) {
        let v = 0;
        let val;

        for (let octave = 0; octave < octaves; octave++) {
            let period = 1024 / (freq ** octave);
            let amplitude = 1 / (freq ** octave);

            v += simplex.noise2D((x) / period, (y) / period) * amplitude;
        }

        val = Math.round(v * 10);
        if (val > 5)
            val = 5;

        if (val < -5)
            val = -5;

        return val;
    }

    generateSeed() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    getOreValue(x, y) {
        let oreValue = Math.floor(Math.random() * 8) + 4;
        return oreValue;
    }

    getNeighbors(zone, x, y) {
        let top = y - 1;
        let bottom = y + 1;
        let left = x - 1;
        let right = x + 1;

        let tBlock = zone.getBlock(x, top);
        let bBlock = zone.getBlock(x, bottom);
        let lBlock = zone.getBlock(left, y);
        let rBlock = zone.getBlock(right, y);

        return { top: tBlock, bottom: bBlock, left: lBlock, right: rBlock };
    }

    checkChunk(neighbors, ore) {
        let top = neighbors.top;
        let bottom = neighbors.bottom;
        let left = neighbors.left;
        let right = neighbors.right;

        let val = {
            pos: null,
            val: true
        };

        if (top && top.value != (4 || ore)) {
            val.pos = top;
            val.val = false;
        }

        if (bottom && bottom.value != (4 || ore)) {
            val.pos = bottom;
            val.val = false;
        }

        if (left && left.value != (4 || ore)) {
            val.pos = left;;
            val.val = false;
        }

        if (right && right.value != (4 || ore)) {
            val.pos = right;;
            val.val = false;
        }

        return val;
    }

    applyChunk(zone, neighbors, block, ore) {
        let top = neighbors.top;
        let bottom = neighbors.bottom;
        let left = neighbors.left;
        let right = neighbors.right;

        if (top && top.value == 4) {
            zone.addBlock(top.x, top.y, ore);
        } else if(!top || top.value == 0){
            zone.addBlock(block.x, block.y - 1, 4);
        }

        if (bottom && bottom.value == 4) {
            zone.addBlock(bottom.x, bottom.y, ore);
        } else if(!bottom || bottom.value == 0){
            zone.addBlock(block.x, block.y + 1, 4);
        }

        if (left && left.value == 4) {
            zone.addBlock(left.x, left.y, ore);
        } else if(!left || left.value == 0){
            zone.addBlock(block.x - 1, block.y, 4);
        }

        if (right && right.value == 4) {
            zone.addBlock(right.x, right.y, ore);
        } else if(!right || right.value == 0){
            zone.addBlock(block.x + 1, block.y, 4);
        }
    }
}