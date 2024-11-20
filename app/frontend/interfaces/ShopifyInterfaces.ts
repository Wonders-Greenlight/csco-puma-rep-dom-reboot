import { ApiVersion, DataType } from '@shopify/shopify-api'
import { ObjectValues } from './AppInterfaces';
// REST RESOURCES
import { Customer } from '@shopify/shopify-api/rest/admin/2023-01/customer';
import { Product } from '@shopify/shopify-api/rest/admin/2023-01/product';
import { Order } from '@shopify/shopify-api/rest/admin/2023-01/order';
import { Metafield } from '@shopify/shopify-api/rest/admin/2023-01/metafield';
import { Transaction as ShopifyTransaction } from '@shopify/shopify-api/rest/admin/2023-01/transaction';
import { Webhook as ShopifyWebhook } from '@shopify/shopify-api/rest/admin/2023-01/webhook';

export const WebhookTopics = {
    APP_PURCHASES_ONE_TIME_UPDATE: 'APP_PURCHASES_ONE_TIME_UPDATE',
    APP_SUBSCRIPTIONS_APPROACHING_CAPPED_AMOUNT: 'APP_SUBSCRIPTIONS_APPROACHING_CAPPED_AMOUNT',
    APP_SUBSCRIPTIONS_UPDATE: 'APP_SUBSCRIPTIONS_UPDATE',
    APP_UNINSTALLED: 'APP_UNINSTALLED',
    ATTRIBUTED_SESSIONS_FIRST: 'ATTRIBUTED_SESSIONS_FIRST',
    ATTRIBUTED_SESSIONS_LAST: 'ATTRIBUTED_SESSIONS_LAST',
    BULK_OPERATIONS_FINISH: 'BULK_OPERATIONS_FINISH',
    CARTS_CREATE: 'CARTS_CREATE',
    CARTS_UPDATE: 'CARTS_UPDATE',
    CHANNELS_DELETE: 'CHANNELS_DELETE',
    CHECKOUTS_CREATE: 'CHECKOUTS_CREATE',
    CHECKOUTS_DELETE: 'CHECKOUTS_DELETE',
    CHECKOUTS_UPDATE: 'CHECKOUTS_UPDATE',
    COLLECTIONS_CREATE: 'COLLECTIONS_CREATE',
    COLLECTIONS_DELETE: 'COLLECTIONS_DELETE',
    COLLECTIONS_UPDATE: 'COLLECTIONS_UPDATE',
    COLLECTION_LISTINGS_ADD: 'COLLECTION_LISTINGS_ADD',
    COLLECTION_LISTINGS_REMOVE: 'COLLECTION_LISTINGS_REMOVE',
    COLLECTION_LISTINGS_UPDATE: 'COLLECTION_LISTINGS_UPDATE',
    COLLECTION_PUBLICATIONS_CREATE: 'COLLECTION_PUBLICATIONS_CREATE',
    COLLECTION_PUBLICATIONS_DELETE: 'COLLECTION_PUBLICATIONS_DELETE',
    COLLECTION_PUBLICATIONS_UPDATE: 'COLLECTION_PUBLICATIONS_UPDATE',
    CUSTOMERS_CREATE: 'CUSTOMERS_CREATE',
    CUSTOMERS_DELETE: 'CUSTOMERS_DELETE',
    CUSTOMERS_DISABLE: 'CUSTOMERS_DISABLE',
    CUSTOMERS_ENABLE: 'CUSTOMERS_ENABLE',
    CUSTOMERS_MARKETING_CONSENT_UPDATE: 'CUSTOMERS_MARKETING_CONSENT_UPDATE',
    CUSTOMERS_UPDATE: 'CUSTOMERS_UPDATE',
    CUSTOMER_GROUPS_CREATE: 'CUSTOMER_GROUPS_CREATE',
    CUSTOMER_GROUPS_DELETE: 'CUSTOMER_GROUPS_DELETE',
    CUSTOMER_GROUPS_UPDATE: 'CUSTOMER_GROUPS_UPDATE',
    CUSTOMER_PAYMENT_METHODS_CREATE: 'CUSTOMER_PAYMENT_METHODS_CREATE',
    CUSTOMER_PAYMENT_METHODS_REVOKE: 'CUSTOMER_PAYMENT_METHODS_REVOKE',
    CUSTOMER_PAYMENT_METHODS_UPDATE: 'CUSTOMER_PAYMENT_METHODS_UPDATE',
    DISPUTES_CREATE: 'DISPUTES_CREATE',
    DISPUTES_UPDATE: 'DISPUTES_UPDATE',
    DOMAINS_CREATE: 'DOMAINS_CREATE',
    DOMAINS_DESTROY: 'DOMAINS_DESTROY',
    DOMAINS_UPDATE: 'DOMAINS_UPDATE',
    DRAFT_ORDERS_CREATE: 'DRAFT_ORDERS_CREATE',
    DRAFT_ORDERS_DELETE: 'DRAFT_ORDERS_DELETE',
    DRAFT_ORDERS_UPDATE: 'DRAFT_ORDERS_UPDATE',
    FULFILLMENTS_CREATE: 'FULFILLMENTS_CREATE',
    FULFILLMENTS_UPDATE: 'FULFILLMENTS_UPDATE',
    FULFILLMENT_EVENTS_CREATE: 'FULFILLMENT_EVENTS_CREATE',
    FULFILLMENT_EVENTS_DELETE: 'FULFILLMENT_EVENTS_DELETE',
    INVENTORY_ITEMS_CREATE: 'INVENTORY_ITEMS_CREATE',
    INVENTORY_ITEMS_DELETE: 'INVENTORY_ITEMS_DELETE',
    INVENTORY_ITEMS_UPDATE: 'INVENTORY_ITEMS_UPDATE',
    INVENTORY_LEVELS_CONNECT: 'INVENTORY_LEVELS_CONNECT',
    INVENTORY_LEVELS_DISCONNECT: 'INVENTORY_LEVELS_DISCONNECT',
    INVENTORY_LEVELS_UPDATE: 'INVENTORY_LEVELS_UPDATE',
    LOCALES_CREATE: 'LOCALES_CREATE',
    LOCALES_UPDATE: 'LOCALES_UPDATE',
    LOCATIONS_CREATE: 'LOCATIONS_CREATE',
    LOCATIONS_DELETE: 'LOCATIONS_DELETE',
    LOCATIONS_UPDATE: 'LOCATIONS_UPDATE',
    MARKETS_CREATE: 'MARKETS_CREATE',
    MARKETS_DELETE: 'MARKETS_DELETE',
    MARKETS_UPDATE: 'MARKETS_UPDATE',
    ORDERS_CANCELLED: 'ORDERS_CANCELLED',
    ORDERS_CREATE: 'ORDERS_CREATE',
    ORDERS_DELETE: 'ORDERS_DELETE',
    ORDERS_EDITED: 'ORDERS_EDITED',
    ORDERS_FULFILLED: 'ORDERS_FULFILLED',
    ORDERS_PAID: 'ORDERS_PAID',
    ORDERS_PARTIALLY_FULFILLED: 'ORDERS_PARTIALLY_FULFILLED',
    ORDERS_UPDATED: 'ORDERS_UPDATED',
    ORDER_TRANSACTIONS_CREATE: 'ORDER_TRANSACTIONS_CREATE',
    PAYMENT_TERMS_CREATE: 'PAYMENT_TERMS_CREATE',
    PAYMENT_TERMS_DELETE: 'PAYMENT_TERMS_DELETE',
    PAYMENT_TERMS_UPDATE: 'PAYMENT_TERMS_UPDATE',
    PRODUCTS_CREATE: 'PRODUCTS_CREATE',
    PRODUCTS_DELETE: 'PRODUCTS_DELETE',
    PRODUCTS_UPDATE: 'PRODUCTS_UPDATE',
    PRODUCT_LISTINGS_ADD: 'PRODUCT_LISTINGS_ADD',
    PRODUCT_LISTINGS_REMOVE: 'PRODUCT_LISTINGS_REMOVE',
    PRODUCT_LISTINGS_UPDATE: 'PRODUCT_LISTINGS_UPDATE',
    PRODUCT_PUBLICATIONS_CREATE: 'PRODUCT_PUBLICATIONS_CREATE',
    PRODUCT_PUBLICATIONS_DELETE: 'PRODUCT_PUBLICATIONS_DELETE',
    PRODUCT_PUBLICATIONS_UPDATE: 'PRODUCT_PUBLICATIONS_UPDATE',
    PROFILES_CREATE: 'PROFILES_CREATE',
    PROFILES_DELETE: 'PROFILES_DELETE',
    PROFILES_UPDATE: 'PROFILES_UPDATE',
    REFUNDS_CREATE: 'REFUNDS_CREATE',
    SCHEDULED_PRODUCT_LISTINGS_ADD: 'SCHEDULED_PRODUCT_LISTINGS_ADD',
    SCHEDULED_PRODUCT_LISTINGS_REMOVE: 'SCHEDULED_PRODUCT_LISTINGS_REMOVE',
    SCHEDULED_PRODUCT_LISTINGS_UPDATE: 'SCHEDULED_PRODUCT_LISTINGS_UPDATE',
    SEGMENTS_CREATE: 'SEGMENTS_CREATE',
    SEGMENTS_DELETE: 'SEGMENTS_DELETE',
    SEGMENTS_UPDATE: 'SEGMENTS_UPDATE',
    SELLING_PLAN_GROUPS_CREATE: 'SELLING_PLAN_GROUPS_CREATE',
    SELLING_PLAN_GROUPS_DELETE: 'SELLING_PLAN_GROUPS_DELETE',
    SELLING_PLAN_GROUPS_UPDATE: 'SELLING_PLAN_GROUPS_UPDATE',
    SHIPPING_ADDRESSES_CREATE: 'SHIPPING_ADDRESSES_CREATE',
    SHIPPING_ADDRESSES_UPDATE: 'SHIPPING_ADDRESSES_UPDATE',
    SHOP_UPDATE: 'SHOP_UPDATE',
    SUBSCRIPTION_BILLING_ATTEMPTS_CHALLENGED: 'SUBSCRIPTION_BILLING_ATTEMPTS_CHALLENGED',
    SUBSCRIPTION_BILLING_ATTEMPTS_FAILURE: 'SUBSCRIPTION_BILLING_ATTEMPTS_FAILURE',
    SUBSCRIPTION_BILLING_ATTEMPTS_SUCCESS: 'SUBSCRIPTION_BILLING_ATTEMPTS_SUCCESS',
    SUBSCRIPTION_CONTRACTS_CREATE: 'SUBSCRIPTION_CONTRACTS_CREATE',
    SUBSCRIPTION_CONTRACTS_UPDATE: 'SUBSCRIPTION_CONTRACTS_UPDATE',
    TAX_SERVICES_CREATE: 'TAX_SERVICES_CREATE',
    TAX_SERVICES_UPDATE: 'TAX_SERVICES_UPDATE',
    TENDER_TRANSACTIONS_CREATE: 'TENDER_TRANSACTIONS_CREATE',
    THEMES_CREATE: 'THEMES_CREATE',
    THEMES_DELETE: 'THEMES_DELETE',
    THEMES_PUBLISH: 'THEMES_PUBLISH',
    THEMES_UPDATE: 'THEMES_UPDATE',
    VARIANTS_IN_STOCK: 'VARIANTS_IN_STOCK',
    VARIANTS_OUT_OF_STOCK: 'VARIANTS_OUT_OF_STOCK'
}

