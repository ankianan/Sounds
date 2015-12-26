export var criticalQueue = [];

function checkCriticalQueue() {
    for (var i = 0; i < criticalQueue.length; i++) {
        var task = criticalQueue.shift();
        task();
    }
    setTimeout(checkCriticalQueue, 1000);
}
checkCriticalQueue();
