import { Router } from 'express'
// import { Role } from '../interfaces/UserInterface.js';

// Middlewares
// import { authenticateJwt, roleChecker } from '@/middlewares/authenticateToken.js';

// Subroutes
import TaskRouter from './TaskRouter.js';
import LocationRouter from './LocationRouter.js';
import ErpRouter from './ErpRouter.js';
import ConfigRouter from './ConfigRouter.js';
import UsersRouter from './UsersRouter.js';
import WebhookRouter from './WebhookRouter.js';
import EventRouter from './EventRouter.js';
import ShopifyRouter from '../ShopifyRouter.js';

class V1ApiRouter {
    public router: Router;

    constructor() {
        this.router = Router()
        this.routes()
    }

    routes() {
        this.router.use('/shopify', ShopifyRouter)
        
        this.router.use('/config', ConfigRouter)
        this.router.use('/users', UsersRouter)
        this.router.use('/webhooks', WebhookRouter)

        this.router.use('/tasks', TaskRouter)
        this.router.use('/events', EventRouter)
        this.router.use('/locations', LocationRouter)
        this.router.use('/erp', ErpRouter)
    }
}

const v1ApiRouter = new V1ApiRouter()

export default v1ApiRouter.router