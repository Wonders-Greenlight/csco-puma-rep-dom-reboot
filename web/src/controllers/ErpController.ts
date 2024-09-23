import { Request, Response } from 'express'
import axios from 'axios';
import { EventType, TaskPriority, TaskState, TaskType } from '../interfaces/TaskInterfaces.js';

// Models
import Event from '../models/EventModel.js'
import Task from '../models/TaskModel.js'

// Controllers & Providers
import TaskProvider from '../providers/TaskProvider.js';
import AgilisaProvider from '../providers/AgilisaProvider.js';
import SocketProvider from '../providers/SocketProvider.js';

const Agilisa = new AgilisaProvider()

class ErpController {
    async handleEvent( req: Request, res: Response ) {
        return res.sendStatus(200)
    }

    async handlePaidOrderWebhook( orderId: number ) {
        // EXIST A TASK FAILED FOR THIS ORDER ID TO BE PROCESS WITH????
        // RERUN THAT ONE IF SO, AND DO NOT CREATE A NEW EVENT
        const existTask = await Task.findOne({ 'innerData.resources': orderId })
        if ( !!existTask ) {
            const existEnqueuedOrderTask = TaskProvider.queue.find(x => 
                x.id === existTask.busId && x.type === existTask.type
            )
            if ( existEnqueuedOrderTask ) return existTask

            const taskPayload = TaskProvider.buildTaskPayloadFromDbTask(existTask)
            TaskProvider.queueTaskInPlace(taskPayload)
            return existTask
        }
        /* END OF TASK EXISTANCE CHECK */

        const newEvent = await Event.create({
            type: EventType.ALLOCATE_BILL_ORDER,
        })

        const task = await TaskProvider.add({
            priority: TaskPriority.HIGH,
            type: TaskType.ALLOCATE_BILL_ORDER,
            innerData: { resources: [orderId] },
            eventId: newEvent.id
        })

        setTimeout(() => {
            SocketProvider.emitEventToRoom(
                '/events', 
                'newEvent'
            )
        }, 500)

        return task
    }

    async getMasterProducts( req: Request, res: Response ) {
        const { page, limit, fields = '', reference, allBrands } = req.query

        try {
            if ( !!reference ) {
                const products = await Agilisa.getProductVariantsByRef(reference as string)
                return res.json(products)
            }

            const products = await Agilisa.getMasterProducts({
                page,
                limit,
                allBrands,
                fields: String(fields).split(',').filter(f => !!f)
            })

            return res.json(products)
        } catch (err) {
            return res.status(500).json({
                message: err.message
            })
        }
    }

    async getMasterProductById( req: Request, res: Response ) {
        const { id } = req.params

        try {
            const product = await Agilisa.getMasterProductById( id )
            return res.json(product)
        } catch (err) {
            return res.status(500).json({
                message: err.message
            })
        }
    }

    async getMasterProductsCount( req: Request, res: Response ) {
        const { all } = req.query
        try {
            const productsCount = await Agilisa.getMasterProductsCount({ all })

            return res.json(productsCount)
        } catch (err) {
            return res.status(500).json({
                message: err.message
            })
        }
    }

    async getMasterInventory( req: Request, res: Response ) {
        const { page, limit, fields = '', reference, allBrands } = req.query

        try {
            if ( !!reference ) {
                const products = await Agilisa.getProductVariantsByRef(reference as string)
                return res.json(products)
            }

            const products = await Agilisa.getMasterInventory({
                page,
                limit,
                allBrands,
                fields: String(fields).split(',').filter(f => !!f)
            })

            return res.json(products)
        } catch (err) {
            return res.status(500).json({
                message: err.message
            })
        }
    }

    async getMasterInventoryById( req: Request, res: Response ) {
        const { id } = req.params

        try {
            const product = await Agilisa.getMasterInventoryById(id)
            return res.json(product)
        } catch (err) {
            return res.status(500).json({
                message: err.message
            })
        }
    }

    async getMasterInventoryCount( req: Request, res: Response ) {
        const { all } = req.query

        try {
            const inventoryCount = await Agilisa.getMasterInventoryCount({ all })

            return res.json(inventoryCount)
        } catch (err) {
            return res.status(500).json({
                message: err.message
            })
        }
    }

    async getMasterBrands( req: Request, res: Response ) {
        try {
            const brands = await Agilisa.getMasterBrands()

            return res.json(brands)
        } catch (err) {
            return res.status(500).json({
                message: err.message
            })
        }
    }

    async getOrderDataById( req: Request, res: Response ) {
        const { id } = req.params
        try {
            const orderInfo = await Agilisa.getOrderDataById(id)
            
            return res.json(orderInfo)
        } catch (err) {
            return res.status(500).json({
                message: err.message
            })
        }
    }
}

export default new ErpController()
