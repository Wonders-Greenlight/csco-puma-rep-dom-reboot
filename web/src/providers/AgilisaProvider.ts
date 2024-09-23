import { parentPort, isMainThread } from 'worker_threads'
import { ShopifyBrand, ShopifyItemProduct, ShopifyItemProductInventory, ShopifyOrder, ShopifyOrderDetail } from '../interfaces/ErpInterfaces.js';
import AppCfgModel from '../models/AppCfgModel.js';
import axios from 'axios';
import sql from 'mssql'
import ShopifyProvider from './ShopifyProvider.js'
import LocationModel from '../models/LocationModel.js';
import { logger } from '../utils/utils.js'

class AgilisaProvider {
    static PROVIDER_CALLS: number = 0;
    private IS_SANDBOX_PROXY: boolean = false;
    private PROXY_SV_DOMAIN: string = process.env.PROXY_SV_DOMAIN || '';
    private SV_DOMAIN!: string;
    private DB_NAME!: string;
    private DB_PW!: string;
    private DB_USER!: string;
    private ACTIVE_BRAND_IDS: (string | number)[] = [];
    private RETRIEVE_ONLY_AVAILABLE_STOCK: boolean = true;

    constructor() {
        this.setup(false)
    }

    private async setup( isOrderQuery: boolean = false ) {
        const appCfg = await AppCfgModel.findOne()

        this.PROXY_SV_DOMAIN = process.env.PROXY_SV_DOMAIN  || ''
        if ( !!!appCfg ) return
        this.SV_DOMAIN = !isOrderQuery ? appCfg?.appModeCfg?.apiUrl : appCfg?.appModeCfg?.apiSecondaryUrl
        this.DB_NAME = !isOrderQuery ? appCfg?.dbName : appCfg?.dbOrdersName
        this.DB_USER = appCfg?.dbUserName
        this.DB_PW = appCfg?.dbPassword
        this.ACTIVE_BRAND_IDS = appCfg?.apiBrandIds || []
        this.RETRIEVE_ONLY_AVAILABLE_STOCK = appCfg?.productRetrieveOnlyAvailable || true
    }
    
