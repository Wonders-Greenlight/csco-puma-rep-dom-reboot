import { TaskDetailState } from "../interfaces/ResourceInterfaces";
import { methods as ShopifyAppMethods } from '../store/ShopifyAppStore'
import { debounce, useAxios } from "../providers/utils";
import { AxiosError } from "axios";

const state:TaskDetailState= {
    processing: false,
    skipDebounce: false,
    pagination: {
        page: 1,
        limit: 10
    },
    taskId: null,
    task: null,
    filters: {
        resourceId: '',
        status: ''
    }
}

let lastStatus = ''

const methods = {
    resetFilters() {
        state.skipDebounce = true
        state.filters.resourceId = ''
        state.filters.status = ''

        setTimeout(() => state.skipDebounce = false, 1000)
    },
    async getTask() {
        if ( !!state.skipDebounce ) return

        state.processing = true
        try {
            const dbTask = await useAxios({
                method: 'GET',
                uri: computeds.fetchPageUrl()
            })

            lastStatus = state.filters.status
        
            // console.log(dbTask)
            
            if ( !!!state.task ) {
                state.task = dbTask
                return
            }

            Object.keys(state.task).forEach(key => {
                if ( dbTask[key] === state.task[key] ) return
                if ( typeof dbTask[key] === 'undefined' ) return
                state.task[key] = dbTask[key]
            })
        } catch (err: any | AxiosError ) {
            console.error('ERROR GETTING TASK')
            console.log(err)

            ShopifyAppMethods.fireToast({
                message: err.response?.data?.message || err.message,
                isError: true
            })

            this.resetFilters()
        } finally {
            state.processing = false
        }
    }
}

const computeds: any = {
    totalResults: () => {
        if ( !!!state.task ) return 0
        return state.task.outerData.failed + state.task.outerData.success
    },
    totalPages: () => Math.ceil(computeds.totalResults / state.pagination.limit),
    fetchPageUrl: () => {
        if ( !!!state.taskId ) return ''
        const urlParams = new URLSearchParams()
        urlParams.set('page', String(state.pagination.page))
        urlParams.set('limit', String(state.pagination.limit))

        
        if ( Object.values(state.filters).some(v => !!v) ) {
            // LATER SOLVE THIS
            // if ( state.pagination.page > 1 ) {
            //     state.pagination.page = 1
            //     urlParams.set('page', String(state.pagination.page))
            // }
            
            Object.entries(state.filters).forEach(([key, val]) => {
                if ( !!!val ) return
                urlParams.set(key, val)
            })

            if ( !!state.filters.resourceId ) {
                urlParams.delete('status')
                state.filters.status = ''
                if ( state.pagination.page > 1 ) {
                    state.pagination.page = 1
                    urlParams.set('page', String(1))
                }
            }

            if ( state.filters.status !== lastStatus ) {
                state.pagination.page = 1
                urlParams.set('page', String(1))
            }
        }
        
        let url = `/api/v1/tasks/${state.taskId}`
        
        return `${url}?${urlParams.toString()}`
    },
    taskRunningTime: () => {
        if ( !!!state.task ) return 0
        const startTime = new Date(state.task.startedAt) as any
        const endTime = new Date(state.task.finishedAt) as any
        const restTime = new Date(endTime - startTime)
    
        const minutes = restTime.getMinutes()
        const seconds = restTime.getSeconds()
        if ( !!!minutes && !!!seconds ) {
            const ms = restTime.getMilliseconds()
            return ms ? `${restTime.getMilliseconds()}ms` : 'N/A'
        }
         
        return `${minutes}m ${seconds}s`
    }
}

// watch(() => state.pagination.page, methods.getTask)
// watch(() => state.filters, debounce(methods.getTask, 750), { deep: true })

export {
    state,
    methods,
    computeds
}