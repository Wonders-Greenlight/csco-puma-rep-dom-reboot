import { Server as SocketServer } from 'socket.io';
import config from '../config.js';
// import { SocketClient, SocketEvent, SocketOrigin } from '../interfaces/AppInterfaces';
class SocketProvider {
    static sockets = [];
    static ioServer;
    static initServer(httpServer) {
        SocketProvider.ioServer = new SocketServer(httpServer, {
            cors: {
                origin: config.CORS.allowedOrigins,
                methods: ['GET', 'POST']
            }
        });
        this.setListeners();
    }
    static getAllRooms() {
        return this.ioServer.sockets.adapter.rooms;
    }
    static getAllSockets() {
        return this.ioServer.fetchSockets();
    }
    static async setListeners() {
        this.ioServer.on('connection', async (socket) => {
            socket.on('pageVisitor', async (pageInfo) => {
                // console.log('\n\nPAGE INFO!')
                // console.log(pageInfo)
                // console.log((await this.ioServer.in(pageInfo.leaving).fetchSockets()).map(x => x.id))
                await socket.leave(pageInfo.leaving);
                await socket.join(pageInfo.visiting);
            });
            socket.on('disconnect', () => {
                console.log('Socket disconnected', socket.id);
                this.sockets = this.sockets.filter(socketInfo => socketInfo.socketId !== socket.id);
            });
        });
    }
    static async emitEventToRoom(room, event, payload = {}) {
        this.ioServer.to(room).emit(event, payload);
    }
}
export default SocketProvider;
