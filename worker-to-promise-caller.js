// ToDo: polyfill Workers
// ToDo: polyfill Promises

(function (w2p) {
    function WorkerShim(scriptName, WorkerType) {
        console.log(arguments);
        if (!scriptName) throw "Invalid number of arguments supplied 1";
        if (!WorkerType) throw "Invalid number of arguments supplied 2";

        this.worker = new WorkerType(scriptName);
        this.messageId = 0;
        this.messagesInProgress = {};

        this.worker.onmessage = function (message) {
            console.log(message);
            console.log(message.data);

            // will receive in format: {_w2pId: 0, status: "success|failure", response: []};
            if (message && message.data && message.data._w2pId && this.messagesInProgress[message.data._w2pId]) {
                var payload = message.data,
                    correspondingFinisher = this.messagesInProgress[message.data._w2pId];

                if (payload.status && payload.status === "success") {
                    correspondingFinisher.resolve.apply(correspondingFinisher, payload.response);
                } else {
                    correspondingFinisher.reject.apply(correspondingFinisher, payload.response);
                }

                delete this.messagesInProgress[message.data._w2pId];
            }
        };
    }

    WorkerShim.prototype.getWorkerInstance = function () {
        return this.worker;
    }

    WorkerShim.prototype.send = function (data, transferList, methodName) {
        var self = this;

        return new Promise(function (resolve, reject) {
            // will send objects in format: {_w2p: "", _w2pId: 0, data: any}
            var payload = {
                _w2p: methodName,
                _w2pId: this.messageId++,
                data: data
            };

            self.messagesInProgress[payload._w2pId] = {
                resolve: function () {
                    resolve(arguments);
                },
                reject: function () {
                    reject(arguments);
                }
            };

            if (transferList) {
                self.worker.postMessage(payload, transferList);
            } else {
                self.worker.postMessage(payload);
            }
        });
    }

    WorkerShim.prototype.postMessage = function (data, transferList, methodName) {
        if (typeof transferList === "string" && !methodName) {
            methodName = transferList;
            transferList = undefined;
        }

        return this.send(data, transferList, methodName);
    }

    function DedicatedWorker(scriptName) {
        WorkerShim.call(this, scriptName, Worker);
    }

    DedicatedWorker.prototype = Object.create(WorkerShim.prototype);

    function SharedWorker(scriptName) {
        WorkerShim.call(this, scriptName, SharedWorker);
    }

    SharedWorker.prototype = Object.create(WorkerShim.prototype);

    // Export Worker (DedicatedWorker), SharedWorker
    w2p.Worker = DedicatedWorker;
    w2p.SharedWorker = SharedWorker;

})(window.w2p = {});

