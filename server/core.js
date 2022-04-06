import { Server } from './server/Server';
import { WorldGenerator } from './socket/engines/Map/MapGeneration/WorldGenerator';
import { SocketServer } from './socket/SocketServer';

(async() => {
    let server = new Server(8080);
    await server.start();
    let socketServer = new SocketServer(server);
    await socketServer.start();
})();