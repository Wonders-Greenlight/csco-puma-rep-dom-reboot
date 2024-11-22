import AppCfg from './models/AppCfgModel.js'
import { AppMode } from './interfaces/AppInterfaces.js'

const d_scope = "read_analytics,read_assigned_fulfillment_orders,read_content,read_customer_events,read_customers,read_discounts,read_discovery,read_draft_orders,read_files,read_fulfillments,read_gdpr_data_request,read_gift_cards,read_inventory,read_legal_policies,read_locales,read_locations,read_marketing_events,read_markets,read_merchant_managed_fulfillment_orders,read_online_store_navigation,read_online_store_pages,read_order_edits,read_orders,read_payment_terms,read_pixels,read_price_rules,read_product_feeds,read_product_listings,read_products,read_purchase_options,read_reports,read_resource_feedbacks,read_returns,read_script_tags,read_shipping,read_shopify_payments_accounts,read_shopify_payments_bank_accounts,read_shopify_payments_disputes,read_shopify_payments_payouts,read_themes,read_third_party_fulfillment_orders,read_translations,write_assigned_fulfillment_orders,write_content,write_customers,write_discounts,write_discovery,write_draft_orders,write_files,write_fulfillments,write_gift_cards,write_inventory,write_legal_policies,write_locales,write_locations,write_marketing_events,write_markets,write_merchant_managed_fulfillment_orders,write_online_store_pages,write_order_edits,write_orders,write_payment_terms,write_pixels,write_price_rules,write_product_feeds,write_product_listings,write_products,write_purchase_options,write_reports,write_resource_feedbacks,write_returns,write_script_tags,write_shipping,write_themes,write_third_party_fulfillment_orders,write_translations"

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
        SHOP: process.env.SHOP || 'activa-shop.com.do',
        HOST: (process.env.HOST || 'nine-unlike-comfort-start.trycloudflare.com').replace(/https:\/\//, ''),
        LAMBDA_ACCESS_TOKEN: process.env.LAMBDA_ACCESS_TOKEN
    },
    DB: {
        URI: 'mongodb://127.0.0.1:27017/puma_agiliza',
        USER: process.env.MONGODB_USER || 'admin',
        PASSWORD: process.env.MONGODB_PASSWORD || 'admin'
    },
    CORS: {
        allowedOrigins: [
            process.env.HOST, 
            "*", 
            "http://activa-shop.com.do", 
            "https://activa-shop.com.do", 
            'http://localhost:8081',
            'https://localhost:8081',
            `http://${process.env.APP_URL.replace(/https:\/\//, '')}`, 
            `http://${process.env.APP_URL.replace(/https:\/\//, '')}`, 
            `http://${process.env.HOST.replace(/https:\/\//, '')}`, 
            `https://${process.env.HOST.replace(/https:\/\//, '')}`, 
            ...(process.env.CORS || 'https://nine-unlike-comfort-start.trycloudflare.com,https://activa-shop.com.do').split(',')
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