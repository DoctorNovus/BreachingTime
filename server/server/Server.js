import http from "http";
import express from "express";
import { Database } from "../socket/database/Database";
import bcrypt from "bcrypt";
import { UserRegistry } from "../shared/UserRegistry";

export class Server {
    constructor(port) {
        this.port = port;
    }

    async start() {
        this.app = express();
        this.app.use(express.static(`${process.cwd()}/public`));

        if (!Database.instance.connected)
            await Database.instance.connect();

        this.database = Database.instance;

        this.app.post("/api/login", async (req, res) => {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk;
            });

            req.on("end", async () => {
                let { uname, pass } = JSON.parse(body);
                if (!uname || !pass) {
                    res.status(400).send("Invalid username or password");
                    return;
                }

                let us = await this.database.users.findOne({ username: uname });
                if (us) {
                    let result = await bcrypt.compareSync(pass, us.password);
                    if (result) {
                        res.send({
                            success: true,
                            user: {
                                name: us.username
                            }
                        });

                        UserRegistry.instance.addUser({ name: us.username });
                    } else {
                        res.send({
                            success: false,
                            message: "Incorrect username/password"
                        });
                    }
                } else {
                    res.send({
                        success: false,
                        message: "No user with that username exists."
                    });
                }
            });
        });

        this.app.post("/api/register", async (req, res) => {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk;
            });

            req.on("end", async () => {
                let { uname, email, pass } = JSON.parse(body);

                if (!uname || !email || !pass) {
                    res.status(400).send("Invalid username or password");
                    return;
                }

                let us = await this.database.users.findOne({ username: uname });
                if (us) {
                    res.send({
                        success: false,
                        message: "Username already taken."
                    });
                } else {
                    let hash = await bcrypt.hashSync(pass, 10);
                    let user = await this.database.users.insertOne({
                        username: uname,
                        email: email,
                        password: hash
                    });
                    res.send({
                        success: true,
                        user: {
                            name: user.username
                        }
                    });
                }
            });
        });

        this.serv = http.createServer(this.app);
        this.serv.listen(this.port, () => {
            console.log("Server started on port " + this.port);
        });
    }

    async stop(){
        this.serv.close();
    }
}