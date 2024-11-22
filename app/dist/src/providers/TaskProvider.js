import { Worker } from 'worker_threads';
import { randomUUID } from 'crypto';
import cron from 'node-cron';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { TaskPriority, TaskState, TaskType } from '../interfaces/TaskInterfaces.js';
// Models
import Task from '../models/TaskModel.js';
import Event from '../models/EventModel.js';
import AppCfgModel from '../models/AppCfgModel.js';
// Utils
import folders from '../utils/folders.js';
import TaskController from '../controllers/TaskController.js';
import SocketProvider from './SocketProvider.js';
import LogController from '../controllers/LogController.js';
import { logger } from '../utils/utils.js';
export const TASKS = {
    ORDER: path.resolve(folders.TASKS, 'OrderTasks.js'),
    PRODUCT: path.resolve(folders.TASKS, 'ProductTasks.js'),
    ERP: path.resolve(folders.TASKS, 'ERPTasks.js'),
};
export const TASKFILE_BY_TYPE = {
    [TaskType.CREATE_UPDATE_PRODUCTS]: TASKS.PRODUCT,
    [TaskType.UPDATE_PRICE]: TASKS.PRODUCT,
    [TaskType.UPDATE_STOCK]: TASKS.PRODUCT,
    [TaskType.APP_TO_ERP_ACTION]: TASKS.ERP,
    [TaskType.ALLOCATE_BILL_ORDER]: TASKS.ORDER,
};
export const TASK_FUNCTION = {
    [TaskType.CREATE_UPDATE_PRODUCTS]: 'createUpdateProducts',
    [TaskType.UPDATE_PRICE]: 'createUpdateProducts',
    [TaskType.UPDATE_STOCK]: 'createUpdateProducts',
    [TaskType.ALLOCATE_BILL_ORDER]: 'allocateOrderInvoices',
};
class _TaskProvider {
    SHOW_LOGS = true;
    cronTab = [];
    queue;
    activeWorkers = {};
    hardwareInfo = {};
    constructor() {
        this.getOSInfo();
        this.setQueueProxy();
        this.log('===== TASK QUEUE CREATED SUCCESSFULLY =====');
        this.runCron();
    }
    setQueueProxy() {
        // A proxy for our array
        this.queue = new Proxy([], {
            deleteProperty: (target, property) => {
                delete target[property];
                // this.runNextTask()
                return true;
            },
            set: (target, property, value, receiver) => {
                target[property] = value;
                this.checkForParallelTask();
                if (this.queue.some(x => !!x.processing))
                    return true;
                this.runNextTask();
                return true;
            }
        });
        this.stopProcessingHoldTasks()
            .then(this.resumeOnHoldTasks.bind(this))
            .then(this.deleteCancelledTasks);
    }
    log(toBeLogged) {
        if (!this.SHOW_LOGS)
            return;
        console.log(toBeLogged);
    }
    getOSInfo() {
        this.hardwareInfo.cpus = os.cpus();
        this.hardwareInfo.arch = os.arch();
    }
    checkForParallelTask() {
        const processingTasks = this.queue.filter(t => t.processing);
        const highPriorityDistincTasks = this.queue.reduce((acc, t) => {
            const existType = acc.some(x => x.type === t.type);
            if (t.priority !== TaskPriority.HIGH || existType)
                return acc;
            if (processingTasks.some(_t => _t.id === t.id || _t.type === t.type))
                return acc;
            acc.push(t);
            return acc;
        }, []);
        if (!!!highPriorityDistincTasks.length)
            return;
        highPriorityDistincTasks.forEach(task => {
            this.runNextTask(this.queue.findIndex(t => t.id === task.id));
        });
    }
    async checkFrozenTasks(nowDate) {
        try {
            const pendingTasks = await Task.countDocuments({ state: TaskState.ON_HOLD });
            if (pendingTasks === 0)
                return;
            const processingTask = this.queue.find(x => x.processing);
            const processingTaskDb = await Task.findOne({ busId: processingTask.id });
            if (!!!processingTaskDb)
                return;
            const nowTime = new Date();
            const startedTime = new Date(processingTaskDb.startedAt);
            const restTime = new Date(nowTime - startedTime);
            if (restTime.getMinutes() < 10)
                return;
            processingTask.processing = false;
            processingTaskDb.state = TaskState.ERROR;
            await processingTaskDb.save();
        }
        catch (err) {
            console.error('Error while checking for frozen tasks');
        }
        finally {
            this.resumeOnHoldTasks.bind(this)();
        }
    }
    async runCron() {
        const ianaTimezone = 'America/Dominica';
        const options = { timezone: ianaTimezone };
        const minByMinTask = cron.schedule('* * * * *', TaskController.checkScheduledTasks, options);
        this.log('===== ADDED CRONE MIN BY MIN SCHEDULE CHECKER =====');
        const checkFrozenTasks = cron.schedule('*/15 * * * *', this.checkFrozenTasks.bind(this), options);
        const cleanTaskResults = cron.schedule('0 0 */1 * *', () => {
            TaskController.deleteOldTasks();
            TaskController.cleanResults();
            LogController.clearPm2Logs();
        }, options);
        const flushPm2Logs = cron.schedule('0 0 */5 * *', TaskController.flushPm2Logs.bind(TaskController), options);
        this.cronTab.push(minByMinTask, checkFrozenTasks, cleanTaskResults, flushPm2Logs);
        const cfg = await AppCfgModel.findOne();
        if (cfg?.cronPriceUpdateRoutineEnabled) {
            const automatedUpdatePrice = cron.schedule(`*/${cfg.cronMinutesPriceUpdateTask} * * * *`, () => {
                TaskController.createTaskByType.bind(TaskController)(TaskType.UPDATE_PRICE);
            }, options);
            this.cronTab.push(automatedUpdatePrice);
        }
        if (cfg?.cronStockUpdateRoutineEnabled) {
            const automatedUpdateStock = cron.schedule(`*/${cfg.cronMinutesStockUpdateTask} * * * *`, () => {
                TaskController.createTaskByType.bind(TaskController)(TaskType.UPDATE_STOCK);
            }, options);
            this.cronTab.push(automatedUpdateStock);
        }
        if (cfg?.cronProductUpdateRoutineEnabled) {
            const automatedProductUpdateStock = cron.schedule(`*/${cfg.cronMinutesProductCreateUpdateTask} * * * *`, () => {
                TaskController.createTaskByType.bind(TaskController)(TaskType.CREATE_UPDATE_PRODUCTS);
            }, options);
            this.cronTab.push(automatedProductUpdateStock);
        }
        const automatedProductUpdateStockEvery4hs = cron.schedule(`30 10-20/4 * * *`, () => {
            TaskController.createTaskByType.bind(TaskController)(TaskType.CREATE_UPDATE_PRODUCTS);
        }, options);
        this.cronTab.push(automatedProductUpdateStockEvery4hs);
        const checkErrorOrders = cron.schedule('0 11 * * *', TaskController.checkErrorOrders.bind(TaskController), options);
        const rebootPm2Server = cron.schedule('0 3 */5 * *', LogController.rebootPm2Server, options);
        const rebootServer = cron.schedule('0 3 1 * *', LogController.rebootServer, options);
        this.cronTab.push(checkErrorOrders, rebootPm2Server, rebootServer);
        this.log('===== ADDED CRONE SCHEDULE =====\n');
    }
    // ------------- END PRIVATE
    reloadCronTab() {
        this.cronTab.forEach(job => job.stop());
        this.cronTab.splice(0, this.cronTab.length);
        this.runCron();
    }
    getHardware() {
        return this.hardwareInfo;
    }
    async resumeOnHoldTasks() {
        const pendingTasks = await Task.find({
            state: TaskState.ON_HOLD,
        });
        if (pendingTasks.length === 0)
            return;
        console.log('RESUMING ON HOLD TASKS');
        console.log(pendingTasks);
        const parsedTasks = pendingTasks
            .sort((a, b) => a.priority > b.priority ? 1 : -1)
            .map(this.buildTaskPayloadFromDbTask);
        this.queue.splice(0, this.queue.length, ...parsedTasks);
    }
    async stopProcessingHoldTasks() {
        const processingTasks = await Task.find({
            state: TaskState.PROCESSING,
        });
        if (processingTasks.length === 0)
            return;
        for await (const task of processingTasks) {
            await task.updateOne({
                $set: { state: TaskState.CANCELLED }
            });
            const taskIndex = this.queue.findIndex(t => t.id === task.busId);
            if (taskIndex === -1)
                continue;
            this.queue.splice(taskIndex, 1);
        }
    }
    async deleteCancelledTasks() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - 10);
        const cancelledTasks = await Task.deleteMany({
            state: TaskState.CANCELLED,
            createdAt: { $lte: now.toISOString() }
        });
        console.log('DELETED CANCELLED TASKS');
        console.log(`Deleted ${cancelledTasks.deletedCount} tasks`);
    }
    buildTaskPayloadFromDbTask(t) {
        return {
            id: t.busId,
            processing: false,
            runOnSeparateThread: true,
            priority: t.priority,
            args: t.args,
            filePath: t.filePath,
            fnToCall: t.fnToCall,
            type: t.type
        };
    }
    queueTaskInPlace(t) {
        if (t.priority === TaskPriority.LOW) {
            this.queue.push(t);
        }
        else {
            const firstHigherIndex = this.queue.findIndex(x => x.priority === t.priority + 1);
            if (firstHigherIndex > 0) {
                this.queue.splice(firstHigherIndex, 0, t);
            }
            else {
                this.queue.push(t);
            }
        }
    }
    async add(task, priority = TaskPriority.NORMAL) {
        const isMainTask = typeof task === 'function';
        let taskPayload = {
            id: randomUUID(),
            processing: false,
            runOnSeparateThread: true,
            priority: !isMainTask ? (task.priority || priority) : priority,
            type: TaskType.GENERAL,
        };
        if (isMainTask) {
            taskPayload.task = task;
            taskPayload.runOnSeparateThread = false;
        }
        else {
            taskPayload = { ...taskPayload, ...task };
            if (!!taskPayload.args) {
                taskPayload.args.pId = taskPayload.id;
                taskPayload.args.type = taskPayload.type;
            }
            else {
                taskPayload.args = {
                    pId: taskPayload.id,
                    type: taskPayload.type
                };
            }
            if (!!!taskPayload.filePath)
                taskPayload.filePath = TASKFILE_BY_TYPE[taskPayload.type];
            if (!!!taskPayload.fnToCall)
                taskPayload.fnToCall = TASK_FUNCTION[taskPayload.type];
            try {
                const dbTask = {
                    type: taskPayload.type,
                    busId: taskPayload.id,
                    args: taskPayload.args,
                    priority: taskPayload.priority,
                    filePath: taskPayload.filePath,
                    fnToCall: taskPayload.fnToCall,
                    innerData: taskPayload.innerData || {},
                    automated: taskPayload.automated ?? true
                };
                if (!!task.eventId)
                    dbTask.eventId = task.eventId; // string ID
                if (!!task.schedule) {
                    dbTask.state = TaskState.SCHEDULED;
                    dbTask.scheduleDate = typeof task.schedule === 'string'
                        ? new Date(task.schedule)
                        : task.schedule;
                }
                const _task = await TaskController.registerTask(dbTask);
                if (!!task.eventId) {
                    await Event.updateOne({ _id: task.eventId }, {
                        $set: { taskId: _task._id }
                    });
                }
            }
            catch (err) {
                console.log(err);
            }
        }
        if (!!taskPayload.schedule)
            return taskPayload;
        this.queueTaskInPlace(taskPayload);
        return taskPayload;
    }
    runTask({ taskFile, fnToCall, args, pId = randomUUID(), type = TaskType.GENERAL, }) {
        if (!!!taskFile)
            taskFile = TASKFILE_BY_TYPE[type];
        if (!!!fnToCall)
            fnToCall = TASK_FUNCTION[type];
        return new Promise(async (res, rej) => {
            let existTask = await TaskController.getTaskByBusId(pId);
            if (!!!existTask) {
                // IF THIS HAPPENS, IT MEANS THAT PROBABLY THIS FN WAS CALLED OUTSIDE AUTOMATIC QUEUE SYSTEM,
                // SO WE'LL ASSUME THE USER WANT IT TO BE RUN ASAP
                existTask = await TaskController.registerTask({
                    type: type,
                    busId: pId,
                    args,
                    priority: TaskPriority.HIGH,
                    filePath: taskFile,
                    fnToCall,
                    innerData: args || {}
                });
            }
            try {
                const worker = new Worker(taskFile, {
                    workerData: {
                        fn: fnToCall,
                        args,
                        pId
                    },
                });
                const thisTask = this.queue.find(x => x.id === pId);
                if (!!thisTask)
                    thisTask.worker = worker;
                const processInfo = { pId };
                worker.on('message', (data) => {
                    if (data?.action === 'message') {
                        if (typeof data.log === 'undefined')
                            data.log = true;
                        SocketProvider.emitEventToRoom(`/tasks/${existTask._id}`, 'taskMessageReport', data.payload);
                        data.log && logger(data.payload);
                        return;
                    }
                    worker.terminate();
                    if (!!data.isError)
                        return rej({ ...processInfo, error: data });
                    res({ ...processInfo, result: data });
                });
                worker.on('error', (msg) => rej({ ...processInfo, error: msg }));
                worker.on('unhandledRejection', (msg) => rej({ ...processInfo, error: msg }));
                worker.on('exit', (code) => {
                    // console.log(`WORKER EXITED!!! => ${code}`)
                    // if ( code === 0 ) res({ ...processInfo, code })
                    if (code === 0)
                        return;
                    rej(new Error(`Worker stopped with exit code ${code}`));
                });
            }
            catch (err) {
                console.error('RunTask fn catch!');
                console.log(err);
                rej(err);
            }
        });
    }
    sleep(ms) {
        return new Promise(res => setTimeout(res, ms));
    }
    cleanTempStaticFolder(task, seconds = 5) {
        setTimeout(() => {
            const staticTaskPath = path.resolve(folders.TEMP, task.id);
            if (!fs.existsSync(staticTaskPath))
                return;
            fs.rmSync(staticTaskPath, { recursive: true, force: true });
        }, seconds * 1000);
    }
    async runNextTask(nextTaskIndex = 0) {
        if (this.queue.length === 0)
            return;
        const nextTask = this.queue.at(nextTaskIndex);
        if (!!!nextTask)
            return;
        if (nextTask.processing)
            return;
        this.log(`\n\nRUNNING TASK ID ==> ${nextTask.id} | ${nextTask.type}`);
        nextTask.processing = true;
        if (nextTask.runOnSeparateThread) {
            await Task.updateOne({ busId: nextTask.id }, {
                $set: {
                    state: TaskState.PROCESSING,
                    startedAt: new Date()
                }
            });
            SocketProvider.emitEventToRoom('/tasks', 'taskUpdate', await Task.findOne({ busId: nextTask.id }).select('-outerData'));
            try {
                const { pId, result } = await this.runTask({
                    taskFile: nextTask.filePath,
                    fnToCall: nextTask.fnToCall,
                    args: nextTask.args,
                    pId: nextTask.id,
                    type: nextTask.type,
                });
                await Task.updateOne({ busId: pId || nextTask.id }, {
                    $set: {
                        state: TaskState.FINISHED,
                        finishedAt: new Date(),
                        outerData: result,
                        microstateStatus: !!!result?.results?.some((x) => !x.status)
                    }
                });
                // this.log(result)
            }
            catch (err) {
                await Task.updateOne({ busId: err.pId || nextTask.id }, {
                    $set: {
                        state: TaskState.ERROR,
                        finishedAt: new Date(),
                        outerData: err.error || err.message,
                        microstateStatus: false
                    }
                });
            }
        }
        else {
            await nextTask.task();
        }
        this.log(`\n\nFINISHED TASK ID ==> ${nextTask.id} | ${nextTask.type}`);
        const dbTask = await Task.findOne({ busId: nextTask.id }).select('-outerData');
        if (!!dbTask) {
            SocketProvider.emitEventToRoom('/tasks', 'taskUpdate', dbTask);
            SocketProvider.emitEventToRoom(`/tasks/${dbTask._id}`, 'taskFinished');
            if (!!dbTask?.eventId) {
                const eventData = { ...dbTask.eventId.toJSON() };
                if (typeof dbTask.eventId !== 'string') {
                    const internDbTask = dbTask.toJSON();
                    delete internDbTask.eventId;
                    eventData.taskId = internDbTask;
                }
                SocketProvider.emitEventToRoom('/events', 'eventUpdate', eventData);
            }
        }
        // this.cleanTempStaticFolder(nextTask, 15)
        this.queue.splice(this.queue.findIndex(t => t.id === nextTask.id), 1);
    }
}
let TaskProvider = new _TaskProvider();
export default TaskProvider;
