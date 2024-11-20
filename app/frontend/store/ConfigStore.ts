import { AppMode } from '../interfaces/AppInterfaces';
import { methods as ShopifyMethods } from './ShopifyAppStore'
import { IAppConfig, IConfigState, IWebhookRegister } from '../interfaces/ResourceInterfaces';
import { GqlProductStatus } from '../interfaces/ShopifyInterfaces';
import { IUserJWT } from '../interfaces/UserInterfaces';
import ShopifyApp, { useAuthenticatedFetch } from '../providers/ShopifyApp'
import { state as ShopifyAppState } from '../store/ShopifyAppStore'
import { Redirect } from '@shopify/app-bridge/actions';
import { useAxios } from '../providers/utils';
import SocketStore from '../store/SocketStore';


let state:IConfigState = {
    processing: false,
    language: localStorage.getItem('ERP_APP_LOCALE') || 'en',
    sessionToken: '',
    refreshToken: '',
    config: {
        mode: AppMode.DISABLED,
        apiSandboxKey: '',
        apiProductionUrl: '',
        apiProductionKey: '',
        apiProductionPrivateKey: '',
        apiSandboxPrivateKey: '',
        apiMerchantId: '',
        apiSandboxUrl: '',
        productCreationMode: GqlProductStatus.DRAFT,
        apiBrandIds: []  // This was referenced in the computed properties
    },
    webhooks: {
        shopify: [],
        db: []
    },
    brands: []
};

// const state = reactive<IConfigState>({
//     processing: false,
//     language: localStorage.getItem('ERP_APP_LOCALE') || 'en',
//     sessionToken: '',
//     refreshToken: '',
//     config: {
//         mode: AppMode.DISABLED,
//         apiSandboxKey: '',
//         apiProductionUrl: '',
//         apiProductionKey: '',
//         apiProductionPrivateKey: '',
//         apiSandboxPrivateKey: '',
//         apiMerchantId: '',
//         apiSandboxUrl: '',
//         productCreationMode: GqlProductStatus.DRAFT
//     },
//     webhooks: {
//         shopify: [],
//         db: []
//     },
//     brands: []
// })

