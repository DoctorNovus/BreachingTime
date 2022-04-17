import { ZoneGenerator } from "./gen/ZoneGenerator";
import { FileSystem } from "../file/FileSystem";

export class ZoneManager {

    constructor(){
        this.zones = [];
        this.generators = {
            "default": new ZoneGenerator(),
            "plain": new ZoneGenerator()
        }
    }

    generateZone(name, width, height, type, seed){
        let zone = this.generators[type].generate(name, width, height, seed);
        this.addZone(zone);
        this.saveZone(zone);
    }

    generateRandomZone(name, width, height, seed){
        let zone = this.generators[Object.keys(this.generators)[Math.floor(Math.random() * Object.keys(this.generators).length)]].generate(name, width, height, seed);
        this.addZone(zone);
        this.saveZone(zone);
    }

    addZone(zone){
        this.zones.push(zone);
    }

    getZone(name){
        return this.zones.find(zone => zone.name == name);
    }

    deleteZone(zone){
        this.zones.splice(this.zones.indexOf(zone), 1);
    }

    saveZones(){
        for(let zone of this.zones){
            this.saveZone(zone);
        }
    }

    saveZone(zone){
        FileSystem.writeFile(`${__dirname}/zones/${zone.name}/config.json`, JSON.stringify(zone.asData()));
    }
}