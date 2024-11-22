export var LogType;
(function (LogType) {
    LogType["WARNING"] = "warning";
    LogType["INFO"] = "info";
    LogType["ATTENTION"] = "attention";
    LogType["SUCCESS"] = "success";
})(LogType || (LogType = {}));
export var AppMode;
(function (AppMode) {
    AppMode["SANDBOX"] = "SANDBOX";
    AppMode["PRODUCTION"] = "PRODUCTION";
    AppMode["DISABLED"] = "DISABLED";
})(AppMode || (AppMode = {}));
export const TOAST_REASON = {
    TASK_CREATED_SUCCESSFULLY: 'TASK_CREATED_SUCCESSFULLY',
    TASK_CREATION_ERROR: 'TASK_CREATION_ERROR',
};
export const TOAST_REASON_RESULT = {
    [TOAST_REASON.TASK_CREATED_SUCCESSFULLY]: {
        message: 'Tarea creada con exito',
        isError: false
    }, // Task successfully created
    [TOAST_REASON.TASK_CREATION_ERROR]: {
        message: 'La tarea no pudo instanciarse',
        isError: true
    } // Not able to create task
};
