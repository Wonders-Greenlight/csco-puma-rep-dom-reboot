import { Router } from 'express'
import WebhookController from '../../../controllers/WebhookController.js'

class WebhookRouter {
    public router: Router;

    constructor() {
        this.router = Router()
        this.routes()
    }

    routes() {
        this.router.get('/', WebhookController.getWebhooks.bind(WebhookController))
        this.router.post('/', WebhookController.registerNewWebhook.bind(WebhookController))
        this.router.post('/sync', WebhookController.syncWebhooksWithShopify.bind(WebhookController))
        this.router.put('/:id', WebhookController.updateWebhook.bind(WebhookController))
        this.router.delete('/:id', WebhookController.deleteWebhook.bind(WebhookController))
    }
}

const webhookRoutes = new WebhookRouter()

export default webhookRoutes.router
