import { MongoClient } from "mongodb";
import { Singleton } from '../systems/Singleton';

const url = 'mongodb://localhost:27017';

export class Database extends Singleton {
    async connect() {
        this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
        await this.client.connect();
        console.log("Connected to database");
        this.db = this.client.db("breaching-time");
        this.users = this.db.collection("users");
        this.worlds = this.db.collection("worlds");

        this.connected = true;
    }
}