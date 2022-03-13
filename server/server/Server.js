import http from "http";
import express from "express";

export class Server {
    constructor(port){
        this.port = port;
        this.app = express();
        this.app.use(express.static(`${process.cwd()}/public`));

        this.serv = http.createServer(this.app);
        this.serv.listen(this.port, () => {
            console.log("Server started on port " + this.port);
        });
    }
}