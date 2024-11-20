import { AppMode, ObjectValues } from "./AppInterfaces";
import { WebhookTopic } from "./ShopifyInterfaces";

/* START RESOURCE RELATED */
export interface PaginationModel<T = any> {
    totalDocs: number | undefined;
    limit: number | undefined;
    totalPages: number | undefined;
    page: number | undefined;
    pagingCounter: number | undefined;
    hasPrevPage: Boolean | undefined;
    hasNextPage: Boolean | undefined;
    prevPage: number | undefined;
    nextPage: number | undefined;
    hasMore: Boolean | undefined;
    docs: T[];
}

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

export interface IAppConfig { // extend interface when db model modified
    _id?:                        string;
    mode?:                       AppMode;
    apiSandboxUrl?:              string;
    apiProductionUrl?:           string;
    apiSandboxSecondaryUrl?:     string;
    apiProductionSecondaryUrl?:  string;
    apiSandboxKey?:              string;
    apiSandboxPrivateKey?:       string;
    apiProductionKey?:           string;
    apiProductionPrivateKey?:    string;
    gatewayCardName?:            string;
    gatewayBankName?:            string;
    gatewayOfflineName?:         string;
    dbName?:                       string;
    dbOrdersName?:                       string;
    dbUserName?:                         string;
    dbPassword?:                         string;
    apiBrandIds?:                        (string | number)[];
    cronMinutesPriceUpdateTask?:         number;
    cronPriceUpdateRoutineEnabled?:      boolean;
    cronMinutesStockUpdateTask?:         number;
    cronStockUpdateRoutineEnabled?:      boolean;
    cronMinutesProductCreateUpdateTask?: number;
    cronProductUpdateRoutineEnabled?:    boolean;
    apiMerchantId?:              string;
    siteId?:                     string;
    csOrgIdTest?:                string;
    csOrgIdProd?:                string;
    updatedAt?:                  number | string | Date;
    createdAt?:                  number | string | Date;
    productCreationMode:                 string;
    productRetrieveOnlyWebItem?:         boolean;
    productRetrieveOnlyAvailable?:       boolean;
}

export interface IOrder {
    _id:                        string;
    orderId?:                   number;
    orderName?:                 string;
    checkoutId:                 number;
    logs:                       Log[];
    items:                      ILineItem[];
    payments:                   IPayment[];
    payed:                      boolean;
    shopifyTransaction:         boolean;
    status:                     IPaymentState;
    gatewayType:                IPaymentType;
    appMode:                    AppMode;
    observations:               string;
    totalAmount:                number;
    shippingAmount:             number;
    bonificationAmount:         number;
    createdAt:                  string | number | Date;
    updatedAt:                  string | number | Date;
}

export const PercentAction = {
    BONIFICATION: 'BONIFICATION',
    INTEREST: 'INTEREST',
} as const;
export type PercentActions = ObjectValues<typeof PercentAction>

export interface ActionParams {
    label:          string;
    badgeStatus:    string;
    badgeLabel:     string;
    icon:           any;
}

export interface InstallmentModel {
    _id:                    string;
    installment:            number;
    minAmount:              number;
    maxAmount:              number;
    paymentMethodIds:       number[];
    percentage:             number;
    action:                 PercentActions;
    createdAt:              number | string | Date;
    updatedAt:              number | string | Date;
}

export interface InstallmentCreatePayload {
    installment:            number;
    minAmount:              number;
    maxAmount:              number;
    paymentMethodIds?:      number[];
    percentage:             number;
    action:                 PercentActions;
}

export interface ILineItem {
    productId?:             number;
    variantId?:             number;
    id:                     string;
    title:                  string;
    description:            string;
    imageSrc:               string;
    categoryId:             string;
    sku:                    string;
    quantity:               number;
    unitPrice:              number;
}

export interface IPayment {
    _id:                        string;
    orderId:                    string;
    state:                      IPaymentState;
    providerId?:                number | string;
    providerRequest?:           any;
    providerResponse?:          any; // Create or consume this inteface from provider's sdk
    providerResponses?:         any[]; // Create or consume this inteface from provider's sdk
    events:                     any[]; // Create or consume this inteface from provider's sdk
    observations:               string;
    createdAt:                  string | number | Date;
    updatedAt:                  string | number | Date;
}

export enum IPaymentState {
    NOT_PROCESSED = 'not_processed',
    PENDING = 'pending',
    REJECTED = 'rejected',
    APPROVED = 'approved',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded'
}

export enum IPaymentType {
    BANK_TRANSFER = 'bank_transfer',
    OFFLINE_ATM = 'offline_atm',
    CARD = 'card'
}

export interface IConfigState {
    language:           string;
    config:             IAppConfig;
    processing:         boolean;
    sessionToken:       string;
    refreshToken:       string;
    webhooks:           { shopify: any[], db: IWebhookRegister[] };
    brands:             ShopifyBrand[];
}

export interface ShopifyBrand {
    Brand_Id:               string; // INTERNAL BRAND ID
    StoreID:                string; // INTERNAL ID
    StoreCode:              string;
    StoreName:              string;
}

export interface IWebhookHandler {
    uri:                    string;
    active:                 boolean;
}

export interface IWebhookRegister {
    _id:                        string;
    topic:                      WebhookTopic;
    handlers:                   IWebhookHandler[];
    updatedAt?:                 number | string | Date;
    createdAt?:                 number | string | Date;
}

interface TaskDetailFilters {
    resourceId:         string;
    status:             string;
}

export interface TaskDetailState {
    pagination:     { page: number, limit: number };
    task:           any;
    taskId:         any;
    processing:     boolean;
    skipDebounce:   boolean;
    filters:        TaskDetailFilters;
}

export const GATEWAY_TYPE_DICTIONARY = {
    [IPaymentType.BANK_TRANSFER]: 'Transferencia bancaria',
    [IPaymentType.OFFLINE_ATM]: 'Offline/ATM/Ticket',
    [IPaymentType.CARD]: 'Tarjeta Credito/Debito',
}

export const BADGE_STATE_DICTIONARY: {
    [K in IPaymentState]: { state: string, label: string };
} = {
    [IPaymentState.APPROVED]: { state: 'success', label: 'Aprobado' },
    [IPaymentState.CANCELLED]: { state: 'critical', label: 'Cancelado' },
    [IPaymentState.NOT_PROCESSED]: { state: 'info', label: 'Sin procesar' },
    [IPaymentState.PENDING]: { state: 'info', label: 'Pendiente' },
    [IPaymentState.REFUNDED]: { state: 'warning', label: 'Reembolsado' },
    [IPaymentState.REJECTED]: { state: 'critical', label: 'Rechazado' },
}