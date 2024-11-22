import { NextFunction, Request, Response } from "express"
import ShopifyProvider, { shopify, ShopifyProvider as _Shopify } from '../providers/ShopifyProvider.js'
import { randomUUID } from 'crypto'
import TaskProvider, { TASKS } from "../providers/TaskProvider.js"
import { InnovateProductInfo, TaskPriority, TaskType } from "../interfaces/TaskInterfaces.js"
import HelpersController from "./HelpersController.js"
import config from '../config.js'
import server from "../../index.js"

// Models
import User from '../models/UserModel.js'

class ShopifyController {
    static async loginIntoApp( req: Request, res: Response, next: NextFunction ) {
        const onlineSessionId = await shopify.api.session.getCurrentId({
            isOnline: shopify.config.useOnlineTokens,
            rawRequest: req,
            rawResponse: res,
        })

        const session = res.locals.shopify?.session || 
            await ShopifyProvider.getSessionFromStorage(
                onlineSessionId
            )

        // if ( !!!onlineSessionId || !!!session ) return next()

        // const adminUser = await User.findOne({ userName: process.env.SU_USERNAME })

        // const suToken = HelpersController.createUserToken(adminUser, {
        //     expiresIn: config.JWT.APP_USER_EXPIRE_TIME
        // })

        // const refreshToken = HelpersController.createUserToken(adminUser, { noTimestamp: true })
        // server.refreshTokens.push(refreshToken)

        // res.cookie('su_at', suToken, {
        //     httpOnly: true,
        //     maxAge: 2 * 60 * 60 * 1000, // 2h duration
        //     secure: !config.GLOBAL.IS_TESTING,
        //     sameSite: 'strict',
        // })
        console.log('loginIntoApp |Logged in successfully ');
        
        return res.json({
            message: 'Logged in successfully',
            // accessToken: suToken,
            // refreshToken: refreshToken,
            socketIoSvUri: `http://localhost:${+server.app.get('port')}`
        })
    }

    static async refreshSessionToken( req: Request, res: Response ): Promise<Response> {
        console.log('checkToken |no errors yet line 53')
        const refreshToken = req.headers['x-innovate-refresh-token'] as string
        if ( !!!refreshToken || !server.refreshTokens.includes(refreshToken)) {
            return res
                .set('X-Innovate-Auth-Forbidden', 'RefreshTokenNotFound')
                .sendStatus(403)
        }
        
        const su = await User.findOne({ userName: process.env.SU_USERNAME })
        const jwtToken = HelpersController.createUserToken(su, { expiresIn: config.JWT.APP_USER_EXPIRE_TIME })
        const newRefreshToken = HelpersController.createUserToken(su, { noTimestamp: true })
        server.refreshTokens.splice(server.refreshTokens.indexOf(refreshToken), 1)
        server.refreshTokens.push(refreshToken)

        return res.json({
            accessToken: jwtToken,
            refreshToken: newRefreshToken
        })
    }

    static async checkToken( req: Request, res: Response ): Promise<Response> {
        console.log('checkToken |no errors yet line 73')
        const authHeader = req.headers['x-innovate-token'] as string
        // if ( !!!authHeader ) return res.sendStatus(401)
        const token = authHeader.split(' ')[1]
        // if ( !!!token ) return res.sendStatus(401)
        
        // const payload = await HelpersController.getJwtTokenPayload(token)
        return res.json("ok")
    }

