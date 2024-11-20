import { Request, Response } from 'express';
import config from '../config.js';
import ErpController from './ErpController.js';

// Interfaces
import { AddHandlersParams, DeliveryMethod, RegisterReturn, WebhookHandler } from '@shopify/shopify-api';
import { TaskPriority } from '../interfaces/TaskInterfaces.js';
import { IWebhookHandler } from '../interfaces/AppInterfaces.js';
interface UserRequest extends Request { user?: object }

// Providers
import ShopifyProvider from '../providers/ShopifyProvider.js';
import TaskProvider from '../providers/TaskProvider.js';
import { IShopifyOrder, WebhookTopic, WebhookTopics } from '../interfaces/ShopifyInterfaces.js';

// Models
import Webhook from '../models/WebhookModel.js';

class WebhookController {
    public async registerInitialWebhooks(): Promise<RegisterReturn[]> {
        const responses: RegisterReturn[] = []
        // Add here the register function for every webhook u want to be registered after app installation
        const uninstallWbkResponse = await this.registerUninstallWebhook()

        responses.push(
            uninstallWbkResponse,
        )
        return responses
    }

    public async addHandlers(): Promise<string[]> {
        const webhooks = await this.getDbWebhooks()
        if ( !webhooks.length ) return []
        
        const handlers: AddHandlersParams = webhooks.reduce((acc, x) => {
            const activeHandlers = x.handlers.filter(h => !!h.active)
            if ( !activeHandlers ) return acc

            const topicHandlers: WebhookHandler[] = activeHandlers.map(({ uri }) => ({
                callbackUrl: uri,
                deliveryMethod: DeliveryMethod.Http,
                callback: async (t, d, b, id) => {
                    console.log(`PROCESSING WEBHOOK => ${x.topic}`)
                    console.log(t, b, d, id)
                }
            }))

            acc[x.topic] = topicHandlers

            return acc
        }, {} as AddHandlersParams)

        await ShopifyProvider.addWebhookHandlers(handlers)
        
        return ShopifyProvider.shopify.api.webhooks.getTopicsAdded()
    }

    public async processPaidOrderWebhook( req: Request, res: Response ) {
        const order: IShopifyOrder = req.body

        // ENQUEUE REQUIRED ACTION
        await ErpController.handlePaidOrderWebhook.bind(ErpController)(+order.id)
        
        return res.sendStatus(200)
    }

    public async processUninstallWebhook( req: Request, res: Response ) {
        console.log('Processing webhook')
        const { domain } = req.body
        const existShop = await ShopifyProvider.shopify.config.sessionStorage.findSessionsByShop( domain || config.APP.SHOP )

        if ( existShop.length === 0 ) return res.sendStatus(200)

        await ShopifyProvider.shopify.config.sessionStorage.deleteSessions(existShop.map(s => s.id))
        res.sendStatus(200)
    }

    public async deleteWebhook( req: Request, res: Response ): Promise<Response> {
        try {
            const { id } = req.params
            const response = await Webhook.findByIdAndDelete(id, req.body)
            const webhooks = await this.getDbWebhooks()

            return res.json({ deleted: true, info: response, webhooks })
        } catch (err) {
            return res.status(500).json({ deleted: false, message: err.message })
        }
    }

    public async createWebhook({ topic, handlers, active }: { topic: WebhookTopic, handlers: IWebhookHandler[], active?: boolean }) {
        const webhook = await Webhook.create({
            topic,
            handlers,
            active
        })
        
        return webhook
    }

    public async getDbWebhooks() {
        const webhooks = await Webhook.find()
        return webhooks
    }

    public async getWebhooks( req: Request, res: Response ): Promise<Response> {
        try {
            if ( typeof req.query.shopify !== 'undefined' ) {
                const webhooks = await ShopifyProvider.getWebhooks()
                return res.json(webhooks)
            }

            const webhooks = await this.getDbWebhooks()

            return res.json(webhooks)
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    public async getShopifyWebhook( req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params

            const webhook = await ShopifyProvider.getWebhookById(Number(id), true)
            return res.json(webhook)
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    public async syncWebhooksWithShopify( req: Request, res: Response): Promise<Response> {
        try {
            await this.addHandlers()
            const response = await ShopifyProvider.registerWebhookHandlers()

            return res.json(response)
        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    }

    public async registerNewWebhook( req: UserRequest, res: Response ): Promise<Response> {
        try {
            const { topic, handlers, active } = req.body
            let errMessages: string[] = []

            if ( !!!topic || !!!handlers ) errMessages.push('Please send webhook topic and handlers')
            if ( !Array.isArray(handlers) ) errMessages.push('handlers param has to be array')
            if ( !handlers.length ) errMessages.push('handlers array cannot be empty')

            if ( errMessages.length > 0 ) {
                return res.status(400).json({
                    registered: false,
                    message: errMessages[0],
                    errors: errMessages
                })
            }

            const webhook = await this.createWebhook({ topic, handlers, active })

            return res.json({ registered: true, webhook })
        } catch (err) {
            return res.status(500).json({ registered: false, message: err.message })
        }
    }

    public async updateWebhook( req: Request, res: Response ): Promise<Response> {
        try {
            const { id } = req.params
            const webhook = await Webhook.findByIdAndUpdate(id, req.body, { new: true })

            return res.json({ updated: true, webhook })
        } catch (err) {
            return res.status(500).json({ updated: false, message: err.message })
        }
    }

    // Webhook registration functions ----------------------------------------------
    private async registerUninstallWebhook(): Promise<any> {
        // Your app should handle the APP_UNINSTALLED webhook to make sure merchants go through OAuth if they reinstall it
        try {
            await this.createWebhook({
                topic: WebhookTopics.APP_UNINSTALLED,
                handlers: [{ uri: '/api/webhooks/process/uninstalled', active: true }]
            })

            await this.addHandlers()
            const result = await ShopifyProvider.registerWebhookHandlers()
            
            // console.log('Webhook registered:', webhook)
            return result[WebhookTopics.APP_UNINSTALLED]
        } catch (err) {
            throw err
        }
    }    
}

export default new WebhookController()
