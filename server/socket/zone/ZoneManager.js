import { ZoneGenerator } from "./gen/ZoneGenerator";
import { FileSystem } from "../file/FileSystem";
import { Zone } from "./Zone";

export class ZoneManager {

    constructor() {
        this.zones = [];
        this.generators = {
            "default": new ZoneGenerator(),
            "plain": new ZoneGenerator()
        }
    }

    generateZone(name, width, height, type = "default", seed) {
        let zone = this.generators[type].generate(name, width, height, seed);
        this.addZone(zone);
        this.saveZone(zone);
    }

    generateRandomZone(name, width, height, seed) {
        let zone = this.generators[Object.keys(this.generators)[Math.floor(Math.random() * Object.keys(this.generators).length)]].generate(name, width, height, seed);
        this.addZone(zone);
        this.saveZone(zone);
    }

    addZone(zone) {
        this.zones.push(zone);
    }

    getZone(name) {
        return this.zones.find(zone => zone.name == name);
    }

    deleteZone(zone) {
        this.zones.splice(this.zones.indexOf(zone), 1);
    }

    saveZones() {
        for (let zone of this.zones) {
            this.saveZone(zone);
        }
    }

    saveZone(zone) {
        try {
            zone.savePlayers();

            let zData = zone.asData();
            let zDataBlocks = [];

            if(zData.blocks[0].value.zone){
                let z2Data = Object.create(zData);
                z2Data.blocks = zData.blocks.map(block => {
                    let b = Object.create(block);
                    delete b.zone;
                    return b;
                });
                zData = z2Data;
            }

            if (zData && zData.blocks && zData.blocks[0]) {
                zData.blocks.forEach((block) => {
                    let b = block.value;
                    zDataBlocks.push({
                        x: b.x,
                        y: b.y,
                        width: b.width,
                        height: b.height,
                        value: b.value,
                        extra: b.extra ? b.extra : null
                    });
                });

                zData.blocks = zDataBlocks;

                FileSystem.writeFile(`${__dirname}/zones/${zone.name}/config.json`, JSON.stringify(zData));
                console.log(`Saved zone ${zone.name}`);
            }
        } catch (e) {
            console.log(`Failed to save zone ${zone.name}`);
            console.log(e);
        }
    }

    loadZones() {
        let files = FileSystem.readdir(`${__dirname}/zones`);
        if (!files) {
            console.log("No zones found");
            return;
        }

        for (let file of files) {
            let f = FileSystem.readFile(`${__dirname}/zones/${file}/config.json`);
            this.loadZone(f);
        }
    }

    loadZone(data) {
        data = JSON.parse(data);
        let zone = Zone.fromData(data);
        this.addZone(zone);
    }

    getPlayer(name) {
        for (let zone of this.zones) {
            if (zone.players && zone.players.length > 0)
                for (let player of zone.players) {
                    if (player.name == name) {
                        return player;
                    }
                }
        }
    }

    getPlayerBySocket(socket) {
        for (let zone of this.zones) {
            if (zone.players && zone.players.length > 0)
                for (let player of zone.players) {
                    if (player.socket == socket) {
                        return player;
                    }
                }
        }
    }
}