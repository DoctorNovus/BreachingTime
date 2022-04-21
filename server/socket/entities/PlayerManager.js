import { Database } from "../database/Database";

export class PlayerManager {
    constructor() {
        this.players = [];
    }

    addPlayer(player) {
        this.players.push(player);
    }

    getPlayer(name) {
        return this.players.find(player => player.name == name);
    }

    deletePlayer(player) {
        this.players.splice(this.players.indexOf(player), 1);
    }

    savePlayers() {
        console.log(`Saving ${this.players.length} players`);
        for (let player of this.players) {
            this.savePlayer(player);
        }
    }

    savePlayer(player) {
        try {
            let pData = player.asData();
            let pDB = Database.instance.users.findOne({ username: player.name });
            if (pDB) {
                Database.instance.users.updateOne({ username: player.name }, { $set: pData });
            } else {
                Database.instance.users.insertOne({ username: player.name, ...pData });
            }
        } catch (e) {
            console.log(`Error saving player ${player.name}`);
            console.log(e);
        }
    }
}