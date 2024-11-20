import { workerData, parentPort, isMainThread, threadId } from 'worker_threads'
import BaseTaskController from './BaseTask.js';
import { TaskType } from '../interfaces/TaskInterfaces.js';

interface MessageRunner<T> {
    fn:         keyof T;
    args:       any;
}

class ERPTasksController extends BaseTaskController {
    public countNumbers({ message }: { message: string }) {
        // console.log(message)

        let counter = 0;
        for (let i = 0; i < 20_000_000_000; i++) {
            counter++;
        }
        
        if ( !isMainThread ) {
            parentPort?.postMessage(counter)
            return
        }

        return counter
    }

    public async runTaskAsWorker() {
        try {
            console.log('\nIM THREAD =>', threadId)
            this.listenBroadcast(this)

            const fn = workerData.fn as keyof typeof erpTasksController
            await erpTasksController[fn](workerData.args)

            // setTimeout(process.exit, 100)
            // process.exit()
            
        } catch (err) {
            throw err
        }
    }
}

const erpTasksController = new ERPTasksController()

// console.log(Object.getOwnPropertyNames(ERPTasksController.prototype))

export default erpTasksController

if ( !isMainThread ) {
    console.log('\n\nERP TASKS - NOT MAIN THREAD')
    erpTasksController.runTaskAsWorker()
}