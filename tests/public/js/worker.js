// We can setup a single default onmessage that will occur if no tasks have been registered
this.onmessage = function (e) {
    console.log('Message received from main script that did not match any tasks');
    console.log(e);
    var workerResult = 'Result: ' + (e.data.payload[0] * e.data.payload[1]);
    console.log('Posting message back to main script');
    this.postMessage(workerResult);
};

self.importScripts('/js/w2p/worker-to-promise-dedicated-worker.js');
// Now we can register our tasks

this.registerTask("multiply", function (data, success, err) {
    success(data[0] * data[1]);
});
