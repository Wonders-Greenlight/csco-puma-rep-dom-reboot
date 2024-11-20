import { ObjectValues } from "./AppInterfaces";
import { TaskType } from "./TaskInterfaces";

export const ERP_ACTION = {
    UPDATE_STOCK: 'actualizarStock', // THIS ARE ALL EXAMPLE EVENTS
    ADD_SKU: 'agregarSKU',
    CREATE_PRODUCT: 'CrearProducto',
    HIDE_PRODUCT: 'OcultarProducto',
    SHOW_PRODUCT: 'MostrarProducto',
    // FROM APP TO ERP
    UPDATE_PRODUCT_ID: 'actualizarIDProducto',
    CREATE_CLIENT: 'crearCliente',
    SEND_PAID_ORDER: 'nuevaOrdenPedido',
} as const;
export type ErpAction = ObjectValues<typeof ERP_ACTION>

export const ERP_TASK = { // THIS ARE ALL EXAMPLE EVENT -> TASK RELATION
    [ERP_ACTION.UPDATE_STOCK]: TaskType.UPDATE_STOCK,
    [ERP_ACTION.ADD_SKU]: TaskType.CREATE_UPDATE_PRODUCTS,
    [ERP_ACTION.CREATE_PRODUCT]: TaskType.CREATE_UPDATE_PRODUCTS,
    [ERP_ACTION.HIDE_PRODUCT]: TaskType.CREATE_UPDATE_PRODUCTS,
    [ERP_ACTION.SHOW_PRODUCT]: TaskType.CREATE_UPDATE_PRODUCTS,

    // FROM APP TO ERP
    [ERP_ACTION.UPDATE_PRODUCT_ID]: TaskType.APP_TO_ERP_ACTION,
    [ERP_ACTION.CREATE_CLIENT]: TaskType.APP_TO_ERP_ACTION,
    [ERP_ACTION.SEND_PAID_ORDER]: TaskType.APP_TO_ERP_ACTION,
}

export interface ShopifyOrder {
    ID:                     number; // INTERNAL ID
    OrderNumber:            string;
    OrderDate:              string; // DATE ISO STRING
    CustomerName:           string;
    CustomerCode:           string;
    Email:                  string;
    Address1:               string;
    Address2:               string;
    Address3:               string;
    City:                   string;
    PhoneNumber:            string;
    Tax:                    number | null;
    Total:                  number;
    Comment:                string;
    BirthDate:              string | null;
}

export interface ShopifyOrderDetail {
    ID:                     number; // INTERNAL ID
    OrderNumber:            string;
    ItemLookupCode:         string; // SKU
    ItemDescription:        string;
    Quantity:               number;
    Price:                  number;
    RowID:                  string;
}

export interface ShopifyBrand {
    Brand_Id:               string; // INTERNAL BRAND ID
    StoreID:                string; // INTERNAL ID
    StoreCode:              string;
    StoreName:              string;
}

export interface ShopifyItemProduct {
    Brand_Id:               string; // INTERNAL BRAND ID
    ItemLookupCode:         string; // INTERNAL ID
    Description:            string;
    ExtendedDescription:    string;
    DepartmentName:         string;
    CategoryName:           string;
    SupplierName:           string;
    UnitOfMeasure:          string;
    BinLocation:            string;
    Notes:                  string | null;
    Inactive:               boolean;
    WebItem:                boolean;
    DateCreated:            string;
    LastUpdated:            string;
    Color:                  string;
    Size:                   string;
    Reference:              string; // PRODUCT ID
}

export interface ShopifyItemProductInventory {
    Brand_Id:           string; // INTERNAL BRAND ID
    ItemLookupCode:     string; // INTERNAL ID
    StoreCode:          number;
    StoreName:          string;
    Reference:          string;
    Quantity:           number;
    Price:              number;
    SaleType:           number;
    SalesPrice:         number;
    SaleStartDate:      string | null;
    SaleEndDate:        string | null;
    TaxRate:            number;
    LastUpdated:        string;
}

export interface CustomShopifyItemProductVariant extends ShopifyItemProduct {
    price?:                 number;
    compareAtPrice?:        number;
    saleType?:              number;
    inventory?:             ShopifyItemProductInventory[]; // ONLY -> StoreCode, StoreName, Quantity
}

export interface CustomShopifyItemProduct {
    reference:              string;
    title:                  string;
    vendor:                 string;
    category:               string;
    type:                   string;
    variants:               CustomShopifyItemProductVariant[];
}

export interface ActionPayload {
    action:             ErpAction;
    codigo:             string;
    sku?:               string;
    shopify_id?:        null | string | number;
    cod_sector?:        string;
    sector?:            string;
    um:                 string;
    clase:              string;
    descrip:            string;
    especificaciones:   string;
    composicion:        string;
    temporada:          string;
    ligamento:          string;
    acabado:            string;
    tipo:               string;
    estetica:           string;
    gramaje:            string;
    ancho:              string;
    espesor:            string;
    elasticidad:        string;
    transparencia:      string;
    cuidados:           string;
    estado_venta:       string;
    usos:               { uso: string }[];
    stock_sucursales?:  StockSucursales[];
    color?:             string;
    design?:            string;
    tags?:              string;
    precio?:            string;
    images?:            Image[];
}

export interface StockSucursales {
    suc:   string;
    stock: string;
}

export interface Image {
    url:        string;
    altText?:   string;
}