export type WebhookTopic = ObjectValues<typeof WebhookTopics>

export enum MetafieldOwner {
    CUSTOMER = 'customer',
    ARTICLE = 'article',
    BLOG = 'blog',
    COLLECTION = 'collection',
    ORDER = 'order',
    DRAFT_ORDER = 'draft_order',
    PRODUCT = 'product',
    PRODUCT_VARIANT = 'variant',
    PRODUCT_IMAGE = 'product_image',
    PAGE = 'page',
    SHOP = 'shop',
}

export enum MetafieldType {
    STRING = 'string',
    INTEGER = 'integer',
    BOOLEAN = 'boolean',
    COLOR = 'color',
    JSON = 'json',
    DATE = 'date',
    DATE_TIME = 'date_time',
    FILE_REFERENCE = 'file_reference',
    PRODUCT_REFERENCE = 'product_reference',
    VARIANT_REFERENCE = 'variant_reference',
    PAGE_REFERENCE = 'page_reference',
    DIMENSION = 'dimension',
    NUMBER_DECIMAL = 'number_decimal',
    NUMBER_INTEGER = 'number_integer',
    SINGLE_LINE_TEXT_FIELD = 'single_line_text_field',
    URL = 'URL',
    RATING = 'rating',
    VOLUME = 'volume',
    WEIGHT = 'weight'
}

