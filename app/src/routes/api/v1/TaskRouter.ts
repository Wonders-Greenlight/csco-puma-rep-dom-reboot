import { Router } from 'express'
import TaskController from '../../../controllers/TaskController.js'

// Middlewares

class TaskRouter {
    public router: Router;

    constructor() {
        this.router = Router()
        this.routes()
    }

    routes() {
        this.router.post('/delete_all', TaskController.flushTasks)
        this.router.get('/bus', TaskController.getBusInfo)

        this.router.get('/', TaskController.getTasks)
        this.router.get('/count', TaskController.getTasksCount)
        this.router.get('/:id', TaskController.getTaskById)
        this.router.post('/', TaskController.createTask.bind(TaskController))
        this.router.delete('/:id', TaskController.deleteTask)
        this.router.post('/:id/rerun', TaskController.reRunTask)
    }
}

const taskRouter = new TaskRouter()

export default taskRouter.router