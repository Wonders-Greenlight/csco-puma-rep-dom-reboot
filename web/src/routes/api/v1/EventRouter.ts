import { Router } from 'express'
// import EventController from '@/controllers/EventController.js'

// Middlewares

class EventRouter {
    public router: Router;

    constructor() {
        this.router = Router()
        this.routes()
    }

    routes() {
        // this.router.get('/', EventController.getEvents)
        // this.router.get('/count', EventController.getEventsCount)
        // this.router.get('/:id', EventController.getEventById)
        // this.router.delete('/:id', EventController.deleteEvent)
    }
}

const eventRouter = new EventRouter()

export default eventRouter.router