export type MetafieldTypes = 'string' | 
    'integer' | 'boolean' | 'color' | 'json' | 'date' | 
    'file_reference' | 'date_time' | 'dimension' |
    'multi_line_text_field' | 'number_decimal' | 'number_integer' |
    'page_reference' | 'product_reference' | 'rating' |
    'single_line_text_field' | 'url' | 'variant_reference' |
    'volume' | 'weight'


export interface GetMetafieldByOwnerParams {
    id:             number;
    resourceType:   MetafieldOwner;
    clearSession?:  boolean;
}

export interface CreateTransactionParams {
    fields:                 NewTransactionFields;
    clearSession?:          boolean;
}

export interface CreateCustomerParams {
    fields:                 NewCustomerFields;
    clearSession?:          boolean;
}

export interface UpdateCustomerParams {
    fields:                 NewCustomerFields;
    clearSession?:          boolean;
    customer?:              Customer;
}

export interface NewCustomerFields {
    email:                      string;
    first_name?:                string;
    last_name?:                 string;
    phone?:                     string;
    tags?:                      string[];
    verified_email?:            boolean;
    email_marketing_consent?:   MarketingConsentData;
    sms_marketing_consent?:     MarketingConsentData;
    send_email_invite?:         boolean;
}

export interface NewTransactionFields {
    order_id:                   number;
    kind:                       TransactionType;
    parent_id?:                 number;
    currency?:                  string;
    amount?:                    string;
    status?:                    string;
}

