import { ObjectValues } from "./AppInterfaces";
import { ErpAction } from "./ErpInterfaces";
import { GqlMetafield, GqlProductStatus } from "./ShopifyInterfaces";

export enum TaskPriority {
    HIGH = 0,
    NORMAL = 1,
    LOW = 2
}

export enum TaskState {
    ON_HOLD = 'ON_HOLD',
    SCHEDULED = 'SCHEDULED',
    PROCESSING = 'PROCESSING',
    FINISHED = 'FINISHED',
    ERROR = 'ERROR',
    CANCELLED = 'CANCELLED',
}

export const TaskType = {
    CREATE_UPDATE_PRODUCTS: 'CREATE_UPDATE_PRODUCTS',
    UPDATE_STOCK: 'UPDATE_STOCK',
    UPDATE_PRICE: 'UPDATE_PRICE',
    CREATE_CUSTOMERS: 'CREATE_CUSTOMERS',
    COUNT_NUMBERS: 'COUNT_NUMBERS',
    GENERAL: 'GENERAL',
    APP_TO_ERP_ACTION: 'APP_TO_ERP_ACTION',
    ALLOCATE_BILL_ORDER: 'ALLOCATE_BILL_ORDER',
} as const;
export type TaskTypes = ObjectValues<typeof TaskType>

export enum EventType {
    CREATE_PRODUCT = 'CREATE_PRODUCT',
    UPDATE_STOCK = 'UPDATE_STOCK',
    UPDATE_PRICE = 'UPDATE_PRICE',
    ALLOCATE_BILL_ORDER = 'ALLOCATE_BILL_ORDER',
}

export const TASK_SUCCESS_MESSAGE: {
    [K in TaskTypes]: string;
} = {
    [TaskType.CREATE_UPDATE_PRODUCTS]: 'Product successfully created/updated',
    [TaskType.UPDATE_STOCK]: 'Product variants stock successfully updated',
    [TaskType.UPDATE_PRICE]: 'Product variants price successfully updated',
    [TaskType.COUNT_NUMBERS]: 'Task ran successfully',
    [TaskType.GENERAL]: 'Task ran successfully',
    [TaskType.APP_TO_ERP_ACTION]: 'Task ran successfully',
    [TaskType.ALLOCATE_BILL_ORDER]: 'Task ran successfully',
    [TaskType.CREATE_CUSTOMERS]: 'Task ran successfully',
}

export const BADGE_DICTIONARY = {
    'PROCESSING': 'info',
    'SCHEDULED': 'attention',
    'ON_HOLD': 'attention',
    'ERROR': 'critical',
    'FINISHED': 'success',
    'CANCELLED': 'base',
}

export const TYPE_NAME_DICTIONARY: {
    [K in TaskTypes]: string;
} = {
    [TaskType.COUNT_NUMBERS]: 'TEST PURPOSES',
    // END TEST
    [TaskType.CREATE_UPDATE_PRODUCTS]: 'Creacion y/o actualizacion de productos',
    [TaskType.UPDATE_PRICE]: 'Actualizacion de precios',
    [TaskType.UPDATE_STOCK]: 'Actualizacion de stock',
    [TaskType.GENERAL]: 'General',
    [TaskType.APP_TO_ERP_ACTION]: 'Envio de datos hacia ERP',
    [TaskType.ALLOCATE_BILL_ORDER]: 'Envio Nota de Venta y/o Imputacion de orden',
    [TaskType.CREATE_CUSTOMERS]: 'Creacion de clientes',
}

export type TaskFn = () => Promise<void> | void

export interface TaskEntry {
    task?:                      TaskFn;
    filePath?:                  string;
    fnToCall?:                  string;
    args?:                      any;
    priority?:                  TaskPriority;
    type?:                      ObjectValues<typeof TaskType>;
    innerData?:                 any;
    eventId?:                   string;
}

export interface TTask extends TaskEntry {
    id:                         string;
    processing:                 boolean;
    runOnSeparateThread:        boolean;
}

export interface ITask {
    _id:                    string;
    type:                   ObjectValues<typeof TaskType>;
    priority?:              TaskPriority;
    busId?:                 string;
    eventId?:               string | IEvent;
    args?:                  object;
    observations?:          string;
    filePath:               string;
    fnToCall:               string;
    state:                  TaskState;
    automated:              boolean;
    microstateStatus?:      boolean;
    innerData?:             any;
    outerData?:             any;
    scheduleDate?:          Date;
    createdAt:              Date;
    updatedAt:              Date;
    startedAt?:             Date;
    finishedAt?:            Date;
}

export interface IEvent {
    _id:                    string;
    type:                   ErpAction;
    taskId?:                string | ITask;
    observations?:          string;
    state?:                 TaskState;
    createdAt?:             Date;
    updatedAt?:             Date;
}

// PRODUCT CREATE / UPDATE RELATED
export interface InnovateProductInfo {
    status?:                 GqlProductStatus;
    shopifyId?:              string | number;
    erpId:                   string | number;
    title?:                  string;
    tags?:                   string[];
    options?:                string[];
    // locations:              InnovateLocationInfo[];
    description?:            string;
    variants?:               InnovateVariantInfo[];
    vendor?:                 string;
    type?:                   string;
    images?:                 InnovateImageInfo[];
    metafields?:             GqlMetafield[];
}

export interface InnovateImageInfo {
    src:                    string;
    alt?:                   string;
}

export interface InnovateLocationInfo {
    erpId:                  string | number;
    shopifyId:              number;
    name:                   string;
}

export interface InnovateVariantInfo {
    shopifyId?:              string | number;
    erpId?:                  string | number;
    options?:                string[];
    imageSrc?:               string;
    title?:                  string;
    sku?:                    string;
    price?:                  string;
    compareAtPrice?:         string;
    barcode?:                string;
    inventory?:              { locationId?: number, quantity: number, erpId?: string }[];
    weight?:                 string;
    metafields?:             any[];
}