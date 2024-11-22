import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { workerData, parentPort, isMainThread, threadId } from "worker_threads";
import { TASK_SUCCESS_MESSAGE, TaskState, TaskType, } from "../interfaces/TaskInterfaces.js";
import { GqlProductStatus, GqlWeightUnit, MetafieldOwner, } from "../interfaces/ShopifyInterfaces.js";
import config from "../config.js";
import folders from "../utils/folders.js";
// MODELS
import "../models/EventModel.js";
import Task from "../models/TaskModel.js";
import Location from "../models/LocationModel.js";
import HelpersController from "../controllers/HelpersController.js";
import BaseTaskController from "./BaseTask.js";
// PROVIDERS
import ShopifyProvider, { ShopifyProvider as _ShopifyProvider, } from "../providers/ShopifyProvider.js";
import AgilisaProvider from "../providers/AgilisaProvider.js";
// import SocketProvider from '@/providers/SocketProvider.js'
import AppCfgModel from "../models/AppCfgModel.js";
function removeDuplicatesByField(array, field) {
    const uniqueObjects = new Set();
    return array.filter(obj => {
        const key = obj[field];
        // Check if the field is an array
        const uniqueKey = Array.isArray(key)
            ? JSON.stringify([...key].sort()) // Sort the array before stringifying
            : String(key);
        if (!uniqueObjects.has(uniqueKey)) {
            uniqueObjects.add(uniqueKey);
            return true;
        }
        return false;
    });
}
class ProductTasksController extends BaseTaskController {
    db = mongoose.connection;
    static shopifyProducts = [];
    constructor() {
        super();
    }
    connectDB() {
        // MongoDB settings
        if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
            // Connection is already active
            this.db = mongoose.connection;
            return new Promise((res, rej) => {
                this.db.on("error", rej);
                this.db.on("open", res);
            });
        }
        else {
            mongoose.set("strictQuery", false);
            mongoose.connect(config.DB.URI, {
                retryWrites: false,
                w: "majority",
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            this.db = mongoose.connection;
            return new Promise((res, rej) => {
                this.db.on("error", rej);
                this.db.on("open", res);
            });
        }
    }
    cleanGqlInput(obj) {
        Object.entries(obj).forEach(([key, value]) => {
            if (value !== undefined) {
                if (typeof value !== "object")
                    return;
                if (Array.isArray(value))
                    obj[key] = value.map((x) => this.cleanGqlInput(x));
                obj[key] = this.cleanGqlInput(value);
                return;
            }
            delete obj[key];
        });
        return obj;
    }
    addErpIdParamProcess(erpProducts) {
        // HOMOLOGATE THIS
        return erpProducts.map((x) => ({
            ...x,
            erpId: x.reference, // modify this
        }));
    }
    async processParams(erpProducts, task) {
        console.log("ProductTasks processParams |Started");
        // WRITE ERP DATA INTERFACE FOR YOUR SPECIFIC ERP
        // PROCESS THE DATA AND RETURN THE EXPECTED PRODUCT DATA FOR THE APP TO CREATE THE PRODUCTS
        const products = [];
        const locations = await Location.find({ active: true });
        const appCfg = await AppCfgModel.findOne();
        const tagKeys = [
            "Color",
            "CategoryName",
            "DepartmentName",
            "Size",
            "Size",
            "Color",
            "BinLocation",
            "CategoryName",
            "DepartmentName",
        ];
        const METAFIELD_KEYS = {};
        // CHECK IF WE NEED TO ADD THIS PRODUCT PAYLOAD, CHECKING LastUpdated and microstate from last task
        const lastTopicTask = await Task.findOne({
            type: task.type,
            state: TaskState.FINISHED,
        }, null, { sort: { startedAt: -1 } });
        for (const product of erpProducts) {
            let productIdentifier = `ref=${product.reference}`;
            try {
                const thisProduct = ProductTasksController.shopifyProducts.find((p) => {
                    const variantMatch = p.variants.some((v) => v.sku === product.variants[0].ItemLookupCode);
                    return variantMatch || p.tags?.includes(productIdentifier);
                });
                const payload = {
                    erpId: String(product.reference),
                    status: thisProduct?.status?.toUpperCase() ||
                        appCfg.productCreationMode ||
                        GqlProductStatus.ACTIVE,
                    type: product.type,
                    vendor: product.vendor,
                    title: product.title,
                    category: product.category,
                    tags: [productIdentifier],
                    metafields: [],
                };
                if (!!thisProduct)
                    payload.shopifyId = thisProduct.id;
                if (!!!thisProduct && task.type !== TaskType.CREATE_UPDATE_PRODUCTS) {
                }
                if (!!!thisProduct && task.type !== TaskType.CREATE_UPDATE_PRODUCTS)
                    continue;
                const variants = [];
                // CHECK IF WE NEED TO ADD THIS PRODUCT PAYLOAD, CHECKING LastUpdated and microstate from last task
                const thisProductResult = lastTopicTask?.outerData?.results.find((r) => r.erpId === payload.erpId);
                const _variants = product.variants.filter((variant) => {
                    // CHECK IF WE NEED TO ADD THIS PRODUCT PAYLOAD, CHECKING LastUpdated and microstate from last task
                    const isoUpdated = new Date(variant.LastUpdated);
                    isoUpdated.setHours(isoUpdated.getHours());
                    const updatedAfterLastTask = isoUpdated >= lastTopicTask?.startedAt;
                    if (!!thisProductResult?.status &&
                        !updatedAfterLastTask &&
                        !!thisProduct) {
                        // // parentPort.postMessage({ action: 'message', payload: `----- IGNORING ----- SKU: ${variant.ItemLookupCode} (${payload.title || 'N/A'}) AS NOT MODIFIED` })
                        return false;
                    }
                    return true;
                });
                if (product.variants.length !== _variants.length) {
                    // parentPort.postMessage({ action: 'message', payload: `----- IGNORED ----- ${product.variants.length - _variants.length} OUT OF ${product.variants.length} VARIANTS ON PRODUCT (${payload.erpId}) AS NOT MODIFIED` })
                }
                _variants.forEach((variant) => {
                    const vPayload = {
                        erpId: variant.ItemLookupCode,
                        sku: variant.ItemLookupCode,
                        barcode: variant.ItemLookupCode,
                        title: variant.ExtendedDescription || payload.title,
                        metafields: [],
                    };
                    // CHECK IF WE NEED TO ADD THIS PRODUCT PAYLOAD, CHECKING LastUpdated and microstate from last task
                    const isoUpdated = new Date(variant.LastUpdated);
                    isoUpdated.setHours(isoUpdated.getHours() + 0);
                    const updatedAfterLastTask = isoUpdated >= lastTopicTask?.startedAt;
                    if (!!thisProductResult?.status &&
                        !updatedAfterLastTask &&
                        !!thisProduct) {
                        // parentPort.postMessage({ action: 'message', payload: `----- IGNORING ----- SKU: ${variant.ItemLookupCode} (${payload.title || 'N/A'}) AS NOT MODIFIED` })
                        return;
                    }
                    if (!!task) {
                        if (task.type === TaskType.UPDATE_PRICE) {
                            vPayload.price = String(Math.round(Number(variant.price || 0)));
                            vPayload.compareAtPrice = String(Math.round(Number(variant.compareAtPrice || 0)));
                        }
                        if (task.type === TaskType.UPDATE_STOCK) {
                            const inventoryInfo = variant.inventory
                                .filter((loc) => locations.some((l) => +l.erpId === +loc.StoreCode))
                                .map((loc) => {
                                const thisLocation = locations.find((l) => +l.erpId === +loc.StoreCode);
                                return {
                                    locationId: Number(thisLocation.shopifyId),
                                    quantity: Number(loc.Quantity),
                                };
                            });
                            vPayload.inventory = inventoryInfo;
                        }
                        if (task.type === TaskType.CREATE_UPDATE_PRODUCTS) {
                            vPayload.options = [];
                            payload.options = [];
                            if (!!variant.Color) {
                                payload.options.push("Color");
                                vPayload.options.push(variant.Color);
                            }
                            if (!!variant.Size) {
                                payload.options.push("Talle");
                                vPayload.options.push(variant.Size);
                            }
                        }
                    }
                    if (!!thisProduct) {
                        payload.shopifyId = thisProduct.id;
                        const thisVariant = thisProduct.variants.find((v) => v.sku === variant.ItemLookupCode);
                        if (!!thisVariant) {
                            vPayload.shopifyId = thisVariant.admin_graphql_api_id;
                        }
                        const isOutOfStock = vPayload.inventory?.every((inv) => inv.quantity === 0);
                        if (isOutOfStock)
                            return;
                        if (!!!thisVariant &&
                            !!thisProduct &&
                            task.type !== TaskType.CREATE_UPDATE_PRODUCTS) {
                            return;
                        }
                    }
                    variants.push(vPayload);
                });
                payload.variants = variants;
                if (!(thisProduct && thisProduct.id)) {
                    payload.variants = removeDuplicatesByField(removeDuplicatesByField(variants, "title"), "options").slice(0, 100);
                }
                Object.entries({
                    ...product,
                    ...(product.variants.at(0) || {}),
                }).forEach(([key, value]) => {
                    let isTag = tagKeys.includes(key);
                    let isMetafield = Object.keys(METAFIELD_KEYS).includes(key);
                    if (!isTag && !isMetafield)
                        return;
                    if (isTag)
                        payload.tags.push(`${key}=${value}`);
                    if (isMetafield) {
                        // const [metaNamespace, metaKey, modifier] = METAFIELD_KEYS[key as keyof typeof METAFIELD_KEYS].split('.')
                        // payload.metafields.push({
                        //     namespace: metaNamespace,
                        //     key: metaKey,
                        //     value: !!!modifier ? String(value) : `${key}=${value}`
                        // })
                    }
                });
                if (!!thisProduct) {
                    const oldTags = thisProduct?.tags?.split(", ") || [];
                    payload.tags = [...new Set([...payload.tags, ...oldTags])];
                }
                if ([TaskType.UPDATE_PRICE, TaskType.UPDATE_STOCK].includes(task.type) &&
                    (variants.length === 0 || !!!thisProduct))
                    continue;
                products.push(payload);
            }
            catch (err) {
                console.log(err);
                if (err.bubble)
                    throw err;
            }
        }
        console.log("ProductTasks processParams |Succesfully finished going throuh all them");
        console.log(products.length);
        return products;
    }
    buildCreateUpdateGqlParams(product) {
        const isUpdating = !!product.shopifyId;
        const thisProduct = isUpdating
            ? ProductTasksController.shopifyProducts.find(x => x.id === product.shopifyId || x.admin_graphql_api_id === product.shopifyId)
            : undefined;
        const variants = product.variants?.map(variant => {
            let weightUnit = GqlWeightUnit.GRAMS;
            // console.log(variant.sku, variant.erpId, variant.inventory);
            const inventoryQuantities = !!variant.inventory && variant.inventory.map(x => {
                return {
                    availableQuantity: x.quantity,
                    locationId: typeof x.locationId === 'string'
                        ? x.locationId
                        : `gid://shopify/Location/${x.locationId}`
                };
            }) || undefined;
            if (isUpdating && !!thisProduct) {
                const thisVariant = thisProduct.variants.find((v) => v.sku === variant.sku || v.barcode === variant.barcode);
                const WeightUnifier = {
                    g: GqlWeightUnit.GRAMS,
                    oz: GqlWeightUnit.OUNCES,
                    kg: GqlWeightUnit.KILOGRAMS,
                    lb: GqlWeightUnit.POUNDS,
                };
                if (!!thisVariant) {
                    variant.shopifyId = thisVariant.admin_graphql_api_id;
                    weightUnit = WeightUnifier[thisVariant.weight_unit] || weightUnit;
                }
            }
            const variantShopifyId = !!!variant.shopifyId
                ? undefined
                : typeof variant.shopifyId === 'string'
                    ? variant.shopifyId
                    : `gid://shopify/ProductVariant/${variant.shopifyId}`;
            return {
                id: variantShopifyId,
                title: variant.title,
                barcode: variant.barcode,
                compareAtPrice: variant.compareAtPrice,
                price: variant.price,
                sku: variant.sku,
                imageSrc: variant.imageSrc,
                mediaSrc: variant.mediaSrc && [variant.mediaSrc] || undefined,
                options: variant.options,
                inventoryManagement: 'SHOPIFY',
                inventoryPolicy: 'DENY',
                inventoryItem: { tracked: true },
                metafields: variant.metafields,
                weight: parseFloat(variant.weight) || undefined,
                weightUnit,
                inventoryQuantities
            };
        }) || undefined;
        let imgExtensionRegex = /\.(jpg|jpeg|png|gif|bmp)$/i;
        let images = product.images?.map(({ src, altText }) => {
            const isVariantImage = product.variants.find(variant => variant.imageSrc === src);
            let thisImgFilename = encodeURIComponent(src.split('/').pop().replace(imgExtensionRegex, '')).replace(/(%)/g, '_');
            const imgExist = thisProduct?.images.find((_img) => _img.src.includes(thisImgFilename));
            if (!!!isVariantImage || !!!isVariantImage.options)
                return { src, altText, id: imgExist?.admin_graphql_api_id };
            return {
                src,
                altText: isVariantImage.options.join(' / '),
                id: imgExist?.admin_graphql_api_id
            };
        }) || undefined;
        let status = product.status || GqlProductStatus.DRAFT;
        if (isUpdating) {
            if (!!variants) {
                thisProduct.variants.forEach((variant) => {
                    if (variants.some(v => v.id === variant.admin_graphql_api_id))
                        return;
                    variants.push({
                        id: variant.admin_graphql_api_id,
                        sku: variant.sku,
                        options: [variant.option1, variant.option2, variant.option3].filter(o => !!o),
                    });
                });
                const desiredOrder = [
                    'XXS',
                    'XS',
                    'S',
                    'M',
                    'L',
                    'XL',
                    '2XL',
                    'XXL',
                    '3XL',
                    'XXXL',
                    '4XL',
                    'XXXXL',
                ];
                // SORT VARIANTS BY SIZE
                variants.sort((a, b) => {
                    let aVariant = null;
                    let bVariant = null;
                    if (!!!a.options) {
                        aVariant = thisProduct.variants.find((v) => v.admin_graphql_api_id === a.id);
                        if (!!aVariant)
                            a.options = [aVariant.option1, aVariant.option2, aVariant.option3].filter(o => !!o);
                    }
                    if (!!!b.options) {
                        bVariant = thisProduct.variants.find((v) => v.admin_graphql_api_id === b.id);
                        if (!!bVariant)
                            b.options = [bVariant.option1, bVariant.option2, bVariant.option3].filter(o => !!o);
                    }
                    if (!!!a.options || !!!b.options)
                        return 0;
                    const sortResult = desiredOrder.indexOf(a.options[1]) - desiredOrder.indexOf(b.options[1]);
                    return sortResult;
                });
            }
            if (!!images && !!thisProduct) {
                // UPLOADING IMAGES
                const imgFileNames = images.map(({ src }) => src.split('/').pop().replace(imgExtensionRegex, ''));
                // SHOPIFY PRODUCT IMAGES
                thisProduct.images.forEach((image) => {
                    const existImage = imgFileNames.some(i => image.src.includes(i));
                    if (existImage)
                        return; // CHECK THIS, AS IT WONT ADD NEW IMAGES FOR VARIANT ON UPDATES
                    images.push({ id: image.admin_graphql_api_id });
                });
                images = images.map(({ src, id, altText }) => {
                    if (!!id)
                        return { id };
                    if (!!!altText)
                        return { src };
                    return { src, altText };
                });
            }
            if (!!!product.status)
                status = undefined;
        }
        const shopifyId = !!!product.shopifyId
            ? undefined
            : typeof product.shopifyId === 'string'
                ? product.shopifyId
                : `gid://shopify/Product/${product.shopifyId}`;
        const productPayload = {
            id: shopifyId,
            tags: product.tags,
            descriptionHtml: product.description,
            vendor: product.vendor,
            productType: product.type,
            status,
            title: product.title || undefined,
            // variants,
            variants: isUpdating ? variants : removeDuplicatesByField(removeDuplicatesByField(variants, "title"), "options").slice(0, 100),
            options: product.options,
            images,
            metafields: product.metafields,
        };
        return this.cleanGqlInput(productPayload);
    }
    // ------- END PRIVATE
    async getErpProducts(task) {
        console.log("getErpProducts |Start");
        console.log("getErpProducts |Start " + task?.fnToCall);
        // RUN QUERY TO AGILISA DB
        const agilisaProvider = new AgilisaProvider();
        if (AgilisaProvider.PROVIDER_CALLS === 0) {
            await new Promise((res) => setTimeout(res, 2 * 1000));
        }
        const pFields = [];
        if ([TaskType.UPDATE_PRICE, TaskType.UPDATE_STOCK].includes(task.type)) {
            pFields.push("ItemLookupCode", "Reference", "Size", "LastUpdated");
        }
        try {
            if (task.type === TaskType.CREATE_UPDATE_PRODUCTS) {
                console.log("getErpProducts |TaskType.CREATE_UPDATE_PRODUCTS");
                const number = await agilisaProvider.getMasterProductsCount();
                console.log("getErpProducts |Success conection retrieved the count of products " +
                    number);
                console.log("agilisaProvider.getAllMasterProducts |Started");
                // parentPort.postMessage({ action: 'message', payload: 'FETCHING MASTER PRODUCTS FROM DB' })
                const erpProducts = await agilisaProvider.getAllMasterProducts({
                    fields: pFields,
                });
                console.log("agilisaProvider.getAllMasterProducts |End of message");
                // parentPort.postMessage({ action: 'message', payload: 'GROUPING PRODUCTS FROM VARIANT PAYLOADS' })
                const groupedProducts = erpProducts.reduce((acc, variant) => {
                    const [ref, modifier] = variant.Reference.split(" ");
                    const existProduct = acc.find((p) => p.reference === ref);
                    const _variant = { ...variant };
                    delete _variant.Description;
                    delete _variant.SupplierName;
                    delete _variant.DepartmentName;
                    delete _variant.CategoryName;
                    if (!!!existProduct) {
                        acc.push({
                            reference: ref,
                            title: variant.Description,
                            vendor: variant.SupplierName,
                            category: variant.DepartmentName,
                            type: variant.CategoryName,
                            variants: [_variant],
                        });
                        return acc;
                    }
                    existProduct.variants.push(_variant);
                    return acc;
                }, []);
                const desiredOrder = [
                    "XXS",
                    "XS",
                    "S",
                    "M",
                    "L",
                    "XL",
                    "2XL",
                    "XXL",
                    "3XL",
                    "XXXL",
                    "4XL",
                    "XXXXL",
                ];
                groupedProducts.forEach((p) => {
                    // console.log(
                    //   `groupedProducts |p.title ${p.title} p.variants ${JSON.stringify(
                    //     p.variants
                    //   )}`
                    // );
                    p.variants.sort((a, b) => {
                        return desiredOrder.indexOf(a.Size) - desiredOrder.indexOf(b.Size);
                    });
                });
                return groupedProducts;
            }
            const fields = ["ItemLookupCode", "Reference", "LastUpdated"];
            if (task.type === TaskType.UPDATE_STOCK) {
                fields.push("StoreCode", "StoreName", "Quantity");
            }
            if (task.type === TaskType.UPDATE_PRICE) {
                fields.push("Price", "SaleType", "SalesPrice");
            }
            // parentPort.postMessage({ action: 'message', payload: 'FETCHING MASTER INVENTORY FROM DB' })
            const masterInventory = await agilisaProvider.getAllMasterInventory({
                fields,
                limit: 3000,
            });
            // parentPort.postMessage({ action: 'message', payload: 'GROUPING PRODUCTS FROM VARIANT PAYLOADS' })
            const groupedProductsInventory = masterInventory.reduce((acc, variant) => {
                const [ref, modifier] = variant.Reference.split(" ");
                const existProduct = acc.find((p) => p.reference === ref);
                if (!!!existProduct) {
                    acc.push({
                        reference: ref,
                        variants: [variant],
                    });
                    return acc;
                }
                existProduct.variants.push(variant);
                return acc;
            }, []);
            // parentPort.postMessage({ action: 'message', payload: 'BUILDING VARIANTS FOR UPDATE_PRICE TASK' })
            for await (const product of groupedProductsInventory) {
                if (task.type === TaskType.UPDATE_PRICE) {
                    product.variants = product.variants.reduce((acc, v) => {
                        const existVariant = acc.find((x) => x.ItemLookupCode === v.ItemLookupCode);
                        if (!!existVariant)
                            return acc;
                        acc.push({
                            Reference: v.Reference,
                            ItemLookupCode: v.ItemLookupCode,
                            price: v.Price,
                            saleType: v.SaleType,
                            compareAtPrice: v.SalesPrice,
                            LastUpdated: v.LastUpdated,
                        });
                        return acc;
                    }, []);
                    continue;
                }
                if (task.type === TaskType.UPDATE_STOCK) {
                    // // parentPort.postMessage({ action: 'message', payload: 'BUILDING VARIANTS FOR UPDATE_STOCK TASK' })
                    for await (const variant of product.variants) {
                        const variantInventory = masterInventory.filter((inv) => inv.ItemLookupCode === variant.ItemLookupCode);
                        variant.inventory = variantInventory.map((inv) => ({
                            StoreCode: inv.StoreCode,
                            StoreName: inv.StoreName,
                            Quantity: inv.Quantity,
                        }));
                    }
                }
            }
            console.log("getErpProducts |End of message");
            return groupedProductsInventory;
        }
        catch (err) {
            console.log("getErpProducts |err throwed");
            console.log("getErpProducts | " + err);
            throw err;
        }
    }
    async checkVariantsInventory(product) {
        if (!(!!product.variants && Array.isArray(product.variants)))
            return;
        const thisProduct = ProductTasksController.shopifyProducts.find((x) => x.id === product.shopifyId);
        for await (const variant of product.variants) {
            if (!!!variant.inventory)
                continue;
            // CHECK INVENTORY LEVELS -> INVENTORY_ITEM_ID
            // IF INVENTORY_LEVELS !INCLUDES -> _product.inventory
            // run inventoryActivate gql mutation / rest fn with no available param
            const thisVariant = thisProduct?.variants.find((v) => v.id === variant.shopifyId ||
                v.admin_graphql_api_id === variant.shopifyId);
            if (!!!thisVariant)
                continue;
            try {
                await HelpersController.sleep(200);
                const variantInventoryLevels = await ShopifyProvider.queueRestRequest(async () => await ShopifyProvider.getInventoryLevels({
                    inventory_item_ids: String(thisVariant.inventory_item_id),
                }));
                const missingLevels = variant.inventory.filter((x) => !variantInventoryLevels.some((l) => l.location_id === x.locationId));
                if (missingLevels.length === 0)
                    continue;
                console.log("MISSING STOCK!!");
                console.log(variant.erpId);
                for (const level of missingLevels) {
                    await HelpersController.sleep(200);
                    await ShopifyProvider.queueRestRequest(async () => await ShopifyProvider.activateInventoryLevel({
                        inventoryItemId: thisVariant.inventory_item_id,
                        locationId: level.locationId,
                    }));
                }
            }
            catch (err) {
                console.log("VARIANT INVENTORY LEVELS RELATED CATCH");
                console.log(err);
            }
        }
    }
    async checkAllVariantInventories({ products, }) {
        // - GET DISTINCT ALL LOCATION IDS
        // - GET ALL INVENTORY LEVELS FOR THAT IDS
        // - CHECK ALL PRODUCTS -> VARIANTS
        // parentPort.postMessage({ action: 'message', payload: `CHECKING VARIANTS INVENTORY!!!` })
        console.log("INVENTORY_CHECK");
        const locationIds = [];
        console.log('checkAllVariantInventories 0', products.length);
        products.forEach((p) => {
            p.variants.forEach((v) => {
                if (!!!v.inventory)
                    return;
                const newInventories = v.inventory
                    .filter((inv) => !locationIds.includes(inv.locationId))
                    .map((inv) => inv.locationId);
                if (!!!newInventories.length)
                    return;
                locationIds.push(...newInventories);
            });
        });
        console.log('checkAllVariantInventories 1');
        // parentPort.postMessage({ action: 'message', payload: `DISTINCT LOCATION IDs BELOW` })
        // parentPort.postMessage({ action: 'message', payload: locationIds })
        if (!!!locationIds.length) {
            throw {
                message: "No location IDs to update for",
            };
        }
        console.log('checkAllVariantInventories 2');
        const allInventoryLevels = await ShopifyProvider.getAllInventoryLevels({
            location_ids: locationIds.join(","),
        });
        console.log('checkAllVariantInventories 3');
        for (const product of products) {
            try {
                const thisProduct = ProductTasksController.shopifyProducts.find((x) => x.id === product.shopifyId ||
                    x.admin_graphql_api_id === product.shopifyId);
                if (!!!thisProduct)
                    continue;
                for await (const variant of product.variants) {
                    if (!!!variant.inventory)
                        continue;
                    // CHECK INVENTORY LEVELS -> INVENTORY_ITEM_ID
                    // IF INVENTORY_LEVELS !INCLUDES -> _product.inventory
                    // run inventoryActivate gql mutation / rest fn with no available param
                    const thisVariant = thisProduct?.variants.find((v) => v.id === variant.shopifyId ||
                        v.admin_graphql_api_id === variant.shopifyId);
                    if (!!!thisVariant)
                        continue;
                    try {
                        const variantInventoryLevels = allInventoryLevels.filter((inv) => inv.inventory_item_id === thisVariant.inventory_item_id);
                        const missingLevels = variant.inventory.filter((x) => !variantInventoryLevels.some((l) => l.location_id === x.locationId));
                        if (missingLevels.length === 0)
                            continue;
                        console.log({ action: 'message', payload: 'MISSING STOCK!!' });
                        console.log({ action: 'message', payload: variant.erpId });
                        // parentPort.postMessage({ action: 'message', payload: 'MISSING STOCK!!' })
                        // parentPort.postMessage({ action: 'message', payload: variant.erpId })
                        for (const level of missingLevels) {
                            await ShopifyProvider.queueRestRequest(async () => await ShopifyProvider.activateInventoryLevel({
                                inventoryItemId: thisVariant.inventory_item_id,
                                locationId: level.locationId,
                            }));
                        }
                    }
                    catch (err) {
                        console.log('checkAllVariantInventories err');
                        console.log(err);
                        // parentPort.postMessage({ action: 'message', payload: 'VARIANT INVENTORY LEVELS RELATED CATCH' })
                        // parentPort.postMessage({ action: 'message', payload: err })
                    }
                }
            }
            catch (err) {
                console.log(err);
            }
        }
        console.log('checkAllVariantInventories 4');
        console.log("INVENTORY_CHECK");
    }
    async createUpdateProducts({ nowDate }) {
        console.log("createUpdateProducts |Begin");
        let isError = false;
        const result = {
            results: [],
            success: 0,
            failed: 0,
        };
        await this.connectDB();
        console.log("createUpdateProducts |Connected To Mongodb");
        const task = await Task.findOne({ busId: workerData.pId });
        const event = task.eventId;
        console.log("createUpdateProducts |Found Task & Event from Mongodb");
        try {
            if (typeof task.innerData === "string" && fs.existsSync(task.innerData)) {
                const innerData = JSON.parse(fs.readFileSync(task.innerData, { encoding: "utf-8" }));
                task.innerData = innerData;
            }
            let erpProducts = task.innerData?.resources || [];
            if (!!!erpProducts || !!!erpProducts.length) {
                erpProducts = await this.getErpProducts(task);
            }
            console.log("createUpdateProducts |erpProducts succesfully retrieved");
            erpProducts = this.addErpIdParamProcess(erpProducts);
            const tempRoute = path.resolve(folders.TEMP, `${task.type}_${task._id}.json`);
            fs.writeFileSync(tempRoute, JSON.stringify({ resources: erpProducts }, null, 4), { encoding: "utf-8" });
            console.log("ShopifyProvider.getLocations |To Start");
            const shopifyLocations = await ShopifyProvider.getLocations();
            console.log("ShopifyProvider.getAllProducts |To Start");
            const shopifyProducts = await ShopifyProvider.getAllProducts({
                fields: ["id", "variants", "images", "status", "tags"],
            });
            // // parentPort.postMessage({ action: 'message', payload: `SHOPIFY PRODUCTS ==> ${shopifyProducts.length}` })
            ProductTasksController.shopifyProducts = [...shopifyProducts];
            const gqlClient = await ShopifyProvider.createGraphqlClient();
            _ShopifyProvider.GRAPHQL_API_PARALLEL_REQUESTS = 25;
            // // parentPort.postMessage({ action: 'message', payload: `ERP PRODUCTS ==> ${erpProducts.length}` })
            // PROCESS ERP DATA
            let products = await this.processParams(erpProducts, task);
            // // parentPort.postMessage({ action: 'message', payload: `PRODUCTS ==> ${products.length}` })
            // WORKAROUND HOW TO USE getAllInventoryLevels FN on UPDATE_STOCK task
            // to avoid waiting on each variant rest request.
            if (task.type === TaskType.UPDATE_STOCK) {
                // parentPort.postMessage({ action: 'message', payload: `CHECKING ALL VARIANT INVENTORIES` })
                console.log("this.checkAllVariantInventories |Started ", products.length);
                await this.checkAllVariantInventories({ products });
                console.log("this.checkAllVariantInventories |End of message");
            }
            const _tempRoute = path.resolve(folders.TEMP, `${task.type}_latest_gqlPayload.json`);
            const _tempRoute1 = path.resolve(folders.TEMP, `${task.type}_latest_pre_gqlPayload.json`);
            fs.writeFileSync(_tempRoute1, JSON.stringify(products, null, 4), {
                encoding: "utf-8",
            });
            fs.writeFileSync(_tempRoute, JSON.stringify(products.map(e => this.buildCreateUpdateGqlParams(e)), null, 4), {
                encoding: "utf-8",
            });
            for (let i = 0; i < products.length; i++) {
                const _product = products[i];
                const isUpdating = !!_product.shopifyId;
                const thisProduct = ProductTasksController.shopifyProducts.find((x) => x.id === _product.shopifyId ||
                    x.admin_graphql_api_id === _product.shopifyId);
                // console.log("thisProduct ",thisProduct);
                let inventoryCheckReqTime = 0;
                const pInfo = {
                    erpId: _product.erpId,
                    shopifyId: _product.shopifyId || null,
                    observations: "",
                    processedAt: Date.now(),
                    variantsCount: _product.variants?.length || 0,
                    apiHealthData: null,
                    status: true,
                    title: _product.title,
                };
                try {
                    if ([TaskType.UPDATE_PRICE, TaskType.UPDATE_STOCK].includes(task.type) &&
                        !!!thisProduct) {
                        pInfo.failed++;
                        pInfo.observations = "Product not found on Shopify";
                        pInfo.status = false;
                        result.results.push(pInfo);
                        continue;
                    }
                    if (isUpdating) {
                        // START CLEANING PAYLOADS DEPENDING ON EACH TASK TYPE
                        if (!!!thisProduct) {
                            console.log("Product not found on Shopify");
                            pInfo.failed++;
                            pInfo.observations = "Product not found on Shopify";
                            pInfo.status = false;
                            result.results.push(pInfo);
                            continue;
                        }
                        if (task.type === TaskType.CREATE_UPDATE_PRODUCTS &&
                            !!_product.variants) {
                            _product.variants.forEach((v) => {
                                // if ( !!event && event.type === ERP_ACTION.ADD_SKU ) return
                                delete v.inventory;
                                delete v.price;
                                delete v.compareAtPrice;
                            });
                        }
                        if (task.type === TaskType.UPDATE_PRICE) {
                            let prodNeededKeys = [
                                "shopifyId",
                                "erpId",
                                "status",
                                "title",
                                "variants",
                            ];
                            let variantNeededKeys = [
                                "compareAtPrice",
                                "shopifyId",
                                "price",
                                "sku",
                            ];
                            Object.keys(_product).forEach((k) => {
                                if (prodNeededKeys.includes(k))
                                    return;
                                delete _product[k];
                            });
                            if (!!_product.variants && Array.isArray(_product.variants)) {
                                _product.variants.forEach((variant) => {
                                    Object.keys(variant).forEach((k) => {
                                        if (variantNeededKeys.includes(k))
                                            return;
                                        delete variant[k];
                                    });
                                });
                            }
                        }
                        if (task.type === TaskType.UPDATE_STOCK) {
                            let prodNeededKeys = [
                                "shopifyId",
                                "erpId",
                                "variants",
                                "title",
                            ];
                            let variantNeededKeys = [
                                "shopifyId",
                                "inventory",
                                "erpId",
                                "sku",
                            ];
                            Object.keys(_product).forEach((k) => {
                                if (prodNeededKeys.includes(k))
                                    return;
                                delete _product[k];
                            });
                            if (!!_product.variants && Array.isArray(_product.variants)) {
                                _product.variants.forEach((variant) => {
                                    Object.keys(variant).forEach((k) => {
                                        if (variantNeededKeys.includes(k))
                                            return;
                                        delete variant[k];
                                    });
                                    // Filter inventory info by active locations
                                    variant.inventory = variant.inventory.filter((l) => shopifyLocations.some((_l) => _l.id === l.locationId && _l.active));
                                });
                            }
                        }
                    }
                }
                catch (err) {
                    // LOG ERROR ON PRODUCT
                    console.log(err.response);
                    console.log(err);
                    pInfo.observations =
                        err.response || `ERROR WHILE UPDATING PREV INFO | ${err.message}`;
                    pInfo.status = false;
                    result.failed++;
                    pInfo.processedAt = Date.now();
                    result.results.push(pInfo);
                    continue;
                }
                try {
                    if (_product.metafields?.length > 0 && !!thisProduct) {
                        const productMetafields = await ShopifyProvider.queueRestRequest(async () => await ShopifyProvider.getMetafieldsByOwner({
                            id: Number(thisProduct.id),
                            resourceType: MetafieldOwner.PRODUCT,
                        }));
                        for await (const metafield of _product.metafields) {
                            const existMeta = productMetafields.find((m) => m.namespace === metafield.namespace && m.key === metafield.key);
                            if (!!!existMeta)
                                continue;
                            metafield.id = existMeta.admin_graphql_api_id;
                        }
                    }
                }
                catch (err) {
                    // LOG ERROR ON PRODUCT
                    console.log(err.response);
                    console.log(err);
                    pInfo.observations =
                        err.response || "ERROR WHILE UPDATING METAFIELDS";
                    pInfo.status = false;
                    result.failed++;
                    pInfo.processedAt = Date.now();
                    result.results.push(pInfo);
                    continue;
                }
                const gqlPayload = this.buildCreateUpdateGqlParams(_product);
                pInfo.title = gqlPayload.title;
                // pInfo.payload = gqlPayload
                // log init on task
                // console.log('----INIT')
                if (_ShopifyProvider.GRAPHQL_API_SLEEP_COUNT > 0) {
                    // FOR SPECIAL CASES
                    await HelpersController.sleep(_ShopifyProvider.GRAPHQL_API_SLEEP_COUNT);
                }
                if (_ShopifyProvider.GRAPHQL_API_AVAILABLE_CREDITS <=
                    _ShopifyProvider.GRAPHQL_API_MINIMUM_SAFE) {
                    const fullyRestoreCredits = _ShopifyProvider.GRAPHQL_API_MAX_AVAILABLE_CREDITS -
                        _ShopifyProvider.GRAPHQL_API_AVAILABLE_CREDITS;
                    const sleepSeconds = fullyRestoreCredits / _ShopifyProvider.GRAPHQL_API_RESTORE_RATE;
                    // parentPort.postMessage({ action: 'message', payload: `GRAPHQL API RATE LIMIT REQUESTS SAFE FN, sleeping ${sleepSeconds}s, RESTORING ${fullyRestoreCredits} credits` })
                    await HelpersController.sleep(sleepSeconds * 1000);
                    _ShopifyProvider.GRAPHQL_API_AVAILABLE_CREDITS += fullyRestoreCredits;
                }
                if (i % _ShopifyProvider.GRAPHQL_API_PARALLEL_REQUESTS === 0) {
                    if (task.type === TaskType.UPDATE_STOCK) {
                        inventoryCheckReqTime = Date.now();
                        await this.checkVariantsInventory(_product);
                        inventoryCheckReqTime = Date.now() - inventoryCheckReqTime;
                        console.log(`Inventory Check Req Time - ${inventoryCheckReqTime / 1000}`);
                    }
                    // parentPort.postMessage({ action: 'message', payload: `\n\nAVAILABLE ==> ${_ShopifyProvider.GRAPHQL_API_AVAILABLE_CREDITS}` })
                    // parentPort.postMessage({ action: 'message', payload: `SAFE ==> ${_ShopifyProvider.GRAPHQL_API_MINIMUM_SAFE}` })
                    // parentPort.postMessage({ action: 'message', payload: `ITERATION ==> ${i} / ${products.length - 1}` })
                    // parentPort.postMessage({ action: 'message', payload: `PARALLEL ==> ${_ShopifyProvider.GRAPHQL_API_PARALLEL_REQUESTS}` })
                    try {
                        console.log("ShopifyProvider.gqlCreateOrUpdateProduct |started");
                        const firstRequestTimeStart = Date.now();
                        const { product, userErrors, cost } = await ShopifyProvider.gqlCreateOrUpdateProduct(gqlPayload, _product.media || [], gqlClient);
                        _ShopifyProvider.GRAPHQL_API_AVAILABLE_CREDITS =
                            cost.throttleStatus.currentlyAvailable;
                        console.log("ShopifyProvider.gqlCreateOrUpdateProduct |no errors yet line 1004");
                        const firstRequestTimeEnd = Date.now();
                        const requestTimeMs = firstRequestTimeEnd - firstRequestTimeStart;
                        // const requestTime = Math.max(Math.floor(requestTimeMs / 1000), 1)
                        const requestTime = Math.max(Math.round(requestTimeMs / 1000), 1);
                        // ON SYNCHRONOUS REQUESTS RE-CHECK FOR API STATUS
                        let initialTotalCredits = cost.throttleStatus.maximumAvailable;
                        let restoreRate = cost.throttleStatus.restoreRate;
                        let queryCost = cost.actualQueryCost;
                        let SAFE_RETURNING_CREDITS = requestTime * restoreRate;
                        let poolSize = Math.floor(SAFE_RETURNING_CREDITS / queryCost);
                        let poolMaxAllowed = 30;
                        // parentPort.postMessage({ action: 'message', payload: `POOL - ${poolSize}` })
                        // parentPort.postMessage({ action: 'message', payload: `POOL MAX ALLOWED - ${poolMaxAllowed}` })
                        // parentPort.postMessage({ action: 'message', payload: `QueryCost - ${queryCost}` })
                        // parentPort.postMessage({ action: 'message', payload: `RequestTime - ${requestTimeMs / 1000}` })
                        // parentPort.postMessage({ action: 'message', payload: `RequestTime - ${requestTime}` })
                        // parentPort.postMessage({ action: 'message', payload: `Safe Returning - ${SAFE_RETURNING_CREDITS}` })
                        // parentPort.postMessage({ action: 'message', payload: `Safe Pool size returning per Cost - ${SAFE_RETURNING_CREDITS / queryCost}` })
                        // parentPort.postMessage({ action: 'message', payload: cost })
                        _ShopifyProvider.GRAPHQL_API_RESTORE_RATE = Number(restoreRate);
                        _ShopifyProvider.GRAPHQL_API_MINIMUM_SAFE = Math.max(SAFE_RETURNING_CREDITS * 2, 200);
                        _ShopifyProvider.GRAPHQL_API_PARALLEL_REQUESTS = Math.min(poolSize, poolMaxAllowed);
                        _ShopifyProvider.GRAPHQL_API_MAX_AVAILABLE_CREDITS =
                            initialTotalCredits;
                        // ON SYNCHRONOUS REQUESTS RE-CHECK FOR API STATUS
                        pInfo.apiHealthData = cost;
                        if (!!userErrors && userErrors.length > 0)
                            throw { response: userErrors };
                        // log finish product on task
                        pInfo.observations = TASK_SUCCESS_MESSAGE[task.type];
                        pInfo.shopifyId = product.id;
                        result.success++;
                    }
                    catch (err) {
                        // LOG ERROR ON PRODUCT
                        console.log("ShopifyProvider.gqlCreateOrUpdateProduct |catched exception");
                        console.log(err.response);
                        console.log(err);
                        if (!!gqlPayload.id)
                            pInfo.shopifyId = gqlPayload.id;
                        console.log(`ShopifyProvider.gqlCreateOrUpdateProduct |payload ${JSON.stringify(gqlPayload)}`);
                        pInfo.payload = gqlPayload;
                        pInfo.observations = err.response;
                        pInfo.status = false;
                        result.failed++;
                    }
                    pInfo.processedAt = Date.now();
                    result.results.push(pInfo);
                    result.results.sort((a, b) => a.processedAt > b.processedAt ? 1 : -1);
                    await task.updateOne({ $set: { outerData: result } });
                    continue;
                }
                ShopifyProvider.gqlCreateOrUpdateProduct(gqlPayload, _product.media || [], gqlClient)
                    .then(({ product, userErrors, cost }) => {
                    if (!!userErrors && userErrors.length > 0) {
                        console.log("ShopifyProvider.gqlCreateOrUpdateProduct |has userErrors");
                        console.log(`ShopifyProvider.gqlCreateOrUpdateProduct |payload ${JSON.stringify(gqlPayload)}`);
                        console.log(`userErrors ${JSON.stringify(userErrors)}`);
                        throw { response: userErrors };
                    }
                    // log finish product on task
                    pInfo.apiHealthData = cost;
                    pInfo.observations = TASK_SUCCESS_MESSAGE[task.type];
                    pInfo.shopifyId = product.id;
                    result.success++;
                })
                    .catch((err) => {
                    console.log("Catched an exception ProductTasks.ts 1333: ", err);
                    // LOG ERROR ON PRODUCT
                    pInfo.payload = gqlPayload;
                    pInfo.observations = err.response;
                    pInfo.status = false;
                    result.failed++;
                })
                    .finally(async () => {
                    if (!!gqlPayload.id)
                        pInfo.shopifyId = gqlPayload.id;
                    pInfo.processedAt = Date.now();
                    result.results.push(pInfo);
                    result.results.sort((a, b) => a.processedAt > b.processedAt ? 1 : -1);
                    await task.updateOne({ $set: { outerData: result } });
                });
            }
            // AS THE LAST POOL OF PRODUCTS CAN BE STILL AWAITING FOR RESPONSE,
            // QUICK CHECKER FOR WAIT FOR THOSE
            await new Promise((res) => {
                let checkProducts = setInterval(() => {
                    if (result.results.length < products.length)
                        return;
                    clearInterval(checkProducts);
                    res(true);
                }, 75);
            });
            // UPDATE TASK WITH LATEST OBS AND DATA
        }
        catch (err) {
            isError = true;
            await task.updateOne({
                $set: { state: TaskState.ERROR, observations: "TASK GLOBAL ERROR" },
            });
            console.log("createUpdateProducts |ERROR THREAD PRODUCT TASKS!");
            console.log(err.message);
            setTimeout(() => {
                throw { error: err.message };
            }, 150);
        }
        // ALL FAILED
        // if ( result.results.length === result.failed ) {
        //     return parentPort?.postMessage(result)
        // }
        result.results.sort((a, b) => (a.processedAt > b.processedAt ? 1 : -1));
        await task.updateOne({ $set: { outerData: result } });
        if (!isMainThread && !isError) {
            parentPort?.postMessage(result);
            return;
        }
        return result;
    }
    async updateInventory({ nowDate }) {
        console.log("updateInventory |Begin");
        const result = {
            results: [],
            success: 0,
            failed: 0,
        };
        await this.connectDB();
        const task = await Task.findOne({ busId: workerData.pId });
        const erpProducts = task.innerData.resources;
        const shopifyProducts = await ShopifyProvider.getAllProducts({
            fields: ["id", "variants"],
        });
        ProductTasksController.shopifyProducts = [...shopifyProducts];
        try {
            const gqlClient = await ShopifyProvider.createGraphqlClient();
            _ShopifyProvider.GRAPHQL_API_PARALLEL_REQUESTS = 15;
            // PROCESS ERP DATA
            let products = await this.processParams(erpProducts);
            console.log("PRODUCTS ==>", products.length);
            for (let i = 0; i < products.length; i++) {
                const _product = products[i];
                const pInfo = {
                    erpId: _product.erpId,
                    shopifyId: null,
                    observations: "",
                    processedAt: Date.now(),
                    apiHealthData: null,
                };
                const gqlPayload = this.buildCreateUpdateGqlParams(_product);
                // log init on task
                if (_ShopifyProvider.GRAPHQL_API_AVAILABLE_CREDITS <
                    _ShopifyProvider.GRAPHQL_API_MINIMUM_SAFE) {
                    console.log("GRAPHQL API RATE LIMIT REQUESTS SAFE FN, sleeping 5s, RESTORING 250 credits");
                    await HelpersController.sleep(5000);
                }
                if (i % _ShopifyProvider.GRAPHQL_API_PARALLEL_REQUESTS === 0) {
                    console.log("ITERATION ==>", i);
                    console.log("PARALLEL", _ShopifyProvider.GRAPHQL_API_PARALLEL_REQUESTS);
                    try {
                        const firstRequestTimeStart = Date.now();
                        const { product, userErrors, cost } = await ShopifyProvider.gqlCreateOrUpdateProduct(gqlPayload, _product.media || [], gqlClient);
                        if (!!userErrors && userErrors.length > 0)
                            throw { response: userErrors };
                        const firstRequestTimeEnd = Date.now();
                        const requestTime = Math.ceil((firstRequestTimeEnd - firstRequestTimeStart) / 1000);
                        // ON SYNCHRONOUS REQUESTS RE-CHECK FOR API STATUS
                        let initialTotalCredits = cost.throttleStatus.maximumAvailable;
                        let restoreRate = cost.throttleStatus.restoreRate; // USE THIS ALSO AFTER KNOWING REQUEST TIME
                        let queryCost = cost.actualQueryCost;
                        let SAFE_RETURNING_CREDITS = requestTime * restoreRate;
                        let poolSize = Math.floor(SAFE_RETURNING_CREDITS / queryCost);
                        _ShopifyProvider.GRAPHQL_API_PARALLEL_REQUESTS = poolSize;
                        // ON SYNCHRONOUS REQUESTS RE-CHECK FOR API STATUS
                        // log finish product on task
                        pInfo.apiHealthData = cost;
                        pInfo.observations = "Product created successfully";
                        pInfo.shopifyId = product.id;
                        pInfo.processedAt = Date.now();
                        result.success++;
                    }
                    catch (err) {
                        // LOG ERROR ON PRODUCT
                        pInfo.observations = err.response;
                        result.failed++;
                    }
                    result.results.push(pInfo);
                    continue;
                }
                ShopifyProvider.gqlCreateOrUpdateProduct(gqlPayload, _product.media || [], gqlClient)
                    .then(({ product, userErrors, cost }) => {
                    if (!!userErrors && userErrors.length > 0)
                        throw { response: userErrors };
                    // log finish product on task
                    pInfo.apiHealthData = cost;
                    pInfo.observations = "Product created successfully";
                    pInfo.shopifyId = product.id;
                    result.success++;
                })
                    .catch((err) => {
                    // LOG ERROR ON PRODUCT
                    pInfo.observations = err.response;
                    result.failed++;
                })
                    .finally(() => {
                    pInfo.processedAt = Date.now();
                    result.results.push(pInfo);
                });
            }
            // AS THE LAST POOL OF PRODUCTS CAN BE STILL AWAITING FOR RESPONSE,
            // QUICK CHECKER FOR WAIT FOR THOSE
            await new Promise((res) => {
                let checkProducts = setInterval(() => {
                    if (result.results.length < products.length)
                        return;
                    clearInterval(checkProducts);
                    res(true);
                }, 75);
            });
            // UPDATE TASK WITH LATEST OBS AND DATA
        }
        catch (err) {
            console.log("updateInventory |ERROR THREAD PRODUCT TASKS!");
            console.log(err.message);
        }
        result.results.sort((a, b) => (a.processedAt > b.processedAt ? 1 : -1));
        // await task.updateOne({ $set: { outerData: result } });
        if (!isMainThread) {
            parentPort?.postMessage(result);
            return;
        }
        return result;
    }
    async runTaskAsWorker() {
        try {
            console.log("\n\nIM THREAD ID =>", threadId);
            this.listenBroadcast(this);
            const fn = workerData.fn;
            await this[fn](workerData.args);
            // FIGURE OUT A WAY TO ADD A TASK TO SLEEP Nsecs FOR FULL RESTORE OF API
            // AS THE LATEST POOL REQUEST MAYBE DIDNT CANCEL THE RESTORE AMOUNT ITSELF
            // --- GRAB THE LATEST COST API DATA AND DO THE MATH
            // setTimeout(process.exit, 100)
        }
        catch (err) {
            console.log("THREAD WORKER ERROR ===== RUNNER AS WORKER FN");
            console.log(err);
            setTimeout(() => process.exit(1), 100);
        }
    }
}
const productTasksController = new ProductTasksController();
export default productTasksController;
if (!isMainThread) {
    console.log("\n\nPRODUCT - NOT MAIN THREAD");
    productTasksController.runTaskAsWorker();
}
