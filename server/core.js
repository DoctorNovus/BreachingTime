import { Server } from './server/Server';
import { SocketServer } from './socket/SocketServer';

let server = new Server(8080);
let socketServer = new SocketServer(server);