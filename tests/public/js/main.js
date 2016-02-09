(function () {
    var first = document.querySelector('#number1');
    var second = document.querySelector('#number2');

    var result = document.querySelector('.result');

    if (window.Worker) { 
        // Check if Browser supports the Worker api.
        // Requries script name as input
        var myWorker = new w2p.Worker("js/worker.js");

        // onkeyup could be used instead of onchange if you wanted to update the answer every time
        // an entered value is changed, and you don't want to have to unfocus the field to update its .value

        first.onchange = function () {
            myWorker.postMessage([first.value, second.value], "multiply").then(function (result) {
                console.log(result);
            })
        };

        second.onchange = function () {
            myWorker.postMessage([first.value, second.value], "multiply").then(function (result) {
                console.log(result);
            });
        };
    }
})();