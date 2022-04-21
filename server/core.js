import { Server } from './server/Server';
import { SocketServer } from './socket/SocketServer';
import readline from "readline";

(async () => {
    let server = new Server(8080);
    await server.start();
    let socketServer = new SocketServer(server);
    await socketServer.start();
    setTimeout(async () => {
        await commandPrompt(server, socketServer);
    }, 3000);
})();

async function commandPrompt(server, socketServer) {
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let questi = () => {
        rl.question("> ", (cmd) => {
            let close = false;
            
            switch (cmd.trim().toLowerCase()) {
                case "stop":
                    server.stop();
                    socketServer.stop();
                    close = true;
                    break;

                case "save":
                    socketServer.save();
                    break;

                default:
                    console.log(`Unknown command: ${cmd}`);
                    break;

            }

            if (close)
                process.exit();
            else
                questi();
        });
    }

    questi();
}