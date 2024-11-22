import fs from "fs";
import path from "path";
import { TaskPriority, TaskType, TaskState, } from "../interfaces/TaskInterfaces.js";
import TaskProvider, { TASKFILE_BY_TYPE, TASK_FUNCTION, } from "../providers/TaskProvider.js";
import { Types } from "mongoose";
import { randomUUID } from "crypto";
import { exec } from "child_process";
// Models
import Task from "../models/TaskModel.js";
import Event from "../models/EventModel.js";
// Utils
import folders from "../utils/folders.js";
import SocketProvider from "../providers/SocketProvider.js";
class TaskController {
    async registerTask(task) {
        try {
            const newTask = new Task(task);
            const tempRoute = path.resolve(folders.TEMP, `${task.type}_${newTask._id}.json`);
            if (task.type !== TaskType.ALLOCATE_BILL_ORDER) {
                fs.writeFileSync(tempRoute, JSON.stringify(task.innerData, null, 4), {
                    encoding: "utf-8",
                });
            }
            if (!!!task.busId)
                newTask.busId = randomUUID();
            if (!!!task.filePath)
                newTask.filePath = TASKFILE_BY_TYPE[task.type];
            if (!!!task.fnToCall)
                newTask.fnToCall = TASK_FUNCTION[task.type];
            if (!!task.args) {
                newTask.args.pId = newTask.busId;
                newTask.args.type = newTask.type;
            }
            else {
                newTask.args = {
                    pId: newTask.busId,
                    type: newTask.type,
                };
            }
            newTask.innerData =
                task.type === TaskType.ALLOCATE_BILL_ORDER ? task.innerData : tempRoute;
            await newTask.save();
            if (!!newTask.eventId) {
                await Event.updateOne({ _id: task.eventId }, {
                    $set: {
                        taskId: newTask.id,
                    },
                });
            }
            setTimeout(() => {
                SocketProvider.emitEventToRoom("/tasks", "newTask");
            }, 500);
            return newTask;
        }
        catch (err) {
            console.log(err);
            throw {
                error: true,
                message: err.message,
            };
        }
    }
    async getTaskByUUID(uuid) {
        return await Task.findOne({ busId: uuid });
    }
    // ------------ END UTILS
    async getTasks(req, res) {
        console.log("getTasks: started");
        if (!req.query.page)
            return res
                .status(400)
                .json({ message: "Cannot get tasks without pagination" });
        const page = parseInt(req.query.page);
        const query = req.query.query ? JSON.parse(req.query.query) : {};
        const limit = (req.query.limit && Number(req.query.limit)) || 10;
        const sort = req.query.sort
            ? JSON.parse(req.query.sort)
            : { createdAt: "DESC" };
        const select = {};
        if (!!!req.query.all) {
            select._id = 1;
            select.type = 1;
            select.startedAt = 1;
            select.finishedAt = 1;
            select.updatedAt = 1;
            select.createdAt = 1;
            select.state = 1;
            select.outerData = 1;
            select.scheduleDate = 1;
            select.microstateStatus = 1;
            select.automated = 1;
        }
        if (!!!req.query.events) {
            query.eventId = { $exists: false };
        }
        if (!!req.query.graph) {
            delete select.outerData;
        }
        // if ( Object.keys(query).length > 0 ) {
        //     if ( typeof query.$and !== 'undefined' && Array.isArray(query.$and) ) {
        //         const findableTaskIdFn = (obj: any) => Object.keys(obj).includes('taskId')
        //         const existTaskId = query.$and.find(findableTaskIdFn)
        //         if ( !!existTaskId ) {
        //             const bIdString = existTaskId.taskId.$eq
        //             const indexOfArray = query.$and.findIndex(findableTaskIdFn)
        //             query.$and.splice(
        //                 indexOfArray,
        //                 1,
        //                 ...[
        //                     { _id: Types.ObjectId.createFromHexString(bIdString) }
        //                 ]
        //             )
        //         }
        //     }
        // }
        try {
            let results = await Task.find({}, { outerData: 0 })
                .sort({ createdAt: -1 })
                .skip(0 * 5)
                .limit(5);
            // results.docs.forEach(async x => {
            //     if ( typeof x.microstateStatus === 'undefined' )
            //         await (x as any).validate()
            //     delete x.outerData?.results
            // })
            //   console.log("no errors, results: ", results)
            return res.json(results);
        }
        catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    async getTasksCount(req, res) {
        const query = req.query.query ? JSON.parse(req.query.query) : {};
        try {
            let count = await Task.countDocuments(query);
            return res.json({ count });
        }
        catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    async getTaskById(req, res) {
        const { id } = req.params;
        const { limit = 10, page = 1, resourceId, status } = req.query;
        try {
            const startResults = Number(page) === 1 ? 0 : Number(limit) * (Number(page) - 1);
            const endResults = Number(limit);
            let query = { _id: id };
            let projection = {
                // "outerData.results": { $slice: [startResults, endResults] },
                outerData: 1,
                innerData: 1,
                observations: 1,
                priority: 1,
                type: 1,
            };
            if (!!resourceId) {
                query["outerData.results.erpId"] = {
                    $regex: resourceId,
                    $options: "i",
                };
                // projection = {
                // };
            }
            const task = await Task.findOne(query, projection);
            if (!!!task)
                return res.status(404).json({ message: "Not found" });
            if (!!status) {
                const filterStatusValue = status === "true" ? true : false;
                const statusResults = await Task.aggregate([
                    {
                        $match: {
                            _id: Types.ObjectId.createFromHexString(id),
                        },
                    },
                    {
                        $project: {
                            results: "$outerData.results",
                        },
                    },
                    {
                        $unwind: "$results",
                    },
                    {
                        $match: {
                            "results.status": filterStatusValue,
                        },
                    },
                    {
                        $group: {
                            _id: "$_id",
                            results: { $push: "$results" },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            results: {
                                $slice: ["$results", startResults, endResults],
                            },
                        },
                    },
                ]);
                if (task.outerData?.results && !!statusResults[0])
                    task.outerData.results = statusResults[0].results;
                else
                    return res
                        .status(404)
                        .json({ message: "Not results found with given status" });
            }
            if (typeof task.innerData === "string") {
                if (!fs.existsSync(task.innerData))
                    return res.json(task);
                const innerData = JSON.parse(fs.readFileSync(task.innerData, { encoding: "utf-8" }));
                if ([
                    TaskType.UPDATE_PRICE,
                    TaskType.UPDATE_STOCK,
                    TaskType.CREATE_UPDATE_PRODUCTS,
                ].includes(task.type)) {
                    task.innerData = {
                        resources: innerData?.resources?.filter((x) => 
                        // HOMOLOGATE SOME FN BELOW TO MATCH THE FILTERING OF PRODUCTS TO RETURN TO TASK DETAILS VIEW
                        task.outerData.results?.some((y) => String(y.erpId) === String(x.erpId))),
                    };
                }
                if (task.type === TaskType.ALLOCATE_BILL_ORDER) {
                    task.innerData = innerData;
                }
                // handle this huge MB size
                // return res.json({ ...task.toJSON(), innerData })
            }
            return res.json(task);
        }
        catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    async reRunTask(req, res) {
        const { id } = req.params;
        try {
            if (!!!id)
                return res.status(404).json({ message: "ID not sent" });
            const task = await Task.findById(id);
            if (!!!task)
                return res.status(404).json({ message: "Not found" });
            const taskPayload = TaskProvider.buildTaskPayloadFromDbTask(task);
            TaskProvider.queueTaskInPlace(taskPayload);
            return res.json({ message: "Task queued successfully" });
        }
        catch (err) {
            return res
                .status(500)
                .json({ message: err.message || "Error while re-running task" });
        }
    }
    async getTaskByBusId(busId) {
        try {
            const task = await Task.findOne({ busId });
            return task;
        }
        catch (err) {
            console.log(err);
            return;
        }
    }
    async createTask(req, res) {
        const { type } = req.body;
        try {
            // const config = await AppCfg.findOne()
            // if ( config.mode === AppMode.DISABLED ) {
            //     throw { message: `App is on DISABLED mode, not able to run tasks` }
            // }
            const result = await TaskProvider.add({
                ...req.body,
                fnToCall: TASK_FUNCTION[type],
                filePath: TASKFILE_BY_TYPE[type],
            });
            setTimeout(() => {
                SocketProvider.emitEventToRoom("/tasks", "newTask");
            }, 500);
            return res.json(result);
        }
        catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    async createTaskByType(type, priority = TaskPriority.HIGH) {
        try {
            const now = new Date(); // UTC TIME
            now.setUTCHours(now.getUTCHours() - 4); // REPDOC UTC OFFSET -4
            const repDocHours = now.getUTCHours();
            const isClosed = (repDocHours === 10 && now.getUTCMinutes() < 30) ||
                repDocHours < 10 ||
                (repDocHours === 21 && now.getUTCMinutes() > 30) ||
                repDocHours > 21;
            if (isClosed)
                return true;
            const result = await TaskProvider.add({
                priority,
                type,
                fnToCall: TASK_FUNCTION[type],
                filePath: TASKFILE_BY_TYPE[type],
            });
            return result;
        }
        catch (err) {
            throw err;
        }
    }
    async deleteTask(req, res) {
        const { id } = req.params;
        try {
            const result = await Task.findByIdAndDelete(id);
            if (!!!result)
                return res.status(404).json({ message: "Not found" });
            if (typeof result.innerData === "string" &&
                fs.existsSync(result.innerData)) {
                fs.unlinkSync(result.innerData);
            }
            const existOnBus = TaskProvider.queue.findIndex((x) => x.id === result.busId);
            if (existOnBus !== -1) {
                const busTask = TaskProvider.queue[existOnBus];
                if (!busTask.processing)
                    TaskProvider.queue.splice(existOnBus, 1);
                if (!!busTask.worker)
                    busTask.worker.terminate();
            }
            SocketProvider.emitEventToRoom("/tasks", "deletedTask");
            return res.json(result);
        }
        catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    async flushTasks(req, res) {
        try {
            const result = await Task.collection.drop();
            if (!!!result)
                return res.status(404).json({ message: "Not found" });
            return res.json({
                success: true,
            });
        }
        catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    async getBusInfo(_, res) {
        try {
            return res.json({
                queue: TaskProvider.queue,
                workers: TaskProvider.activeWorkers,
                cronTab: TaskProvider.cronTab,
                hardware: TaskProvider.getHardware(),
            });
        }
        catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    async cleanResults(daysBefore = 15) {
        try {
            const now = new Date();
            now.setDate(now.getDate() - daysBefore);
            // GET TASKS LOWER THAN DATE
            const tasks = await Task.find({
                createdAt: { $lte: now.toISOString() },
                innerData: { $type: "string" },
            }, ["innerData"]);
            tasks.forEach(({ innerData }) => {
                if (typeof innerData !== "string" || !fs.existsSync(innerData))
                    return;
                fs.unlinkSync(innerData);
            });
            // CHECK FOR FILES LEFT ALONE THERE WITH NO LINKED TASK
            let tempJsonFiles = fs.readdirSync(folders.TEMP);
            tempJsonFiles = tempJsonFiles.filter((x) => x.endsWith(".json"));
            for await (let file of tempJsonFiles) {
                const existTask = await Task.findOne({ innerData: { $regex: file } });
                if (!!existTask)
                    return;
                fs.unlinkSync(path.resolve(folders.TEMP, file));
            }
            // GET OLD TASKS TO FLUSH THEIR OUTER DATA RESULT
            const toFlushTasks = await Task.find({
                createdAt: { $lte: now.toISOString() },
            }, ["outerData"]);
            for await (const task of toFlushTasks) {
                try {
                    await task.updateOne({ $set: { outerData: {}, innerData: {} } });
                }
                catch (err) {
                    console.error(err.message);
                }
            }
            return true;
        }
        catch (err) {
            console.error(`ERROR ON CLEAN RESULTS CRON: ${err.message}`);
        }
    }
    async deleteOldTasks(daysBefore = 30) {
        try {
            const now = new Date();
            now.setDate(now.getDate() - daysBefore);
            // GET TASKS LOWER THAN DATE
            const events = await Event.deleteMany({
                createdAt: { $lte: now.toISOString() },
            });
            const tasks = await Task.deleteMany({
                createdAt: { $lte: now.toISOString() },
            });
            console.log(`Deleted ${tasks.deletedCount} tasks`);
            console.log(`Deleted ${events.deletedCount} events`);
            return tasks;
        }
        catch (err) {
            console.error(`ERROR ON CLEAN RESULTS CRON: ${err.message}`);
        }
    }
    async checkScheduledTasks(nowDate) {
        // console.log(nowDate) // ISOSTRING SET BY IANA TIMEZONE
        // console.log((nowDate as any).toISOString?.()) // ISOSTRING SET BY IANA TIMEZONE
        // console.log((nowDate as any).getUTCHours?.()) // ISOSTRING SET BY IANA TIMEZONE
        nowDate = new Date(); // REAL UTC DATE
        // console.log(nowDate.toISOString()) // REAL UTC ISO STRING
        // console.log(nowDate.getUTCHours()) // REAL UTC HOURS
        // nowDate.setMinutes(nowDate.getMinutes() + nowDate.getTimezoneOffset())
        // console.log(nowDate.getTimezoneOffset())
        // console.log(nowDate)
        // console.log(nowDate)
        const tasks = await Task.find({
            $and: [
                { scheduleDate: { $exists: true } },
                { state: { $eq: TaskState.SCHEDULED } },
                { scheduleDate: { $lte: nowDate.toISOString() } },
            ],
        });
        if (!!!tasks.length)
            return;
        const taskPayloads = tasks.map(TaskProvider.buildTaskPayloadFromDbTask);
        taskPayloads.forEach((t) => TaskProvider.queueTaskInPlace(t));
    }
    async checkErrorOrders(nowDate) {
        nowDate = new Date(); // REAL UTC DATE
        nowDate.setDate(nowDate.getDate() - 1); // REAL UTC DATE - 1 DAY
        const tasks = await Task.find({
            $and: [
                { state: { $eq: TaskState.ERROR } },
                { type: { $in: [TaskType.ALLOCATE_BILL_ORDER] } },
                { createdAt: { $gte: nowDate.toISOString() } },
            ],
        });
        if (!!!tasks.length)
            return;
        tasks.forEach(async (task) => {
            const existEnqueuedOrderTask = TaskProvider.queue.find((x) => x.id === task.busId && x.type === task.type);
            if (existEnqueuedOrderTask)
                return task;
            const taskPayload = TaskProvider.buildTaskPayloadFromDbTask(task);
            TaskProvider.queueTaskInPlace(taskPayload);
        });
    }
    async flushPm2Logs() {
        exec("pm2 flush", (error, stdout, stderr) => {
            if (error) {
                console.error(`Error flushing PM2 logs: ${error.message}`);
                return;
            }
            console.log(`PM2 logs flushed successfully.`);
        });
    }
}
let taskController = new TaskController();
export default taskController;
export { TaskController };
