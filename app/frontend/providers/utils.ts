import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

export function debounce<P extends any[]>(
    cb: (...args: P) => any, 
    delay: number = 250
): (...args: P) => void {
    let timeout: NodeJS.Timeout

    return (...args) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            cb(...args)
        }, delay)
    }
}

export function isObject( test: any ) {
    try {
        if ( typeof test !== 'string' && !!Object.keys(test).length ) return true
        const json = JSON.parse(test)
        if ( !!!Object.keys(json).length ) throw false

        return true
    } catch (err)  {
        return false
    }
}

export function buildQueryString( params: object ) {
    return Object.entries(params).map(([key, val]) => 
        `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
    ).join('&')
}

export async function useAxios<T = any>({ method, uri, payload = {}, config = {} }: {
    method: 'POST' | 'GET' | 'PATCH' | 'PUT' | 'DELETE',
    uri: string,
    payload?: any,
    config?: AxiosRequestConfig
}) {
    const AXIOS_FN_MATCH = {
        POST: axios.post,
        GET: axios.get,
        PATCH: axios.patch,
        PUT: axios.put,
        DELETE: axios.delete,
    }

    const axiosFn = AXIOS_FN_MATCH[method]
    
    const { computeds, methods: ConfigMethods } = await import('../store/ConfigStore')
    config = { ...config, ...computeds.fetchConfig }

    try {
        const args = [uri, config] as any
        if ( ['POST', 'PUT', 'PATCH'].includes(method) ) {
            args.splice(1, 0, payload)
        }

        const { data } = await axiosFn.apply(null, args) as AxiosResponse<T>
        return data
    } catch (err: any) {
        if ( err.isAxiosError && err.request.status === 403 ) {
            await new Promise(async (res, rej) => {
                ConfigMethods.handleJwtError((err, payload) => {
                    if ( err ) throw err
                    res(payload)
                })
            })

            return useAxios<T>({ method, uri, payload, config })
        }
        
        throw err
    }
}

type AnyObject = { [key: string]: any };
export function mergeObjects<T extends AnyObject, U extends AnyObject>(obj1: T, obj2: U): T & U {
    // Create a new empty object to hold the merged values
    const mergedObject = {} as T & U;

    // Merge obj1 into the mergedObject
    for (const key in obj1) {
        if (typeof obj1[key] === 'object' && !Array.isArray(obj1[key])) {
            mergedObject[key] = mergeObjects(obj1[key], {});
        } else {
            mergedObject[key] = obj1[key] as any;
        }
    }

    // Merge obj2 into the mergedObject, replacing existing values if they exist
    for (const key in obj2) {
        if (typeof obj2[key] === 'object' && !Array.isArray(obj2[key])) {
            mergedObject[key] = mergeObjects(mergedObject[key] || {}, obj2[key]);
        } else {
            mergedObject[key] = obj2[key] as any;
        }
    }

    return mergedObject;
}

export const currencyFormat = new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
})

export function isEmpty(value: any) {
    if (Array.isArray(value)) {
        return value.length === 0;
    } else {
        return value === '' || value == null;
    }
}