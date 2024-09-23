import AppCfg from './models/AppCfgModel.js'
import { AppMode } from './interfaces/AppInterfaces.js'

const d_scope = "read_analytics,write_assigned_fulfillment_orders,read_assigned_fulfillment_orders,read_customer_events,write_customers,read_customers,write_discounts,read_discounts,write_draft_orders,read_draft_orders,write_discovery,read_discovery,write_files,read_files,read_gdpr_data_request,write_fulfillments,read_fulfillments,write_gift_cards,read_gift_cards,write_inventory,read_inventory,write_legal_policies,read_legal_policies,write_locations,read_locations,write_marketing_events,read_marketing_events,write_merchant_managed_fulfillment_orders,read_merchant_managed_fulfillment_orders,read_online_store_navigation,write_online_store_pages,read_online_store_pages,write_order_edits,read_order_edits,write_orders,read_orders,write_payment_terms,read_payment_terms,write_pixels,read_pixels,write_price_rules,read_price_rules,write_product_feeds,read_product_feeds,write_product_listings,read_product_listings,write_products,read_products,write_purchase_options,read_purchase_options,write_reports,read_reports,write_returns,read_returns,write_resource_feedbacks,read_resource_feedbacks,write_script_tags,read_script_tags,write_shipping,read_shipping,write_locales,read_locales,write_markets,read_markets,read_shopify_payments_accounts,read_shopify_payments_bank_accounts,read_shopify_payments_disputes,read_shopify_payments_payouts,write_content,read_content,write_themes,read_themes,write_third_party_fulfillment_orders,read_third_party_fulfillment_orders,write_translations,read_translations"

const config = {
    GLOBAL: {
        APP_NAME: process.env.APP_NAME || "csco-puma-new-app",
        IS_TESTING: false, 
        SU_PASSWORD: process.env.SU_PASSWORD,
    },
    APP: {
        USE_ONLINE_TOKENS: true,
        API_KEY: process.env.SHOPIFY_API_KEY,
        API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
        ACCESS_TOKEN: process.env.ACCESS_TOKEN || '',
        SCOPES: (process.env.SCOPES || d_scope).split(','),
        SHOP: process.env.SHOP || 'greenlight-csco-puma.myshopify.com',
        HOST: (process.env.HOST || 'https://rap-posting-hardcover-males.trycloudflare.com').replace(/https:\/\//, ''),
        LAMBDA_ACCESS_TOKEN: process.env.LAMBDA_ACCESS_TOKEN
    },
    DB: {
        URI: process.env.MONGODB_URI || 'mongodb+srv://neatsoull:12345@cluster0.if84o.mongodb.net/?appName=Cluster0',
        USER: process.env.MONGODB_USER || 'neatsoull',
        PASSWORD: process.env.MONGODB_PASSWORD || '12345'
    },
    CORS: {
        allowedOrigins: [
            process.env.HOST, 
            "*", 
            `http://${process.env.HOST}`, 
            `https://${process.env.HOST}`, 
            ...(process.env.CORS || '').split(',')
        ]
    },
    JWT: {
        APP_USER_EXPIRE_TIME: '2m',
        SECRET_TOKEN: process.env.JWT_SECRET,
        CLIENT_SECRET_TOKEN: process.env.CLIENT_JWT_SECRET,
    }
}


export const initChecker = async () => {    
    console.log(config);
    // await AppCfg.create({ mode: AppMode.PRODUCTION })
    // const existShop = await Shop.findOne({ domain: config.SHOPIFY_APP.SHOP })
    // if ( existShop ) config.SHOPIFY_APP.ACCESS_TOKEN = existShop.accessToken
    // const existCfg = await AppCfg.findOne()
    // if ( !existCfg ) await AppCfg.create({ mode: AppMode.DISABLED })
}

export default config