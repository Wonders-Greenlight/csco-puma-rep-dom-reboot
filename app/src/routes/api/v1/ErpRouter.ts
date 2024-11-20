import { Router } from 'express'
import ErpController from '../../../controllers/ErpController.js';
import AgilisaRouter from './AgilisaRouter.js';

// Middlewares

class ErpRouter {
    public router: Router;

    constructor() {
        this.router = Router()
        this.routes()
    }

    routes() {
        this.router.use('/agilisa', AgilisaRouter)
        this.router.post('/events', ErpController.handleEvent.bind(ErpController))
    }
}

const erpRouter = new ErpRouter()

export default erpRouter.router