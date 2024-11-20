import { ObjectValues } from "./AppInterfaces";
import { TaskType } from "./TaskInterfaces";

export const ERP_ACTION = {
    UPDATE_STOCK: 'actualizarStock',
    ADD_SKU: 'agregarSKU',
    CREATE_PRODUCT: 'CrearProducto',
    HIDE_PRODUCT: 'OcultarProducto',
    SHOW_PRODUCT: 'MostrarProducto',
    UPDATE_PRODUCT_ID: 'actualizarIDProducto',
} as const;
export type ErpAction = ObjectValues<typeof ERP_ACTION>

export const ERP_TASK = {
    [ERP_ACTION.UPDATE_STOCK]: TaskType.UPDATE_STOCK,
    [ERP_ACTION.ADD_SKU]: TaskType.CREATE_UPDATE_PRODUCTS,
    [ERP_ACTION.CREATE_PRODUCT]: TaskType.CREATE_UPDATE_PRODUCTS,
    [ERP_ACTION.HIDE_PRODUCT]: TaskType.CREATE_UPDATE_PRODUCTS,
    [ERP_ACTION.SHOW_PRODUCT]: TaskType.CREATE_UPDATE_PRODUCTS,

    // FROM APP TO ERP
    [ERP_ACTION.UPDATE_PRODUCT_ID]: TaskType.APP_TO_ERP_ACTION,
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
    url: string;
}

