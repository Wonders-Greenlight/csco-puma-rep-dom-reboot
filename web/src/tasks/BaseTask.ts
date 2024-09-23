import { workerData, parentPort, isMainThread, threadId } from 'worker_threads'

interface MessageRunner<T> {
    fn:         keyof T;
    args:       any;
}

class BaseTaskController {
    public listenBroadcast( controller: any ) {
        parentPort.on('message', ({ fn, args }: MessageRunner<typeof controller>) => {
            controller[fn](args)
        })
    }
}

export default BaseTaskController