import { Router } from 'express'
import ExtensionsController from '../controllers/ExtensionsController.js';

class ExtensionsRouter {
    public router: Router;

    constructor() {
        this.router = Router()
        this.routes()
    }

    routes() {
        this.router.get('/order', ExtensionsController.goToOrder.bind(ExtensionsController))
        this.router.get('/order/bill', ExtensionsController.billOrder.bind(ExtensionsController))
    }
}

const extensionsRoutes = new ExtensionsRouter()

export default extensionsRoutes.router
