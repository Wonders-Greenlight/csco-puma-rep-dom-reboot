import { Socket, io } from 'socket.io-client'
// import router from '@/router'

declare const window: any;
const isDev = (typeof process !== 'undefined' && process.env.NODE_ENV || window.NODE_ENV) === 'development'

const state = {
    socketSvUri: '',
    socket: null as Socket | null
}

const methods = {
    setServerUri( svUri: string ) {
        state.socketSvUri = svUri
    },
    connectClientSocket() {
        if ( !!state.socket ) return

        const socket = isDev ? io(state.socketSvUri) : io()
        state.socket = socket

        socket.on('connect', () => {
            console.log('============== CONNECTED TO IO SERVER!!!')
            // router.beforeEach((to, from) => {
            //     socket.emit('pageVisitor', { 
            //         socketId: socket.id,
            //         leaving: from.path,
            //         visiting: to.path,
            //         fullPath: to.fullPath
            //     })
            // })
        })
    }
}


export default {
    state,
    methods
}