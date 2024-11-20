// import { authenticateJwt, roleChecker } from '@/middlewares/authenticateToken';
import { Router } from 'express'
import WebhookController from '../../controllers/WebhookController.js'

class WebhookRouter {
    public router: Router;

    constructor() {
        this.router = Router()
        this.routes()
    }

    routes() {
        this.router.post('/process/uninstalled', WebhookController.processUninstallWebhook)
        this.router.post('/process/orders/paid', WebhookController.processPaidOrderWebhook)
    }
}

const webhookRoutes = new WebhookRouter()

export default webhookRoutes.router
