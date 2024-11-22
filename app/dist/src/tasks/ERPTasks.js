import { workerData, parentPort, isMainThread, threadId } from 'worker_threads';
import BaseTaskController from './BaseTask.js';
class ERPTasksController extends BaseTaskController {
    countNumbers({ message }) {
        // console.log(message)
        let counter = 0;
        for (let i = 0; i < 20_000_000_000; i++) {
            counter++;
        }
        if (!isMainThread) {
            parentPort?.postMessage(counter);
            return;
        }
        return counter;
    }
    async runTaskAsWorker() {
        try {
            console.log('\nIM THREAD =>', threadId);
            this.listenBroadcast(this);
            const fn = workerData.fn;
            await erpTasksController[fn](workerData.args);
            // setTimeout(process.exit, 100)
            // process.exit()
        }
        catch (err) {
            throw err;
        }
    }
}
const erpTasksController = new ERPTasksController();
// console.log(Object.getOwnPropertyNames(ERPTasksController.prototype))
export default erpTasksController;
if (!isMainThread) {
    console.log('\n\nERP TASKS - NOT MAIN THREAD');
    erpTasksController.runTaskAsWorker();
}