type MarketingOptInLevels = 'single_opt_in' | 'confirmed_opt_in' | 'unknown'

interface MarketingConsentData {
    state:                      'subscribed' | 'unsuscribed';
    opt_in_level:               MarketingOptInLevels;
    consent_updated_at:         Date | number | string;
    consent_collected_from?:    'OTHER';
}

export enum FinancialStatus {
    ANY = 'any',
    PAID = 'paid',
    VOIDED = 'voided',
    PENDING = 'pending',
    REFUNDED = 'refunded',
    AUTHORIZED = 'authorized'
}

export interface IShopifyOrder {
    id:                         number;
    email:                      string;
    closed_at:                  null;
    created_at:                 string;
    updated_at:                 string;
    number:                     number;
    note:                       null;
    token:                      string;
    gateway:                    null;
    test:                       boolean;
    total_price:                string;
    subtotal_price:             string;
    total_weight:               number;
    total_tax:                  string;
    taxes_included:             boolean;
    currency:                   Currency;
    financial_status:           string;
    confirmed:                  boolean;
    total_discounts:            string;
    total_line_items_price:     string;
    cart_token:                 null;
    buyer_accepts_marketing:    boolean;
    name:                       string;
    referring_site:             null;
    landing_site:               null;
    cancelled_at:               string;
    cancel_reason:              string;
    total_price_usd:            null;
    checkout_token:             null;
    reference:                  null;
    user_id:                    null;
    location_id:                null;
    source_identifier:          null;
    source_url:                 null;
    processed_at:               null;
    device_id:                  null;
    phone:                      null;
    customer_locale:            string;
    app_id:                     null;
    browser_ip:                 null;
    landing_site_ref:           null;
    order_number:               number;
    discount_applications:      DiscountApplication[];
    discount_codes:             any[];
    note_attributes:            any[];
    payment_gateway_names:      string[];
    processing_method:          string;
    checkout_id:                null;
    source_name:                string;
    fulfillment_status:         string;
    tax_lines:                  any[];
    tags:                       string;
    contact_email:              string;
    order_status_url:           string;
    presentment_currency:       Currency;
    total_line_items_price_set: Set;
    total_discounts_set:        Set;
    total_shipping_price_set:   Set;
    subtotal_price_set:         Set;
    total_price_set:            Set;
    total_tax_set:              Set;
    line_items:                 LineItem[];
    fulfillments:               any[];
    refunds:                    any[];
    total_tip_received:         string;
    original_total_duties_set:  null;
    current_total_duties_set:   null;
    payment_terms:              null;
    admin_graphql_api_id:       string;
    shipping_lines:             ShippingLine[];
    billing_address:            Address;
    shipping_address:           Address;
    customer:                   Customer;
}

