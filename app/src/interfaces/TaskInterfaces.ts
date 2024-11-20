import { Worker } from 'worker_threads'
import { ObjectValues } from "./AppInterfaces";
import { ErpAction } from "./ErpInterfaces";
import { GqlImage, GqlMediaInput, GqlMetafield, GqlProductStatus } from "./ShopifyInterfaces";

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
    COUNT_NUMBERS: 'COUNT_NUMBERS',
    GENERAL: 'GENERAL',
    ALLOCATE_BILL_ORDER: 'ALLOCATE_BILL_ORDER',
    APP_TO_ERP_ACTION: 'APP_TO_ERP_ACTION',
} as const;

export enum EventType {
    CREATE_PRODUCT = 'CREATE_PRODUCT',
    UPDATE_STOCK = 'UPDATE_STOCK',
    UPDATE_PRICE = 'UPDATE_PRICE',
    ALLOCATE_BILL_ORDER = 'ALLOCATE_BILL_ORDER',
}

export const TASK_SUCCESS_MESSAGE = {
    [TaskType.CREATE_UPDATE_PRODUCTS]: 'Product successfully created/updated',
    [TaskType.UPDATE_STOCK]: 'Product variants stock successfully updated',
    [TaskType.UPDATE_PRICE]: 'Product variants price successfully updated',
    [TaskType.COUNT_NUMBERS]: 'Task ran successfully',
    [TaskType.GENERAL]: 'Task ran successfully',
    [TaskType.APP_TO_ERP_ACTION]: 'Task ran successfully',
    [TaskType.ALLOCATE_BILL_ORDER]: 'Order sent to ERP successfully',
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
    schedule?:                  Date | string;
    automated?:                 boolean;
}

export interface TTask extends TaskEntry {
    id:                         string;
    processing:                 boolean;
    runOnSeparateThread:        boolean;
    worker?:                    Worker;
}

export interface ITask {
    type:                   ObjectValues<typeof TaskType>;
    priority?:              TaskPriority;
    busId?:                 string;
    eventId?:               IEvent;
    args?:                  object;
    observations?:          string;
    filePath:               string;
    fnToCall:               string;
    state?:                 TaskState;
    microstateStatus?:      boolean;
    automated?:             boolean;
    innerData?:             any;
    outerData?:             any;
    createdAt?:             Date;
    updatedAt?:             Date;
    startedAt?:             Date;
    finishedAt?:            Date;
    scheduleDate?:          Date;
}

export interface IEvent {
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
    category?:               string;
    variants?:               InnovateVariantInfo[];
    vendor?:                 string;
    type?:                   string;
    images?:                 GqlImage[];
    media?:                  GqlMediaInput[];
    metafields?:             GqlMetafield[];
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
    mediaSrc?:               string;
    title?:                  string;
    sku?:                    string;
    price?:                  string;
    compareAtPrice?:         string;
    barcode?:                string;
    inventory?:              { locationId?: number, quantity: number, erpId?: string }[];
    weight?:                 string;
    metafields?:             any[];
}