export var GQL_MUTATIONS;
(function (GQL_MUTATIONS) {
    GQL_MUTATIONS["ORDER_EDIT_BEGIN"] = "mutation orderEditBegin($id: ID!) {\n        orderEditBegin(id: $id) {\n          userErrors {\n            field\n            message\n          }\n          calculatedOrder {\n               id\n            lineItems(first: 15){\n              edges{\n                node{\n                  id\n                  quantity\n                }\n              }\n            }\n            originalOrder{\n              lineItems(first: 15){\n                edges{\n                  node{\n                    id\n                    variant{\n                        id\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n    }";
    GQL_MUTATIONS["ORDER_EDIT_COMMIT"] = "mutation commitEdit($id: ID!) {\n        orderEditCommit(id: $id, notifyCustomer: false, staffNote: \"Order edited by Payments Manager (Plexo) APP\") {\n          order {\n            id\n          }\n          userErrors {\n            field\n            message\n          }\n        }\n    }";
    GQL_MUTATIONS["ORDER_EDIT_ADD_ITEM_DISCOUNT"] = "mutation orderEditAddLineItemDiscount(\n        $id: ID!, \n        $discount: OrderEditAppliedDiscountInput!, \n        $lineItemId: ID!\n    ) {\n        orderEditAddLineItemDiscount(id: $id, discount: $discount, lineItemId: $lineItemId) {\n          addedDiscountStagedChange {\n            id\n            value\n            description\n          }\n          calculatedLineItem {\n            id\n            quantity\n          }\n          calculatedOrder {\n            id\n            addedLineItems(first: 5) {\n                edges {\n                    node {\n                        id\n                        quantity\n                    }\n                }\n            }\n          }\n          userErrors {\n            field\n            message\n          }\n        }\n    }";
    GQL_MUTATIONS["ORDER_EDIT_ADD_CUSTOM_ITEM"] = "mutation orderEditAddCustomItem($id: ID!, $price: MoneyInput!, $quantity: Int!, $title: String!) {\n        orderEditAddCustomItem(id: $id, price: $price, quantity: $quantity, title: $title) {\n          calculatedLineItem {\n            id\n            quantity\n          }\n          calculatedOrder {\n            id\n            addedLineItems(first: 5) {\n                edges {\n                    node {\n                        id\n                        quantity\n                    }\n                }\n            }\n          }\n          userErrors {\n            field\n            message\n          }\n        }\n    }";
    GQL_MUTATIONS["ORDER_EDIT_ADD_ITEM"] = "mutation orderEditAddVariant($id: ID!, $quantity: Int!, $variantId: ID!) {\n        orderEditAddVariant(id: $id, quantity: $quantity, variantId: $variantId, allowDuplicates: true) {\n          calculatedLineItem {\n            id\n            quantity\n          }\n          calculatedOrder {\n            id\n            addedLineItems(first: 5) {\n                edges {\n                    node {\n                        id\n                        quantity\n                    }\n                }\n            }\n          }\n          userErrors {\n            field\n            message\n          }\n        }\n    }";
    GQL_MUTATIONS["ORDER_EDIT_REMOVE_ITEM"] = "mutation changeLineItemQuantity($id: ID!, $lineItemId: ID!) {\n        orderEditSetQuantity(id: $id, lineItemId: $lineItemId, quantity: 0) {\n            calculatedOrder {\n                id\n                addedLineItems(first: 5) {\n                    edges {\n                        node {\n                            id\n                            quantity\n                        }\n                    }\n                }\n            }\n            userErrors {\n                field\n                message\n            }\n        }\n    }";
    GQL_MUTATIONS["ORDER_MARK_AS_PAID"] = "mutation orderMarkAsPaid($input: OrderMarkAsPaidInput!) {\n        orderMarkAsPaid(input: $input) {\n            order {\n                id\n            }\n            userErrors {\n                field\n                message\n            }\n        }\n    }";
    GQL_MUTATIONS["CREATE_PRODUCT"] = "mutation productCreate($input: ProductInput!, $media: [CreateMediaInput!]) {\n        productCreate(input: $input, media: $media) {\n            product {\n                id\n                title\n            }\n            userErrors {\n                field\n                message\n            }\n        }\n    }";
    GQL_MUTATIONS["UPDATE_PRODUCT"] = "mutation productUpdate($input: ProductInput!, $media: [CreateMediaInput!]) {\n        productUpdate(input: $input, media: $media) {\n            product {\n                id\n                title\n            }\n            userErrors {\n                field\n                message\n            }\n        }\n    }";
    GQL_MUTATIONS["STAGED_UPLOADS_CREATE"] = "mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {\n        stagedUploadsCreate(input: $input) {\n            stagedTargets {\n                url\n                resourceUrl\n                parameters {\n                    name\n                    value\n                }\n            }\n            userErrors {\n                field\n                message\n            }\n        }\n    }";
    GQL_MUTATIONS["INVENTORY_ADJUST_QUANTITIES"] = "mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {\n        inventoryAdjustQuantities(input: $input) {\n            inventoryAdjustmentGroup {\n                reason\n            }\n            userErrors {\n                field\n                message\n            }\n        }\n    }";
    GQL_MUTATIONS["PREPARE_ORDER_FOR_PICKUP"] = "mutation fulfillmentOrderLineItemsPreparedForPickup($input: FulfillmentOrderLineItemsPreparedForPickupInput!) {\n        fulfillmentOrderLineItemsPreparedForPickup(input: $input) {\n            userErrors {\n                field\n                message\n            }\n        }\n    }";
})(GQL_MUTATIONS || (GQL_MUTATIONS = {}));
export var GQL_QUERIES;
(function (GQL_QUERIES) {
    GQL_QUERIES["PRODUCTS"] = "query getProducts($query: String) {\n        products(first: 5, query: $query) {\n            edges {\n                node {\n                    id\n                    title\n                }\n            }\n        }\n    }";
    GQL_QUERIES["ORDERS"] = "query getOrders($query: String) {\n        orders(first: 5, query: $query) {\n            edges {\n                node {\n                    id\n                    name\n                }\n            }\n        }\n    }";
})(GQL_QUERIES || (GQL_QUERIES = {}));
export const SIZE_GLOBAL_ORDER = [
    'XXS',
    'XS',
    'S',
    'SM',
    'M',
    'MD',
    'L',
    'LG',
    'XL',
    'XXL',
    'XXXL',
    '3XL',
    '4XL',
];
export const SIZE_GLOBAL_OPTION_NAMES = [
    'size',
    'talla',
    'tamaño',
    'talle',
];
