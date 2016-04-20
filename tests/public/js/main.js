(function () {
    var first = document.getElementById('number1');
    var second = document.getElementById('number2');
    var resultField = document.getElementById("result-number");

    if (window.Worker) { 
        // Check if Browser supports the Worker api.
        // Requries script name as input
        var myWorker = new w2p.Worker("js/worker.js");

        // onkeyup could be used instead of onchange if you wanted to update the answer every time
        // an entered value is changed, and you don't want to have to unfocus the field to update its .value

        first.onchange = function () {
            myWorker.postMessage([parseInt(first.value), parseInt(second.value)], "multiply").then(function (result) {
                resultField.textContent = document.createTextNode(result).textContent;
                console.log(result);
            })
        };

        second.onchange = function () {
            myWorker.postMessage([parseInt(first.value), parseInt(second.value)], "multiply").then(function (result) {
                resultField.textContent = document.createTextNode(result).textContent;
                console.log(result);
            });
        };
    }
})();