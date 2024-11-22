import config from '../config.js';
// import Shopify from '@shopify/shopify-api';
// import { TaskPriority, TaskType } from '@/interfaces/TaskInterfaces';
import { TOAST_REASON } from '../interfaces/AppInterfaces.js';
// import HelpersController from './HelpersController';
// import ShopifyProvider, { shopify } from '@/providers/ShopifyProvider';
// import TaskProvider from '@/providers/TaskProvider';
import ErpController from './ErpController.js';
const { SHOP, API_KEY } = config.APP;
class ExtensionsController {
    static buildQuerystring(query) {
        return Object.entries(query).map(([key, val]) => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
        });
    }
    // public async goToOrder( req: Request, res: Response ): Promise<void> {
    //     const shop = req.query.shop as string
    //     if ( !!!shop ) return res.redirect(`https://${process.env.HOST}`)
    //     const queryString = Object.entries(req.query).map(([key, val]) => {
    //         return `${encodeURIComponent(key)}=${encodeURIComponent(val as string)}`  
    //     })
    //     let order
    //     const orderId = req.query.id
    //     const checkoutId = req.query.checkoutId
    //     if ( !!orderId ) {
    //         order = await Order.findOne({ 
    //             $or: [
    //                 { orderId: Number(orderId) },
    //                 { checkoutId: Number(orderId) },
    //             ]
    //         })
    //     }
    //     if ( !!checkoutId && !!!order ) {
    //         order = await Order.findOne({ checkoutId: Number(checkoutId) })
    //     }
    //     const su = await User.findOne({ userName: process.env.SU_USERNAME })
    //     if ( !!order ) {
    //         queryString.push(`orderId=${order._id}`)
    //     }
    //     return res.redirect(
    //         order 
    //             ? `https://${process.env.HOST}/orders/${order._id}?${queryString.join('&')}`
    //             : `https://${process.env.HOST}?${[...queryString, 'error=order_not_found'].join('&')}`
    //     )
    // }
    async goToOrder(req, res) {
        const shop = req.query.shop;
        if (!!!shop)
            return res.redirect(`https://${config.APP.HOST}`);
        const queryString = ExtensionsController.buildQuerystring(req.query);
        let order = true;
        const orderId = req.query.id;
        let redirectUri = `https://${config.APP.HOST}?${[...queryString, 'error=order_not_found'].join('&')}`;
        if (!!order) {
            redirectUri = `https://${config.APP.HOST}/orders/${orderId}?${queryString.join('&')}`;
        }
        return res.redirect(redirectUri);
    }
    async billOrder(req, res) {
        const shop = req.query.shop;
        if (!!!shop)
            return res.redirect(`https://${config.APP.HOST}`);
        const queryString = ExtensionsController.buildQuerystring(req.query);
        const orderId = req.query.id;
        const returnUri = `https://${config.APP.HOST}/events?${queryString.join('&')}`;
        // ENQUEUE REQUIRED ACTION
        await ErpController.handlePaidOrderWebhook.bind(ErpController)(+orderId);
        return res.redirect(returnUri);
    }
    async goToTasks(req, res) {
        const shop = req.query.shop;
        if (!!!shop)
            return res.redirect(`https://${config.APP.HOST}`);
        const queryString = ExtensionsController.buildQuerystring(req.query);
        const orderId = req.query.id;
        // EXECUTE REQUIRED ACTION
        // TaskProvider.add(
        //     ErpController.handlePaidOrderWebhook.bind(ErpController)(orderId), 
        //     TaskPriority.HIGH
        // )
        queryString.push(`toastReason=${encodeURIComponent(TOAST_REASON.TASK_CREATED_SUCCESSFULLY)}`);
        let redirectUri = `https://${config.APP.HOST}/tasks?${queryString.join('&')}`;
        return res.redirect(redirectUri);
    }
}
export default new ExtensionsController();
