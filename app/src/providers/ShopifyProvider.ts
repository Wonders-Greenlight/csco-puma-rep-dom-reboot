import "@shopify/shopify-api/adapters/node";
import crypto, { randomUUID } from "crypto";
import {
  AddHandlersParams,
  BillingInterval,
  LATEST_API_VERSION,
  LogSeverity,
  RegisterReturn,
  Session,
} from "@shopify/shopify-api";
import { ShopifyApp, shopifyApp } from "@shopify/shopify-app-express";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-07";
import {
  RestResources,
  CreateCustomerParams,
  CreateTransactionParams,
  GetMetafieldByOwnerParams,
  GqlRemoveOrderItemParams,
  GqlAddOrderItemParams,
  GqlAddOrderItemDiscountParams,
  GqlProductInput,
  GqlStagedUploadInput,
  GqlInventoryAdjustItemInput,
  GqlAdjustInventoryInput,
  Transaction,
  CreateCarrierServiceParams,
  GqlMediaInput,
  CreateFulfillmentParams,
  CreateFulfillmentEventParams,
} from "../interfaces/ShopifyInterfaces";

import config from "../config.js";
// import server from '../index.js';
import { GQL_MUTATIONS, GQL_QUERIES } from "../utils/ShopifyConstants.js";
import HelpersController from "../controllers/HelpersController.js";
import axios from "axios";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/puma_agiliza";

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  "My Shopify One-Time Charge": {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 5.0,
    currencyCode: "USD",
    interval: BillingInterval.OneTime,
  },
};

const d_scope =
  "read_analytics,read_assigned_fulfillment_orders,read_content,read_customer_events,read_customers,read_discounts,read_discovery,read_draft_orders,read_files,read_fulfillments,read_gdpr_data_request,read_gift_cards,read_inventory,read_legal_policies,read_locales,read_locations,read_marketing_events,read_markets,read_merchant_managed_fulfillment_orders,read_online_store_navigation,read_online_store_pages,read_order_edits,read_orders,read_payment_terms,read_pixels,read_price_rules,read_product_feeds,read_product_listings,read_products,read_purchase_options,read_reports,read_resource_feedbacks,read_returns,read_script_tags,read_shipping,read_shopify_payments_accounts,read_shopify_payments_bank_accounts,read_shopify_payments_disputes,read_shopify_payments_payouts,read_themes,read_third_party_fulfillment_orders,read_translations,write_assigned_fulfillment_orders,write_content,write_customers,write_discounts,write_discovery,write_draft_orders,write_files,write_fulfillments,write_gift_cards,write_inventory,write_legal_policies,write_locales,write_locations,write_marketing_events,write_markets,write_merchant_managed_fulfillment_orders,write_online_store_pages,write_order_edits,write_orders,write_payment_terms,write_pixels,write_price_rules,write_product_feeds,write_product_listings,write_products,write_purchase_options,write_reports,write_resource_feedbacks,write_returns,write_script_tags,write_shipping,write_themes,write_third_party_fulfillment_orders,write_translations";

// class ShopifyClient {
//   private static instance: ShopifyClient;
//   public shopify: any;

//   private constructor(config: any) {
//     this.shopify = shopifyApp(config);
//   }

//   public static getInstance(config: any): ShopifyClient {
//     if (!ShopifyClient.instance) {
//       ShopifyClient.instance = new ShopifyClient(config);
//     }
//     return ShopifyClient.instance;
//   }
// }

// // Usage
// const config = {
//   /* configuration options */
// };

class ShopifyProvider {
  public shopify: ShopifyApp;
  private RAW_CONFIG: any;
  private API_KEY: string;
  private API_PASSWORD: string;
  private API_ACCESS_TOKEN: string;
  private SCOPES: string[];
  private DOMAIN: string;
  private HOST: string;
  private REBUILDED: boolean = false;
  static GRAPHQL_API_MINIMUM_SAFE: number = 100;
  static GRAPHQL_API_MAX_AVAILABLE_CREDITS: number = 1000;
  static GRAPHQL_API_AVAILABLE_CREDITS: number = 1000;
  static GRAPHQL_API_PARALLEL_REQUESTS: number = 10;
  static GRAPHQL_API_RESTORE_RATE: number = 50;
  static GRAPHQL_API_SLEEP_COUNT: number = 0;
  static LAST_REST_API_CALL: null | number = null;
  static REST_LIMIT_AMOUNT_PER_SECOND: number = 2; // CHANGE EACH TIME SHOPIFY UPDATES ITS REST API
  static REST_MS_LIMIT_PER_SECOND: number =
    1000 / ShopifyProvider.REST_LIMIT_AMOUNT_PER_SECOND;
  public REST_API_QUEUE: any[] = new Proxy([], {
    deleteProperty: (target, property) => {
      delete target[property as keyof typeof target];
      // this.runNextTask()
      return true;
    },
    set: (target, property, value, receiver) => {
      target[property as keyof typeof target | any] = value;

      if (this.REST_API_QUEUE.some((x) => !!x.processing)) return true;
      this.runNextRestRequest();
      return true;
    },
  });

  constructor() {
    this.API_KEY = config.APP.API_KEY;
    this.API_PASSWORD = config.APP.API_SECRET_KEY;
    this.SCOPES = config.APP.SCOPES;
    this.DOMAIN = config.APP.SHOP;
    this.HOST = config.APP.HOST;

    if (!!config.APP.ACCESS_TOKEN) {
      this.API_ACCESS_TOKEN = config.APP.ACCESS_TOKEN;
      return;
    }

    this.readyChecker();
  }

  static objSessionRemover(entity: any) {
    const cleanObj = { ...entity };

    if (cleanObj.session) delete cleanObj.session;

    Object.keys(cleanObj).forEach((key) => {
      if (Array.isArray(cleanObj[key])) {
        cleanObj[key] = ShopifyProvider.sessionRemover(cleanObj[key]);
        return;
      }

      if (
        typeof cleanObj[key] === "object" &&
        Object.keys(cleanObj[key] || {}).length > 0
      ) {
        cleanObj[key] = ShopifyProvider.objSessionRemover(cleanObj[key]);
      }
    });

    return cleanObj;
  }

