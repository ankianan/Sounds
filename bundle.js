(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _user = require("./peer/user/user.js");

var _superUser = require("./peer/superUser/superUser.js");

window.createSuperUser = _superUser.createSuperUser;

window.registerUser = function (form) {
    var userMetadata = {
        "name": form.elements.name.value,
        "type": form.elements.type.value
    };
    (0, _user.createUser)(userMetadata);
};

},{"./peer/superUser/superUser.js":7,"./peer/user/user.js":11}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var superUserDetails = exports.superUserDetails = {
    name: "superUser1"
};
var peerConfigOptions = exports.peerConfigOptions = {
    //key: 'h3p0lmdszguv7vi'
    key: '45x1mf8qyx7833di'

};

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var REQUEST = exports.REQUEST = {
    TYPE: {
        GET: {
            "NEARUSER": "1" // 1-99
        },
        POST: {
            "REGISTER": "100" // 100-199
        }

    }
};

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var criticalQueue = exports.criticalQueue = [];

function checkCriticalQueue() {
    for (var i = 0; i < criticalQueue.length; i++) {
        var task = criticalQueue.shift();
        task();
    }
    setTimeout(checkCriticalQueue, 1000);
}
checkCriticalQueue();

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getNearbyBnodeIds = getNearbyBnodeIds;
exports.addToBnodeList = addToBnodeList;
//This will be indexedDB implementation

//nodes sorted based on their distance from 0,0,0
var bnodeList = [

    /*{
        __proto__ : {
            coods: {
                x: Number,
                y: Number,
                z: Number
            }
        },        
        peer: Number
        connection: Object
    }*/

];

//Orignal formular is root of sum of square of differences
function distance(coords1, coords2) {
    var sum = 0;
    sum += coords1.x - coords2.x;
    sum += coords1.y - coords2.y;
    sum += coords1.z - coords2.z;
    return sum;
}

function createNewBnode(conn) {
    var newNode = Object.create(conn.metadata);
    newNode.id = conn.peer;
    newNode.connection = {};
    return newNode;
}

function getNearbyBnodeIds(lMetadata) {
    return bnodeList.map(function (bnode) {
        return {
            id: bnode.id,
            distance: distance(bnode.coords, lMetadata.coords)
        };
    }).sort(function (a, b) {
        return a.distance - b.distance;
    });
}

//Add node to sorted bnodeList
function addToBnodeList(conn) {
    var bnode = createNewBnode(conn);
    bnodeList.push(bnode);
}

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.makeResponse = makeResponse;

var _requestType = require("../requestType.js");

var _nodeListManager_simple = require("./nodeListManager_simple.js");

function makeResponse(type, conn) {
    var result = null;
    if (type == _requestType.REQUEST.TYPE.GET.NEARUSER) {
        result = (0, _nodeListManager_simple.getNearbyBnodeIds)(conn.metadata);
    } else if (type == _requestType.REQUEST.TYPE.POST.REGISTER) {
        result = true;
    }

    console.log(result);

    conn.send({
        "type": type,
        "result": result
    });
}

},{"../requestType.js":3,"./nodeListManager_simple.js":5}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createSuperUser = createSuperUser;

var _requestType = require("../requestType.js");

var _config = require("../config.js");

var _criticalQueueManager = require("./criticalQueueManager.js");

var _nodeListManager_simple = require("./nodeListManager_simple.js");

var _responseManager = require("./responseManager.js");

function listen(peer) {
    peer.on('connection', function (conn) {
        conn.on('open', function () {
            _criticalQueueManager.criticalQueue.push(function () {
                if (conn.metadata.type == "broadcaster") {
                    (0, _nodeListManager_simple.addToBnodeList)(conn);
                    (0, _responseManager.makeResponse)(_requestType.REQUEST.TYPE.POST.REGISTER, conn);
                } else {
                    (0, _responseManager.makeResponse)(_requestType.REQUEST.TYPE.GET.NEARUSER, conn);
                }
            });
        });
    });
}

