import { Router } from 'express'
import ErpController from '../../../controllers/ErpController.js';

// Middlewares

class AgilisaRouter {
    public router: Router;

    constructor() {
        this.router = Router()
        this.routes()
    }

    routes() {
        this.router.get('/master_products', ErpController.getMasterProducts)
        this.router.get('/master_products/count', ErpController.getMasterProductsCount)
        this.router.get('/master_products/:id', ErpController.getMasterProductById)
        this.router.get('/master_inventory', ErpController.getMasterInventory)
        this.router.get('/master_inventory/count', ErpController.getMasterInventoryCount)
        this.router.get('/master_inventory/:id', ErpController.getMasterInventoryById)
        this.router.get('/master_brands', ErpController.getMasterBrands)

        this.router.get('/orders/:id', ErpController.getOrderDataById)
    }
}

const agilisaRouter = new AgilisaRouter()

export default agilisaRouter.router