const methods = {
    
    async checkTokenPayload() {
        const { useAuthenticatedFetch } = await import('../providers/ShopifyApp')

        const fetch = useAuthenticatedFetch()
        const request = await fetch(`/api/shopify/check_token`, {
            credentials: 'same-origin'
        })

        interface TokenCheckResponse {
            status:         boolean;
            payload:        IUserJWT;
        }

        const res: TokenCheckResponse = await request.json()
        return res
    },
    setRefreshToken( token: string ) {
        state.refreshToken = token
    },
    setSessionToken( token: string ) {
        state.sessionToken = token
    },
    async signIn() {
        
    
        debugger;
        try {
            console.log(state.sessionToken);
            console.log(state.refreshToken);
            if ( !!state.sessionToken && !!state.refreshToken ) return -1;
    
            // const data = await useAxios({
            //     method: 'DELETE',
            //     uri: `/api/v1/webhooks/${id}`,
            // })
            const request = await useAxios({
                method: 'GET',
                uri: '/api/shopify/login'
            })
            const res = await request.json()
    
            this.setSessionToken(res.accessToken)
            this.setRefreshToken(res.refreshToken)
            // SocketStore.methods.setServerUri(res.socketIoSvUri)
        } catch (err) {
            console.log('here')
            console.error(err)
        }
    },
    async deleteWebhook( id: string ) {
        try {
            const data = await useAxios({
                method: 'DELETE',
                uri: `/api/v1/webhooks/${id}`,
            })

            state.webhooks.db = data.webhooks
            
            return data
        } catch (err: any) {
            console.error(err)
        }
    },
    async getBrands() {
        try {
            const brands = await useAxios({
                method: 'GET',
                uri: `/api/v1/erp/agilisa/master_brands`,
            })
            state.brands.splice(0, state.brands.length, ...brands)
            
            console.log(brands)
        } catch (err: any) {
            if ( err.isAxiosError && err.request.status === 403 ) {
                await this.handleJwtError((err, payload) => {
                    if ( err ) throw err
                    return this.getBrands()
                })

                return
            }
            console.error(err)
        }
    },
    async getWebhooks() {
        try {
            const { useAuthenticatedFetch } = await import('../providers/ShopifyApp')
            
            const fetch = useAuthenticatedFetch()
            const request = await fetch('/api/shopify/webhooks')
            const webhooks = await request.json()

            state.webhooks.shopify = webhooks

            const data = await useAxios({
                method: 'GET',
                uri: `/api/v1/webhooks`,
            })
            state.webhooks.db = data
            
            console.log(webhooks)
        } catch (err: any) {
            if ( err.isAxiosError && err.request.status === 403 ) {
                await this.handleJwtError((err, payload) => {
                    if ( err ) throw err
                    return this.getWebhooks()
                })

                return
            }
            console.error(err)
        }
    },
    async syncWebhooks() {
        state.processing = true

        try {
            const data = await useAxios({
                method: 'POST',
                uri: `/api/v1/webhooks/sync`,
            })

            this.getWebhooks()
        } catch (err: any) {
            console.error(err)

            ShopifyMethods.fireToast({
                message: err?.message || 'Error!',
                isError: true
            })
        }

        state.processing = false
    },
    async getConfig() {
        state.processing = true
        debugger;
        try {
            const data = await useAxios<IAppConfig>({
                method: 'GET',
                uri: '/api/v1/config',
            })

            Object.entries(data).forEach(([key, val]) => {
                state.config[key as keyof IAppConfig] = val as never
            })
            
            return data;
        } catch (err: any) {
            console.error(err)
        }

        state.processing = false
    },
    async updateConfig() {
        state.processing = true

        const newCfg = { ...state.config }
        delete newCfg._id
        delete newCfg.createdAt
        newCfg.updatedAt = Date.now()
    
        try {
            const data = await useAxios<IAppConfig>({
                method: 'PUT',
                uri: `/api/v1/config/${state.config._id}`,
                payload: newCfg
            })

            ShopifyMethods.fireToast({ message: 'Settings updated successfully!' })
            console.log(data)
        } catch (err: any) {
            console.error(err)

            ShopifyMethods.fireToast({
                message: err?.message || 'Error!',
                isError: true
            })
        }
        
        state.processing = false
    },
    async updateWebhook( params: IWebhookRegister ) {
        state.processing = true
        const id = params._id
        params.handlers = params.handlers.filter(x => !!x.uri)
        const _params = { ...params } as any
        delete _params._id

        try {
            const data = await useAxios({
                method: 'PUT',
                uri: `/api/v1/webhooks/${id}`,
                payload: _params
            })

            ShopifyMethods.fireToast({ message: `${_params.topic} webhook updated successfully!` })

            const thisWebhookIndex = state.webhooks.db.findIndex(x => x._id === id)
            state.webhooks.db.splice(thisWebhookIndex, 1, data.webhook)
            console.log(data)
        } catch (err: any) {
            console.error(err)

            ShopifyMethods.fireToast({
                message: err.isAxiosError ? err.response.data.message : 'Error!',
                isError: true
            })
        }
        
        state.processing = false
    },
    async createWebhook( params: any ) {
        state.processing = true
        params.handlers = params.handlers.filter((x: any) => !!x.uri)

        try {
            const data = await useAxios({
                method: 'POST',
                uri: `/api/v1/webhooks`,
                payload: params
            })

            ShopifyMethods.fireToast({ message: `${params.topic} webhook created successfully!` })

            state.webhooks.db.push(data.webhook)
            console.log(data)
        } catch (err: any) {
            console.error(err)

            ShopifyMethods.fireToast({
                message: err?.message || 'Error!',
                isError: true
            })
        }
        
        state.processing = false
    },
    async handleJwtError(
        cb?: (
            err: null | Error | unknown, 
            payload: { accessToken: string, refreshToken: string } | null
        ) => Promise<any> | any
    ) {
        try {
            const fetch = useAuthenticatedFetch()
            const request = await fetch(`/api/shopify/refresh_token?shop=${ShopifyAppState.shop}`, {
                method: 'POST',
                body: JSON.stringify({}),
                ...computeds.fetchConfig
            })
            const { accessToken, refreshToken } = await request.json()

            if ( request.status > 300 ) throw { message: 'Refresh token voided' }
    
            this.setSessionToken(accessToken)
            this.setRefreshToken(refreshToken)

            if ( !!cb ) {
                return cb(null, { accessToken, refreshToken })
            }
        } catch (err) {
            const redirect = Redirect.create(ShopifyApp);
            // redirect.dispatch(Redirect.Action.REMOTE, '/api/auth')
            const { computeds: NavigationComputeds } = await import('../store/NavigationStore')
            redirect.dispatch(
                Redirect.Action.ADMIN_PATH, 
                `/apps/${process.env.SHOPIFY_API_KEY}?${NavigationComputeds.queryParams}`
            )

            if ( !!cb ) {
                return cb(err, null)
            }
        }
    }
}

const fetchConfig = () => ({
    headers: {
        'X-Innovate-Token': `Bearer ${state.sessionToken}`,
        'X-Innovate-Refresh-Token': state.refreshToken,
        'Content-Type': `application/json`
    }
});

const brandOptions = () => {
    return state.brands
        .filter(brand => !state.config.apiBrandIds?.includes(String(brand.Brand_Id)))
        .map(brand => ({
            value: String(brand.Brand_Id),
            label: `${brand.StoreName} (${brand.Brand_Id})`
        }));
};

const activeBrandOptions = () => {
    return state.config.apiBrandIds?.map(bId => {
        return state.brands.find(x => String(x.Brand_Id) === String(bId));
    }) || [];
};

// Using a simple object to hold computed functions
const computeds = {
    fetchConfig,
    brandOptions,
    activeBrandOptions
};

function updateConfigValues(newVal:any) {
    [
        'cronMinutesStockUpdateTask', 
        'cronMinutesPriceUpdateTask',
        'cronMinutesProductCreateUpdateTask',
    ].forEach(key => {
        const _key = key as unknown as keyof IAppConfig
        if ( !!!state.config[_key] ) return

        ;(state.config[_key] as number) = Number(state.config[_key]) > 60
            ? 60
            : Number(state.config[_key]) < 1
                ? 1
                : Number(newVal[_key])
    })
}

export {
    state,
    methods,
    computeds
}