export interface Address {
    first_name:    null | string;
    address1:      string;
    phone:         string;
    city:          string;
    zip:           string;
    province:      string;
    country:       string;
    last_name:     null | string;
    address2:      null;
    company:       null | string;
    latitude?:     null;
    longitude?:    null;
    name:          string;
    country_code:  string;
    province_code: string;
    id?:           number;
    customer_id?:  number;
    country_name?: string;
    default?:      boolean;
}

export enum Currency {
    Pyg = "PYG",
}

export interface DiscountApplication {
    type:              string;
    value:             string;
    value_type:        string;
    allocation_method: string;
    target_selection:  string;
    target_type:       string;
    description:       string;
    title:             string;
}

export interface LineItem {
    id:                           number;
    variant_id:                   number;
    title:                        string;
    quantity:                     number;
    sku:                          string;
    variant_title:                null;
    vendor:                       null;
    fulfillment_service:          string;
    product_id:                   number;
    requires_shipping:            boolean;
    taxable:                      boolean;
    gift_card:                    boolean;
    name:                         string;
    variant_inventory_management: string;
    properties:                   any[];
    product_exists:               boolean;
    fulfillable_quantity:         number;
    grams:                        number;
    price:                        string;
    total_discount:               string;
    fulfillment_status:           null;
    price_set:                    string[];
    total_discount_set:           string[];
    discount_allocations:         string[];
    duties:                       any[];
    admin_graphql_api_id:         string;
    tax_lines:                    any[];
}

export interface ShippingLine {
    id:                               number;
    title:                            string;
    price:                            string;
    code:                             null;
    source:                           string;
    phone:                            null;
    requested_fulfillment_service_id: null;
    delivery_category:                null;
    carrier_identifier:               null;
    discounted_price:                 string;
    price_set:                        string[];
    discounted_price_set:             string[];
    discount_allocations:             any[];
    tax_lines:                        any[];
}

export interface Set {
    shop_money:        Money;
    presentment_money: Money;
}

export interface Money {
    amount:        string;
    currency_code: Currency;
}

export enum CancelOrderReason {
    CUSTOMER = 'customer', 
    INVENTORY = 'inventory', 
    FRAUD = 'fraud', 
    DECLINED = 'declined', 
    OTHER = 'other'
}

export enum TransactionType {
    AUTHORIZATION = 'authorization', // Money that the customer has agreed to pay. The authorization period can be between 7 and 30 days (depending on your payment service) while a store waits for a payment to be captured.
    CAPTURE = 'capture', // A transfer of money that was reserved during the authorization of a shop.
    SALE = 'sale', // The authorization and capture of a payment performed in one single step.
    VOID = 'void', // The cancellation of a pending authorization or capture.
    REFUND = 'refund' // The partial or full return of captured money to the customer.
}

export interface OrderTransactionsResponse {
    transactions: Transaction[];
}

