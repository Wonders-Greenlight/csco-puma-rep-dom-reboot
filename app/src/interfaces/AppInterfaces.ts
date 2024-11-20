import { WebhookTopic } from "./ShopifyInterfaces";

export type ObjectValues<T> = T[keyof T];
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export enum LogType {
    WARNING = 'warning',
    INFO = 'info',
    ATTENTION = 'attention',
    SUCCESS = 'success'
}

export interface Log {
    description:     string;
    type:            LogType;
    issuedAt:        number;
}

export enum AppMode {
    SANDBOX = 'SANDBOX',
    PRODUCTION = 'PRODUCTION',
    DISABLED = 'DISABLED'
}

interface IAppModeCfg {
    apiUrl:          string;
    apiSecondaryUrl: string;
    apiKey:          string;
}

export interface IAppConfig {
    mode:                               AppMode;
    apiSandboxUrl:                      string;
    apiProductionUrl:                   string;
    apiSandboxSecondaryUrl:             string;
    apiProductionSecondaryUrl:          string;
    apiSandboxKey:                      string;
    apiProductionKey:                   string;
    dbName:                             string;
    dbOrdersName:                       string;
    dbUserName:                         string;
    dbPassword:                         string;
    apiBrandIds:                        (string | number)[];
    cronMinutesPriceUpdateTask:         number;
    cronPriceUpdateRoutineEnabled:      boolean;
    cronMinutesStockUpdateTask:         number;
    cronStockUpdateRoutineEnabled:      boolean;
    cronMinutesProductCreateUpdateTask: number;
    cronProductUpdateRoutineEnabled:    boolean;
    updatedAt:                          number | string | Date;
    createdAt:                          number | string | Date;
    productCreationMode:                string;
    productRetrieveOnlyWebItem:         boolean;
    productRetrieveOnlyAvailable:       boolean;
    // Virtuals
    appModeCfg:                         IAppModeCfg;
    isProduction:                       boolean;
}

export interface IWebhookHandler {
    uri:                    string;
    active:                 boolean;
}

export interface IWebhookRegister {
    topic:                      WebhookTopic;
    handlers:                   IWebhookHandler[];
    updatedAt:                  number | string | Date;
    createdAt:                  number | string | Date;
}

export interface ILocation {
    shopifyId?:                 number;
    erpId?:                     string;
    active:                     boolean;
    name:                       string;
    email?:                     string;
    updatedAt:                  number | string | Date;
    createdAt:                  number | string | Date;
}

export const TOAST_REASON = {
    TASK_CREATED_SUCCESSFULLY: 'TASK_CREATED_SUCCESSFULLY',
    TASK_CREATION_ERROR: 'TASK_CREATION_ERROR',
} as const;
export type ToastReason = ObjectValues<typeof TOAST_REASON>

export const TOAST_REASON_RESULT: {
    [K in ToastReason]: { message: string, isError: boolean };
} = {
    [TOAST_REASON.TASK_CREATED_SUCCESSFULLY]: {
        message: 'Tarea creada con exito',
        isError: false
    }, // Task successfully created
    [TOAST_REASON.TASK_CREATION_ERROR]: {
        message: 'La tarea no pudo instanciarse',
        isError: true
    } // Not able to create task
} as const;