    static async getProductsCount( req: Request, res: Response ) {
        console.log(req.headers);

        console.log('getProductsCount started')
        const onlineSessionId = await shopify.api.session.getCurrentId({
            isOnline: shopify.config.useOnlineTokens,
            rawRequest: req,
            rawResponse: res,
        })

        const offlineSessionId = shopify.api.session.getOfflineId(
            process.env.SHOP || 'puma-rep-dominicana.myshopify.com'
        )

        // use sessionId to retrieve session from app's session storage
        // getSessionFromStorage() must be provided by application
        console.log('process.env.SHOP || puma-rep-dominicana.myshopify.com')
        
        console.log('\n\nHERE SESSION!!!!')
        console.log(onlineSessionId)
        console.log(offlineSessionId)

        const dbSession = await ShopifyProvider.getSessionFromStorage(offlineSessionId)
        // console.log('getProductsCount dbSession started', dbSession)
        // const session = res.locals.shopify?.session || new Session({
        //     id: offlineSessionId,
        //     shop: process.env.SHOP,
        //     scope: process.env.SCOPES,
        //     isOnline: this.shopify.config.useOnlineTokens,
        //     accessToken: dbSession.accessToken,
        //     state: dbSession.state
        // })
        const session = res.locals.shopify?.session || dbSession

        try {
            const countData = await ShopifyProvider.getProductsCount()

            res.json(countData);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async getVariantsCount( req: Request, res: Response ) {
        // console.log(req.headers);
        
        console.log('getVariantsCount started')

        const { id } = req.params
        try {
            const countData = !!id 
                ? await ShopifyProvider.getProductVariantsCount( id )
                : await ShopifyProvider.getVariantsCount()

            res.json(countData);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async getProductById( req: Request, res: Response ) {
        try {
            const { id } = req.params
            const product = await ShopifyProvider.getProductById(id)

            return res.json(product)
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async getProducts( req: Request, res: Response ) {
        const onlineSessionId = await shopify.api.session.getCurrentId({
            isOnline: shopify.config.useOnlineTokens,
            rawRequest: req,
            rawResponse: res,
        })

        const offlineSessionId = shopify.api.session.getOfflineId(
            process.env.SHOP
        )

        // use sessionId to retrieve session from app's session storage
        // getSessionFromStorage() must be provided by application
        console.log('\n\nHERE SESSION!!!!')
        console.log(onlineSessionId)
        console.log(offlineSessionId)

        const dbSession = await ShopifyProvider.getSessionFromStorage(offlineSessionId)

        // const session = res.locals.shopify?.session || new Session({
        //     id: offlineSessionId,
        //     shop: process.env.SHOP,
        //     scope: process.env.SCOPES,
        //     isOnline: this.shopify.config.useOnlineTokens,
        //     accessToken: dbSession.accessToken,
        //     state: dbSession.state
        // })
        const session = res.locals.shopify?.session || dbSession

        try {
            const products = await ShopifyProvider.getProducts({ ...req.query })

            res.json(products);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async getWebhooks( req: Request, res: Response ) {
        try {
            const webhooks = await ShopifyProvider.getWebhooks()

            return res.json(webhooks)
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async getOrderById( req: Request, res: Response ) {
        try {
            const { id } = req.params
            const order = await ShopifyProvider.getOrderById(id)

            return res.json(order)
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async getAllProducts( req: Request, res: Response ) {
        const onlineSessionId = await shopify.api.session.getCurrentId({
            isOnline: shopify.config.useOnlineTokens,
            rawRequest: req,
            rawResponse: res,
        })

        const offlineSessionId = shopify.api.session.getOfflineId(
            process.env.SHOP
        )

        // use sessionId to retrieve session from app's session storage
        // getSessionFromStorage() must be provided by application
        console.log('\n\nHERE SESSION!!!!')
        console.log(onlineSessionId)
        console.log(offlineSessionId)

        const dbSession = await ShopifyProvider.getSessionFromStorage(offlineSessionId)

        // const session = res.locals.shopify?.session || new Session({
        //     id: offlineSessionId,
        //     shop: process.env.SHOP,
        //     scope: process.env.SCOPES,
        //     isOnline: this.shopify.config.useOnlineTokens,
        //     accessToken: dbSession.accessToken,
        //     state: dbSession.state
        // })
        const session = res.locals.shopify?.session || dbSession

        try {
            const products = await ShopifyProvider.getAllProducts({ ...req.query })

            res.json(products);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }


    static async getLocations( req: Request, res: Response ) {
        try {
            const getLocations = ShopifyProvider.throttleRest(ShopifyProvider.getLocations)

            // console.time('GET_200_LOCATIONS')
            // for (let i = 0; i < 100; i++) {
            //     var locations = await getLocations(false)
            // }
            // console.timeEnd('GET_200_LOCATIONS')

            // console.time('GET_200_LOCATIONS')
            // for (let i = 0; i < 200; i++) {
            //     var locations = await ShopifyProvider.execRestRequest(async () => 
            //         await shopify.api.rest.Location.all({ session: await ShopifyProvider.getOfflineSession() })
            //     )
            // }
            // console.timeEnd('GET_200_LOCATIONS')

            const locations = await ShopifyProvider.getLocations()

            res.json(locations);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async getLocationById( req: Request, res: Response ) {
        const { id } = req.params
        try {
            const location = ShopifyProvider.getLocationById(id)
            res.json(location);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async getInventoryLevelsByLocation( req: Request, res: Response ) {
        const { limit } = req.query
        const { locationId } = req.params

        try {
            const inventoryLevels = await ShopifyProvider.getInventoryLevels({
                location_ids: locationId,
                limit
            })

            return res.json(inventoryLevels);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async getInventoryLevels( req: Request, res: Response ) {
        const { inventory_item_ids, limit, location_ids } = req.query

        try {
            const inventoryLevels = await ShopifyProvider.getInventoryLevels({
                location_ids,
                limit,
                inventory_item_ids
            })

            return res.json(inventoryLevels);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async getAllInventoryLevels( req: Request, res: Response ) {
        const { inventory_item_ids, limit, location_ids } = req.query

        try {
            console.time('ALL_INVENTORY')
            const inventoryLevels = await ShopifyProvider.getAllInventoryLevels({
                location_ids,
                limit,
                inventory_item_ids
            })
            console.timeEnd('ALL_INVENTORY')

            return res.json(inventoryLevels);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async getInventoryItemById( req: Request, res: Response ) {
        const { id } = req.params

        try {
            const inventoryItem = await ShopifyProvider.getInventoryItemById(id)

            return res.json(inventoryItem);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async getInventoryItems( req: Request, res: Response ) {
        const { ids, limit } = req.query

        if ( !!!ids ) return res.status(400).json({ message: 'Please send "ids" query parameter, with comma separated inventory item ids' })

        try {
            const inventoryItems = await ShopifyProvider.getInventoryItems({ ids, limit })

            return res.json(inventoryItems);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async setInventoryLevel( req: Request, res: Response ) {
        const { id } = req.params
        const { locationId, available } = req.body

        try {
            await ShopifyProvider.setAvailableInventoryLevel({
                inventoryItemId: Number(id),
                locationId: Number(locationId),
                available: Number(available)
            })

            const inventoryLevels = await ShopifyProvider.getInventoryLevels({
                inventory_item_ids: id
            })

            return res.json(inventoryLevels);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async adjustInventoryLevel( req: Request, res: Response ) {
        const { id } = req.params
        const { locationId, availableAdjustment } = req.body

        try {
            await ShopifyProvider.adjustAvailableInventoryLevel({
                inventoryItemId: Number(id),
                locationId: Number(locationId),
                availableAdjustment: Number(availableAdjustment)
            })

            const inventoryLevels = await ShopifyProvider.getInventoryLevels({
                inventory_item_ids: id
            })

            return res.json(inventoryLevels);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async setVariantPrice( req: Request, res: Response ) {
        const { id } = req.params
        const { price, compareAtPrice } = req.body

        try {
            const variant = new shopify.api.rest.Variant({
                session: await ShopifyProvider.getOfflineSession(),
            })

            variant.id = Number(id)
            variant.compare_at_price = compareAtPrice
            variant.price = price
            
            await variant.save({ update: true })

            return res.json(variant);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async setVariantPriceOnProduct( req: Request, res: Response ) {
        const { pId, vId } = req.params
        const { price, compareAtPrice } = req.body

        try {
            const _product = await shopify.api.rest.Product.find({
                session: await ShopifyProvider.getOfflineSession(),
                id: Number(pId),
                fields: 'variants'
            })

            const product = await ShopifyProvider.createOrUpdateProduct({
                id: Number(pId),
                variants: [
                    ..._product.variants,
                    {
                        id: Number(vId),
                        compare_at_price: compareAtPrice,
                        price,
                    }
                ]
            })

            return res.json(product);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async getCarrierServices( req: Request, res: Response ) {
        try {
            const carrierServices = await ShopifyProvider.getCarrierServices()

            res.json(carrierServices);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async getCarrierServiceById( req: Request, res: Response ) {
        try {
            const { id } = req.params
            const carrierService = await ShopifyProvider.getCarrierServiceById(Number(id))

            res.json(carrierService);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async deleteCarrierService( req: Request, res: Response ) {
        try {
            const { id } = req.params
            const carrierService = await ShopifyProvider.getCarrierServiceById(Number(id), false)
            const _carrierService = { ...carrierService }
            delete _carrierService.session

            await carrierService.delete?.()

            res.json(carrierService);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async updateCarrierService( req: Request, res: Response ) {
        try {
            const { id } = req.params
            const { name, callback_url } = req.body
            const carrierService = await ShopifyProvider.getCarrierServiceById(Number(id), false)
            if ( !!!carrierService ) return res.status(404).json({ message: 'Carrier Service with given ID not found' })

            carrierService.name = name
            carrierService.callback_url = callback_url
            await carrierService.saveAndUpdate()

            res.json(carrierService);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async createCarrierService( req: Request, res: Response ) {
        try {
            const { name, callback_url, service_discovery = true } = req.body

            const carrierService = await ShopifyProvider.createCarrierService({
                name,
                callback_url,
                service_discovery
            })

            res.json(carrierService);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async createProduct( req: Request, res: Response ) {
        try {
            // Creating/Updating payload should be taken from request body, this
            // is an example
            const product = await ShopifyProvider.createOrUpdateProduct({
                title: "BOTA HOMBRE / WAYFINDER MID OUTDRY (REST)",
                vendor: 'COLUMBIA',
                product_type: 'CALZADO',
                status: 'active',
                variants: [
                    {
                        title: 'VARIANT 1',
                        compare_at_price: '99.00',
                        price: '49.00',
                        sku: 'var1',
                        option1: 'X',
                        option2: 'Red',
                        imageSrc: "https://images.pexels.com/photos/2775861/pexels-photo-2775861.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
                    },
                    {
                        title: 'VARIANT 2',
                        compare_at_price: '99.00',
                        price: '49.00',
                        sku: 'var2',
                        option1: 'M',
                        option2: 'Black',
                        imageSrc: "https://images.pexels.com/photos/15549494/pexels-photo-15549494.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
                    }
                ],
                options: [
                    {
                        name: 'Size',
                        values: [
                            'XS',
                            'S',
                            'M',
                            'L',
                            'XL',
                        ]
                    },
                    {
                        name: 'Color',
                        values: [
                            'Red',
                            'Black',
                            'White',
                        ]
                    },
                ],
                images: [
                    {
                        src: "https://images.pexels.com/photos/15953915/pexels-photo-15953915.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
                    },
                    {
                        src: "https://images.pexels.com/photos/9008989/pexels-photo-9008989.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
                    },
                    {
                        src: "https://images.pexels.com/photos/10648716/pexels-photo-10648716.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
                    }
                ],
                tags: 'Departamento=CALZADO, Seccion=Hombre, Familia=Botas'
            })

            return res.json(product);
        } catch (err) {
            res.status(500).json({
                message: err.message
            })
        }
    }

    static async createProductGql( req: Request, res: Response ) {
        try {
            // Creating/Updating payload should be taken from request body, this
            // is an example

            const erpProducts: InnovateProductInfo[] = []

            const exampleErpPayload = {
                erpId: randomUUID(),
                title: "BOTA HOMBRE / WAYFINDER MID OUTDRY",
                vendor: 'COLUMBIA',
                type: 'CALZADO',
                description: 'test description',
                variants: [
                    {
                        title: 'VARIANT 1',
                        compareAtPrice: '99.00',
                        price: '49.00',
                        sku: 'var1',
                        options: ['X', 'Red'],
                        imageSrc: "https://images.pexels.com/photos/2775861/pexels-photo-2775861.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load",
                        inventory: [
                            {
                                quantity: 55,
                                locationId: 67473309846
                            },
                            {
                                quantity: 77,
                                locationId: 63683559574
                            }
                        ],
                        barcode: 'ASDASD',
                        erpId: randomUUID(),
                    },
                    {
                        title: 'VARIANT 2',
                        compareAtPrice: '99.00',
                        price: '49.00',
                        sku: 'var2',
                        options: ['M', 'Black'],
                        imageSrc: "https://images.pexels.com/photos/15549494/pexels-photo-15549494.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load",
                        inventory: [
                            {
                                quantity: 55,
                                locationId: 67473309846
                            },
                            {
                                quantity: 77,
                                locationId: 63683559574
                            }
                        ],
                        barcode: 'ASDASD',
                        erpId: randomUUID(),
                    },
                    {
                        title: 'VARIANT 3',
                        compareAtPrice: '99.00',
                        price: '49.00',
                        sku: 'var3',
                        options: ['M', 'White'],
                        imageSrc: "https://images.pexels.com/photos/9008989/pexels-photo-9008989.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load",
                        inventory: [
                            {
                                quantity: 55,
                                locationId: 67473309846
                            },
                            {
                                quantity: 77,
                                locationId: 63683559574
                            }
                        ],
                        barcode: 'ASDASD',
                        erpId: randomUUID(),
                    },
                    {
                        title: 'VARIANT 4',
                        compareAtPrice: '99.00',
                        price: '49.00',
                        sku: 'var4',
                        options: ['XL', 'Green'],
                        imageSrc: "https://images.pexels.com/photos/10648716/pexels-photo-10648716.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load",
                        inventory: [
                            {
                                quantity: 55,
                                locationId: 67473309846
                            },
                            {
                                quantity: 77,
                                locationId: 63683559574
                            }
                        ],
                        barcode: 'ASDASD',
                        erpId: randomUUID(),
                    }
                ],
                options: ['Size', 'Color'],
                images: [
                    {
                        src: "https://images.pexels.com/photos/15953915/pexels-photo-15953915.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
                    },
                    // Variant 1 photo
                    {
                        src: "https://images.pexels.com/photos/2775861/pexels-photo-2775861.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
                    },
                    // Variant 2 photo
                    {
                        src: "https://images.pexels.com/photos/15549494/pexels-photo-15549494.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
                    },
                    // Variant 3 photo
                    {
                        src: "https://images.pexels.com/photos/9008989/pexels-photo-9008989.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
                    },
                    // Variant 4 photo
                    {
                        src: "https://images.pexels.com/photos/10648716/pexels-photo-10648716.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
                    },
                ],
                tags: ['Departamento=CALZADO', 'Seccion=Hombre', 'Familia=Botas']
            }

            for (let i = 0; i < 300; i++) {
                erpProducts.push({
                    ...exampleErpPayload,
                    erpId: randomUUID(),
                    title: exampleErpPayload.title + ` (GQL ${i + 1})`,
                    variants: exampleErpPayload.variants.map(x => ({
                        ...x,
                        erpId: randomUUID()
                    }))
                })
            }

            if ( !!req.query.queue ) {
                const result = await TaskProvider.add({
                    args: { nowDate: Date.now(), erpProducts, type: TaskType.CREATE_UPDATE_PRODUCTS },
                    filePath: TASKS.PRODUCT,
                    fnToCall: 'createUpdateProducts',
                    priority: TaskPriority.HIGH,
                    type: TaskType.CREATE_UPDATE_PRODUCTS
                })

                return res.json(result);
            }

            console.time(`UPDATE_${erpProducts.length}_PRODUCTS`)
            const result = await TaskProvider.runTask({
                taskFile: TASKS.PRODUCT,
                fnToCall: 'createUpdateProducts',
                args: { nowDate: Date.now(), erpProducts },
                type: TaskType.CREATE_UPDATE_PRODUCTS,
            })
            console.timeEnd(`UPDATE_${erpProducts.length}_PRODUCTS`)
            
            return res.json(result);
        } catch (err) {
            res.status(500).json({
                message: err.message,
                err
            })
        }
    }

    static async updateProductGql( req: Request, res: Response ) {
        try {
            const erpProducts: InnovateProductInfo[] = []

            erpProducts.push(
                {
                    erpId: 7772337569942,
                    shopifyId: 7772337569942,
                    description: 'UPDATED DESCRIPTION',
                    variants: [
                        {
                            erpId: 42589838934166,
                            shopifyId: 42589838934166,
                            price: '55.55',
                            compareAtPrice: '100',
                            sku: 'new-var-y',
                            inventory: [
                                {
                                    locationId: 67540123798,
                                    quantity: 55
                                },
                                {
                                    locationId: 63683559574,
                                    quantity: 77
                                },
                                {
                                    locationId: 67541991574,
                                    quantity: 99
                                },
                            ]
                        },
                        {
                            erpId: 42589839065238,
                            shopifyId: 42589839065238,
                            price: '77.00',
                            compareAtPrice: '100',
                            sku: 'new-var-x',
                            inventory: [
                                {
                                    locationId: 67540123798,
                                    quantity: 55
                                },
                                {
                                    locationId: 63683559574,
                                    quantity: 77
                                },
                                {
                                    locationId: 67541991574,
                                    quantity: 99
                                },
                            ]
                        }
                    ]
                }
            )

            console.time(`UPDATE_${erpProducts.length}_PRODUCTS`)
            const result = await TaskProvider.runTask({
                args: { nowDate: Date.now(), erpProducts },
                type: TaskType.UPDATE_STOCK,
            })
            console.timeEnd(`UPDATE_${erpProducts.length}_PRODUCTS`)
            
            return res.json(result);
        } catch (err) {
            res.status(500).json({
                message: err.message,
                err
            })
        }
    }

    static async getProductGql( req: Request, res: Response ) {
        try {
            const product = await ShopifyProvider.gqlGetProductsByQuery(req.query.query as string)
            
            return res.json(product);
        } catch (err) {
            res.status(500).json({
                message: err.message,
                err
            })
        }
    }

    static async bulkInventoryUpdate( req: Request, res: Response ) {
        try {
            const locationId1 = 'gid://shopify/Location/63683559574'
            const locationId2 = 'gid://shopify/Location/67473309846'
            const locationId3 = 'gid://shopify/Location/67540123798'

            // const test = await ShopifyProvider.activateInventoryLevel({
            //     inventoryItemId: 44671396479126,
            //     locationId: 67540123798,
            // })

            // const input: GqlAdjustInventoryInput = {
            //     changes: [
            //         {
            //             delta: 15,
            //             inventoryItemId: 'gid://shopify/InventoryItem/44671396479126',
            //             locationId: locationId1
            //         },
            //         {
            //             delta: 35,
            //             inventoryItemId: 'gid://shopify/InventoryItem/44671396479126',
            //             locationId: locationId2
            //         },
            //         {
            //             delta: 5,
            //             inventoryItemId: 'gid://shopify/InventoryItem/44671396479126',
            //             locationId: locationId3
            //         }
            //     ],
            //     name: 'available',
            //     reason: ADJUST_INVENTORY_REASON.CORRECTION
            // }

            // console.time('TEST_1')
            // const test = await ShopifyProvider.gqlAdjustQuantities(input)
            // console.timeEnd('TEST_1')

            const erpProducts: InnovateProductInfo[] = []
            erpProducts.push(
                {
                    erpId: randomUUID(),
                    shopifyId: 7765729738902,
                    variants: [
                        {
                            erpId: randomUUID(),
                            shopifyId: 42574547550358,
                            inventory: [
                                {
                                    locationId: 63683559574,
                                    quantity: 10
                                },
                                {
                                    locationId: 67473309846,
                                    quantity: 15
                                },
                                {
                                    locationId: 67540123798,
                                    quantity: 20
                                },
                            ]
                        },
                    ]
                }
            )

            console.time('TEST_2')
            const result = await TaskProvider.runTask({
                taskFile: TASKS.PRODUCT,
                fnToCall: 'createUpdateProducts',
                args: { nowDate: Date.now(), erpProducts },
                type: TaskType.CREATE_UPDATE_PRODUCTS,
            })
            console.timeEnd('TEST_2')

            return res.json( result );
        } catch (err) {
            res.status(500).json({
                message: err.message,
                err
            })
        }
    }
}

export default ShopifyController