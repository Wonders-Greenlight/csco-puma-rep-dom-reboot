import config from '../config.js'
import path from 'path'

const cwd = process.cwd()
console.log("current cwd")
console.log(cwd)
const publicRoute = config.GLOBAL.IS_TESTING ? 'frontend/' : 'frontend/'
const publicDevRoute = config.GLOBAL.IS_TESTING ? '../frontend' : './frontend'
// const publicDevRoute = config.GLOBAL.IS_TESTING ? 'dist/public' : 'web/frontend'
const staticRoute = config.GLOBAL.IS_TESTING ? '../public/static' : '../public/static'
const tasksRoute = config.GLOBAL.IS_TESTING ? 'src/tasks' : 'src/tasks'
const tempRoute = config.GLOBAL.IS_TESTING ? '../public/tmp' : '../public/tmp'

export default {
    PUBLIC: path.resolve(cwd, publicRoute),
    PUBLIC_DEV: path.resolve(cwd, publicDevRoute),
    STATICS: path.resolve(cwd, staticRoute),
    TASKS: path.resolve(cwd, tasksRoute),
    TEMP: path.resolve(cwd, tempRoute),
}