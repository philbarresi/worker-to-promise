/// <reference path="w2p.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// ToDo: polyfill Workers
// ToDo: polyfill Promises
(function (w2p) {
    var WorkerShim = (function () {
        function WorkerShim(scriptName, WorkerType) {
            var _this = this;
            this.scriptName = scriptName;
            this.messageId = 0;
            this.messagesInProgress = {};
            this.worker = new WorkerType(scriptName);
            this.worker.onmessage = function (message) {
                // will receive in format: {_w2pId: 0, status: "success|failure", response: []};
                if (message && message.data && (message.data._w2pId !== undefined) && _this.messagesInProgress[message.data._w2pId]) {
                    var asResponse = message.data;
                    var payload = message.data.payload, correspondingFinisher = _this.messagesInProgress[message.data._w2pId];
                    if (message.data.status && message.data.status === "success") {
                        correspondingFinisher.resolve(payload);
                    }
                    else {
                        correspondingFinisher.reject(payload);
                    }
                    delete _this.messagesInProgress[message.data._w2pId];
                }
            };
        }
        WorkerShim.prototype.getWorkerInstance = function () {
            return this.worker;
        };
        WorkerShim.prototype.postMessage = function (data, transferList, methodName) {
            if (typeof transferList === "string" && !methodName) {
                methodName = transferList;
                transferList = undefined;
            }
            return this.send(data, transferList, methodName);
        };
        WorkerShim.prototype.send = function (data, transferList, methodName) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var message = {
                    _w2pMethod: methodName,
                    _w2pId: _this.messageId++,
                    payload: data
                };
                _this.messagesInProgress[message._w2pId] = {
                    resolve: function (result) {
                        resolve(result);
                    },
                    reject: function (error) {
                        reject(error);
                    }
                };
                if (transferList) {
                    _this.worker.postMessage(message, transferList);
                }
                else {
                    _this.worker.postMessage(message);
                }
            });
        };
        return WorkerShim;
    })();
    var DedicatedWorkerShim = (function (_super) {
        __extends(DedicatedWorkerShim, _super);
        function DedicatedWorkerShim(scriptName) {
            _super.call(this, scriptName, Worker);
        }
        return DedicatedWorkerShim;
    })(WorkerShim);
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
