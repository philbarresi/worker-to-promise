/// <reference path="lib.webworker.d.ts" />
/// <reference path="w2p.d.ts" />

(function(scope: WorkerGlobalScope) {
    var taskDict: { [taskName: string]: (data: any, done: (returnValue: any) => void, error: (message: any) => void) => void } = {},
        noop = function() { },
        oldOnmessage = scope.onmessage || noop;

    // taskName is simple, the task you are registering:
    // the callback takes the following parameters:
    // function callback(data: any, done: function) 
    // when you are finished, you will call done(returnvalue); allowing easy asynchronous values
    scope.registerTask = function(taskName: string, callback: (data: any, done: (returnValue: any) => void, error: (message: any) => void) => void) {
        taskDict[taskName] = callback;
    }

    scope.onmessage = function(event) {
        var asEnvelope = <IEnvelope<any>>event.data;

        if (!asEnvelope || asEnvelope._w2pId === undefined || !asEnvelope._w2pMethod || !taskDict[asEnvelope._w2pMethod]) {
            // route it to the old on message
            oldOnmessage(event);
            return;
        }
        
        // we've got an id to sendback to complete the handshake, and a task. Let's do this!
        try {
            var taskToDo = taskDict[asEnvelope._w2pMethod];

            taskToDo(asEnvelope.payload, (result) => {
                var resultEnv = <IResponseEnvelope<any>>{};
                resultEnv._w2pId = asEnvelope._w2pId;
                resultEnv.status = "success";
                resultEnv.payload = result;
                
                scope.postMessage(resultEnv);
            }, (error) => {
                var resultEnv = <IResponseEnvelope<any>>{};
                resultEnv._w2pId = asEnvelope._w2pId;
                resultEnv.status = "error";
                resultEnv.payload = error;

                scope.postMessage(resultEnv);
            })
        } catch (e) {
            var resultEnv = <IResponseEnvelope<any>>{};
            resultEnv._w2pId = asEnvelope._w2pId;
            resultEnv.status = "error";
            resultEnv.payload = e;

            scope.postMessage(resultEnv);
        }        

        // algorithm: check if our payload has the _w2p info
        // if so, run task; supply task
        
        // if not, send to oldOnmessage (which may result in being tossed out)
        
    }
})(this);