function createSuperUser() {
    var peer;

    peer = new Peer(_config.superUserDetails.name, _config.peerConfigOptions);
    listen(peer);

    return peer;
}

},{"../config.js":2,"../requestType.js":3,"./criticalQueueManager.js":4,"./nodeListManager_simple.js":5,"./responseManager.js":6}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.onCallByBnode = onCallByBnode;
exports.callLnode = callLnode;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function onCallByBnode(peer) {
    console.log(peer);
    peer.on('call', function (call) {
        /*getUserMedia.call(window.navigator, {
            video: true,
            audio: true
        }, 
        function(stream) {*/
        call.answer(); // Answer the call with an A/V stream.
        call.on('stream', function (remoteStream) {
            var video = document.querySelector('video');
            video.src = window.URL.createObjectURL(remoteStream);
            video.onloadedmetadata = function (e) {
                video.play();
            };
        });
        /*}
        , function(err) {
                    console.log('Failed to get local stream', err);
                });*/
    });
}

function callLnode(lNodeId, peer) {
    getUserMedia.call(window.navigator, {
        video: true,
        audio: true
    }, function (stream) {
        var call = peer.call(lNodeId, stream);
        /*call.on('stream', function(remoteStream) {
            // Show stream in some video/canvas element.
            console.log(stream);
          });*/
    }, function (err) {
        console.log('Failed to get local stream', err);
    });
}

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getCurrentPosition = getCurrentPosition;
function latLongToECEF(coords) {
    var cosLat = Math.cos(coords.latitude * Math.PI / 180.0);
    var sinLat = Math.sin(coords.latitude * Math.PI / 180.0);
    var cosLon = Math.cos(coords.longitude * Math.PI / 180.0);
    var sinLon = Math.sin(coords.longitude * Math.PI / 180.0);
    var rad = 6378137.0;
    var f = 1.0 / 298.257224;
    var C = 1.0 / Math.sqrt(cosLat * cosLat + (1 - f) * (1 - f) * sinLat * sinLat);
    var S = (1.0 - f) * (1.0 - f) * C;
    var h = 0.0;
    var x = (rad * C + h) * cosLat * cosLon;
    var y = (rad * C + h) * cosLat * sinLon;
    var z = (rad * S + h) * sinLat;

    return {
        x: parseInt(x / 1000),
        y: parseInt(y / 1000),
        z: parseInt(z / 1000)
    };
}

function getCurrentPosition(callback) {
    navigator.geolocation.getCurrentPosition(function (position) {
        var ECEFCoords = latLongToECEF(position.coords);
        callback(ECEFCoords);
    });
}

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.renderResponse = renderResponse;
exports.makeRequest = makeRequest;

var _user = require("./user.js");

var _requestType = require("../requestType.js");

function renderResponse(data, peer, metadata) {
    var nearbyUserId;
    if (data.type == _requestType.REQUEST.TYPE.GET.NEARUSER) {
        nearbyUserId = data.result[0].id;
        (0, _user.connectToBnode)(nearbyUserId, peer, metadata);

        /*data.result.map(function(nearbyUserId) {
            connectToBnode(nearbyUserId, peer, metadata)
        })*/
    }
}

function makeRequest(type, peer) {
    peer.connection[superUserDetails.name][0].send({
        type: type
    });
}

},{"../requestType.js":3,"./user.js":11}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.connectToBnode = connectToBnode;
exports.createUser = createUser;

var _geoLocationManager = require("./geoLocationManager.js");

var _config = require("../config.js");

var _requesManager = require("./requesManager.js");

var _audioStreamManager = require("./audioStreamManager.js");

function connectToBnode(nearbyBnodeId, peer, metadata) {
    var conn = peer.connect(nearbyBnodeId, {
        "metadata": metadata
    });
}

function onConnectingBnode(peer, metadata) {
    peer.on('connection', function (conn) {
        console.log("bnode", metadata.name, "connected lnode", conn.metadata.name);
        (0, _audioStreamManager.callLnode)(conn.peer, peer);
    });
}

function connectToSuperUser(peer, metadata) {
    var conn = peer.connect(_config.superUserDetails.name, {
        "metadata": metadata
    });

    conn.on('data', function (data) {
        (0, _requesManager.renderResponse)(data, peer, metadata);
        conn.close();
    });
}