  private async runNextRestRequest(nextTaskIndex: number = 0) {
    if (this.REST_API_QUEUE.length === 0) return;
    const nextTask = this.REST_API_QUEUE.at(nextTaskIndex);
    if (!!!nextTask) return;
    if (nextTask.processing) return;

    nextTask.processing = true;
    await this.throttleApiRequests();
    const result = await nextTask.fn();
    nextTask.ready(result);

    this.REST_API_QUEUE.splice(
      this.REST_API_QUEUE.findIndex((t) => t.id === nextTask.id),
      1
    );
  }

  static sessionRemover<T>(classArray: T[]): T[] {
    return classArray.map((obj: any) => {
      if (obj.session) delete obj.session;
      Object.keys(obj).forEach((key) => {
        if (Array.isArray(obj[key])) {
          obj[key] = ShopifyProvider.sessionRemover(obj[key]);
          return;
        }

        if (
          typeof obj[key] === "object" &&
          Object.keys(obj[key] || {}).length > 0
        ) {
          obj[key] = ShopifyProvider.objSessionRemover(obj[key]);
        }
      });

      return obj;
    });
  }

  private async readyChecker(rebuild: boolean = false): Promise<void> {
    if (typeof this.shopify !== "undefined" && !rebuild) return;

    try {
      this.API_KEY = config.APP.API_KEY;
      this.API_PASSWORD = config.APP.API_SECRET_KEY;
      this.API_ACCESS_TOKEN = config.APP.ACCESS_TOKEN;
      this.SCOPES = config.APP.SCOPES;
      this.DOMAIN = config.APP.SHOP;

      const _shopifyInit: any = {
        api: {
          apiKey: this.API_KEY,
          apiSecretKey: this.API_PASSWORD,
          apiVersion: LATEST_API_VERSION,
          restResources,
          hostName: process.env.HOST.replace(/https:\/\//, ""),
          hostScheme: "https",
          scopes: (process.env.SCOPES || d_scope).split(","),
          billing: undefined, // or replace with billingConfig above to enable example billing
          isEmbeddedApp: true,
          logger: {
            // level: LogSeverity[config.GLOBAL.IS_TESTING ? 'Debug' : 'Error'],
            level: "error",
            httpRequests: false,
            timestamps: true,
          },
        },
        auth: {
          path: "/api/auth",
          callbackPath: "/api/auth/callback",
        },
        webhooks: {
          path: "/api/webhooks",
        },
        // This should be replaced with your preferred storage strategy
        //   sessionStorage: new SQLiteSessionStorage(DB_PATH),
        sessionStorage: new MongoDBSessionStorage(
          MONGODB_URI as unknown as URL,
          MONGODB_URI.split("/").pop()
        ),
        useOnlineTokens: config.APP.USE_ONLINE_TOKENS,
      };
      this.RAW_CONFIG = _shopifyInit;
      // console.log('readyChecker _shopifyInit |');
      // console.log(_shopifyInit);
      this.shopify = shopifyApp(_shopifyInit);

      const offlineSessionId = this.shopify.api.session.getOfflineId(
        config.APP.SHOP
      );

      const dbSession = await this.getSessionFromStorage(offlineSessionId);
      if (!!!dbSession) return;

      config.APP.ACCESS_TOKEN = dbSession.accessToken;
      this.API_ACCESS_TOKEN = dbSession.accessToken;
    } catch (err) {
      console.log(err);
      console.error("readyChecker | Error while creating shopify api");
    }
  }

  private async throttleApiRequests(firstCallWait: boolean = false) {
    let timeToWait: number;

    if (!!!ShopifyProvider.LAST_REST_API_CALL) {
      if (firstCallWait) timeToWait = ShopifyProvider.REST_MS_LIMIT_PER_SECOND;
      else {
        ShopifyProvider.LAST_REST_API_CALL = Date.now();
        return;
      }
    } else {
      const now = Date.now();
      const timeSinceLastCall = now - ShopifyProvider.LAST_REST_API_CALL;

      if (timeSinceLastCall < ShopifyProvider.REST_MS_LIMIT_PER_SECOND) {
        timeToWait =
          ShopifyProvider.REST_MS_LIMIT_PER_SECOND - timeSinceLastCall;
      }
    }

    if (timeToWait) {
      console.log("WAITING =>", timeToWait);
      await HelpersController.sleep(timeToWait);
      console.log("done waiting");
    }

    ShopifyProvider.LAST_REST_API_CALL = Date.now();
  }

  public async queueRestRequest<T = any>(fn: any): Promise<T> {
    return new Promise((res) => {
      this.REST_API_QUEUE.push({
        processing: false,
        ready: res,
        id: randomUUID(),
        fn,
      });
    });
  }

  public async execRestRequest(fn: any): Promise<any> {
    try {
      await this.throttleApiRequests();

      const resource = await fn();
      return resource;
    } catch (err) {
      if (err.response) {
        console.log(err.response.code);
        console.log(err.response.statusText);
        console.log(err.response.body);
      }

      console.log("waiting");
      if (typeof err.response?.retryAfter !== "undefined") {
        const retryAfter = err.response.retryAfter;
        console.log(`waiting {{ ${retryAfter} seconds }}!!`);
        await new Promise((res) => setTimeout(res, retryAfter * 1000));
        console.log("finish waiting");
        return this.execRestRequest(fn);
      }
    }
  }

  public throttleRest(
    fn: any,
    delay: number = ShopifyProvider.REST_MS_LIMIT_PER_SECOND
  ) {
    ShopifyProvider.LAST_REST_API_CALL = 0;
    this.REST_API_QUEUE = [];

    const flushQueue = async () => {
      if (this.REST_API_QUEUE.length === 0) return;
      const elapsed = Date.now() - ShopifyProvider.LAST_REST_API_CALL;
      if (elapsed >= delay) {
        ShopifyProvider.LAST_REST_API_CALL = Date.now();
        const next = this.REST_API_QUEUE.shift();
        const result = await fn.apply(this, next.args);
        next.resolve(result);
        flushQueue();
      } else {
        setTimeout(flushQueue, delay - elapsed);
      }
    };

    return function (...args: any[]) {
      return new Promise((resolve) => {
        this.push({
          args,
          resolve,
        });

        flushQueue();
      });
    };
  }

  private async execGraphqlRequest(fn: any): Promise<any> {
    try {
      const resource = await fn();
      return resource;
    } catch (err) {
      // HANDLE GQL ERROR RESPONSE TOO MANY REQUESTS
      if ( err.response ) {
          console.log(err.response.code)
          console.log(err.response.statusText)
          console.log(err.response.body)
      }
      console.log('execGraphqlRequest')
      if ( typeof err.response?.retryAfter !== 'undefined' ) {
          console.log(`waiting {{ ${err.response.retryAfter} seconds }}!!`)
          await new Promise(res => setTimeout(res, err.response.retryAfter * 1000))
          console.log('finish waiting')
          return this.execRestRequest(fn)
      }
    }
  }

  public async createRestClient(accessToken?: string) {
    return new this.shopify.api.clients.Rest({
      session: await this.getOfflineSession(),
      apiVersion: LATEST_API_VERSION,
    });
  }

  public async createGraphqlClient(accessToken?: string) {
    return new this.shopify.api.clients.Graphql({
      session: await this.getOfflineSession(),
      apiVersion: LATEST_API_VERSION,
    });
  }
  // ---------------------- END PRIVATE
  // -------------- UTILS
  public validateHmac(query: object) {
    const mappedQueryValues = Object.entries(query).map(
      ([key, val]) => `${key}=${val}`
    );
    const queryString = mappedQueryValues.reduce((acc, keyPair, i) => {
      if (i === 0) return (acc += keyPair);
      return (acc += `&${keyPair}`);
    }, "?");

    const params = new URLSearchParams(queryString);
    const hmac = params.get("hmac");
    params.delete("hmac");
    params.sort();

    const validate = crypto
      .createHmac("sha256", this.API_PASSWORD)
      .update(params.toString())
      .digest("hex");

    return validate === hmac;
  }

  public getOfflineSession(): Promise<Session> {
    console.log(`getOfflineSession |config.APP.SHOP: ${config.APP.SHOP}`);
    const offlineSessionId = shopify.api.session.getOfflineId(config.APP.SHOP);

    return this.getSessionFromStorage(offlineSessionId);
  }

  public getSessionFromStorage(id: string): Promise<Session> {
    return this.shopify.config.sessionStorage.loadSession(id);
  }
  // -------------- END UTILS

  public async getMetafieldsByOwner({
    id,
    resourceType,
    clearSession = false,
  }: GetMetafieldByOwnerParams): Promise<RestResources["Metafield"][]> {
    const metafields = await this.shopify.api.rest.Metafield.all({
      session: await this.getOfflineSession(),
      metafield: {
        owner_id: id,
        owner_resource: resourceType,
      },
    });

    if (clearSession)
      metafields.data = ShopifyProvider.sessionRemover<
        RestResources["Metafield"]
      >(metafields.data);

    delete metafields.headers;
    return metafields.data;
  }

  public async createMetafieldsByOwner(body: any) {
    const metafield = new this.shopify.api.rest.Metafield({
      session: await this.getOfflineSession(),
      fromData: body,
    });

    await metafield.save();

    return metafield;
  }

  public async getProductsByHandles(
    handles: string,
    fields: string = "",
    clearSession: boolean = true
  ) {
    const products = await this.shopify.api.rest.Product.all({
      session: await this.getOfflineSession(),
      handle: handles,
      fields,
    });

    if (clearSession)
      products.data = ShopifyProvider.sessionRemover(products.data);

    delete products.headers;
    return products.data;
  }

  public async getAllProducts(
    { fields = [] }: any,
    clearSession: boolean = true
  ) {
    const session = await this.getOfflineSession();
    let products: any[] = [];

    let limit = 250;
    let pageInfo: any;

    do {
      const response: any = await this.queueRestRequest(
        async () =>
          await shopify.api.rest.Product.all({
            ...pageInfo?.nextPage?.query,
            session,
            limit,
            fields,
          })
      );

      const pageProducts = response.data;
      products.push(...pageProducts);

      pageInfo = response.pageInfo;
    } while (pageInfo?.nextPage);

    if (!clearSession) return products;
    return ShopifyProvider.sessionRemover(products);
  }

  public async getProducts(
    {
      fields = [],
      limit = 250,
      handle = "",
      collection_id = "",
      created_at_max = "",
      created_at_min = "",
      published_at_max = "",
      published_at_min = "",
      updated_at_max = "",
      updated_at_min = "",
      presentment_currencies = "",
      product_type = "",
      since_id = "0",
      status = "",
      title = "",
      vendor = "",
      published_status = "",
      page_info = "",
    }: any,
    clearSession: boolean = true
  ) {
    const params: any = {
      handle,
      fields,
      limit,
      collection_id,
      created_at_max,
      created_at_min,
      published_at_max,
      published_at_min,
      updated_at_max,
      updated_at_min,
      presentment_currencies,
      product_type,
      since_id,
      status,
      title,
      vendor,
      published_status,
    };

    if (!!page_info) {
      delete params.since_id;
      delete params.status;
      params.page_info = page_info;
    }

    Object.keys(params).forEach((key) => {
      if (!!params[key]) return;
      delete params[key];
    });

    const products = await this.shopify.api.rest.Product.all({
      session: await this.getOfflineSession(),
      ...params,
    });

    if (clearSession)
      products.data = ShopifyProvider.sessionRemover(products.data);

    delete products.headers;
    return products;
  }

  public async getProductById(
    id: string | number,
    fields: string = "",
    clearSession: boolean = true
  ) {
    const product = await this.shopify.api.rest.Product.find({
      session: await this.getOfflineSession(),
      id: Number(id),
      fields,
    });

    if (!clearSession) return product;
    delete product.session;
    return product;
  }

  
  public async getProductsCount(clearSession: boolean = true) {
    // console.log('getProductsCount dbSession started', this.getOfflineSession())
    const count = await shopify.api.rest.Product.count({
      session: await this.getOfflineSession(),
    });

    if (clearSession) delete count.session;
    return count;
  }

  public async getProductVariantsCount(
    productId: string | number,
    clearSession: boolean = true
  ) {
    const count = await shopify.api.rest.Variant.count({
      session: await this.getOfflineSession(),
      product_id: Number(productId),
    });

    if (clearSession) delete count.session;
    return count;
  }

  public async deleteProductImage(
    productId: string | number,
    imageId: string | number,
    clearSession: boolean = true
  ) {
    await shopify.api.rest.Image.delete({
      session: await this.getOfflineSession(),
      product_id: Number(productId),
      id: Number(imageId),
    });

    return true;
  }

  public async getVariantsCount() {
    const session = await this.getOfflineSession();
    console.log('session.accessToken', session.accessToken)
    const { data: count } = await axios.get(
      `https://${this.DOMAIN}/admin/api/${LATEST_API_VERSION}/variants/count.json`,
      {
        headers: { "X-Shopify-Access-Token": session.accessToken },
      }
    );

    return count;
  }

  public async getCountries() {
    const session = await this.getOfflineSession();

    const {
      data: { countries },
    } = await axios.get(
      `https://${this.DOMAIN}/admin/api/${LATEST_API_VERSION}/countries.json`,
      {
        headers: { "X-Shopify-Access-Token": session.accessToken },
      }
    );

    return countries;
  }

  public async getCountryById(id: number | string) {
    const session = await this.getOfflineSession();

    const {
      data: { country },
    } = await axios.get(
      `https://${this.DOMAIN}/admin/api/${LATEST_API_VERSION}/countries/${id}.json`,
      {
        headers: { "X-Shopify-Access-Token": session.accessToken },
      }
    );

    return country;
  }

  public async createOrUpdateProduct(
    payload: any,
    clearSession: boolean = true
  ) {
    const variants: any[] = payload.variants || [];
    const variantsWithImage = variants.filter(
      (x) => typeof x.imageSrc !== "undefined"
    );

    variantsWithImage.forEach((x) => {
      payload.images.push({
        src: x.imgSrc,
        alt: x.sku,
      });

      delete x.imgSrc;
    });

    let product = new this.shopify.api.rest.Product({
      session: await this.getOfflineSession(),
      fromData: payload,
    });

    await product.save({ update: true });

    if (variantsWithImage.length > 0) {
      const variantImages = product.images.filter((x: any) => !!x.alt);

      variantImages.forEach((x: any) => {
        const imgVariant = product.variants.find((v: any) => v.sku === x.alt);
        if (!!!imgVariant) return;

        imgVariant.image_id = x.id;
      });

      product = new this.shopify.api.rest.Product({
        session: await this.getOfflineSession(),
        fromData: {
          id: product.id,
          variants: product.variants,
        },
      });

      await product.saveAndUpdate();
    }

    if (!clearSession) return product;

    product.variants = ShopifyProvider.sessionRemover(product.variants);
    delete product.session;
    return product;
  }

  public async getCollectionById(
    id: string | number,
    clearSession: boolean = true
  ) {
    const collection = await this.shopify.api.rest.Collection.find({
      session: await this.getOfflineSession(),
      id,
    });

    clearSession && collection.session && delete collection.session;
    return collection;
  }

  public async getOrderById(
    id: string | number,
    clearSession: boolean = true
  ): Promise<RestResources["Order"]> {
    const order = await this.shopify.api.rest.Order.find({
      session: await this.getOfflineSession(),
      id,
    });

    clearSession && order.session && delete order.session;
    return order;
  }

  public async updateOrderById(
    id: number,
    fields: any,
    clearSession: boolean = true
  ): Promise<RestResources["Order"]> {
    const order = new this.shopify.api.rest.Order({
      session: await this.getOfflineSession(),
      fromData: { ...fields, id },
    });

    await order.save({ update: true });

    clearSession && order.session && delete order.session;
    return order;
  }

  public async getPendingOrders(
    fields: string[] = [],
    clearSession: boolean = true
  ) {
    await this.readyChecker();

    const payload: any = {
      session: await this.getOfflineSession(),
      financial_status: "pending",
    };

    if (fields.length > 0) payload.fields = fields.join(",").toLowerCase();

    const orders = await this.shopify.api.rest.Order.all(payload);

    if (clearSession) orders.data = ShopifyProvider.sessionRemover(orders);

    delete orders.headers;
    return orders;
  }

  public async getOrders(
    {
      fields = [],
      limit = 250,
      created_at_max = "",
      created_at_min = "",
      processed_at_max = "",
      processed_at_min = "",
    }: any,
    clearSession: boolean = true
  ): Promise<RestResources["Order"][]> {
    await this.readyChecker();

    const payload: any = {
      session: await this.getOfflineSession(),
      limit,
      created_at_max,
      created_at_min,
      processed_at_max,
      processed_at_min,
    };

    if (fields.length > 0) payload.fields = fields.join(",").toLowerCase();

    const orders = await this.shopify.api.rest.Order.all(payload);

    if (clearSession) orders.data = ShopifyProvider.sessionRemover(orders);

    delete orders.headers;
    return orders;
  }

  public async getLocations(
    clearSession: boolean = true
  ): Promise<RestResources["Location"][]> {
    await this.readyChecker();
    console.log("getLocations |this.RAW_CONFIG");
    console.log(this.RAW_CONFIG);
    const session = await this.getOfflineSession();

    const locations = await shopify.api.rest.Location.all({ session });

    if (clearSession)
      locations.data = ShopifyProvider.sessionRemover(locations.data);
    return locations.data;
  }

  public async getLocationById(
    id: string | number,
    clearSession: boolean = true
  ) {
    await this.readyChecker();
    console.log("getLocations |this.RAW_CONFIG");
    console.log(this.RAW_CONFIG);
    const location = await shopify.api.rest.Location.find({
      session: await this.getOfflineSession(),
      id: Number(id),
    });

    if (clearSession) delete location.session;
    return location;
  }

  public async getCarrierServices(clearSession: boolean = true) {
    await this.readyChecker();
    const session = await this.getOfflineSession();

    const carriers = await shopify.api.rest.CarrierService.all({ session });

    if (clearSession)
      carriers.data = ShopifyProvider.sessionRemover(carriers.data);
    return carriers.data;
  }

  public async getCarrierServiceById(
    id: number,
    clearSession: boolean = true
  ): Promise<RestResources["CarrierService"]> {
    await this.readyChecker();
    const session = await this.getOfflineSession();

    const carrier = await shopify.api.rest.CarrierService.find({
      session,
      id,
    });

    if (clearSession) delete carrier.session;
    return carrier;
  }

  public async createCarrierService(
    params: CreateCarrierServiceParams,
    clearSession: boolean = true
  ) {
    await this.readyChecker();
    const session = await this.getOfflineSession();

    const carrier = new shopify.api.rest.CarrierService({
      session,
      fromData: params,
    });

    await carrier.save({ update: true });

    if (clearSession) delete carrier.session;
    return carrier;
  }

  public async getOrderTransactions(
    orderId: string | number,
    clearSession: boolean = true
  ): Promise<Transaction[]> {
    await this.readyChecker();
    const session = await this.getOfflineSession();

    const transactions = await shopify.api.rest.Transaction.all({
      session,
      order_id: +orderId,
    });

    if (!clearSession) return transactions.data;
    return ShopifyProvider.sessionRemover(transactions.data);
  }

  public async getFulfillmentOrdersByOrderId(
    orderId: number,
    clearSession: boolean = true
  ): Promise<RestResources["FulfillmentOrder"][]> {
    await this.readyChecker();

    const fulfillmentOrders = await shopify.api.rest.FulfillmentOrder.all({
      session: await this.getOfflineSession(),
      order_id: orderId,
    });

    return clearSession
      ? ShopifyProvider.sessionRemover(fulfillmentOrders.data || [])
      : fulfillmentOrders.data;
  }

  public async createFulfillment(
    payload: CreateFulfillmentParams,
    clearSession: boolean = true
  ): Promise<RestResources["Fulfillment"] | any> {
    const fulfillment = new shopify.api.rest.Fulfillment({
      session: await this.getOfflineSession(),
      fromData: payload,
    });
    await fulfillment.save({ update: true });

    if (clearSession) delete fulfillment.session;
    return fulfillment;
  }

  public async createFulfillmentEvent(
    payload: CreateFulfillmentEventParams,
    clearSession: boolean = true
  ) {
    const fulfillmentEvent = await new shopify.api.rest.FulfillmentEvent({
      session: await this.getOfflineSession(),
      fromData: payload,
    }).save({ update: true });

    if (!!!fulfillmentEvent) return true;
    if (clearSession) delete fulfillmentEvent.session;
    return fulfillmentEvent;
  }

  public async getInventoryLevels(
    {
      limit = 250,
      location_ids = "",
      inventory_item_ids = "",
      updated_at_min = "",
    }: any,
    clearSession: boolean = true
  ) {
    await this.readyChecker();
    const session = await this.getOfflineSession();

    const inventoryLevels = await shopify.api.rest.InventoryLevel.all({
      session,
      limit,
      location_ids,
      inventory_item_ids,
      updated_at_min,
    });

    console.log(inventoryLevels);

    if (clearSession)
      inventoryLevels.data = ShopifyProvider.sessionRemover(
        inventoryLevels.data
      );

    delete inventoryLevels.headers;
    return inventoryLevels.data;
  }

  public async getAllInventoryLevels(
    { location_ids = "", inventory_item_ids = "" }: any,
    clearSession: boolean = true
  ) {
    const session = await this.getOfflineSession();
    let inventories: any[] = [];

    let limit = 250;
    let pageInfo;

    let params: any = {
      session,
      limit,
      location_ids,
      inventory_item_ids,
    };

    do {
      if (!!pageInfo) {
        delete params.inventory_item_ids;
        delete params.location_ids;
        params = { ...params, ...pageInfo?.nextPage.query };
      }

      const response: any = await this.queueRestRequest(
        async () => await shopify.api.rest.InventoryLevel.all(params)
      );

      const pageInventories = response.data;
      inventories.push(...pageInventories);

      pageInfo = response.pageInfo;
    } while (pageInfo?.nextPage);

    if (!clearSession) return inventories;
    return ShopifyProvider.sessionRemover(inventories);
  }

  public async getInventoryItemById(
    id: number | string,
    clearSession: boolean = true
  ) {
    await this.readyChecker();
    const session = await this.getOfflineSession();

    const inventoryItem = await shopify.api.rest.InventoryItem.find({
      session,
      id: Number(id),
    });

    if (!clearSession) return inventoryItem;

    delete inventoryItem.session;
    return inventoryItem;
  }

  public async getInventoryItems(
    { ids = "", limit = 250 }: any,
    clearSession: boolean = true
  ) {
    await this.readyChecker();
    const session = await this.getOfflineSession();

    const inventoryItems = await shopify.api.rest.InventoryItem.all({
      session,
      ids,
      limit,
    });

    if (clearSession)
      inventoryItems.data = ShopifyProvider.sessionRemover(inventoryItems.data);

    delete inventoryItems.headers;
    return inventoryItems.data;
  }

  public async setAvailableInventoryLevel(
    { inventoryItemId, locationId, available }: any,
    clearSession: boolean = true
  ) {
    await this.readyChecker();
    const session = await this.getOfflineSession();

    const inventoryItem = await this.getInventoryItemById(
      Number(inventoryItemId),
      false
    );
    inventoryItem.tracked = true;
    await inventoryItem.save({ update: true });

    if (!!!inventoryItem)
      throw { message: `Inventory item not found with id: ${inventoryItemId}` };

    const inventoryLevel = new shopify.api.rest.InventoryLevel({ session });

    await inventoryLevel.set({
      body: {
        location_id: Number(locationId),
        inventory_item_id: inventoryItem.id,
        available,
      },
    });

    return true;
  }

  public async activateInventoryLevel(
    { inventoryItemId, locationId }: any,
    clearSession: boolean = true
  ) {
    await this.readyChecker();
    const session = await this.getOfflineSession();

    const inventoryLevel = new shopify.api.rest.InventoryLevel({ session });

    await inventoryLevel.connect({
      body: {
        location_id: Number(locationId),
        inventory_item_id: Number(inventoryItemId),
      },
    });

    return true;
  }

  public async adjustAvailableInventoryLevel(
    { inventoryItemId, locationId, availableAdjustment }: any,
    clearSession: boolean = true
  ) {
    await this.readyChecker();
    const session = await this.getOfflineSession();

    const inventoryItem = await this.getInventoryItemById(
      Number(inventoryItemId),
      false
    );
    inventoryItem.tracked = true;
    await inventoryItem.save({ update: true });

    if (!!!inventoryItem)
      throw { message: `Inventory item not found with id: ${inventoryItemId}` };

    const inventoryLevel = new shopify.api.rest.InventoryLevel({ session });

    await inventoryLevel.adjust({
      body: {
        location_id: Number(locationId),
        inventory_item_id: inventoryItem.id,
        available_adjustment: availableAdjustment,
      },
    });

    return true;
  }

  public async createTransaction({
    fields,
    clearSession = true,
  }: CreateTransactionParams) {
    await this.readyChecker();
    const session = await this.getOfflineSession();

    if (!!!fields.parent_id) {
      const transactions = await this.shopify.api.rest.Transaction.all({
        session,
        order_id: fields.order_id,
      });

      const lastTransaction = [...transactions.data].pop();

      if (!!!lastTransaction) throw { message: "No last transaction found" };

      fields.parent_id = lastTransaction.id;
      fields.currency = lastTransaction.currency;
    }

    const transaction = new this.shopify.api.rest.Transaction({
      session,
      fromData: fields,
    });

    await transaction.save({ update: true });
    clearSession && transaction.session && delete transaction.session;

    return transaction;
  }

  public async getCustomerById(
    customerId: string | number,
    clearSession: boolean = true
  ): Promise<RestResources["Customer"]> {
    const customer = await this.shopify.api.rest.Customer.find({
      session: await this.getOfflineSession(),
      id: customerId,
    });

    clearSession && customer.session && delete customer.session;
    return customer;
  }

  public async getCustomerByEmail(email: string, clearSession: boolean = true) {
    const customer = await this.shopify.api.rest.Customer.all({
      session: await this.getOfflineSession(),
      email,
    });

    return clearSession ? ShopifyProvider.sessionRemover(customer) : customer;
  }

  public async updateCustomerById(
    id: number,
    fields: any,
    clearSession: boolean = true
  ): Promise<RestResources["Order"]> {
    const customer = new this.shopify.api.rest.Customer({
      session: await this.getOfflineSession(),
      fromData: { ...fields, id },
    });

    await customer.save({ update: true });

    clearSession && customer.session && delete customer.session;
    return customer;
  }

  public async createCustomer(params: CreateCustomerParams) {
    const { clearSession = true, fields } = params;

    const customer = new this.shopify.api.rest.Customer({
      session: await this.getOfflineSession(),
      fromData: fields,
    });

    await customer.saveAndUpdate();

    clearSession && customer.session && delete customer.session;
    return customer;
  }

  public async getWebhooks(clearSession: boolean = true) {
    await this.readyChecker();
    const webhooks = await this.shopify.api.rest.Webhook.all({
      session: await this.getOfflineSession(),
    });

    delete webhooks.headers;

    return clearSession
      ? ShopifyProvider.sessionRemover(webhooks.data)
      : webhooks.data;
  }

  public async getWebhookById(
    id: number,
    clearSession: boolean = false
  ): Promise<RestResources["Webhook"]> {
    const webhook = await this.shopify.api.rest.Webhook.find({
      session: await this.getOfflineSession(),
      id,
    });

    clearSession && delete webhook.session;
    return webhook;
  }

  public async deleteWebhook(id: number): Promise<unknown> {
    const webhook = await this.shopify.api.rest.Webhook.delete({
      session: await this.getOfflineSession(),
      id,
    });

    return webhook;
  }

  public async registerWebhookHandlers(
    session?: Session
  ): Promise<RegisterReturn> {
    const response = await this.shopify.api.webhooks.register({
      session: session ?? (await this.getOfflineSession()),
    });

    return response;
  }

  public async addWebhookHandlers(handlers: AddHandlersParams) {
    await this.readyChecker(true);
    this.shopify.api.webhooks.addHandlers(handlers);
  }

  public async gqlOrderMarkAsPaid(
    order: RestResources["Order"],
    gqlClient?: any
  ) {
    if (!gqlClient) {
      gqlClient = this.createGraphqlClient();
    }

    try {
      const orderMarkAsPaid = await gqlClient.query({
        data: {
          query: GQL_MUTATIONS.ORDER_MARK_AS_PAID,
          variables: {
            input: {
              id: order.admin_graphql_api_id,
            },
          },
        },
      });

      const orderData = (orderMarkAsPaid.body as any).data.orderMarkAsPaid
        .order;

      if (!!!orderData) {
        throw {
          response: {
            errors: (orderMarkAsPaid.body as any).data.orderMarkAsPaid
              .userErrors,
          },
        };
      }

      return {
        order: {
          id: orderData.id,
        },
      };
    } catch (err) {
      console.log("ORDER MARK AS PAID CATCH");
      throw err;
    }
  }

  public async gqlOrderEditBegin(
    order: RestResources["Order"],
    gqlClient?: any
  ) {
    if (!gqlClient) {
      gqlClient = this.createGraphqlClient();
    }

    try {
      const orderEditBegin = await gqlClient.query({
        data: {
          query: GQL_MUTATIONS.ORDER_EDIT_BEGIN,
          variables: {
            id: order.admin_graphql_api_id,
          },
        },
      });

      const calculatedOrderData = (orderEditBegin.body as any).data
        .orderEditBegin.calculatedOrder;

      if (!!!calculatedOrderData) {
        throw {
          response: {
            errors: (orderEditBegin.body as any).data.orderEditBegin.userErrors,
          },
        };
      }

      const originalOrderData = (orderEditBegin.body as any).data.orderEditBegin
        .calculatedOrder.originalOrder;

      return {
        calculatedOrder: {
          id: calculatedOrderData.id,
          lineItems: calculatedOrderData.lineItems.edges.map(
            (x: { node: any }) => x.node
          ),
        },
        originalOrderData: {
          lineItems: originalOrderData.lineItems.edges.map(
            (x: { node: any }) => x.node
          ),
        },
      };
    } catch (err) {
      console.log("ORDER EDIT BEGIN CATCH");
      throw err;
    }
  }

  public async gqlOrderRemoveLineItem(
    { calculatedLineItemId, calculatedOrderId }: GqlRemoveOrderItemParams,
    gqlClient?: any
  ) {
    if (!gqlClient) {
      gqlClient = this.createGraphqlClient();
    }

    try {
      const changeOrder = await gqlClient.query({
        data: {
          query: GQL_MUTATIONS.ORDER_EDIT_REMOVE_ITEM,
          variables: {
            id: calculatedOrderId,
            lineItemId: calculatedLineItemId,
          },
        },
      });

      const calculatedOrderData = (changeOrder.body as any).data
        .orderEditSetQuantity.calculatedOrder;

      if (!!!calculatedOrderData) {
        throw {
          response: {
            errors: (changeOrder.body as any).data.orderEditSetQuantity
              .userErrors,
          },
        };
      }

      return {
        calculatedOrder: {
          id: calculatedOrderData.id,
          modifiedLineItems: calculatedOrderData.addedLineItems.edges.map(
            (x: { node: any }) => x.node
          ),
        },
        extension: (changeOrder.body as any).extension,
      };
    } catch (err) {
      console.log("ORDER REMOVE LINE ITEM CATCH");
      throw err;
    }
  }

  public async gqlOrderAddLineItem(
    { quantity, calculatedOrderId, variantId }: GqlAddOrderItemParams,
    gqlClient?: any
  ) {
    if (!gqlClient) {
      gqlClient = this.createGraphqlClient();
    }

    try {
      const addItem = await gqlClient.query({
        data: {
          query: GQL_MUTATIONS.ORDER_EDIT_ADD_ITEM,
          variables: {
            id: calculatedOrderId,
            quantity,
            variantId,
          },
        },
      });

      const calculatedOrderData = (addItem.body as any).data.orderEditAddVariant
        .calculatedOrder;

      if (!!!calculatedOrderData) {
        throw {
          response: {
            errors: (addItem as any).data.orderEditAddVariant.userErrors,
          },
        };
      }

      const calculatedLineItem = (addItem.body as any).data.orderEditAddVariant
        .calculatedLineItem;

      return {
        calculatedOrder: {
          id: calculatedOrderData.id,
          modifiedLineItems: calculatedOrderData.addedLineItems.edges.map(
            (x: { node: any }) => x.node
          ),
        },
        calculatedLineItem: {
          id: calculatedLineItem.id,
          quantity: calculatedLineItem.quantity,
        },
      };
    } catch (err) {
      console.log("ORDER ADD LINE ITEM CATCH");
      throw err;
    }
  }

  public async gqlOrderAddLineItemDiscount(
    { discount, calculatedOrderId, lineItemId }: GqlAddOrderItemDiscountParams,
    gqlClient?: any
  ) {
    if (!gqlClient) {
      gqlClient = this.createGraphqlClient();
    }

    try {
      const addItemDiscount = await gqlClient.query({
        data: {
          query: GQL_MUTATIONS.ORDER_EDIT_ADD_ITEM_DISCOUNT,
          variables: {
            id: calculatedOrderId,
            discount,
            lineItemId,
          },
        },
      });

      const calculatedOrderData = (addItemDiscount.body as any).data
        .orderEditAddLineItemDiscount.calculatedOrder;

      if (!!!calculatedOrderData) {
        throw {
          response: {
            errors: (addItemDiscount.body as any).data
              .orderEditAddLineItemDiscount.userErrors,
          },
        };
      }

      const calculatedLineItem = (addItemDiscount.body as any).data
        .orderEditAddLineItemDiscount.calculatedLineItem;
      const addedDiscountStagedChange = (addItemDiscount.body as any).data
        .orderEditAddLineItemDiscount.addedDiscountStagedChange;

      return {
        calculatedOrder: {
          id: calculatedOrderData.id,
          modifiedLineItems: calculatedOrderData.addedLineItems.edges.map(
            (x: { node: any }) => x.node
          ),
        },
        calculatedLineItem: {
          id: calculatedLineItem.id,
          quantity: calculatedLineItem.quantity,
        },
        addedDiscountStaged: {
          id: addedDiscountStagedChange.id,
          value: addedDiscountStagedChange.value,
          description: addedDiscountStagedChange.description,
        },
      };
    } catch (err) {
      console.log("ORDER ADD LINE ITEM DISCOUNT CATCH");
      throw err;
    }
  }

  public async gqlOrderEditCommit(calculatedOrderId: string, gqlClient?: any) {
    if (!gqlClient) {
      gqlClient = this.createGraphqlClient();
    }

    try {
      const commitOrder = await gqlClient.query({
        data: {
          query: GQL_MUTATIONS.ORDER_EDIT_COMMIT,
          variables: {
            id: calculatedOrderId,
          },
        },
      });

      const orderData = (commitOrder.body as any).data.orderEditCommit.order;

      return orderData;
    } catch (err) {
      console.log("ORDER COMMIT CATCH");
      throw err;
    }
  }

  public async gqlCreateOrUpdateProduct(
    productInput: GqlProductInput,
    mediaInput: GqlMediaInput[] = [],
    gqlClient?: any
  ): Promise<any> {
    this.readyChecker();
    if (!!!gqlClient) {
      gqlClient = await this.createGraphqlClient();
    }

    const mutationKey: keyof typeof GQL_MUTATIONS = !!productInput.id
      ? "UPDATE_PRODUCT"
      : "CREATE_PRODUCT";
    const gqlKey: any = !!productInput.id ? "productUpdate" : "productCreate";

    try {
      const queryData = {
        query: GQL_MUTATIONS[mutationKey],
        variables: {
          input: productInput,
          media: mediaInput,
        },
      };

      if (typeof productInput.images !== "undefined")
        delete queryData.variables.media;

      const createUpdateProduct = await gqlClient.query({
        data: queryData,
      });

      // console.log(createUpdateProduct.body.extensions)

      const extensions = (createUpdateProduct.body as any).extensions;
      const { product, userErrors } = (createUpdateProduct.body as any).data[
        gqlKey
      ];

      return { product, userErrors, cost: extensions.cost };
    } catch (err) {
      console.log("\n\nGQL PRODUCT CREATE / UPDATE CATCH");
      console.log(err.response);

      throw err;
    }
  }

  public async gqlGetProductsByQuery(query: string, gqlClient?: any) {
    if (!!!gqlClient) {
      gqlClient = await this.createGraphqlClient();
    }

    try {
      const createUpdateProduct = await gqlClient.query({
        data: {
          query: GQL_QUERIES.PRODUCTS,
          variables: {
            query,
          },
        },
      });

      const extensions = (createUpdateProduct.body as any).extensions;
      const { products, userErrors } = (createUpdateProduct.body as any).data;

      ShopifyProvider.GRAPHQL_API_AVAILABLE_CREDITS =
        extensions.cost.currentlyAvailable;

      return { products, userErrors, cost: extensions.cost };
    } catch (err) {
      console.log("GQL PRODUCT CREATE / UPDATE CATCH");
      throw err;
    }
  }

  public async gqlCreateStagedUploads(
    uploadsInput: GqlStagedUploadInput[],
    gqlClient?: any
  ) {
    if (!!!gqlClient) {
      gqlClient = await this.createGraphqlClient();
    }

    try {
      const createStagedUploads = await gqlClient.query({
        data: {
          query: GQL_MUTATIONS.STAGED_UPLOADS_CREATE,
          variables: {
            input: uploadsInput,
          },
        },
      });

      console.log(createStagedUploads.body.extensions);

      const stagedItemsData = (createStagedUploads.body as any).data
        .stagedUploadsCreate.stagedTargets;
      const userErrors = (createStagedUploads.body as any).data
        .stagedUploadsCreate.userErrors;

      return stagedItemsData || userErrors;
    } catch (err) {
      console.log("GQL STAGED UPLOADS CREATE CATCH");
      throw err;
    }
  }

  public async gqlAdjustQuantities(
    input: GqlAdjustInventoryInput,
    gqlClient?: any
  ) {
    if (!!!gqlClient) {
      gqlClient = await this.createGraphqlClient();
    }

    try {
      const inventoryAdjustQuantities = await gqlClient.query({
        data: {
          query: GQL_MUTATIONS.INVENTORY_ADJUST_QUANTITIES,
          variables: {
            input,
          },
        },
      });

      const bulkInventoryUpdate = (inventoryAdjustQuantities.body as any).data
        .inventoryAdjustQuantities;
      const userErrors = (inventoryAdjustQuantities.body as any).data
        .inventoryAdjustQuantities.userErrors;

      return bulkInventoryUpdate || userErrors;
    } catch (err) {
      console.log("BULK INVENTORY UPDATE UPLOADS CREATE CATCH");
      throw err;
    }
  }

  public async gqlPrepareOrderForPickup(
    fulfillmentOrderId: string,
    gqlClient?: any
  ) {
    if (!!!gqlClient) {
      gqlClient = await this.createGraphqlClient();
    }

    try {
      const prepareOrder = await gqlClient.query({
        data: {
          query: GQL_MUTATIONS.PREPARE_ORDER_FOR_PICKUP,
          variables: {
            input: {
              lineItemsByFulfillmentOrder: [
                {
                  fulfillmentOrderId,
                },
              ],
            },
          },
        },
      });

      const extensions = (prepareOrder.body as any).extensions;
      const { userErrors } = (prepareOrder.body as any).data;

      ShopifyProvider.GRAPHQL_API_AVAILABLE_CREDITS =
        extensions.cost.currentlyAvailable;

      return { userErrors, cost: extensions.cost };
    } catch (err) {
      console.log("GQL PREPARE ORDER FOR PICKUP CATCH");
      throw err;
    }
  }

  public async gqlGetOrdersByQuery(query: string, gqlClient?: any) {
    if (!!!gqlClient) {
      gqlClient = await this.createGraphqlClient();
    }

    try {
      const getOrdersByQuery = await gqlClient.query({
        data: {
          query: GQL_QUERIES.ORDERS,
          variables: {
            query,
          },
        },
      });

      const extensions = (getOrdersByQuery.body as any).extensions;
      const { orders, userErrors } = (getOrdersByQuery.body as any).data;

      ShopifyProvider.GRAPHQL_API_AVAILABLE_CREDITS =
        extensions.cost.currentlyAvailable;

      return { orders, userErrors, cost: extensions.cost };
    } catch (err) {
      console.log("GQL GET ORDERS BY QUERY CATCH");
      throw err;
    }
  }
}

class ShopifyProviderSingleton {
  // Step 1: Create a private static property to hold the singleton instance
  private static instance: ShopifyProvider;

  // Step 2: Make the constructor private to prevent direct instantiation
  private constructor() {
    // Initialization logic here
    // For example, initialize API connections, set default values, etc.
  }

  // Step 3: Provide a public static method to access the singleton instance
  public static getInstance(): ShopifyProvider {
    if (!this.instance) {
      console.log("ShopifyProviderSingleton |regenerating ");
      this.instance = new ShopifyProvider();
    }
    return this.instance;
  }

  // Example method
  public getShopDetails(): void {
    console.log("Shop details...");
  }
}

const shopifyProvider = ShopifyProviderSingleton.getInstance();
const shopify = shopifyProvider.shopify;

export { ShopifyProvider, shopify };
export default shopifyProvider;
