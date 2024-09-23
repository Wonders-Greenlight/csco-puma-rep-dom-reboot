// @ts-check
import 'dotenv/config'
import '@shopify/shopify-api/adapters/node';
import express from 'express';
import cors from 'cors'
import { Server as HttpServer } from 'http'
import cookieParser from 'cookie-parser'
import serveStatic from 'serve-static';
import mongoose from 'mongoose';
import { ShopifyApp } from '@shopify/shopify-app-express';
import { shopify } from './src/providers/ShopifyProvider.js';
import './src/providers/TaskProvider.js'
import SocketProvider from './src/providers/SocketProvider.js';

// Middlewares
import { addSessionShopToReqParams, rootCheckAndRedirect, serveClientApp } from './src/middlewares/serveApp.js';

// Config
import config, { initChecker } from './src/config.js';

// Utils
import folders from './src/utils/folders.js';

// Routes
import ApiRouter from './src/routes/ApiRouter.js';

class Server {
    // Public props
    public app: express.Application
    public server: HttpServer;
    public isProduction: boolean;
    public shopify: ShopifyApp;
    public refreshTokens: string[] = [];
    public STATIC_PATH: string;
    // Private props
    private PORT: number;

    constructor() {
        this.setup()
    }

    private setup() {
        this.mongodbConfig()
        this.PORT = Number(process.env.BACKEND_PORT) || Number(process.env.PORT) || 3000;
        this.isProduction = false
        // this.isProduction = !config.GLOBAL.IS_TESTING
        this.STATIC_PATH = this.isProduction ? folders.PUBLIC : folders.PUBLIC_DEV
        this.createShopifyApp()
        this.app = express()
        this.app.set('port', this.PORT)
        // Set up Shopify authentication and webhook handling
        this.app.get(this.shopify.config.auth.path, this.shopify.auth.begin())
        this.app.get(
            this.shopify.config.auth.callbackPath,
            this.shopify.auth.callback(),
            this.shopify.redirectToShopifyOrAppRoot(),
        )
        
        this.app.use("/*", addSessionShopToReqParams)
        this.app.use(express.json());
        this.app.use(cookieParser())
        
        this.createRoutes()

        this.app.use(serveStatic(this.STATIC_PATH, { index: false }));

        this.app.use(
            '/*',
            rootCheckAndRedirect,
            serveClientApp
        )
    }

    private createRoutes() {
        this.app.use('/api', ApiRouter)
    }

    private async createShopifyApp() {
        this.shopify = shopify
    }

    private mongodbConfig() {
        // MongoDB settings
        mongoose.set('strictQuery', false)
        mongoose.connect(config.DB.URI)
        const db = mongoose.connection
        db.on('error', error => console.error(error) )
        db.on('open', async () => {
            console.log('DB is connected to mongoose')
            initChecker()
        })
    }

    public listen() {
        this.server = this.app.listen(this.PORT, () => {
            console.log(`Running on port => ${this.PORT} | ${process.env.NODE_ENV}`)

            console.log('\n\nINSTALL APP ROUTE')
            const b64Host = Buffer.from(`${process.env.SHOP}/admin`).toString('base64url')
            console.log('REDIRECT USER HERE:')
            console.log(`https://${process.env.HOST.replace(/https:\/\//, '')}?shop=${process.env.SHOP}&host=${b64Host}`)
        })
        
        SocketProvider.initServer(this.server)
    }
}

const server = new Server()
server.listen()

export default server