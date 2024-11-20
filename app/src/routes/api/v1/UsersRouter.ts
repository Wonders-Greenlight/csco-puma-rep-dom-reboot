import { Router } from 'express'

// Controllers
import { Role } from '@/interfaces/UserInterface.js';
// import { roleChecker } from '@/middlewares/authenticateToken.js';
// import UserController from '@/controllers/UserController.js';

class UserRouter {
    public router: Router;

    constructor() {
        this.router = Router()
        this.routes()
    }

    routes() {
        // App users routes
        // this.router.get('/', roleChecker([Role.READ_ONLY, Role.WRITE_ONLY, Role.ADMIN]), UserController.getUsers)
        // this.router.post('/', roleChecker([Role.WRITE_ONLY, Role.ADMIN]), UserController.setUser)
        // this.router.put('/:userId', roleChecker([Role.ADMIN, Role.WRITE_ONLY]), UserController.updateUser)
    }
}

const userRouter = new UserRouter()

export default userRouter.router