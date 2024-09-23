import { Request, Response, NextFunction } from 'express'
import { UserRequest } from './UserInterface'

export type ExpressMiddleware<T = Request> = ( req: T, res: Response, next: NextFunction ) => Promise<void | Response> | void | Response