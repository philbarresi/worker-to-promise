/// <reference path="w2p.d.ts" />

// ToDo: polyfill Workers
// ToDo: polyfill Promises

(function(w2p) {
    class WorkerShim implements Iw2pWorker {
        private worker: Worker;
        private messageId: number = 0;
        private messagesInProgress: { [key: number]: IFinisher } = {};

        public getWorkerInstance(): Worker {
            return this.worker;
        }

        public postMessage<T>(data: T, transferList: string | any[], methodName: string): Promise<any> {
            if (typeof transferList === "string" && !methodName) {
                methodName = <string>transferList;
                transferList = undefined;
            }

            return this.send(data, transferList, methodName);
        }

        private send<T>(data: T, transferList: string | any[], methodName: string): Promise<any> {
            return new Promise((resolve, reject) => {
                var message: IEnvelope<T> = {
                    _w2pMethod: methodName,
                    _w2pId: this.messageId++,
                    payload: data
                };

                this.messagesInProgress[message._w2pId] = <IFinisher>{
                    resolve: function(result) {
                        resolve(result);
                    },
                    reject: function(error) {
                        reject(error);
                    }
                };

                if (transferList) {
                    this.worker.postMessage(message, transferList);
                } else {
                    this.worker.postMessage(message);
                }
            });
        }

        constructor(private scriptName: string, WorkerType: new (stringUrl: string) => Worker) {
            this.worker = new WorkerType(scriptName);

            this.worker.onmessage = (message: IResponseEnvelope<any> | any) => {
                // will receive in format: {_w2pId: 0, status: "success|failure", response: []};
                
                if (message && message.data && (message.data._w2pId !== undefined) && this.messagesInProgress[message.data._w2pId]) {
                    var asResponse = <IResponseEnvelope<any>>message.data;

                    var payload = message.data.payload,
                        correspondingFinisher = this.messagesInProgress[message.data._w2pId];

                    if (message.data.status && message.data.status === "success") {
                        correspondingFinisher.resolve(payload);
                    } else {
                        correspondingFinisher.reject(payload);
                    }

                    delete this.messagesInProgress[message.data._w2pId];
                }
            };
        }
    }

    class DedicatedWorkerShim extends WorkerShim {
        constructor(scriptName: string) {
            super(scriptName, Worker);
        }
    }

    /*
        class SharedWorkerShim extends WorkerShim {
            constructor(scriptName: string) {
                super(scriptName, SharedWorker);
            }
        }
    */
  
    // Export Worker (DedicatedWorker), SharedWorker
    w2p.Worker = DedicatedWorkerShim;
    //    w2p.SharedWorker = SharedWorkerShim;

})(window.w2p = {});

