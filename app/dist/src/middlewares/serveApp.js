import { join } from 'path';
import WebhookController from "../controllers/WebhookController.js";
import ShopifyProvider from "../providers/ShopifyProvider.js";
import server from '../../index.js';
import { WebhookTopics } from "../interfaces/ShopifyInterfaces.js";
// Models
const whiteFedPaths = [];
export const addSessionShopToReqParams = (req, res, next) => {
    const shop = res.locals?.shopify?.session?.shop;
    if (shop && !req.query.shop) {
        req.query.shop = shop;
    }
    next();
};
export const serveClientApp = async (req, res, next) => {
    // LATER MOVE ALL OF THIS
    try {
        const topics = await WebhookController.addHandlers();
        if (!!topics.length)
            await ShopifyProvider.registerWebhookHandlers();
        const dbWebhooks = await WebhookController.getDbWebhooks();
        if (!!!dbWebhooks.find(x => x.topic === WebhookTopics.APP_UNINSTALLED)) {
            await WebhookController.registerInitialWebhooks();
        }
    }
    catch (err) {
        console.error('B:ERROR WHEN CREATING INITIAL WEBHOOKS');
        console.log("error:", err);
        console.error('E:ERROR WHEN CREATING INITIAL WEBHOOKS');
    }
    // Create Super User to give a full access token to the FED app
    // try {
    //     const adminUser = await User.findOne({ userName: process.env.SU_USERNAME })
    //     if ( !!!adminUser ) {
    //         const { user } = await HelpersController.createNewApiUser({
    //             userName: process.env.SU_USERNAME as string,
    //             password: process.env.SU_PASSWORD as string,
    //             roles: [Role.ADMIN]
    //         })
    //     }
    // } catch (err) {
    //     console.error('ERROR CREATING SU ADMIN USER')
    //     console.log(err)
    // }
    // return res
    // .status(200)
    // .set('Content-Type', 'text/html')
    // .set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    // .set('Pragma', 'no-cache')
    // .set('Expires', '0')
    // .sendFile(join(server.STATIC_PATH, 'index.html'));
    return res
        .status(200)
        .set('Content-Type', 'text/html')
        .sendFile(join(server.STATIC_PATH, 'index.html'));
};
export const rootCheckAndRedirect = async (req, res, next) => {
    const isWithlisted = whiteFedPaths.some(p => req.baseUrl.includes(p));
    if (isWithlisted)
        return next();
    const ensureInstalled = server.shopify.ensureInstalledOnShop();
    return ensureInstalled(req, res, next);
};