export interface Transaction {
    id:                   number;
    order_id:             number;
    kind:                 TransactionType;
    gateway:              string;
    status:               string;
    message:              string;
    created_at:           string;
    test:                 boolean;
    authorization:        null;
    location_id:          null;
    user_id:              null;
    parent_id:            number | null;
    processed_at:         string;
    device_id:            null;
    error_code:           null;
    source_name:          string;
    receipt:              Receipt;
    amount:               string;
    currency:             string;
    admin_graphql_api_id: string;
}

export interface Receipt {
}

export interface OrderTransactionCreateRequest extends Record<string, unknown> {
    transaction: TransactionCreate;
}

export interface Location {
    id:                      number;
    name:                    string;
    address1:                string;
    address2:                null;
    city:                    string;
    zip:                     string;
    province:                string;
    country:                 string;
    phone:                   null;
    created_at:              string;
    updated_at:              string;
    country_code:            string;
    country_name:            string;
    province_code:           string;
    legacy:                  boolean;
    active:                  boolean;
    admin_graphql_api_id:    string;
    localized_country_name:  string;
    localized_province_name: string;
}


export interface Webhook {
    id:                             number;
    address:                        string;
    topic:                          string;
    created_at:                     string;
    updated_at:                     string;
    format:                         string;
    fields:                         any[];
    metafield_namespaces:           any[];
    api_version:                    ApiVersion;
    private_metafield_namespaces:   any[];
}

export interface TransactionCreate {
    amount?:              string;
    kind:                 TransactionType;
    status?:              string;
    currency:             string;
    parent_id:            number | null;
}

export interface RestClientOrderTransactionCreateRequest {
    path:   string;
    data:   OrderTransactionCreateRequest;
    type:   DataType;
}

export interface ModifyWebhookParams {
    webhookId: number | string;
    newData: { address: string }
}

export interface RegisterWebhookParams {
    topic:          WebhookTopic;
    uri:            string;
}

export interface NewFulfillmentParams {
    orderId:                number | string;
    trackingNumber:         string;
    locationId?:            number;
    trackingUrls?:          string[];
}

export interface TransactionCreate {
    amount?:              string;
    kind:                 TransactionType;
    status?:              string;
    currency:             string;
    parent_id:            number | null;
}

export interface Fulfillment {
    id:                   number;
    order_id:             number;
    status:               string;
    created_at:           string;
    service:              string;
    updated_at:           string;
    tracking_company:     string;
    shipment_status:      null;
    location_id:          number;
    origin_address:       null;
    line_items:           LineItem[];
    tracking_number:      string;
    tracking_numbers:     string[];
    tracking_url:         string;
    tracking_urls:        string[];
    receipt:              Receipt;
    name:                 string;
    admin_graphql_api_id: string;
}

interface GqlMoneyInput {
    amount:             number;
    currencyCode:       string;
}

export interface GqlDiscountInput {
    description?:                string;
    fixedValue?:                 GqlMoneyInput;
    percentValue?:               number;
}

export interface GqlRemoveOrderItemParams {
    calculatedLineItemId:           string;
    calculatedOrderId:              string;
}

export interface GqlAddOrderItemParams {
    quantity:                       number;
    variantId:                      string;
    calculatedOrderId:              string;
}

export interface GqlAddOrderItemDiscountParams {
    discount:                       GqlDiscountInput;
    lineItemId:                     string;
    calculatedOrderId:              string;
}

// -------------------
export interface RestResources {
    Customer:       Customer;
    Order:          Order;
    Webhook:        ShopifyWebhook;
    Metafield:      Metafield;
    Transaction:    ShopifyTransaction;
    Product:        Product;
}

export enum GqlProductStatus {
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED',
    DRAFT = 'DRAFT',
}

