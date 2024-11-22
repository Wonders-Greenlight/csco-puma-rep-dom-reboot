import { Router } from 'express';
import ShopifyController from '../../controllers/ShopifyController.js';
// Middlewares
// Subroutes
class ShopifyRouter {
    router;
    constructor() {
        this.router = Router();
        this.routes();
    }
    routes() {
        this.router.get('/login', ShopifyController.loginIntoApp);
        this.router.post('/refresh_token', ShopifyController.refreshSessionToken);
        this.router.get('/check_token', ShopifyController.checkToken);
        this.router.get('/webhooks', ShopifyController.getWebhooks);
        this.router.get('/products', ShopifyController.getProducts);
        this.router.get('/products/all', ShopifyController.getAllProducts);
        this.router.get('/products/count', ShopifyController.getProductsCount);
        this.router.get('/products/:id', ShopifyController.getProductById);
        this.router.get('/products/:id/variants/count', ShopifyController.getVariantsCount);
        this.router.get('/variants/count', ShopifyController.getVariantsCount);
        // Stock related
        this.router.get('/locations', ShopifyController.getLocations);
        this.router.get('/locations/:id', ShopifyController.getLocationById);
        this.router.get('/locations/:locationId/inventory_levels', ShopifyController.getInventoryLevelsByLocation);
        this.router.get('/inventory_levels', ShopifyController.getInventoryLevels);
        this.router.get('/inventory_levels/all', ShopifyController.getAllInventoryLevels);
        this.router.get('/inventory_items', ShopifyController.getInventoryItems);
        this.router.get('/inventory_items/:id', ShopifyController.getInventoryItemById);
        this.router.post('/inventory_items/:id/set', ShopifyController.setInventoryLevel);
        this.router.post('/inventory_items/:id/adjust', ShopifyController.adjustInventoryLevel);
        this.router.get('/inventory_update_gql', ShopifyController.bulkInventoryUpdate);
        // Price related
        this.router.post('/variants/:id/price', ShopifyController.setVariantPrice);
        this.router.post('/products/:pId/variants/:vId/price', ShopifyController.setVariantPriceOnProduct);
        this.router.post('/products', ShopifyController.createProduct);
        // this.router.get('/products_gql', ShopifyController.getProductGql)
        this.router.post('/products_gql', ShopifyController.createProductGql);
        this.router.get('/products_gql', ShopifyController.updateProductGql);
        this.router.get('/orders/:id', ShopifyController.getOrderById);
    }
}
const shopifyRouter = new ShopifyRouter();
export default shopifyRouter.router;
