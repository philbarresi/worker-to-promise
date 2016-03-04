/// <reference path="es6-promise.d.ts" />

interface IEnvelope<T> {
    _w2pMethod: string;
    _w2pId: number;
    payload: T;
}

interface IResponseEnvelope<T> {
    _w2pId: number;
    payload: T;
    status: string;    
}

interface IFinisher {
    resolve: (result: any) => {};
    reject: (error: any) => {};
}

interface Iw2pWorker {
    getWorkerInstance(): Worker;
    postMessage<T>(data: T, transferList: string | any[], methodName: string);
}

declare module 'w2p' {
    var foo: typeof w2p; // Temp variable to reference Promise in local context

    module w2p {
        export var w2p: typeof foo;
        export var Worker: Iw2pWorker;
    }

    export = w2p;
}

interface Window {
    w2p: any;
}

interface WorkerGlobalScope {
    registerTask(taskName: string, callback: (data: any, done: (returnValue) => void) => void);
}
