import { NavigationState } from "../interfaces/AppInterfaces";
// import { RouteLocationRaw } from 'vue-router';
import { buildQueryString } from "../providers/utils";

const state = {
    page: 1,
    lastPath: '/',
    activePath: '/',
    backPath: '/'
}

const methods = {
    navigateTo( params: any ) {
        // state.router?.push(params)
    }
}

const queryParams = () => {
    return '?tldr=1'
    // if ( !!!state.route ) return ''
    // return buildQueryString(state.route.query)
}

const computeds = {
    queryParams
}

export {
    state,
    methods,
    computeds
}