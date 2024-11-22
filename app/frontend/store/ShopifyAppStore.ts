// INITIAL GLOBAL IDEA
import ShopifyApp from "../providers/ShopifyApp";
import { Toast } from "@shopify/app-bridge/actions";


const DEFAULT_TOAST_TIMEOUT = 3000

const state = {
    shop: 'puma-rep-dominicana.myshopify.com',
    toastInstance: Toast?.create(ShopifyApp, {
        message: '',
        duration: DEFAULT_TOAST_TIMEOUT
    })
}

const methods = {
    fireToast({ message, isError = false }: { message: string, isError?: boolean }, timeout: number = DEFAULT_TOAST_TIMEOUT) {
        try {
            state.toastInstance.message = message
            state.toastInstance.isError = isError
            state.toastInstance.duration = timeout
            state.toastInstance.dispatch(Toast.Action.SHOW)
        } catch (err) {
            state.toastInstance = Toast.create(ShopifyApp, {
                message,
                isError,
                duration: DEFAULT_TOAST_TIMEOUT
            }).dispatch(Toast.Action.SHOW)
        }
    }
}

export {
    state,
    methods
}