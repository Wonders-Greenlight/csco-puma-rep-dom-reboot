import { Response, Request, NextFunction } from 'express';
import { ExpressMiddleware } from '../interfaces/ServerInterfaces';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import UserModel from '@/models/UserModel';

import { IUserJWT, Role, UserRequest } from '../interfaces/UserInterface'
import HelpersController from '@/controllers/HelpersController';
import { shopify } from '../providers/ShopifyProvider.js'

const trustedOrigins = [
    config.APP.HOST, 
    `https://${config.APP.HOST}`, 
    `https://${config.APP.SHOP}`,
]

const whitePaths = [
    '/iframe/close',
    'socket.io',
    '/payment/start'
]

export const roleChecker: ( role: Role | Role[] ) => ExpressMiddleware<UserRequest> = ( role ) => {
    const roles = Array.isArray(role) ? role : [role]

    return ( req, res, next ) => {
        const { user } = req

        const roleMatch = !!user?.roles?.some(r => roles.includes(r))
        const fullPath = req.baseUrl + req.path
    
        if ( whitePaths.some(path => fullPath.includes(path)) ) return next()

        if ( !user ) return res.sendStatus(401)
        if ( !roleMatch ) return res.status(401).json({ message: 'Your user doesnt have permissions to access this resource' })

        next()
    }
}

export const authenticateJwt: ExpressMiddleware<UserRequest> = async ( req, res, next ) => {
    const { origin, host } = req.headers

    const suQuery = req.query.innovate_su 
    if ( typeof suQuery !== 'undefined' && suQuery === process.env.SU_PASSWORD ) {
        const adminUser = await UserModel.findOne({ userName: process.env.SU_USERNAME })

        if ( !!!adminUser ) return next()

        req.user = {
            roles: adminUser.roles,
            userName: adminUser.userName,
            id: adminUser.id,
        }

        return next()
    }
    
    const authHeader = req.headers['x-innovate-token'] as string
    if ( !!authHeader ) return jwtProcessor(req, res, next)

    const fullPath = req.baseUrl + req.path
    
    if ( config.GLOBAL.IS_TESTING ) return next() // COMMENT THIS LINE TO REALLY CHECK HOW PRODUCTION AUTH WORKS
    if ( whitePaths.some(path => fullPath.includes(path)) ) return next()

    if ( !origin || !trustedOrigins.includes(origin) ) return jwtProcessor(req, res, next)

    next()
}

const jwtProcessor: ExpressMiddleware<UserRequest> = async ( req, res, next ) => {
    const authHeader = req.headers['x-innovate-token'] as string
    if ( !!!authHeader ) return res.status(401).json({ message: 'No required header with JWT' })

    const token = authHeader && authHeader.split(' ')[1]
    if ( !!!token ) return res.status(401).json({ message: 'No JWT token found on headers' })

    jwt.verify(token, config.JWT.SECRET_TOKEN, (err, user: IUserJWT) => {
        if ( err ) {
            console.log(err.name, (err as any).expiredAt)
            return res.sendStatus(403)
        }
        
        req.user = user
        next()
    })
}

export const createFirstApiAdminUser: ExpressMiddleware<UserRequest> = async ( req, res, next ) => {
    // Create Super User to give a full access token to the FED app
    const { user } = await HelpersController.createNewApiUser({
        userName: process.env.SU_USERNAME as string,
        password: process.env.SU_PASSWORD as string,
        roles: [Role.ADMIN]
    })

    req.user = {
        id: user.id,
        userName: user.userName,
        roles: user.roles
    }

    next()
}