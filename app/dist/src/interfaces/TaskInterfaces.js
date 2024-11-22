export var TaskPriority;
(function (TaskPriority) {
    TaskPriority[TaskPriority["HIGH"] = 0] = "HIGH";
    TaskPriority[TaskPriority["NORMAL"] = 1] = "NORMAL";
    TaskPriority[TaskPriority["LOW"] = 2] = "LOW";
})(TaskPriority || (TaskPriority = {}));
export var TaskState;
(function (TaskState) {
    TaskState["ON_HOLD"] = "ON_HOLD";
    TaskState["SCHEDULED"] = "SCHEDULED";
    TaskState["PROCESSING"] = "PROCESSING";
    TaskState["FINISHED"] = "FINISHED";
    TaskState["ERROR"] = "ERROR";
    TaskState["CANCELLED"] = "CANCELLED";
})(TaskState || (TaskState = {}));
export const TaskType = {
    CREATE_UPDATE_PRODUCTS: 'CREATE_UPDATE_PRODUCTS',
    UPDATE_STOCK: 'UPDATE_STOCK',
    UPDATE_PRICE: 'UPDATE_PRICE',
    COUNT_NUMBERS: 'COUNT_NUMBERS',
    GENERAL: 'GENERAL',
    ALLOCATE_BILL_ORDER: 'ALLOCATE_BILL_ORDER',
    APP_TO_ERP_ACTION: 'APP_TO_ERP_ACTION',
};
export var EventType;
(function (EventType) {
    EventType["CREATE_PRODUCT"] = "CREATE_PRODUCT";
    EventType["UPDATE_STOCK"] = "UPDATE_STOCK";
    EventType["UPDATE_PRICE"] = "UPDATE_PRICE";
    EventType["ALLOCATE_BILL_ORDER"] = "ALLOCATE_BILL_ORDER";
})(EventType || (EventType = {}));
export const TASK_SUCCESS_MESSAGE = {
    [TaskType.CREATE_UPDATE_PRODUCTS]: 'Product successfully created/updated',
    [TaskType.UPDATE_STOCK]: 'Product variants stock successfully updated',
    [TaskType.UPDATE_PRICE]: 'Product variants price successfully updated',
    [TaskType.COUNT_NUMBERS]: 'Task ran successfully',
    [TaskType.GENERAL]: 'Task ran successfully',
    [TaskType.APP_TO_ERP_ACTION]: 'Task ran successfully',
    [TaskType.ALLOCATE_BILL_ORDER]: 'Order sent to ERP successfully',
};
