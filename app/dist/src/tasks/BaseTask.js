import { parentPort } from 'worker_threads';
class BaseTaskController {
    listenBroadcast(controller) {
        parentPort.on('message', ({ fn, args }) => {
            controller[fn](args);
        });
    }
}
export default BaseTaskController;
