import http from 'http'
import { Server as SocketServer } from 'socket.io'
import config from '../config.js';
import HelpersController from '@/controllers/HelpersController.js';

// import { SocketClient, SocketEvent, SocketOrigin } from '../interfaces/AppInterfaces';

class SocketProvider {
    static sockets: any[] = []
    static ioServer: SocketServer;

    static initServer( httpServer: http.Server ) {
        SocketProvider.ioServer = new SocketServer(httpServer, {
            cors: {
                origin: config.CORS.allowedOrigins,
                methods: ['GET', 'POST']
            }
        })

        this.setListeners()
    }

    static getAllRooms() {
        return this.ioServer.sockets.adapter.rooms
    }

    static getAllSockets() {
        return this.ioServer.fetchSockets()
    }

    static async setListeners() {
        this.ioServer.on('connection', async (socket) => {
            socket.on('pageVisitor', async (pageInfo: any) => {
                // console.log('\n\nPAGE INFO!')
                // console.log(pageInfo)
                // console.log((await this.ioServer.in(pageInfo.leaving).fetchSockets()).map(x => x.id))
                await socket.leave(pageInfo.leaving)
                await socket.join(pageInfo.visiting)
            })
        
            socket.on('disconnect', () => {
                console.log('Socket disconnected', socket.id)
                this.sockets = this.sockets.filter(socketInfo => 
                    socketInfo.socketId !== socket.id 
                )
            })
        })
    }

    static async emitEventToRoom( room: string, event: string, payload: any = {} ) {
        this.ioServer.to(room).emit(event, payload)
    }

    // static async getSocketByCheckoutId( checkoutId: string, socketOrigin: SocketOrigin ) {
    //     const sockets = await this.ioServer.fetchSockets()
    //     const socketRelated = this.sockets.find(socketInfo => {
    //         return socketInfo.checkoutId === checkoutId && socketInfo.origin === socketOrigin
    //     })
        
    //     if ( !!!socketRelated ) return null
    //     return sockets.find( socket => socket.id === socketRelated.socketId )
    // }

    // static async emitSocketByCheckoutId( checkoutId: string, socketOrigin: SocketOrigin, eventData: SocketEvent ): Promise<void> {
    //     const socket = await this.getSocketByCheckoutId(checkoutId, socketOrigin)
    //     if ( !!!socket ) return
        
    //     socket.emit(eventData.key, eventData.payload)
    // }
}

export default SocketProvider