import { Router } from 'express';
// Controllers
import ConfigController from '../../../controllers/ConfigController.js';
class ConfigRouter {
    router;
    constructor() {
        this.router = Router();
        this.routes();
    }
    routes() {
        this.router.get('/', ConfigController.getConfig);
        this.router.post('/', ConfigController.setConfig);
        this.router.put('/:id', ConfigController.updateConfig);
    }
}
const configRouter = new ConfigRouter();
export default configRouter.router;
