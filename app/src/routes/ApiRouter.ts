import { Router } from 'express'
// import ConfigController from '../controllers/ConfigController'
// import UserController from '../controllers/UserController'
// import ApiController from '../controllers/ApiController'
import { shopify } from '../providers/ShopifyProvider.js'

// Middlewares
// import { authenticateJwt } from '../middlewares/authenticateToken';

// Subroutes
import ShopifyRouter from './api/ShopifyRouter.js'
import ExtensionsRouter from './ExtensionsRouter.js';
import WebhooksRouter from './api/WebhookHandleRouter.js';
import v1ApiRouter from './api/v1/_v1RootRouter.js';

// REMOVE AFTER DEMO
// import BlockerController from '../controllers/_BlockerController.js';

class ApiRouter {
    public router: Router;

    constructor() {
        this.router = Router()
        this.routes()
    }

    routes() {
        // Direct Shopify consumer routes
        this.router.use('/shopify', ShopifyRouter)
        
        // Extensions routes
        this.router.use('/extensions', ExtensionsRouter)

        // V1 App routes -- Work here
        this.router.use('/v1', v1ApiRouter)

        // Webhooks
        this.router.use('/webhooks', WebhooksRouter)
    }
}

const apiRouter = new ApiRouter()

export default apiRouter.router