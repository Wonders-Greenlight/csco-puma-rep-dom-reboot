import mongoose from 'mongoose'
import fs from 'fs'
import { workerData, parentPort, isMainThread, threadId } from 'worker_threads'
import { LogType } from '../interfaces/AppInterfaces'
import config from '../config.js'
import BaseTaskController from './BaseTask'
import { IEvent, TASK_SUCCESS_MESSAGE, TaskState } from '@/interfaces/TaskInterfaces'

// MODELS
import '@/models/EventModel'
import Task from '@/models/TaskModel'

// CONTROLLERS
import HelpersController from '@/controllers/HelpersController.js'

// PROVIDERS
import ShopifyProvider from '@/providers/ShopifyProvider.js'
import AgilisaProvider from '@/providers/AgilisaProvider'

const Agilisa = new AgilisaProvider()

class OrderTasksController extends BaseTaskController {
    private db = mongoose.connection

    private connectDB() {
        // MongoDB settings
        mongoose.set('strictQuery', false)
        mongoose.connect(config.DB.URI)
        this.db = mongoose.connection

        return new Promise((res, rej) => {
            this.db.on('error', rej)
            this.db.on('open', res)
        })
    }

    // ------- END PRIVATE
    public async checkAppOrders( nowDate: Date | string | number ): Promise<void> {
        try {
            // const halfProcessedOrders = await Order.find({ 
            //     $and: [
            //         { orderId: { $exists: true } },
            //         { status: 0 },
            //     ]
            // })
            const halfProcessedOrders: any[] = []
            
            if ( halfProcessedOrders.length === 0 ) return

            for await (const order of halfProcessedOrders) {
                try {
                    // DO SOMETHING
                } catch (err) {
                    await order.pushLog(`Cron checker: Error while iterating => ${err.message}`, LogType.WARNING)

                    HelpersController.sendSlackMessage('Cron Order Checker', [
                        {
                            type: 'section',
                            fields: [
                                {
                                    type: 'mrkdwn',
                                    text: `*Error:*\n\`\`\`${JSON.stringify(err, null, 4)}\`\`\``
                                },
                                {
                                    type: 'mrkdwn',
                                    text: `*Order:*\n\`\`\`${JSON.stringify({
                                        id: order.id,
                                        checkout_id: order.checkoutId,
                                        order_id: order.orderId,
                                        order_name: order.orderName,
                                        created_at: order.createdAt,
                                        payed: order.payed,
                                        status: order.status
                                    }, null, 4)}\`\`\``
                                }
                            ]
                        }
                    ])
                }
            }
        } catch (err) {
            console.error(err)

            HelpersController.sendSlackMessage('Cron Order Checker - (Not Iteration)', [
                {
                    type: 'section',
                    fields: [
                        {
                            type: 'mrkdwn',
                            text: `*Error:*\n\`\`\`${JSON.stringify(err, null, 4)}\`\`\``
                        },
                        {
                            type: 'mrkdwn',
                            text: `*Status Detail:*\n\`\`\`${err.message}\`\`\``
                        }
                    ]
                }
            ])
        }
    }

    public async checkOrders({ nowDate }: { nowDate: string }) {
        try {
            await this.connectDB()
            
            await this.checkAppOrders( nowDate )
        } catch (err) {
            console.log('ERROR THREAD ORDER TASKS!')
            console.log(err.message)
        }
        
        if ( !isMainThread ) {
            parentPort?.postMessage(true)
            return
        }

        return true
    }

    public async allocateOrderInvoices({ nowDate }: { nowDate: string }) {
        const result: {
            isError?: boolean,
            success: number,
            failed: number,
            results: {
                shopifyId: number | string,
                title: string,
                observations: string,
                processedAt: number,
                status: boolean
            }[]
        } = {
            results: [],
            success: 0,
            failed: 0,
            isError: false
        }

        await this.connectDB()
        const task = await Task.findOne({ busId: workerData.pId })
        const event = task.eventId as IEvent

        if ( typeof task.innerData === 'string' && fs.existsSync(task.innerData) ) {
            const innerData = JSON.parse(fs.readFileSync(task.innerData, { encoding: 'utf-8' }))
            task.innerData = innerData
        }

        const orders = task.innerData.resources

        for (let i = 0; i < orders.length; i++) {
            const orderId = orders[i] as number
            let order

            const oInfo: any = {
                shopifyId: orderId,
                observations: 'Order successfully sent to ERP',
                processedAt: Date.now(),
                status: true,
                title: orderId,
                payload: null,
                responses: []
            }

            try {
                order = await ShopifyProvider.getOrderById(+orderId)
                oInfo.shopifyId = order.admin_graphql_api_id
                oInfo.title = order.name
            } catch (err) {
                console.error('ERROR ALLOCATING ORDER - SHOPIFY API GETTING ORDER ERROR')
                oInfo.observations = 'SHOPIFY API GETTING ORDER ERROR'
                oInfo.responses.push(err?.response?.body)
                oInfo.payload = err.payload
                oInfo.status = false
                result.failed++
                task.state = TaskState.ERROR
                oInfo.processedAt = Date.now()
                
                result.results.push(oInfo)
                result.results.sort((a,b) => a.processedAt > b.processedAt ? 1 : -1)
                await task.updateOne({ $set: { outerData: result } })

                continue
            }

            try {
                const _response = await Agilisa.insertNewOrder(orderId)
                console.log(_response)
                oInfo.responses.push(_response)

                const someError = _response.orderDetailsResult.find((x: any) => typeof x.payload !== 'undefined')
                if ( !!someError ) throw someError

                oInfo.observations = TASK_SUCCESS_MESSAGE[task.type]
                result.success++
            } catch (err) {
                console.error('ERROR ALLOCATING ORDER')
                console.log(err)
                oInfo.observations = err.message
                oInfo.query = err.query
                oInfo.payload = err.payload
                oInfo.status = false
                result.failed++
                task.state = TaskState.ERROR
                await task.updateOne({ $set: { outerData: result } })

                try {
                    await Agilisa.deleteOrderDataById(orderId) // ROLLBACK MODIFICATIONS AS NOT ALL THINGS WERE SAVED PROPERLY
                } catch (err) {
                    oInfo.observations = err.message
                }
            }

            oInfo.processedAt = Date.now()
            result.results.push(oInfo)

            result.results.sort((a,b) => a.processedAt > b.processedAt ? 1 : -1)
            await task.updateOne({ $set: { outerData: result } })
        }

        result.results.sort((a,b) => a.processedAt > b.processedAt ? 1 : -1)
        await task.updateOne({ $set: { outerData: result } })

        // ALL FAILED
        if ( result.results.length === result.failed ) {
            result.isError = true
            return parentPort?.postMessage(result)
        }

        if ( !isMainThread && !result.isError ) {
            parentPort?.postMessage(result)
            return
        }

        return result
    }

    public async runTaskAsWorker() {
        try {
            console.log('\n\nIM THREAD ID =>', threadId)
            this.listenBroadcast(this)

            const fn = workerData.fn as keyof typeof orderTasksController
            await orderTasksController[fn](workerData.args)
            await new Promise(res => setTimeout(res, 150))

            process.exit()
        } catch (err) {
            console.log(err)
            process.exit(1)
        }
    }
}

const orderTasksController = new OrderTasksController()

export default orderTasksController

if ( !isMainThread ) {
    orderTasksController.runTaskAsWorker()
}