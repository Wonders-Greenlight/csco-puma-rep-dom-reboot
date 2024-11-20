import config from '../config.js'

export const logger = ( message: any, forceLog: boolean = false ) => {
    if ( !config.GLOBAL.IS_TESTING && !forceLog ) return
    console.log(message)
}