export interface GqlProductInput {
    collectionsToJoin?:       string[];
    collectionsToLeave?:      string[];
    customProductType?:       string;
    descriptionHtml?:         string;
    giftCard?:                boolean;
    giftCardTemplateSuffix?:  string;
    handle?:                  string;
    id?:                      string;
    images?:                  GqlImage[];
    metafields?:              GqlMetafield[];
    options?:                 string[];
    privateMetafields?:       GqlPrivateMetafield[];
    productCategory?:         GqlProductCategory;
    productPublications?:     GqlPublication[];
    productType?:             string;
    publications?:            GqlPublication[];
    publishDate?:             string;
    publishOn?:               string;
    published?:               boolean;
    publishedAt?:             string;
    redirectNewHandle?:       boolean;
    requiresSellingPlan?:     boolean;
    seo?:                     GqlSEO;
    standardizedProductType?: GqlProductCategory;
    status?:                  GqlProductStatus;
    tags?:                    string[];
    templateSuffix?:          string;
    title?:                   string;
    variants?:                GqlVariant[];
    vendor?:                  string;
}

export interface GqlImage {
    altText?: string;
    id?:      string;
    src?:     string;
}

export type GqlMetafieldType = 'boolean' | 'color' | 'date' | 'date_time' | 'dimension' | 'json' |
    'money' | 'multi_line_text_field' | 'number_decimal' | 'number_integer' | 'rating' | 'rich_text_field' |
    'single_line_text_field' | 'url' | 'volume' | 'weight'

export interface GqlMetafield {
    description?: string;
    id?:          string;
    key?:         string;
    namespace?:   string;
    type?:        GqlMetafieldType;
    value?:       string;
}

export interface GqlPrivateMetafield {
    key:        string;
    namespace:  string;
    owner:      string;
    valueInput: GqlValueInput;
}

export interface GqlValueInput {
    value:     string;
    valueType: string;
}

export interface GqlProductCategory {
    productTaxonomyNodeId: string;
}

export interface GqlPublication {
    channelHandle: string;
    channelId:     string;
    publicationId: string;
    publishDate:   string;
}

export interface GqlSEO {
    description: string;
    title:       string;
}

export interface GqlVariant {
    barcode?:              string;
    compareAtPrice?:       string;
    fulfillmentServiceId?: string;
    harmonizedSystemCode?: string;
    id?:                   string;
    imageId?:              string;
    imageSrc?:             string;
    inventoryItem?:        GqlInventoryItem;
    inventoryManagement?:  string;
    inventoryPolicy?:      string;
    inventoryQuantities?:  GqlInventoryQuantity[];
    mediaSrc?:             string[];
    metafields?:           GqlMetafield[];
    options?:              string[];
    position?:             number;
    price?:                string;
    privateMetafields?:    GqlPrivateMetafield[];
    productId?:            string;
    requiresShipping?:     boolean;
    sku?:                  string;
    taxCode?:              string;
    taxable?:              boolean;
    title?:                string;
    weight?:               number;
    weightUnit?:           string;
}

export interface GqlInventoryItem {
    cost?:    string;
    tracked?: boolean;
}

export interface GqlInventoryQuantity {
    availableQuantity: number;
    locationId:        string;
}

export interface GqlStagedUploadInput {
    fileSize:   string;
    filename:   string;
    httpMethod: string;
    mimeType:   string;
    resource:   string;
}


export interface GqlInventoryAdjustItemInput {
    availableDelta:  number;
    inventoryItemId: string;
}

export type GqlAdjustInventoryNames = 'available' | 'reserved'

export enum ADJUST_INVENTORY_REASON {
    CORRECTION = 'correction', 
    CYCLE_COUNT_AVAILABLE = 'cycle_count_available', 
    DAMAGED = 'damaged', 
    PROMOTION = 'promotion', 
    RECEIVED = 'received', 
    RESERVATION_CREATED = 'reservation_created', 
    RESERVATION_DELETED = 'reservation_deleted', 
    RESERVATION_UPDATE = 'reservation_updated', 
    RESTOCK = 'restock', 
    SHRINKAGE = 'shrinkage'
}

export interface GqlAdjustInventoryInput {
    changes:               Change[];
    name:                  GqlAdjustInventoryNames;
    reason:                ADJUST_INVENTORY_REASON;
    referenceDocumentUri?: string;
}

export interface Change {
    delta:              number;
    inventoryItemId:    string;
    ledgerDocumentUri?: string;
    locationId:         string;
}
