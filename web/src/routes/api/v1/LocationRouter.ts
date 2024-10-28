import { Router } from 'express'
import LocationController from '../../../controllers/LocationController.js'

// Middlewares

class TaskRouter {
    public router: Router;

    constructor() {
        this.router = Router()
        this.routes()
    }

    routes() {
        this.router.get('/', LocationController.getLocations)
        this.router.get('/:id', LocationController.getLocationById)
        this.router.post('/', LocationController.createLocation.bind(LocationController))
        this.router.put('/:id', LocationController.updateLocation.bind(LocationController))
        this.router.delete('/:id', LocationController.deleteLocation)
    }
}

const taskRouter = new TaskRouter()

export default taskRouter.router