function createUser(metadata) {
    var peer, conn;

    peer = new Peer(_config.peerConfigOptions);

    if (metadata.type == "broadcaster") {
        onConnectingBnode(peer, metadata);
        //onCallingBnode(peer, metadata);
    } else {
            (0, _audioStreamManager.onCallByBnode)(peer);
        }

    (0, _geoLocationManager.getCurrentPosition)(function (coords) {
        metadata.coords = coords;
        connectToSuperUser(peer, metadata);
    });

    return peer;
}

},{"../config.js":2,"./audioStreamManager.js":8,"./geoLocationManager.js":9,"./requesManager.js":10}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnRcXGFwcC5qcyIsImNsaWVudFxccGVlclxcY29uZmlnLmpzIiwiY2xpZW50XFxwZWVyXFxyZXF1ZXN0VHlwZS5qcyIsImNsaWVudFxccGVlclxcc3VwZXJVc2VyXFxjcml0aWNhbFF1ZXVlTWFuYWdlci5qcyIsImNsaWVudFxccGVlclxcc3VwZXJVc2VyXFxub2RlTGlzdE1hbmFnZXJfc2ltcGxlLmpzIiwiY2xpZW50XFxwZWVyXFxzdXBlclVzZXJcXHJlc3BvbnNlTWFuYWdlci5qcyIsImNsaWVudFxccGVlclxcc3VwZXJVc2VyXFxzdXBlclVzZXIuanMiLCJjbGllbnRcXHBlZXJcXHVzZXJcXGF1ZGlvU3RyZWFtTWFuYWdlci5qcyIsImNsaWVudFxccGVlclxcdXNlclxcZ2VvTG9jYXRpb25NYW5hZ2VyLmpzIiwiY2xpZW50XFxwZWVyXFx1c2VyXFxyZXF1ZXNNYW5hZ2VyLmpzIiwiY2xpZW50XFxwZWVyXFx1c2VyXFx1c2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDVUEsTUFBTSxDQUFDLGVBQWUsY0FKbEIsZUFBZSxBQUlxQixDQUFDOztBQUV6QyxNQUFNLENBQUMsWUFBWSxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQ2pDLFFBQUksWUFBWSxHQUFHO0FBQ2YsY0FBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUs7QUFDaEMsY0FBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUs7S0FDbkMsQ0FBQztBQUNGLGNBaEJBLFVBQVUsRUFnQkMsWUFBWSxDQUFDLENBQUE7Q0FDM0IsQ0FBQzs7Ozs7Ozs7QUNsQkssSUFBSSxnQkFBZ0IsV0FBaEIsZ0JBQWdCLEdBQUc7QUFDMUIsUUFBSSxFQUFFLFlBQVk7Q0FDckIsQ0FBQztBQUNLLElBQUksaUJBQWlC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LENBQUMsQ0FBQztDQUVOOztBQUdNLFNBQVMsVUFBVSxDQUFDLFFBQVEsRUFBRTtBQUNqQyxRQUFJLElBQUksRUFBRSxJQUFJLENBQUM7O0FBRWYsUUFBSSxHQUFHLElBQUksSUFBSSxTQTVDZixpQkFBaUIsQ0E0Q2lCLENBQUM7O0FBRW5DLFFBQUksUUFBUSxDQUFDLElBQUksSUFBSSxhQUFhLEVBQUU7QUFDaEMseUJBQWlCLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQzs7QUFBQyxLQUVyQyxNQUFNO0FBQ0gsb0NBMUNKLGFBQWEsRUEwQ0ssSUFBSSxDQUFDLENBQUM7U0FDdkI7O0FBRUQsNEJBekRBLGtCQUFrQixFQXlEQyxVQUFTLE1BQU0sRUFBRTtBQUNoQyxnQkFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDekIsMEJBQWtCLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ3RDLENBQUMsQ0FBQzs7QUFFSCxXQUFPLElBQUksQ0FBQztDQUVmIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7XHJcbiAgICBjcmVhdGVVc2VyLCBxdWVyeVN1cGVyVXNlclxyXG59XHJcbmZyb20gXCIuL3BlZXIvdXNlci91c2VyLmpzXCI7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgY3JlYXRlU3VwZXJVc2VyXHJcbn1cclxuZnJvbSBcIi4vcGVlci9zdXBlclVzZXIvc3VwZXJVc2VyLmpzXCI7XHJcblxyXG53aW5kb3cuY3JlYXRlU3VwZXJVc2VyID0gY3JlYXRlU3VwZXJVc2VyO1xyXG5cclxud2luZG93LnJlZ2lzdGVyVXNlciA9IGZ1bmN0aW9uKGZvcm0pIHtcclxuICAgIHZhciB1c2VyTWV0YWRhdGEgPSB7XHJcbiAgICAgICAgXCJuYW1lXCI6IGZvcm0uZWxlbWVudHMubmFtZS52YWx1ZSxcclxuICAgICAgICBcInR5cGVcIjogZm9ybS5lbGVtZW50cy50eXBlLnZhbHVlLFxyXG4gICAgfTtcclxuICAgIGNyZWF0ZVVzZXIodXNlck1ldGFkYXRhKVxyXG59O1xyXG4iLCJleHBvcnQgdmFyIHN1cGVyVXNlckRldGFpbHMgPSB7XHJcbiAgICBuYW1lOiBcInN1cGVyVXNlcjFcIlxyXG59O1xyXG5leHBvcnQgdmFyIHBlZXJDb25maWdPcHRpb25zID0ge1xyXG4gICAgLy9rZXk6ICdoM3AwbG1kc3pndXY3dmknXHJcbiAgICBrZXkgOiAnNDV4MW1mOHF5eDc4MzNkaSdcclxuXHJcbn07XHJcbiIsImV4cG9ydCB2YXIgUkVRVUVTVCA9IHtcclxuICAgIFRZUEU6IHtcclxuICAgICAgICBHRVQ6IHtcclxuICAgICAgICAgICAgXCJORUFSVVNFUlwiOiBcIjFcIiAvLyAxLTk5IFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgUE9TVDoge1xyXG4gICAgICAgICAgICBcIlJFR0lTVEVSXCI6IFwiMTAwXCIgLy8gMTAwLTE5OVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn1cclxuIiwiZXhwb3J0IHZhciBjcml0aWNhbFF1ZXVlID0gW107XHJcblxyXG5mdW5jdGlvbiBjaGVja0NyaXRpY2FsUXVldWUoKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNyaXRpY2FsUXVldWUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgdGFzayA9IGNyaXRpY2FsUXVldWUuc2hpZnQoKTtcclxuICAgICAgICB0YXNrKCk7XHJcbiAgICB9XHJcbiAgICBzZXRUaW1lb3V0KGNoZWNrQ3JpdGljYWxRdWV1ZSwgMTAwMCk7XHJcbn1cclxuY2hlY2tDcml0aWNhbFF1ZXVlKCk7XHJcbiIsIi8vVGhpcyB3aWxsIGJlIGluZGV4ZWREQiBpbXBsZW1lbnRhdGlvblxyXG5cclxuXHJcblxyXG4vL25vZGVzIHNvcnRlZCBiYXNlZCBvbiB0aGVpciBkaXN0YW5jZSBmcm9tIDAsMCwwXHJcbnZhciBibm9kZUxpc3QgPSBbXHJcblxyXG4gICAgLyp7XHJcbiAgICAgICAgX19wcm90b19fIDoge1xyXG4gICAgICAgICAgICBjb29kczoge1xyXG4gICAgICAgICAgICAgICAgeDogTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgeTogTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgejogTnVtYmVyXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAgICAgICAgXHJcbiAgICAgICAgcGVlcjogTnVtYmVyXHJcbiAgICAgICAgY29ubmVjdGlvbjogT2JqZWN0XHJcbiAgICB9Ki9cclxuXHJcbl07XHJcblxyXG5cclxuLy9PcmlnbmFsIGZvcm11bGFyIGlzIHJvb3Qgb2Ygc3VtIG9mIHNxdWFyZSBvZiBkaWZmZXJlbmNlc1xyXG5mdW5jdGlvbiBkaXN0YW5jZShjb29yZHMxLCBjb29yZHMyKSB7XHJcbiAgICB2YXIgc3VtID0gMDtcclxuICAgIHN1bSArPSBjb29yZHMxLnggLSBjb29yZHMyLng7XHJcbiAgICBzdW0gKz0gY29vcmRzMS55IC0gY29vcmRzMi55O1xyXG4gICAgc3VtICs9IGNvb3JkczEueiAtIGNvb3JkczIuejtcclxuICAgIHJldHVybiBzdW07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZU5ld0Jub2RlKGNvbm4pIHtcclxuICAgIHZhciBuZXdOb2RlID0gT2JqZWN0LmNyZWF0ZShjb25uLm1ldGFkYXRhKTtcclxuICAgIG5ld05vZGUuaWQgPSBjb25uLnBlZXI7XHJcbiAgICBuZXdOb2RlLmNvbm5lY3Rpb24gPSB7fTtcclxuICAgIHJldHVybiBuZXdOb2RlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmVhcmJ5Qm5vZGVJZHMobE1ldGFkYXRhKSB7XHJcbiAgICByZXR1cm4gYm5vZGVMaXN0Lm1hcChmdW5jdGlvbihibm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGJub2RlLmlkLFxyXG4gICAgICAgICAgICAgICAgZGlzdGFuY2U6IGRpc3RhbmNlKGJub2RlLmNvb3JkcywgbE1ldGFkYXRhLmNvb3JkcylcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEuZGlzdGFuY2UgLSBiLmRpc3RhbmNlO1xyXG4gICAgICAgIH0pO1xyXG59XHJcblxyXG4vL0FkZCBub2RlIHRvIHNvcnRlZCBibm9kZUxpc3RcclxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRvQm5vZGVMaXN0KGNvbm4pIHtcclxuICAgIHZhciBibm9kZSA9IGNyZWF0ZU5ld0Jub2RlKGNvbm4pO1xyXG4gICAgYm5vZGVMaXN0LnB1c2goYm5vZGUpO1xyXG5cclxufVxyXG4iLCJpbXBvcnQge1xyXG4gICAgUkVRVUVTVFxyXG59XHJcbmZyb20gXCIuLi9yZXF1ZXN0VHlwZS5qc1wiO1xyXG5pbXBvcnQge1xyXG4gICAgZ2V0TmVhcmJ5Qm5vZGVJZHNcclxufVxyXG5mcm9tIFwiLi9ub2RlTGlzdE1hbmFnZXJfc2ltcGxlLmpzXCI7XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VSZXNwb25zZSh0eXBlLCBjb25uKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gbnVsbDtcclxuICAgIGlmICh0eXBlID09IFJFUVVFU1QuVFlQRS5HRVQuTkVBUlVTRVIpIHtcclxuICAgICAgICByZXN1bHQgPSBnZXROZWFyYnlCbm9kZUlkcyhjb25uLm1ldGFkYXRhKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBSRVFVRVNULlRZUEUuUE9TVC5SRUdJU1RFUikge1xyXG4gICAgICAgIHJlc3VsdCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2cocmVzdWx0KTtcclxuXHJcbiAgICBjb25uLnNlbmQoe1xyXG4gICAgICAgIFwidHlwZVwiOiB0eXBlLFxyXG4gICAgICAgIFwicmVzdWx0XCI6IHJlc3VsdFxyXG4gICAgfSk7XHJcblxyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgICBSRVFVRVNUXHJcbn1cclxuZnJvbSBcIi4uL3JlcXVlc3RUeXBlLmpzXCI7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgcGVlckNvbmZpZ09wdGlvbnMsIHN1cGVyVXNlckRldGFpbHNcclxufVxyXG5mcm9tIFwiLi4vY29uZmlnLmpzXCI7XHJcbmltcG9ydCB7XHJcbiAgICBjcml0aWNhbFF1ZXVlXHJcbn1cclxuZnJvbSBcIi4vY3JpdGljYWxRdWV1ZU1hbmFnZXIuanNcIjtcclxuaW1wb3J0IHtcclxuICAgIGFkZFRvQm5vZGVMaXN0XHJcbn1cclxuZnJvbSBcIi4vbm9kZUxpc3RNYW5hZ2VyX3NpbXBsZS5qc1wiO1xyXG5pbXBvcnQge1xyXG4gICAgbWFrZVJlc3BvbnNlXHJcbn1cclxuZnJvbSBcIi4vcmVzcG9uc2VNYW5hZ2VyLmpzXCI7XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGxpc3RlbihwZWVyKSB7XHJcbiAgICBwZWVyLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24oY29ubikge1xyXG4gICAgICAgIGNvbm4ub24oJ29wZW4nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY3JpdGljYWxRdWV1ZS5wdXNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbm4ubWV0YWRhdGEudHlwZSA9PSBcImJyb2FkY2FzdGVyXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBhZGRUb0Jub2RlTGlzdChjb25uKTtcclxuICAgICAgICAgICAgICAgICAgICBtYWtlUmVzcG9uc2UoUkVRVUVTVC5UWVBFLlBPU1QuUkVHSVNURVIsIGNvbm4pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBtYWtlUmVzcG9uc2UoUkVRVUVTVC5UWVBFLkdFVC5ORUFSVVNFUiwgY29ubik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdXBlclVzZXIoKSB7XHJcbiAgICB2YXIgcGVlcjtcclxuXHJcbiAgICBwZWVyID0gbmV3IFBlZXIoc3VwZXJVc2VyRGV0YWlscy5uYW1lLCBwZWVyQ29uZmlnT3B0aW9ucyk7XHJcbiAgICBsaXN0ZW4ocGVlcik7XHJcblxyXG4gICAgcmV0dXJuIHBlZXI7XHJcbn1cclxuIiwidmFyIGdldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG9uQ2FsbEJ5Qm5vZGUocGVlcikge1xyXG4gICAgY29uc29sZS5sb2cocGVlcik7XHJcbiAgICBwZWVyLm9uKCdjYWxsJywgZnVuY3Rpb24oY2FsbCkge1xyXG4gICAgICAgIC8qZ2V0VXNlck1lZGlhLmNhbGwod2luZG93Lm5hdmlnYXRvciwge1xyXG4gICAgICAgICAgICB2aWRlbzogdHJ1ZSxcclxuICAgICAgICAgICAgYXVkaW86IHRydWVcclxuICAgICAgICB9LCBcclxuICAgICAgICBmdW5jdGlvbihzdHJlYW0pIHsqL1xyXG4gICAgICAgIGNhbGwuYW5zd2VyKCk7IC8vIEFuc3dlciB0aGUgY2FsbCB3aXRoIGFuIEEvViBzdHJlYW0uXHJcbiAgICAgICAgY2FsbC5vbignc3RyZWFtJywgZnVuY3Rpb24ocmVtb3RlU3RyZWFtKSB7XHJcbiAgICAgICAgICAgIHZhciB2aWRlbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3ZpZGVvJyk7XHJcbiAgICAgICAgICAgIHZpZGVvLnNyYyA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKHJlbW90ZVN0cmVhbSk7XHJcbiAgICAgICAgICAgIHZpZGVvLm9ubG9hZGVkbWV0YWRhdGEgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB2aWRlby5wbGF5KCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLyp9XHJcbiAgICAgICAgLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRmFpbGVkIHRvIGdldCBsb2NhbCBzdHJlYW0nLCBlcnIpO1xyXG4gICAgICAgICAgICAgICAgfSk7Ki9cclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2FsbExub2RlKGxOb2RlSWQsIHBlZXIpIHtcclxuICAgIGdldFVzZXJNZWRpYS5jYWxsKHdpbmRvdy5uYXZpZ2F0b3IsIHtcclxuICAgICAgICAgICAgdmlkZW86IHRydWUsXHJcbiAgICAgICAgICAgIGF1ZGlvOiB0cnVlXHJcbiAgICAgICAgfSwgZnVuY3Rpb24oc3RyZWFtKSB7XHJcbiAgICAgICAgICAgIHZhciBjYWxsID0gcGVlci5jYWxsKGxOb2RlSWQsIHN0cmVhbSk7XHJcbiAgICAgICAgICAgIC8qY2FsbC5vbignc3RyZWFtJywgZnVuY3Rpb24ocmVtb3RlU3RyZWFtKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTaG93IHN0cmVhbSBpbiBzb21lIHZpZGVvL2NhbnZhcyBlbGVtZW50LlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coc3RyZWFtKTtcclxuXHJcbiAgICAgICAgICAgIH0pOyovXHJcbiAgICAgICAgfSxcclxuICAgICAgICBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0ZhaWxlZCB0byBnZXQgbG9jYWwgc3RyZWFtJywgZXJyKTtcclxuICAgICAgICB9KTtcclxufVxyXG4iLCJmdW5jdGlvbiBsYXRMb25nVG9FQ0VGKGNvb3Jkcykge1xyXG4gICAgdmFyIGNvc0xhdCA9IE1hdGguY29zKGNvb3Jkcy5sYXRpdHVkZSAqIE1hdGguUEkgLyAxODAuMCk7XHJcbiAgICB2YXIgc2luTGF0ID0gTWF0aC5zaW4oY29vcmRzLmxhdGl0dWRlICogTWF0aC5QSSAvIDE4MC4wKTtcclxuICAgIHZhciBjb3NMb24gPSBNYXRoLmNvcyhjb29yZHMubG9uZ2l0dWRlICogTWF0aC5QSSAvIDE4MC4wKTtcclxuICAgIHZhciBzaW5Mb24gPSBNYXRoLnNpbihjb29yZHMubG9uZ2l0dWRlICogTWF0aC5QSSAvIDE4MC4wKTtcclxuICAgIHZhciByYWQgPSA2Mzc4MTM3LjA7XHJcbiAgICB2YXIgZiA9IDEuMCAvIDI5OC4yNTcyMjQ7XHJcbiAgICB2YXIgQyA9IDEuMCAvIE1hdGguc3FydChjb3NMYXQgKiBjb3NMYXQgKyAoMSAtIGYpICogKDEgLSBmKSAqIHNpbkxhdCAqIHNpbkxhdCk7XHJcbiAgICB2YXIgUyA9ICgxLjAgLSBmKSAqICgxLjAgLSBmKSAqIEM7XHJcbiAgICB2YXIgaCA9IDAuMDtcclxuICAgIHZhciB4ID0gKHJhZCAqIEMgKyBoKSAqIGNvc0xhdCAqIGNvc0xvbjtcclxuICAgIHZhciB5ID0gKHJhZCAqIEMgKyBoKSAqIGNvc0xhdCAqIHNpbkxvbjtcclxuICAgIHZhciB6ID0gKHJhZCAqIFMgKyBoKSAqIHNpbkxhdDtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IHBhcnNlSW50KHggLyAxMDAwKSxcclxuICAgICAgICB5OiBwYXJzZUludCh5IC8gMTAwMCksXHJcbiAgICAgICAgejogcGFyc2VJbnQoeiAvIDEwMDApXHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnRQb3NpdGlvbihjYWxsYmFjaykge1xyXG4gICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbihwb3NpdGlvbikge1xyXG4gICAgICAgIHZhciBFQ0VGQ29vcmRzID0gbGF0TG9uZ1RvRUNFRihwb3NpdGlvbi5jb29yZHMpICAgICAgICBcclxuICAgICAgICBjYWxsYmFjayhFQ0VGQ29vcmRzKTtcclxuICAgIH0pO1xyXG59XHJcbiIsImltcG9ydHtcclxuXHRjb25uZWN0VG9Cbm9kZVxyXG59XHJcbmZyb20gXCIuL3VzZXIuanNcIlxyXG5pbXBvcnQge1xyXG4gICAgUkVRVUVTVFxyXG59XHJcbmZyb20gXCIuLi9yZXF1ZXN0VHlwZS5qc1wiO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclJlc3BvbnNlKGRhdGEsIHBlZXIsIG1ldGFkYXRhKSB7XHJcblx0dmFyIG5lYXJieVVzZXJJZDtcclxuICAgIGlmIChkYXRhLnR5cGUgPT0gUkVRVUVTVC5UWVBFLkdFVC5ORUFSVVNFUikge1xyXG4gICAgXHRuZWFyYnlVc2VySWQgPSBkYXRhLnJlc3VsdFswXS5pZDtcclxuICAgIFx0Y29ubmVjdFRvQm5vZGUobmVhcmJ5VXNlcklkLCBwZWVyLCBtZXRhZGF0YSk7XHJcbiAgICBcdFxyXG4gICAgICAgIC8qZGF0YS5yZXN1bHQubWFwKGZ1bmN0aW9uKG5lYXJieVVzZXJJZCkge1xyXG4gICAgICAgICAgICBjb25uZWN0VG9Cbm9kZShuZWFyYnlVc2VySWQsIHBlZXIsIG1ldGFkYXRhKVxyXG4gICAgICAgIH0pKi9cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VSZXF1ZXN0KHR5cGUsIHBlZXIpIHtcclxuICAgIHBlZXIuY29ubmVjdGlvbltzdXBlclVzZXJEZXRhaWxzLm5hbWVdWzBdLnNlbmQoe1xyXG4gICAgICAgIHR5cGU6IHR5cGVcclxuICAgIH0pO1xyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgICBnZXRDdXJyZW50UG9zaXRpb25cclxufVxyXG5mcm9tIFwiLi9nZW9Mb2NhdGlvbk1hbmFnZXIuanNcIjtcclxuaW1wb3J0IHtcclxuICAgIHBlZXJDb25maWdPcHRpb25zLCBzdXBlclVzZXJEZXRhaWxzXHJcbn1cclxuZnJvbSBcIi4uL2NvbmZpZy5qc1wiO1xyXG5pbXBvcnQge1xyXG4gICAgcmVuZGVyUmVzcG9uc2VcclxufVxyXG5mcm9tICcuL3JlcXVlc01hbmFnZXIuanMnO1xyXG5pbXBvcnQge1xyXG4gICAgb25DYWxsQnlCbm9kZSxcclxuICAgIGNhbGxMbm9kZVxyXG59XHJcbmZyb20gXCIuL2F1ZGlvU3RyZWFtTWFuYWdlci5qc1wiXHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbm5lY3RUb0Jub2RlKG5lYXJieUJub2RlSWQsIHBlZXIsIG1ldGFkYXRhKSB7XHJcbiAgICB2YXIgY29ubiA9IHBlZXIuY29ubmVjdChuZWFyYnlCbm9kZUlkLCB7XHJcbiAgICAgICAgXCJtZXRhZGF0YVwiOiBtZXRhZGF0YVxyXG4gICAgfSk7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiBvbkNvbm5lY3RpbmdCbm9kZShwZWVyLCBtZXRhZGF0YSkge1xyXG4gICAgcGVlci5vbignY29ubmVjdGlvbicsIGZ1bmN0aW9uKGNvbm4pIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImJub2RlXCIsIG1ldGFkYXRhLm5hbWUsIFwiY29ubmVjdGVkIGxub2RlXCIsIGNvbm4ubWV0YWRhdGEubmFtZSk7XHJcbiAgICAgICAgY2FsbExub2RlKGNvbm4ucGVlciwgcGVlcik7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gY29ubmVjdFRvU3VwZXJVc2VyKHBlZXIsIG1ldGFkYXRhKSB7XHJcbiAgICB2YXIgY29ubiA9IHBlZXIuY29ubmVjdChzdXBlclVzZXJEZXRhaWxzLm5hbWUsIHtcclxuICAgICAgICBcIm1ldGFkYXRhXCI6IG1ldGFkYXRhXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25uLm9uKCdkYXRhJywgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIHJlbmRlclJlc3BvbnNlKGRhdGEsIHBlZXIsIG1ldGFkYXRhKTtcclxuICAgICAgICBjb25uLmNsb3NlKCk7XHJcbiAgICB9KTtcclxuXHJcbn1cclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVXNlcihtZXRhZGF0YSkge1xyXG4gICAgdmFyIHBlZXIsIGNvbm47XHJcblxyXG4gICAgcGVlciA9IG5ldyBQZWVyKHBlZXJDb25maWdPcHRpb25zKTtcclxuXHJcbiAgICBpZiAobWV0YWRhdGEudHlwZSA9PSBcImJyb2FkY2FzdGVyXCIpIHtcclxuICAgICAgICBvbkNvbm5lY3RpbmdCbm9kZShwZWVyLCBtZXRhZGF0YSk7XHJcbiAgICAgICAgLy9vbkNhbGxpbmdCbm9kZShwZWVyLCBtZXRhZGF0YSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIG9uQ2FsbEJ5Qm5vZGUocGVlcik7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q3VycmVudFBvc2l0aW9uKGZ1bmN0aW9uKGNvb3Jkcykge1xyXG4gICAgICAgIG1ldGFkYXRhLmNvb3JkcyA9IGNvb3JkcztcclxuICAgICAgICBjb25uZWN0VG9TdXBlclVzZXIocGVlciwgbWV0YWRhdGEpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHBlZXI7XHJcblxyXG59XHJcbiJdfQ==