export const USE_CASES_DICTIONARY = [
    {
      erpCategory: "COLCHON/SOMMIER",
      shopifyUseCase: "-"
    },
    {
      erpCategory: "ACCESORIOS VARIOS",
      shopifyUseCase: "ACCESORIOS"
    },
    {
      erpCategory: "ALFOMBRAS",
      shopifyUseCase: "ALFOMBRA"
    },
    {
      erpCategory: "ALFOMBRA ALTO RENDIMIENTO ",
      shopifyUseCase: "ALFOMBRA"
    },
    {
      erpCategory: "ALFOMBRA EXTERNA",
      shopifyUseCase: "ALFOMBRA"
    },
    {
      erpCategory: "ALMOHADA DECORATIVA PREMIUM",
      shopifyUseCase: "ALMOHADA"
    },
    {
      erpCategory: "ALMOHADA ECONOMICO",
      shopifyUseCase: "ALMOHADA"
    },
    {
      erpCategory: "ALMOHADA Y ACCESORIO DE CUNA",
      shopifyUseCase: "ALMOHADA"
    },
    {
      erpCategory: "BLAZER INFORMAL MUJER",
      shopifyUseCase: "BLAZER"
    },
    {
      erpCategory: "BLAZER FORMAL MUJER",
      shopifyUseCase: "BLAZER, SACO"
    },
    {
      erpCategory: "BLUSA COCTEL",
      shopifyUseCase: "BLUSA"
    },
    {
      erpCategory: "BLUSA DIURNA",
      shopifyUseCase: "BLUSA, REMERA"
    },
    {
      erpCategory: "BLUSA Y VESTIDO LIVIANO",
      shopifyUseCase: "BLUSA, VESTIDO"
    },
    {
      erpCategory: "CAMISAS ",
      shopifyUseCase: "CAMISA"
    },
    {
      erpCategory: "CAMPERA Y CANGURO",
      shopifyUseCase: "CAMPERA"
    },
    {
      erpCategory: "CORTINADO BLOQUEO SOLAR 100%",
      shopifyUseCase: "CORTINA"
    },
    {
      erpCategory: "CORTINADO CON INGRESO DE CLARIDAD",
      shopifyUseCase: "CORTINA"
    },
    {
      erpCategory: "CORTINADO DE CALIDAD",
      shopifyUseCase: "CORTINA"
    },
    {
      erpCategory: "CORTINA PARA BANO",
      shopifyUseCase: "CORTINA"
    },
    {
      erpCategory: "CORTINADO SEMI TRANSPARENTE",
      shopifyUseCase: "CORTINA"
    },
    {
      erpCategory: "DECORACION",
      shopifyUseCase: "DECORACION"
    },
    {
      erpCategory: "FALDAS",
      shopifyUseCase: "FALDA"
    },
    {
      erpCategory: "HOSPITALARIAS",
      shopifyUseCase: "HOSPITALARIAS"
    },
    {
      erpCategory: "IMPERMEABLES",
      shopifyUseCase: "IMPERMEABLES"
    },
    {
      erpCategory: "MANTA/ACOLCHADO",
      shopifyUseCase: "MANTAS Y FRAZADAS"
    },
    {
      erpCategory: "MANTELERIA DECORATIVA",
      shopifyUseCase: "MANTEL"
    },
    {
      erpCategory: "MANTELERIA ECONOMICA",
      shopifyUseCase: "MANTEL"
    },
    {
      erpCategory: "MANTELERIA OPCIONAL",
      shopifyUseCase: "MANTEL"
    },
    {
      erpCategory: "MANTELERIA PVC",
      shopifyUseCase: "MANTEL"
    },
    {
      erpCategory: "MANUALIDAD ",
      shopifyUseCase: "MANUALIDADES"
    },
    {
      erpCategory: "PANTALONES",
      shopifyUseCase: "PANTALON, SHORT"
    },
    {
      erpCategory: "REMERAS",
      shopifyUseCase: "REMERAS"
    },
    {
      erpCategory: "TRAJE DE BANO / BIKINI",
      shopifyUseCase: "ROPA DE PLAYA"
    },
    {
      erpCategory: "CAMISETA DEPORTIVA",
      shopifyUseCase: "ROPA DEPORTIVA"
    },
    {
      erpCategory: "CAMPERA DEPORTIVA",
      shopifyUseCase: "ROPA DEPORTIVA"
    },
    {
      erpCategory: "INDUMENTARIA FITNESS",
      shopifyUseCase: "ROPA DEPORTIVA"
    },
    {
      erpCategory: "INDUMENTARIA INFANTIL",
      shopifyUseCase: "ROPA INFANTIL"
    },
    {
      erpCategory: "ROPA INTERIOR ",
      shopifyUseCase: "ROPA INTERIOR"
    },
    {
      erpCategory: "TELA PARA SABANA ECONOMICA",
      shopifyUseCase: "SABANAS"
    },
    {
      erpCategory: "TELA PARA SABANA",
      shopifyUseCase: "SABANAS"
    },
    {
      erpCategory: "COMPLEMENTO STOLA Y TORERA",
      shopifyUseCase: "SACO"
    },
    {
      erpCategory: "SACO INFORMAL MASCULINO",
      shopifyUseCase: "SACO"
    },
    {
      erpCategory: "TAPADOS",
      shopifyUseCase: "SACO"
    },
    {
      erpCategory: "SACO FORMAL MASCULINO",
      shopifyUseCase: "SACO, SASTRERIA"
    },
    {
      erpCategory: "SASTRERIA",
      shopifyUseCase: "SASTRERIA"
    },
    {
      erpCategory: "TAPICERIA AUTOMOTRIZ",
      shopifyUseCase: "TAPICERIA"
    },
    {
      erpCategory: "TAPICERIA CABECEROS INFANTIL",
      shopifyUseCase: "TAPICERIA"
    },
    {
      erpCategory: "TAPICERIA CABECEROS SOMMIER",
      shopifyUseCase: "TAPICERIA"
    },
    {
      erpCategory: "TAPICERIA COMPLEMENTO",
      shopifyUseCase: "TAPICERIA"
    },
    {
      erpCategory: "TAPICERIA SILLA",
      shopifyUseCase: "TAPICERIA"
    },
    {
      erpCategory: "TAPICERIA JUEGO DE LIVING",
      shopifyUseCase: "TAPICERIA"
    },
    {
      erpCategory: "TAPICERIA POLTRONA",
      shopifyUseCase: "TAPICERIA"
    },
    {
      erpCategory: "TELAS NO TEJIDAS",
      shopifyUseCase: "TELAS NO TEJIDAS"
    },
    {
      erpCategory: "ROPA PARA MASCOTA",
      shopifyUseCase: "TELAS PARA MASCOTA"
    },
    {
      erpCategory: "TELAS PLASTICAS",
      shopifyUseCase: "TELAS PLASTICAS"
    },
    {
      erpCategory: "TELA TOALLA",
      shopifyUseCase: "TOALLA"
    },
    {
      erpCategory: "TRAJE DE DANZA",
      shopifyUseCase: "TRAJE DE DANZA"
    },
    {
      erpCategory: "UNIFORME ESCOLAR",
      shopifyUseCase: "UNIFORME ESCOLAR"
    },
    {
      erpCategory: "VESTIDO DE ETIQUETA O GALA",
      shopifyUseCase: "VESTIDO"
    },
    {
      erpCategory: "VESTIDO FORMAL O COCTEL",
      shopifyUseCase: "VESTIDO"
    },
    {
      erpCategory: "VESTIDO DE GALA INFANTIL",
      shopifyUseCase: "VESTIDO"
    },
    {
      erpCategory: "VESTIDO URBANO",
      shopifyUseCase: "VESTIDO"
    }
]