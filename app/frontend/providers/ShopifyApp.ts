import { authenticatedFetch } from '@shopify/app-bridge/utilities'
import AppBridge, { AppBridgeState, ClientApplication } from '@shopify/app-bridge'
import { Redirect, SessionToken } from '@shopify/app-bridge/actions'
import aaa from '@shopify/app-bridge/utilities';
console.log('aaa',aaa)
const URLParams = new URLSearchParams(location.search)
console.log("localStorage.getItem('host')", localStorage.getItem('host'))
console.log("window.__SHOPIFY_DEV_HOST", window.__SHOPIFY_DEV_HOST)
import another from '@shopify/app-bridge';
console.log(window, another);



window.__SHOPIFY_DEV_HOST = window.__SHOPIFY_DEV_HOST || 'cHVtYS1yZXAtZG9taW5pY2FuYS5teXNob3BpZnkuY29tL2FkbWlu';
console.log(Redirect, authenticatedFetch, ClientApplication);
console.log( process.env.SHOPIFY_API_KEY, localStorage.getItem('host') || window.__SHOPIFY_DEV_HOST || URLParams.get('host') || '');
var ShopifyApp;
if (typeof AppBridge === 'function') {
    ShopifyApp = AppBridge({
        apiKey: process.env.SHOPIFY_API_KEY || '',
        host: localStorage.getItem('host') || window.__SHOPIFY_DEV_HOST || URLParams.get('host') || '',
        forceRedirect: true
    })
} else {
    ShopifyApp = another.createApp({
        apiKey: process.env.SHOPIFY_API_KEY || '',
        host: localStorage.getItem('host') || window.__SHOPIFY_DEV_HOST || URLParams.get('host') || '',
        forceRedirect: true
    })
}

setStore()

const useAuthenticatedFetch = () => {
    debugger;
    const fetchFunction = authenticatedFetch(ShopifyApp)

    return async (uri: string, options: any = {}) => {
        debugger;
        const { methods, computeds } = await import('../store/ConfigStore')
        console.log(options);
        console.log(computeds.fetchConfig());
        options = { ...options, ...computeds.fetchConfig() }
        
        const response = await fetchFunction(uri, options);

        if (response.headers.get('X-Shopify-API-Request-Failure-Reauthorize') === '1') {
            checkHeadersForReauthorization(response.headers, ShopifyApp);
            throw new Error('Shopify Auth needs reauthorize')
        }

        if ([403, 401].includes(response.status)) {
            if (!!response.headers.get('X-Innovate-Auth-Forbidden')) {
                throw new Error('Forbidden refresh token from server')
            }

            await new Promise(res => {
                methods.handleJwtError((_, payload) => {
                    if (typeof options.headers === 'undefined') options.headers = {}

                    options.headers['X-Innovate-Token'] = `Bearer ${payload?.accessToken}`
                    options.headers['X-Innovate-Refresh-Token'] = payload?.refreshToken
                    return res(true)
                })
            })

            const _response = await fetchFunction(uri, options);
            checkHeadersForReauthorization(_response.headers, ShopifyApp);

            return _response
        }

        return response;
    };
}

const useFetch = async (uri: string, options: any = {}) => {
    const fetchFunction = authenticatedFetch(ShopifyApp)

    const response = await fetchFunction(uri, options);
    checkHeadersForReauthorization(response.headers, ShopifyApp);
    return response.json();
}

function checkHeadersForReauthorization(headers: Headers, app: ClientApplication<AppBridgeState>) {
    if (headers.get("X-Shopify-API-Request-Failure-Reauthorize") !== '1') return

    const authUrlHeader =
        headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url") ||
        `/api/auth`;

    const redirect = Redirect.create(app);
    redirect.dispatch(
        Redirect.Action.REMOTE,
        authUrlHeader.startsWith('/')
            ? `https://${window.location.host}${authUrlHeader}`
            : authUrlHeader
    );
}

async function setStore() {
    try {
        const ShopifyStore = await import('../store/ShopifyAppStore')
        // if ( !URLParams.has('shop') ) throw new Error('Shop query param not found!')

        ShopifyStore.state.shop = 'puma-rep-dominicana.myshopify.com';
        console.log("ShopifyStore.state.shop", ShopifyStore.state.shop)
    } catch (err) {
        console.error('ERROR WHILE SETTING STORE!!!')
        console.error(err)
    }
}

export default ShopifyApp
export { useAuthenticatedFetch, useFetch }