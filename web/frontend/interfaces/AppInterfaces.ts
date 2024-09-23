import { RouteLocationNormalizedLoaded, Router } from "vue-router";

export enum AppMode {
    SANDBOX = 'SANDBOX',
    PRODUCTION = 'PRODUCTION',
    DISABLED = 'DISABLED'
}

export const TOAST_REASON = {
    TASK_CREATED_SUCCESSFULLY: 'TASK_CREATED_SUCCESSFULLY',
    TASK_CREATION_ERROR: 'TASK_CREATION_ERROR',
} as const;
export type ToastReason = ObjectValues<typeof TOAST_REASON>

export const TOAST_REASON_RESULT: {
    [K in ToastReason]: { message: string, isError: boolean };
} = {
    [TOAST_REASON.TASK_CREATED_SUCCESSFULLY]: {
        message: 'Tarea creada con exito',
        isError: false
    }, // Task successfully created
    [TOAST_REASON.TASK_CREATION_ERROR]: {
        message: 'La tarea no pudo instanciarse',
        isError: true
    } // Not able to create task
} as const;

export interface NavigationState {
    router?:        Router;
    route?:         RouteLocationNormalizedLoaded;
    page:           number;
    lastPath:       string;
    backPath:       string;
    activePath:     string;
}

export type ObjectValues<T> = T[keyof T];
