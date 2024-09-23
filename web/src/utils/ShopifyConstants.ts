export enum GQL_MUTATIONS {
    ORDER_EDIT_BEGIN = `mutation orderEditBegin($id: ID!) {
        orderEditBegin(id: $id) {
          userErrors {
            field
            message
          }
          calculatedOrder {
               id
            lineItems(first: 15){
              edges{
                node{
                  id
                  quantity
                }
              }
            }
            originalOrder{
              lineItems(first: 15){
                edges{
                  node{
                    id
                    variant{
                        id
                    }
                  }
                }
              }
            }
          }
        }
    }`,
    ORDER_EDIT_COMMIT = `mutation commitEdit($id: ID!) {
        orderEditCommit(id: $id, notifyCustomer: false, staffNote: "Order edited by Payments Manager (Plexo) APP") {
          order {
            id
          }
          userErrors {
            field
            message
          }
        }
    }`,
    ORDER_EDIT_ADD_ITEM_DISCOUNT = `mutation orderEditAddLineItemDiscount(
        $id: ID!, 
        $discount: OrderEditAppliedDiscountInput!, 
        $lineItemId: ID!
    ) {
        orderEditAddLineItemDiscount(id: $id, discount: $discount, lineItemId: $lineItemId) {
          addedDiscountStagedChange {
            id
            value
            description
          }
          calculatedLineItem {
            id
            quantity
          }
          calculatedOrder {
            id
            addedLineItems(first: 5) {
                edges {
                    node {
                        id
                        quantity
                    }
                }
            }
          }
          userErrors {
            field
            message
          }
        }
    }`,
    ORDER_EDIT_ADD_CUSTOM_ITEM = `mutation orderEditAddCustomItem($id: ID!, $price: MoneyInput!, $quantity: Int!, $title: String!) {
        orderEditAddCustomItem(id: $id, price: $price, quantity: $quantity, title: $title) {
          calculatedLineItem {
            id
            quantity
          }
          calculatedOrder {
            id
            addedLineItems(first: 5) {
                edges {
                    node {
                        id
                        quantity
                    }
                }
            }
          }
          userErrors {
            field
            message
          }
        }
    }`,
    ORDER_EDIT_ADD_ITEM = `mutation orderEditAddVariant($id: ID!, $quantity: Int!, $variantId: ID!) {
        orderEditAddVariant(id: $id, quantity: $quantity, variantId: $variantId, allowDuplicates: true) {
          calculatedLineItem {
            id
            quantity
          }
          calculatedOrder {
            id
            addedLineItems(first: 5) {
                edges {
                    node {
                        id
                        quantity
                    }
                }
            }
          }
          userErrors {
            field
            message
          }
        }
    }`,
    ORDER_EDIT_REMOVE_ITEM = `mutation changeLineItemQuantity($id: ID!, $lineItemId: ID!) {
        orderEditSetQuantity(id: $id, lineItemId: $lineItemId, quantity: 0) {
            calculatedOrder {
                id
                addedLineItems(first: 5) {
                    edges {
                        node {
                            id
                            quantity
                        }
                    }
                }
            }
            userErrors {
                field
                message
            }
        }
    }`,
    ORDER_MARK_AS_PAID = `mutation orderMarkAsPaid($input: OrderMarkAsPaidInput!) {
        orderMarkAsPaid(input: $input) {
            order {
                id
            }
            userErrors {
                field
                message
            }
        }
    }`,
    CREATE_PRODUCT = `mutation productCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
        productCreate(input: $input, media: $media) {
            product {
                id
                title
            }
            userErrors {
                field
                message
            }
        }
    }`,
    UPDATE_PRODUCT = `mutation productUpdate($input: ProductInput!, $media: [CreateMediaInput!]) {
        productUpdate(input: $input, media: $media) {
            product {
                id
                title
            }
            userErrors {
                field
                message
            }
        }
    }`,
    STAGED_UPLOADS_CREATE = `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
            stagedTargets {
                url
                resourceUrl
                parameters {
                    name
                    value
                }
            }
            userErrors {
                field
                message
            }
        }
    }`,
    INVENTORY_ADJUST_QUANTITIES = `mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
        inventoryAdjustQuantities(input: $input) {
            inventoryAdjustmentGroup {
                reason
            }
            userErrors {
                field
                message
            }
        }
    }`,
    PREPARE_ORDER_FOR_PICKUP = `mutation fulfillmentOrderLineItemsPreparedForPickup($input: FulfillmentOrderLineItemsPreparedForPickupInput!) {
        fulfillmentOrderLineItemsPreparedForPickup(input: $input) {
            userErrors {
                field
                message
            }
        }
    }`
}

export enum GQL_QUERIES {
    PRODUCTS = `query getProducts($query: String) {
        products(first: 5, query: $query) {
            edges {
                node {
                    id
                    title
                }
            }
        }
    }`,
    ORDERS = `query getOrders($query: String) {
        orders(first: 5, query: $query) {
            edges {
                node {
                    id
                    name
                }
            }
        }
    }`
}

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
]

export const SIZE_GLOBAL_OPTION_NAMES = [
    'size',
    'talla',
    'tamaño',
    'talle',
]