    private getSqlDbConfig(): sql.config {
        return {
            user: this.DB_USER,
            password: this.DB_PW,
            database: this.DB_NAME,
            server: this.SV_DOMAIN,
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000
            },
            options: {
                encrypt: true, // for azure
                trustServerCertificate: true // change to true for local dev / self-signed certs
            }
        }
    }

    private async execSqlCmd({ query, inputs, isOrderQuery = false }: { query: string, inputs?: any[], isOrderQuery?: boolean }) {
        try {
            await this.setup(isOrderQuery)
            const sqlConfig = this.getSqlDbConfig()
            const pool = await sql.connect(sqlConfig)

            const request = pool.request()
            if ( !!inputs ) {
                inputs.forEach((input: [string, any, any]) => request.input(...input))
            }

            const result = await request.query(query)
            await pool.close()

            AgilisaProvider.PROVIDER_CALLS++
    
            return result
        } catch (err) {
            console.error(`Error running sql cmd fn =>`, err.message)
            err.query = query
            throw err
        }
    }

    private async execQueryOnProxyServer({ query }: { query: string }) {
        try {
            await this.setup()
            const { data } = await axios.post(this.PROXY_SV_DOMAIN, { query })
    
            return data
        } catch (err) {
            console.error(`Error running sql cmd fn =>`, err.message)
            throw err
        }
    }
    /* ------------------- END PRIVATE */

    public async getAllMasterProducts({ limit = 2500, fields = [] }: any): Promise<ShopifyItemProduct[]> {
        await this.setup()
        const count = await this.getMasterProductsCount()
        const pages = Math.ceil(count / limit)

        const cfg = await AppCfgModel.findOne()        
        const where = cfg.productRetrieveOnlyWebItem ? 'WHERE (WebItem = 1)' : ''
        
        const products = []

        for (let i = 0; i < pages; i++) {
            let page = i + 1

            const log = `REQUESTING ALL PRODUCTS WITH PAGE ${page} of ${pages} | LIMIT: ${limit}`
            if ( !isMainThread ) {
                parentPort.postMessage({ action: 'message', payload: log })
            } else logger(log)

            const dbProducts = await this.getMasterProducts({ limit, fields, page, where })
            products.push(...dbProducts)
        }

        return products
    }

    public async getMasterBrands({ fields = [] }: any = {}): Promise<ShopifyBrand[]> {
        await this.setup()
        const _fields = fields.map((x: string) => `[${x}]`).join(',')

        let query = `
            SELECT 
            ${!!fields.length ? _fields : '*'}
            FROM [${this.DB_NAME}].[dbo].[vw_Shopify_Stores]
        `.trim()

        if ( this.IS_SANDBOX_PROXY ) {
            const brands = await this.execQueryOnProxyServer({ query })
            return brands
        }

        const brands = await this.execSqlCmd({ query })

        return brands.recordset
    }

    public async getMasterProducts({ limit = 2500, fields = [], page = 1, all = false, where = '', allBrands = false }: any): Promise<ShopifyItemProduct[]> {
        await this.setup()
        const _fields = fields.map((x: string) => `[${x}]`).join(',')

        if ( !!!where && !allBrands ) {
            where = `WHERE Brand_Id IN (${this.ACTIVE_BRAND_IDS.join(',')})`
        } else if ( !!where && !allBrands ) {
            where += ` AND Brand_Id IN (${this.ACTIVE_BRAND_IDS.join(',')})`
        }

        let query = `
            SELECT 
            ${!!fields.length ? _fields : '*'}
            FROM [${this.DB_NAME}].[dbo].[vw_Shopify_Item]
            ${where}
            ORDER BY ItemLookupCode ASC
            ${!!!all && `OFFSET ${(page - 1) * limit} ROWS 
            FETCH NEXT ${limit} ROWS ONLY` || ''}
        `.trim()

        if ( this.IS_SANDBOX_PROXY ) {
            const products = await this.execQueryOnProxyServer({ query })
            return products
        }

        const products = await this.execSqlCmd({ query })

        return products.recordset
    }

    public async getMasterProductsCount({ all = false }: any = {}): Promise<number> {
        await this.setup()

        let where = all ? '' : `WHERE Brand_Id IN (${this.ACTIVE_BRAND_IDS.join(',')})`

        let query = `
            SELECT COUNT
            (*)
            FROM [${this.DB_NAME}].[dbo].[vw_Shopify_Item]
            ${where}
        `.trim()

        if ( this.IS_SANDBOX_PROXY ) {
            const count = await this.execQueryOnProxyServer({ query })
            return Number(count.at(0)[''])
        }

        const count = await this.execSqlCmd({ query })

        return Number(Object.values(count.recordset.at(0)).at(0))
    }

    public async getMasterProductById( lookupId: string ): Promise<ShopifyItemProduct> {
        await this.setup()

        let query = `
            SELECT 
            *
            FROM [${this.DB_NAME}].[dbo].[vw_Shopify_Item]
            WHERE ItemLookupCode = '${lookupId}'
        `.trim()

        if ( this.IS_SANDBOX_PROXY ) {
            const products = await this.execQueryOnProxyServer({ query })
            return products.at(0)
        }

        const products = await this.execSqlCmd({ query })

        return products.recordset.at(0)
    }

    public async getProductVariantsByRef( reference: string ): Promise<ShopifyItemProduct[]> {
        await this.setup()

        let query = `
            SELECT 
            *
            FROM [${this.DB_NAME}].[dbo].[vw_Shopify_Item]
            WHERE Reference LIKE '%${reference}%'
        `.trim()

        if ( this.IS_SANDBOX_PROXY ) {
            const variants = await this.execQueryOnProxyServer({ query })
            return variants
        }

        const variants = await this.execSqlCmd({ query })

        return variants.recordset
    }

    public async getAllMasterInventory({ limit = 2500, fields = [] }: any): Promise<ShopifyItemProductInventory[]> {
        await this.setup()

        const count = await this.getMasterInventoryCount()
        const pages = Math.ceil(count / limit)
        
        const products = []

        for (let i = 0; i < pages; i++) {
            let page = i + 1

            const log = `REQUESTING ALL INVENTORY WITH PAGE ${page} of ${pages} | LIMIT: ${limit}`
            if ( !isMainThread ) {
                parentPort.postMessage({ action: 'message', payload: log })
            } else logger(log)

            const dbProducts = await this.getMasterInventory({ limit, fields, page })
            products.push(...dbProducts)
        }

        return products
    }

    public async getMasterInventory({ limit = 2500, fields = [], page = 1, all = false, where = '', allBrands = false }: any): Promise<ShopifyItemProductInventory[]> {
        const _fields = fields.map((x: string) => `[${x}]`).join(',')

        if ( !!!where && !allBrands ) {
            where = `WHERE Brand_Id IN (${this.ACTIVE_BRAND_IDS.join(',')})`
        } else if ( !!where && !allBrands ) {
            where += ` AND Brand_Id IN (${this.ACTIVE_BRAND_IDS.join(',')})`
        }

        if ( this.RETRIEVE_ONLY_AVAILABLE_STOCK ) {
            if ( !!where ) where += ' AND Quantity > 0'
            else where = 'WHERE Quantity > 0'
        }
        
        let query = `
            SELECT 
            ${!!fields.length ? _fields : '*'}
            FROM [${this.DB_NAME}].[dbo].[vw_Shopify_Item_Inventory]
            ${where}
            ORDER BY ItemLookupCode ASC
            ${!!!all && `OFFSET ${(page - 1) * limit} ROWS 
            FETCH NEXT ${limit} ROWS ONLY` || ''}
        `.trim()

        if ( this.IS_SANDBOX_PROXY ) {
            const productInventory = await this.execQueryOnProxyServer({ query })
            return productInventory
        }

        const productInventory = await this.execSqlCmd({ query })

        return productInventory.recordset
    }

    public async getMasterInventoryCount({ all = false }: any = {}): Promise<number> {
        await this.setup()

        let where = all ? '' : `WHERE Brand_Id IN (${this.ACTIVE_BRAND_IDS.join(',')})`

        if ( this.RETRIEVE_ONLY_AVAILABLE_STOCK ) {
            if ( !!where ) where += ' AND Quantity > 0'
            else where = 'WHERE Quantity > 0'
        }

        let query = `
            SELECT COUNT
            (*)
            FROM [${this.DB_NAME}].[dbo].[vw_Shopify_Item_Inventory]
            ${where}
        `.trim()

        if ( this.IS_SANDBOX_PROXY ) {
            const count = await this.execQueryOnProxyServer({ query })
            return Number(count.at(0)[''])
        }

        const count = await this.execSqlCmd({ query })

        return Number(Object.values(count.recordset.at(0)).at(0))
    }

    public async getMasterInventoryById( lookupId: string, fields: string[] = [] ): Promise<ShopifyItemProductInventory[]> {
        await this.setup()
        const _fields = fields.map((x: string) => `[${x}]`).join(',')

        let query = `
            SELECT 
            ${!!fields.length ? _fields : '*'}
            FROM [${this.DB_NAME}].[dbo].[vw_Shopify_Item_Inventory]
            WHERE ItemLookupCode = '${lookupId}'
        `.trim()

        if ( this.IS_SANDBOX_PROXY ) {
            const inventory = await this.execQueryOnProxyServer({ query })
            return inventory
        }

        const inventory = await this.execSqlCmd({ query })

        return inventory.recordset
    }

    public async getProductVariantsInventoryByRef( reference: string ): Promise<ShopifyItemProduct[]> {
        await this.setup()

        let query = `
            SELECT 
            *
            FROM [${this.DB_NAME}].[dbo].[vw_Shopify_Item_Inventory]
            WHERE Reference LIKE '%${reference}%'
        `.trim()

        if ( this.IS_SANDBOX_PROXY ) {
            const variants = await this.execQueryOnProxyServer({ query })
            return variants
        }

        const variants = await this.execSqlCmd({ query })

        return variants.recordset
    }

    public async insertNewOrderInfo( fields: { name: string, value: any }[] = [] ): Promise<ShopifyItemProductInventory[]> {
        await this.setup(true)

        const NameType: { [k: string]: ( x?: any ) => any; } = {
            OrderNumber: String,
            // OrderDate: (x: any) => '@OrderDate',
            OrderDate: String,
            CustomerName: String,
            CustomerCode: String,
            Address1: String,
            Address2: String,
            Address3: String,
            City: String,
            Email: String,
            PhoneNumber: String,
            // Tax: (x: any) => '@Tax',
            // Total: (x: any) => '@Total',
            Tax: Number,
            Total: Number,
            Comment: String,
            PickupInfo: String,
        }
        const fieldNames = fields.map(x => `[${x.name}]`).join(',')
        const fieldValues = fields.map(x => JSON.stringify(NameType[x.name](x.value || '')).replaceAll?.('\"', '\'')).join(',')

        let query = `
            INSERT INTO [Shopify_Order]
            (${fieldNames})
            VALUES
            (${fieldValues})
        `.trim()

        const inputs = [
            ['@OrderDate', sql.DateTime, new Date(fields.find(x => x.name === 'OrderDate')?.value)],
            ['@Tax', sql.Money, fields.find(x => x.name === 'Tax')?.value],
            ['@Total', sql.Money, fields.find(x => x.name === 'Total')?.value],
        ]

        if ( this.IS_SANDBOX_PROXY ) {
            const sendOrder = await this.execQueryOnProxyServer({ query })
            return sendOrder
        }

        const sendOrder = await this.execSqlCmd({ query, inputs, isOrderQuery: true })

        return sendOrder.recordset
    }

    public async insertNewOrderProductDetails( fields: { name: string, value: any }[] = [] ): Promise<ShopifyItemProductInventory[]> {
        await this.setup(true)

        const NameType: { [k: string]: ( x?: any ) => any; } = {
            OrderNumber: String,
            ItemLookupCode: String,
            ItemDescription: String,
            Quantity: Number,
            // Price: (x: any) => '@Price',
            Price: Number,
            RowID: String,
        }

        const fieldNames = fields.map(x => `[${x.name}]`).join(',')
        const fieldValues = fields.map(x => JSON.stringify(NameType[x.name](x.value || '')).replaceAll?.('\"', '\'')).join(',')

        let query = `
            INSERT INTO [Shopify_OrderDetail]
            (${fieldNames})
            VALUES
            (${fieldValues})
        `.trim()

        const inputs = [
            ['@Price', sql.Money, fields.find(x => x.name === 'Price')?.value],
        ]

        if ( this.IS_SANDBOX_PROXY ) {
            const sendOrderDetails = await this.execQueryOnProxyServer({ query })
            return sendOrderDetails
        }

        const sendOrderDetails = await this.execSqlCmd({ query, inputs, isOrderQuery: true })

        return sendOrderDetails.recordset
    }

    public async insertNewOrder( orderId: string | number ): Promise<{ orderResult: any, orderDetailsResult: any }> {
        await this.setup(true)

        const cfg = await AppCfgModel.findOne()
        const order = await ShopifyProvider.getOrderById(orderId, false)
        // Insert new order info
        const { customer, shipping_address, billing_address } = order

        const isPickup = !!!shipping_address
        const address = billing_address || shipping_address || customer?.default_address || {}
        const customerName = `${customer?.first_name || address.first_name} ${customer?.last_name || address.last_name}` 
        const customerCode = String(customer?.id || order.email)

        let locationId: any = null
        const fulfillment = Array.isArray(order.fulfillments) && order.fulfillments.length > 0
            ? order.fulfillments[0] 
            : { location_id: 0 }
        locationId = order.location_id || fulfillment.location_id

        if ( !!!locationId ) {
            const fulfillmentOrders = await ShopifyProvider.queueRestRequest(async () =>
                await ShopifyProvider.getFulfillmentOrdersByOrderId(order.id)
            )
            if ( (fulfillmentOrders || []).length > 0 ) {
                locationId = fulfillmentOrders[0].assigned_location_id
            }
        }

        const locationDb = await LocationModel.findOne({
            shopifyId: locationId
        })

        let pickupLocation = !isPickup
            ? 'SHIPPING'
            // : order.note_attributes.find(x => x.key === 'PickupLocation')?.value || ''
            : locationDb?.name || 'Not assigned (not found on DB)'

        const brands = await this.getMasterBrands()
        const activeBrands = cfg.apiBrandIds
        const brand = brands.filter(x => 
            activeBrands.map(b => String(b)).includes(String(x.Brand_Id))
        )
        const brandName = brand?.at(0)?.StoreName?.split(' ').at(0) || 'Not found'
        pickupLocation += ` (Tienda: ${brandName})`

        const saveOrderPayload = [
            { name: 'OrderNumber', value: order.id },
            { name: 'OrderDate', value: order.created_at.replace(/-[^-]*$/, '') },
            { name: 'CustomerName', value: customerName },
            { name: 'CustomerCode', value: customerCode },
            { name: 'Address1', value: (address.address1 || '').slice(0, 100) },
            { name: 'Address2', value: (address.address2 || '').slice(0, 100) },
            { name: 'Address3', value: address.zip },
            { name: 'City', value: (address.city || '').slice(0, 50) },
            { name: 'Email', value: order.email },
            { name: 'PhoneNumber', value: address.phone },
            { name: 'Tax', value: order.current_total_tax },
            { name: 'Total', value: order.current_total_price },
            { name: 'Comment', value: order.note },
            { name: 'PickupInfo', value: pickupLocation },
        ]

        let saveOrderResult
        try {
            const existOrderHeader = await this.getOrderHeaderById(order.id)
            
            logger(existOrderHeader)

            saveOrderResult = existOrderHeader.length === 0
                ? await this.insertNewOrderInfo(saveOrderPayload) || 'OK'
                : 'OK (ALREADY ON DB)'
        } catch (err) {
            throw {
                err,
                message: err.message,
                payload: { orderResult: saveOrderPayload, query: err.query }
            }
        }

        // Insert new order product details
        const lineItems = [...order.line_items]
        if ( !isPickup ) {
            lineItems.push({
                id: 'SHIPPING',
                sku: 'SHIPPING',
                quantity: 1,
                title: 'Shipping cost',
                price: Number(order.shipping_lines.at(0)?.price),
                total_discount: '0.00'
            })
            
            logger(Number(order.shipping_lines.at(0)?.price))
        }


        const orderDetailResults = []

        const existOrderDetails = await this.getOrderDetailsById(order.id)
        logger(existOrderDetails)
        for await (const item of lineItems)  {
            // BUILD PAYLOAD FOR EACH PRODUCT
            const orderDetailPayload = [
                { name: 'OrderNumber', value: order.id },
                { name: 'ItemLookupCode', value: item.sku },
                { name: 'ItemDescription', value: item.title },
                { name: 'Quantity', value: item.quantity },
                { name: 'Price', value: Number(item.price) - Number(item.total_discount) },
                { name: 'RowID', value: String(item.id) },
            ]

            let saveOrderDetailResult
            try {
                const existThisDetail = existOrderDetails.find(_item => _item.ItemLookupCode === item.sku)
                saveOrderDetailResult = !!!existThisDetail 
                    ? await this.insertNewOrderProductDetails(orderDetailPayload) || `${item.sku} => OK`
                    : `${item.sku} => OK (ALREADY ON DB)`
            } catch (err) {
                saveOrderDetailResult = {
                    err,
                    message: err.message,
                    payload: orderDetailPayload,
                    query: err.query
                }
            }

            orderDetailResults.push(saveOrderDetailResult)
        }

        return {
            orderResult: saveOrderResult,
            orderDetailsResult: orderDetailResults
        }
    }

    public async getOrderHeaderById( id: string | number ): Promise<ShopifyOrder[]> {
        await this.setup(true)

        let query = `
            SELECT 
            *
            FROM [${this.DB_NAME}].[dbo].[Shopify_Order]
            WHERE OrderNumber LIKE '%${id}%'
        `.trim()

        if ( this.IS_SANDBOX_PROXY ) {
            const variants = await this.execQueryOnProxyServer({ query })
            return variants
        }

        const orderHeader = await this.execSqlCmd({ query, isOrderQuery: true })

        return orderHeader.recordset
    }

    public async getOrderHeaders(): Promise<ShopifyOrder[]> {
        await this.setup(true)

        let query = `
            SELECT 
            *
            FROM [${this.DB_NAME}].[dbo].[Shopify_Order]
        `.trim()

        if ( this.IS_SANDBOX_PROXY ) {
            const variants = await this.execQueryOnProxyServer({ query })
            return variants
        }

        const orderHeader = await this.execSqlCmd({ query, isOrderQuery: true })

        return orderHeader.recordset
    }

    public async getOrderDetailsById( id: string | number ): Promise<ShopifyOrderDetail[]> {
        await this.setup(true)

        let query = `
            SELECT 
            *
            FROM [${this.DB_NAME}].[dbo].[Shopify_OrderDetail]
            WHERE OrderNumber LIKE '%${id}%'
        `.trim()

        if ( this.IS_SANDBOX_PROXY ) {
            const variants = await this.execQueryOnProxyServer({ query })
            return variants
        }

        const orderDetails = await this.execSqlCmd({ query, isOrderQuery: true })

        return orderDetails.recordset
    }

    public async getOrderDataById( id: string | number ): Promise<{ header: ShopifyOrder[]; details: ShopifyOrderDetail[] }> {
        const header = await this.getOrderHeaderById(id)
        const details = await this.getOrderDetailsById(id)

        return {
            header,
            details
        }
    }

    public async deleteOrderHeaderById( id: string | number ): Promise<ShopifyOrder[]> {
        await this.setup(true)

        let query = `
            DELETE 
            FROM [${this.DB_NAME}].[dbo].[Shopify_Order]
            WHERE OrderNumber = '${id}'
        `.trim()

        if ( this.IS_SANDBOX_PROXY ) {
            const variants = await this.execQueryOnProxyServer({ query })
            return variants
        }

        const orderHeader = await this.execSqlCmd({ query, isOrderQuery: true })

        return orderHeader.recordset
    }

    public async deleteOrderDetailsById( id: string | number ): Promise<ShopifyOrderDetail[]> {
        await this.setup(true)

        let query = `
            DELETE 
            FROM [${this.DB_NAME}].[dbo].[Shopify_OrderDetail]
            WHERE OrderNumber = '${id}'
        `.trim()

        if ( this.IS_SANDBOX_PROXY ) {
            const variants = await this.execQueryOnProxyServer({ query })
            return variants
        }

        const orderDetails = await this.execSqlCmd({ query, isOrderQuery: true })

        return orderDetails.recordset
    }

    public async deleteOrderDataById( id: string | number ): Promise<{ header: ShopifyOrder[]; details: ShopifyOrderDetail[] }> {
        const header = await this.deleteOrderHeaderById(id)
        const details = await this.deleteOrderDetailsById(id)

        return {
            header,
            details
        }
    }
}

export default AgilisaProvider