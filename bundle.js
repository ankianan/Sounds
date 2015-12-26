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

},{"./peer/superUser/superUser.js":7,"./peer/user/user.js":13}],2:[function(require,module,exports){
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
        },
        UPDATE: {
            "POSCHANGE": "200" //200-299
        },
        DELETE: {
            "CLOSECONN": "300" //300-399
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
exports.disconnectPanner = disconnectPanner;
exports.setPannerOrientation = setPannerOrientation;
exports.setListenerOrientation = setListenerOrientation;
exports.listenToAll = listenToAll;
exports.onCallByBnode = onCallByBnode;
exports.callLnode = callLnode;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var AudioContext = window.AudioContext || window.webkitAudioContext;

var audioCtx = new AudioContext(),
    pannerMap = {};

function creatPanner(peer, coords) {
    var panner = audioCtx.createPanner();

    pannerMap[peer] = panner;

    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.coneOuterGain = 0;
    panner.setOrientation(coords.x, coords.y, coords.z);
}
function disconnectPanner(bnodeId) {
    pannerMap[bnodeId].discConnect();
}
function setPannerOrientation(bnodeId, coords) {
    pannerMap[bnodeId].setOrientation(coords.x, coords.y, coords.z);
}

function setListenerOrientation(coords) {
    var listener = audioCtx.listener;
    listener.setOrientation(0, 0, -1, 0, 1, 0);
}

function listenToAll() {}

function onCallByBnode(peer) {

    peer.on('call', function (call) {
        call.answer();
        call.on('stream', function (remoteStream) {
            var video = document.querySelector('video');
            video.src = window.URL.createObjectURL(remoteStream);
            video.onloadedmetadata = function (e) {
                video.play();
            };
        });
    });
}

function callLnode(lNodeId, peer) {
    getUserMedia.call(window.navigator, {
        //video: true,
        audio: true
    }, function (stream) {
        var call = peer.call(lNodeId, stream);
    }, function (err) {
        console.log('Failed to get local stream', err);
    });
}

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.onConnectingBnode = onConnectingBnode;

var _requestType = require('../requestType.js');

var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var connMap = {};
var callMap = {};

function notifyConnectedPeers(coords) {
    for (key in connMap) {
        var conn = connMap[key];
        conn.send({
            type: _requestType.REQUEST.TYPE.UPDATE.POSCHANGE,
            result: coords
        });
    }
}

function callLnode(lnodeId, peer) {
    getUserMedia.call(window.navigator, {
        //video: true,
        audio: true
    }, function (stream) {
        callMap[lnodeId] = peer.call(lnodeId, stream);
    }, function (err) {
        console.log('Failed to get local stream', err);
    });
}

function closeCall(lnodeId) {
    callMap[lnodeId].close();
}

function onConnectingBnode(peer, metadata) {
    peer.on('connection', function (conn) {
        console.log("bnode", metadata.name, "connected lnode", conn.metadata.name);
        conn.on('open', function () {
            callLnode(conn.peer, peer);
            connMap[conn.peer] = conn;
        });
        conn.on('data', function (data) {
            if (data.type == _requestType.REQUEST.TYPE.DELETE.CLOSECONN) {
                var lnodeId = data.result;
                closeCall(lnodeId);
                conn.close();
            }
        });
    });
}

},{"../requestType.js":3}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getCurrentPosition = getCurrentPosition;
exports.watchPosition = watchPosition;

var _audioStreamManager = require("./audioStreamManager.js");

var _broadcaster = require("./broadcaster.js");

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

function watchPosition(nodeType) {
    if (nodeType == "listener") {
        navigator.geolocation.watchPosition(function (position) {
            //Notify server
            (0, _audioStreamManager.setListenerOrientation)(position);
        });
    } else if (nodeType == "broadcaster") {
        {
            navigator.geolocation.watchPosition(function (position) {
                //Notify server
                (0, _broadcaster.notifyConnectedPeers)(position);
            });
        }
    }
}

},{"./audioStreamManager.js":8,"./broadcaster.js":9}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.onCallByBnode = onCallByBnode;
exports.connectToBnode = connectToBnode;

var _audioStreamManager = require("./audioStreamManager.js");

var _requestType = require("../requestType.js");

var connMap = {};

var thresold = 1000;

//Orignal formular is root of sum of square of differences
function distance(coords1, coords2) {
    var sum = 0;
    sum += Math.pow(coords1.x - coords2.x, 2);
    sum += Math.pow(coords1.y - coords2.y, 2);
    sum += Math.pow(coords1.z - coords2.z, 2);
    return Math.sqrt(sum);
}

function isInRange(bcoords, lcoords) {
    if (distance <= thresold) {
        return true;
    }
    return false;
}

function notifyToClose(lnodeId) {
    connMap[bnodeId].send({
        type: _requestType.REQUEST.TYPE.DELETE.CLOSECONN,
        result: lnodeId
    });
}

function refreshSource(bnodeId, lnodeId, bcoords, lcoords) {

    var flag = isInRange(bcoords, lcoords);
    if (flag) {
        (0, _audioStreamManager.setPannerOrientation)(bnodeId, bcoords);
    } else {
        (0, _audioStreamManager.disconnectPanner)(bnodeId);
        notifyToClose(lnodeId);
    }
}

function onCallByBnode(peer) {

    peer.on('call', function (call) {
        call.answer();
        call.on('stream', function (remoteStream) {
            var video = document.querySelector('video');
            video.src = window.URL.createObjectURL(remoteStream);
            video.onloadedmetadata = function (e) {
                video.play();
            };
        });
    });
}

function connectToBnode(bnodeId, lnode, metadata) {
    var conn = lnode.connect(bnodeId, {
        "metadata": metadata
    });
    var lcoords = metadata.coords;
    connMap[bnodeId] = conn;

    conn.on('data', function (data) {
        if (data.type == _requestType.REQUEST.TYPE.UPDATE.POSCHANGE) {
            var bcoords = data.result;
            refreshSource(bnodeId, lnode.id, bcoords, lcoords);
        }
    });
}

},{"../requestType.js":3,"./audioStreamManager.js":8}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.renderResponse = renderResponse;
exports.makeRequest = makeRequest;

var _listener = require("./listener.js");

var _requestType = require("../requestType.js");

function renderResponse(data, peer, metadata) {
    var nearbyUserId;
    if (data.type == _requestType.REQUEST.TYPE.GET.NEARUSER) {
        nearbyUserId = data.result[0].id;
        (0, _listener.connectToBnode)(nearbyUserId, peer, metadata);

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

},{"../requestType.js":3,"./listener.js":11}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createUser = createUser;

var _geoLocationManager = require("./geoLocationManager.js");

var _config = require("../config.js");

var _requesManager = require("./requesManager.js");

var _listener = require("./listener.js");

var _broadcaster = require("./broadcaster.js");

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
        (0, _broadcaster.onConnectingBnode)(peer, metadata);
    } else {
        (0, _listener.onCallByBnode)(peer);
    }

    (0, _geoLocationManager.getCurrentPosition)(function (coords) {
        metadata.coords = coords;
        connectToSuperUser(peer, metadata);
    });

    return peer;
}

},{"../config.js":2,"./broadcaster.js":9,"./geoLocationManager.js":10,"./listener.js":11,"./requesManager.js":12}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnRcXGFwcC5qcyIsImNsaWVudFxccGVlclxcY29uZmlnLmpzIiwiY2xpZW50XFxwZWVyXFxyZXF1ZXN0VHlwZS5qcyIsImNsaWVudFxccGVlclxcc3VwZXJVc2VyXFxjcml0aWNhbFF1ZXVlTWFuYWdlci5qcyIsImNsaWVudFxccGVlclxcc3VwZXJVc2VyXFxub2RlTGlzdE1hbmFnZXJfc2ltcGxlLmpzIiwiY2xpZW50XFxwZWVyXFxzdXBlclVzZXJcXHJlc3BvbnNlTWFuYWdlci5qcyIsImNsaWVudFxccGVlclxcc3VwZXJVc2VyXFxzdXBlclVzZXIuanMiLCJjbGllbnRcXHBlZXJcXHVzZXJcXGF1ZGlvU3RyZWFtTWFuYWdlci5qcyIsImNsaWVudFxccGVlclxcdXNlclxcYnJvYWRjYXN0ZXIuanMiLCJjbGllbnRcXHBlZXJcXHVzZXJcXGdlb0xvY2F0aW9uTWFuYWdlci5qcyIsImNsaWVudFxccGVlclxcdXNlclxcbGlzdGVuZXIuanMiLCJjbGllbnRcXHBlZXJcXHVzZXJcXHJlcXVlc01hbmFnZXIuanMiLCJjbGllbnRcXHBlZXJcXHVzZXJcXHVzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNVQSxNQUFNLENBQUMsZUFBZSxjQUpsQixlQUFlLEFBSXFCLENBQUM7O0FBRXpDLE1BQU0sQ0FBQyxZQUFZLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDakMsUUFBSSxZQUFZLEdBQUc7QUFDZixjQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSztBQUNoQyxjQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSztLQUNuQyxDQUFDO0FBQ0YsY0FoQkEsVUFBVSxFQWdCQyxZQUFZLENBQUMsQ0FBQTtDQUMzQixDQUFDOzs7Ozs7OztBQ2xCSyxJQUFJLGdC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QUM7O0FBRUgsUUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBUyxJQUFJLEVBQUU7QUFDM0IsMkJBdEJKLGNBQWMsRUFzQkssSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNyQyxZQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDaEIsQ0FBQyxDQUFDO0NBRU47O0FBR00sU0FBUyxVQUFVLENBQUMsUUFBUSxFQUFFO0FBQ2pDLFFBQUksSUFBSSxFQUFFLElBQUksQ0FBQzs7QUFFZixRQUFJLEdBQUcsSUFBSSxJQUFJLFNBcENmLGlCQUFpQixDQW9DaUIsQ0FBQzs7QUFFbkMsUUFBSSxRQUFRLENBQUMsSUFBSSxJQUFJLGFBQWEsRUFBRTtBQUNoQyx5QkExQkosaUJBQWlCLEVBMEJLLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztLQUNyQyxNQUFNO0FBQ0gsc0JBakNKLGFBQWEsRUFpQ0ssSUFBSSxDQUFDLENBQUM7S0FDdkI7O0FBRUQsNEJBaERBLGtCQUFrQixFQWdEQyxVQUFTLE1BQU0sRUFBRTtBQUNoQyxnQkFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDekIsMEJBQWtCLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ3RDLENBQUMsQ0FBQzs7QUFFSCxXQUFPLElBQUksQ0FBQztDQUVmIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7XHJcbiAgICBjcmVhdGVVc2VyLCBxdWVyeVN1cGVyVXNlclxyXG59XHJcbmZyb20gXCIuL3BlZXIvdXNlci91c2VyLmpzXCI7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgY3JlYXRlU3VwZXJVc2VyXHJcbn1cclxuZnJvbSBcIi4vcGVlci9zdXBlclVzZXIvc3VwZXJVc2VyLmpzXCI7XHJcblxyXG53aW5kb3cuY3JlYXRlU3VwZXJVc2VyID0gY3JlYXRlU3VwZXJVc2VyO1xyXG5cclxud2luZG93LnJlZ2lzdGVyVXNlciA9IGZ1bmN0aW9uKGZvcm0pIHtcclxuICAgIHZhciB1c2VyTWV0YWRhdGEgPSB7XHJcbiAgICAgICAgXCJuYW1lXCI6IGZvcm0uZWxlbWVudHMubmFtZS52YWx1ZSxcclxuICAgICAgICBcInR5cGVcIjogZm9ybS5lbGVtZW50cy50eXBlLnZhbHVlLFxyXG4gICAgfTtcclxuICAgIGNyZWF0ZVVzZXIodXNlck1ldGFkYXRhKVxyXG59O1xyXG4iLCJleHBvcnQgdmFyIHN1cGVyVXNlckRldGFpbHMgPSB7XHJcbiAgICBuYW1lOiBcInN1cGVyVXNlcjFcIlxyXG59O1xyXG5leHBvcnQgdmFyIHBlZXJDb25maWdPcHRpb25zID0ge1xyXG4gICAgLy9rZXk6ICdoM3AwbG1kc3pndXY3dmknXHJcbiAgICBrZXkgOiAnNDV4MW1mOHF5eDc4MzNkaSdcclxuXHJcbn07XHJcbiIsImV4cG9ydCB2YXIgUkVRVUVTVCA9IHtcclxuICAgIFRZUEU6IHtcclxuICAgICAgICBHRVQ6IHtcclxuICAgICAgICAgICAgXCJORUFSVVNFUlwiOiBcIjFcIiAvLyAxLTk5IFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgUE9TVDoge1xyXG4gICAgICAgICAgICBcIlJFR0lTVEVSXCI6IFwiMTAwXCIgLy8gMTAwLTE5OVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgVVBEQVRFIDoge1xyXG4gICAgICAgIFx0XCJQT1NDSEFOR0VcIiA6IFwiMjAwXCIgLy8yMDAtMjk5XHJcbiAgICAgICAgfSxcclxuICAgICAgICBERUxFVEUgOiB7XHJcbiAgICAgICAgICAgIFwiQ0xPU0VDT05OXCIgOiBcIjMwMFwiIC8vMzAwLTM5OVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn1cclxuIiwiZXhwb3J0IHZhciBjcml0aWNhbFF1ZXVlID0gW107XHJcblxyXG5mdW5jdGlvbiBjaGVja0NyaXRpY2FsUXVldWUoKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNyaXRpY2FsUXVldWUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgdGFzayA9IGNyaXRpY2FsUXVldWUuc2hpZnQoKTtcclxuICAgICAgICB0YXNrKCk7XHJcbiAgICB9XHJcbiAgICBzZXRUaW1lb3V0KGNoZWNrQ3JpdGljYWxRdWV1ZSwgMTAwMCk7XHJcbn1cclxuY2hlY2tDcml0aWNhbFF1ZXVlKCk7XHJcbiIsIi8vVGhpcyB3aWxsIGJlIGluZGV4ZWREQiBpbXBsZW1lbnRhdGlvblxyXG5cclxuXHJcblxyXG4vL25vZGVzIHNvcnRlZCBiYXNlZCBvbiB0aGVpciBkaXN0YW5jZSBmcm9tIDAsMCwwXHJcbnZhciBibm9kZUxpc3QgPSBbXHJcblxyXG4gICAgLyp7XHJcbiAgICAgICAgX19wcm90b19fIDoge1xyXG4gICAgICAgICAgICBjb29kczoge1xyXG4gICAgICAgICAgICAgICAgeDogTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgeTogTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgejogTnVtYmVyXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAgICAgICAgXHJcbiAgICAgICAgcGVlcjogTnVtYmVyXHJcbiAgICAgICAgY29ubmVjdGlvbjogT2JqZWN0XHJcbiAgICB9Ki9cclxuXHJcbl07XHJcblxyXG5cclxuLy9PcmlnbmFsIGZvcm11bGFyIGlzIHJvb3Qgb2Ygc3VtIG9mIHNxdWFyZSBvZiBkaWZmZXJlbmNlc1xyXG5mdW5jdGlvbiBkaXN0YW5jZShjb29yZHMxLCBjb29yZHMyKSB7XHJcbiAgICB2YXIgc3VtID0gMDtcclxuICAgIHN1bSArPSBjb29yZHMxLnggLSBjb29yZHMyLng7XHJcbiAgICBzdW0gKz0gY29vcmRzMS55IC0gY29vcmRzMi55O1xyXG4gICAgc3VtICs9IGNvb3JkczEueiAtIGNvb3JkczIuejtcclxuICAgIHJldHVybiBzdW07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZU5ld0Jub2RlKGNvbm4pIHtcclxuICAgIHZhciBuZXdOb2RlID0gT2JqZWN0LmNyZWF0ZShjb25uLm1ldGFkYXRhKTtcclxuICAgIG5ld05vZGUuaWQgPSBjb25uLnBlZXI7XHJcbiAgICBuZXdOb2RlLmNvbm5lY3Rpb24gPSB7fTtcclxuICAgIHJldHVybiBuZXdOb2RlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmVhcmJ5Qm5vZGVJZHMobE1ldGFkYXRhKSB7XHJcbiAgICByZXR1cm4gYm5vZGVMaXN0Lm1hcChmdW5jdGlvbihibm9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IGJub2RlLmlkLFxyXG4gICAgICAgICAgICAgICAgZGlzdGFuY2U6IGRpc3RhbmNlKGJub2RlLmNvb3JkcywgbE1ldGFkYXRhLmNvb3JkcylcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEuZGlzdGFuY2UgLSBiLmRpc3RhbmNlO1xyXG4gICAgICAgIH0pO1xyXG59XHJcblxyXG4vL0FkZCBub2RlIHRvIHNvcnRlZCBibm9kZUxpc3RcclxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRvQm5vZGVMaXN0KGNvbm4pIHtcclxuICAgIHZhciBibm9kZSA9IGNyZWF0ZU5ld0Jub2RlKGNvbm4pO1xyXG4gICAgYm5vZGVMaXN0LnB1c2goYm5vZGUpO1xyXG5cclxufVxyXG4iLCJpbXBvcnQge1xyXG4gICAgUkVRVUVTVFxyXG59XHJcbmZyb20gXCIuLi9yZXF1ZXN0VHlwZS5qc1wiO1xyXG5pbXBvcnQge1xyXG4gICAgZ2V0TmVhcmJ5Qm5vZGVJZHNcclxufVxyXG5mcm9tIFwiLi9ub2RlTGlzdE1hbmFnZXJfc2ltcGxlLmpzXCI7XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VSZXNwb25zZSh0eXBlLCBjb25uKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gbnVsbDtcclxuICAgIGlmICh0eXBlID09IFJFUVVFU1QuVFlQRS5HRVQuTkVBUlVTRVIpIHtcclxuICAgICAgICByZXN1bHQgPSBnZXROZWFyYnlCbm9kZUlkcyhjb25uLm1ldGFkYXRhKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBSRVFVRVNULlRZUEUuUE9TVC5SRUdJU1RFUikge1xyXG4gICAgICAgIHJlc3VsdCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2cocmVzdWx0KTtcclxuXHJcbiAgICBjb25uLnNlbmQoe1xyXG4gICAgICAgIFwidHlwZVwiOiB0eXBlLFxyXG4gICAgICAgIFwicmVzdWx0XCI6IHJlc3VsdFxyXG4gICAgfSk7XHJcblxyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgICBSRVFVRVNUXHJcbn1cclxuZnJvbSBcIi4uL3JlcXVlc3RUeXBlLmpzXCI7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgcGVlckNvbmZpZ09wdGlvbnMsIHN1cGVyVXNlckRldGFpbHNcclxufVxyXG5mcm9tIFwiLi4vY29uZmlnLmpzXCI7XHJcbmltcG9ydCB7XHJcbiAgICBjcml0aWNhbFF1ZXVlXHJcbn1cclxuZnJvbSBcIi4vY3JpdGljYWxRdWV1ZU1hbmFnZXIuanNcIjtcclxuaW1wb3J0IHtcclxuICAgIGFkZFRvQm5vZGVMaXN0XHJcbn1cclxuZnJvbSBcIi4vbm9kZUxpc3RNYW5hZ2VyX3NpbXBsZS5qc1wiO1xyXG5pbXBvcnQge1xyXG4gICAgbWFrZVJlc3BvbnNlXHJcbn1cclxuZnJvbSBcIi4vcmVzcG9uc2VNYW5hZ2VyLmpzXCI7XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGxpc3RlbihwZWVyKSB7XHJcbiAgICBwZWVyLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24oY29ubikge1xyXG4gICAgICAgIGNvbm4ub24oJ29wZW4nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY3JpdGljYWxRdWV1ZS5wdXNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbm4ubWV0YWRhdGEudHlwZSA9PSBcImJyb2FkY2FzdGVyXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBhZGRUb0Jub2RlTGlzdChjb25uKTtcclxuICAgICAgICAgICAgICAgICAgICBtYWtlUmVzcG9uc2UoUkVRVUVTVC5UWVBFLlBPU1QuUkVHSVNURVIsIGNvbm4pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBtYWtlUmVzcG9uc2UoUkVRVUVTVC5UWVBFLkdFVC5ORUFSVVNFUiwgY29ubik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdXBlclVzZXIoKSB7XHJcbiAgICB2YXIgcGVlcjtcclxuXHJcbiAgICBwZWVyID0gbmV3IFBlZXIoc3VwZXJVc2VyRGV0YWlscy5uYW1lLCBwZWVyQ29uZmlnT3B0aW9ucyk7XHJcbiAgICBsaXN0ZW4ocGVlcik7XHJcblxyXG4gICAgcmV0dXJuIHBlZXI7XHJcbn1cclxuIiwidmFyIGdldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhO1xyXG52YXIgQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0O1xyXG5cclxudmFyIGF1ZGlvQ3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpLFxyXG4gICAgcGFubmVyTWFwID0ge307XHJcblxyXG5mdW5jdGlvbiBjcmVhdFBhbm5lcihwZWVyLCBjb29yZHMpIHtcclxuICAgIHZhciBwYW5uZXIgPSBhdWRpb0N0eC5jcmVhdGVQYW5uZXIoKTtcclxuXHJcbiAgICBwYW5uZXJNYXBbcGVlcl0gPSBwYW5uZXI7XHJcblxyXG4gICAgcGFubmVyLnBhbm5pbmdNb2RlbCA9ICdIUlRGJztcclxuICAgIHBhbm5lci5kaXN0YW5jZU1vZGVsID0gJ2ludmVyc2UnO1xyXG4gICAgcGFubmVyLnJlZkRpc3RhbmNlID0gMTtcclxuICAgIHBhbm5lci5tYXhEaXN0YW5jZSA9IDEwMDAwO1xyXG4gICAgcGFubmVyLnJvbGxvZmZGYWN0b3IgPSAxO1xyXG4gICAgcGFubmVyLmNvbmVJbm5lckFuZ2xlID0gMzYwO1xyXG4gICAgcGFubmVyLmNvbmVPdXRlckFuZ2xlID0gMDtcclxuICAgIHBhbm5lci5jb25lT3V0ZXJHYWluID0gMDtcclxuICAgIHBhbm5lci5zZXRPcmllbnRhdGlvbihjb29yZHMueCwgY29vcmRzLnksIGNvb3Jkcy56KTtcclxuXHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGRpc2Nvbm5lY3RQYW5uZXIoYm5vZGVJZCkge1xyXG4gICAgcGFubmVyTWFwW2Jub2RlSWRdLmRpc2NDb25uZWN0KCk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFBhbm5lck9yaWVudGF0aW9uKGJub2RlSWQsIGNvb3Jkcykge1xyXG4gICAgcGFubmVyTWFwW2Jub2RlSWRdLnNldE9yaWVudGF0aW9uKGNvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnopO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0TGlzdGVuZXJPcmllbnRhdGlvbihjb29yZHMpIHtcclxuICAgIHZhciBsaXN0ZW5lciA9IGF1ZGlvQ3R4Lmxpc3RlbmVyO1xyXG4gICAgbGlzdGVuZXIuc2V0T3JpZW50YXRpb24oMCwgMCwgLTEsIDAsIDEsIDApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbGlzdGVuVG9BbGwoKSB7XHJcblxyXG5cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG9uQ2FsbEJ5Qm5vZGUocGVlcikge1xyXG5cclxuICAgIHBlZXIub24oJ2NhbGwnLCBmdW5jdGlvbihjYWxsKSB7XHJcbiAgICAgICAgY2FsbC5hbnN3ZXIoKTtcclxuICAgICAgICBjYWxsLm9uKCdzdHJlYW0nLCBmdW5jdGlvbihyZW1vdGVTdHJlYW0pIHtcclxuICAgICAgICAgICAgdmFyIHZpZGVvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcigndmlkZW8nKTtcclxuICAgICAgICAgICAgdmlkZW8uc3JjID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwocmVtb3RlU3RyZWFtKTtcclxuICAgICAgICAgICAgdmlkZW8ub25sb2FkZWRtZXRhZGF0YSA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHZpZGVvLnBsYXkoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2FsbExub2RlKGxOb2RlSWQsIHBlZXIpIHtcclxuICAgIGdldFVzZXJNZWRpYS5jYWxsKHdpbmRvdy5uYXZpZ2F0b3IsIHtcclxuICAgICAgICAgICAgLy92aWRlbzogdHJ1ZSxcclxuICAgICAgICAgICAgYXVkaW86IHRydWVcclxuICAgICAgICB9LCBmdW5jdGlvbihzdHJlYW0pIHtcclxuICAgICAgICAgICAgdmFyIGNhbGwgPSBwZWVyLmNhbGwobE5vZGVJZCwgc3RyZWFtKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRmFpbGVkIHRvIGdldCBsb2NhbCBzdHJlYW0nLCBlcnIpO1xyXG4gICAgICAgIH0pO1xyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgICBSRVFVRVNUXHJcbn1cclxuZnJvbSBcIi4uL3JlcXVlc3RUeXBlLmpzXCI7XHJcbnZhciBnZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYTtcclxudmFyIGNvbm5NYXAgPSB7fTtcclxudmFyIGNhbGxNYXAgPSB7fTtcclxuXHJcbmZ1bmN0aW9uIG5vdGlmeUNvbm5lY3RlZFBlZXJzKGNvb3Jkcykge1xyXG4gICAgZm9yIChrZXkgaW4gY29ubk1hcCkge1xyXG4gICAgICAgIHZhciBjb25uID0gY29ubk1hcFtrZXldO1xyXG4gICAgICAgIGNvbm4uc2VuZCh7XHJcbiAgICAgICAgICAgIHR5cGU6IFJFUVVFU1QuVFlQRS5VUERBVEUuUE9TQ0hBTkdFLFxyXG4gICAgICAgICAgICByZXN1bHQ6IGNvb3Jkc1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjYWxsTG5vZGUobG5vZGVJZCwgcGVlcikge1xyXG4gICAgZ2V0VXNlck1lZGlhLmNhbGwod2luZG93Lm5hdmlnYXRvciwge1xyXG4gICAgICAgICAgICAvL3ZpZGVvOiB0cnVlLFxyXG4gICAgICAgICAgICBhdWRpbzogdHJ1ZVxyXG4gICAgICAgIH0sIGZ1bmN0aW9uKHN0cmVhbSkge1xyXG4gICAgICAgICAgICBjYWxsTWFwW2xub2RlSWRdID0gcGVlci5jYWxsKGxub2RlSWQsIHN0cmVhbSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0ZhaWxlZCB0byBnZXQgbG9jYWwgc3RyZWFtJywgZXJyKTtcclxuICAgICAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xvc2VDYWxsKGxub2RlSWQpIHtcclxuICAgIGNhbGxNYXBbbG5vZGVJZF0uY2xvc2UoKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG9uQ29ubmVjdGluZ0Jub2RlKHBlZXIsIG1ldGFkYXRhKSB7XHJcbiAgICBwZWVyLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24oY29ubikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiYm5vZGVcIiwgbWV0YWRhdGEubmFtZSwgXCJjb25uZWN0ZWQgbG5vZGVcIiwgY29ubi5tZXRhZGF0YS5uYW1lKTtcclxuICAgICAgICBjb25uLm9uKCdvcGVuJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNhbGxMbm9kZShjb25uLnBlZXIsIHBlZXIpO1xyXG4gICAgICAgICAgICBjb25uTWFwW2Nvbm4ucGVlcl0gPSBjb25uO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbm4ub24oJ2RhdGEnLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLnR5cGUgPT0gUkVRVUVTVC5UWVBFLkRFTEVURS5DTE9TRUNPTk4pIHtcclxuICAgICAgICAgICAgICAgIHZhciBsbm9kZUlkID0gZGF0YS5yZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICBjbG9zZUNhbGwobG5vZGVJZClcclxuICAgICAgICAgICAgICAgIGNvbm4uY2xvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH0pO1xyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgICBzZXRMaXN0ZW5lck9yaWVudGF0aW9uXHJcbn1cclxuZnJvbSBcIi4vYXVkaW9TdHJlYW1NYW5hZ2VyLmpzXCI7XHJcbmltcG9ydCB7XHJcbiAgICBub3RpZnlDb25uZWN0ZWRQZWVyc1xyXG59XHJcbmZyb20gXCIuL2Jyb2FkY2FzdGVyLmpzXCJcclxuXHJcblxyXG5mdW5jdGlvbiBsYXRMb25nVG9FQ0VGKGNvb3Jkcykge1xyXG4gICAgdmFyIGNvc0xhdCA9IE1hdGguY29zKGNvb3Jkcy5sYXRpdHVkZSAqIE1hdGguUEkgLyAxODAuMCk7XHJcbiAgICB2YXIgc2luTGF0ID0gTWF0aC5zaW4oY29vcmRzLmxhdGl0dWRlICogTWF0aC5QSSAvIDE4MC4wKTtcclxuICAgIHZhciBjb3NMb24gPSBNYXRoLmNvcyhjb29yZHMubG9uZ2l0dWRlICogTWF0aC5QSSAvIDE4MC4wKTtcclxuICAgIHZhciBzaW5Mb24gPSBNYXRoLnNpbihjb29yZHMubG9uZ2l0dWRlICogTWF0aC5QSSAvIDE4MC4wKTtcclxuICAgIHZhciByYWQgPSA2Mzc4MTM3LjA7XHJcbiAgICB2YXIgZiA9IDEuMCAvIDI5OC4yNTcyMjQ7XHJcbiAgICB2YXIgQyA9IDEuMCAvIE1hdGguc3FydChjb3NMYXQgKiBjb3NMYXQgKyAoMSAtIGYpICogKDEgLSBmKSAqIHNpbkxhdCAqIHNpbkxhdCk7XHJcbiAgICB2YXIgUyA9ICgxLjAgLSBmKSAqICgxLjAgLSBmKSAqIEM7XHJcbiAgICB2YXIgaCA9IDAuMDtcclxuICAgIHZhciB4ID0gKHJhZCAqIEMgKyBoKSAqIGNvc0xhdCAqIGNvc0xvbjtcclxuICAgIHZhciB5ID0gKHJhZCAqIEMgKyBoKSAqIGNvc0xhdCAqIHNpbkxvbjtcclxuICAgIHZhciB6ID0gKHJhZCAqIFMgKyBoKSAqIHNpbkxhdDtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IHBhcnNlSW50KHggLyAxMDAwKSxcclxuICAgICAgICB5OiBwYXJzZUludCh5IC8gMTAwMCksXHJcbiAgICAgICAgejogcGFyc2VJbnQoeiAvIDEwMDApXHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnRQb3NpdGlvbihjYWxsYmFjaykge1xyXG4gICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbihwb3NpdGlvbikge1xyXG4gICAgICAgIHZhciBFQ0VGQ29vcmRzID0gbGF0TG9uZ1RvRUNFRihwb3NpdGlvbi5jb29yZHMpXHJcbiAgICAgICAgY2FsbGJhY2soRUNFRkNvb3Jkcyk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHdhdGNoUG9zaXRpb24obm9kZVR5cGUpIHtcclxuICAgIGlmIChub2RlVHlwZSA9PSBcImxpc3RlbmVyXCIpIHtcclxuICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24ud2F0Y2hQb3NpdGlvbihmdW5jdGlvbihwb3NpdGlvbikge1xyXG4gICAgICAgICAgICAvL05vdGlmeSBzZXJ2ZXJcclxuICAgICAgICAgICAgc2V0TGlzdGVuZXJPcmllbnRhdGlvbihwb3NpdGlvbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGVsc2UgaWYgKG5vZGVUeXBlID09IFwiYnJvYWRjYXN0ZXJcIikge1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLndhdGNoUG9zaXRpb24oZnVuY3Rpb24ocG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIC8vTm90aWZ5IHNlcnZlclxyXG4gICAgICAgICAgICAgICAgbm90aWZ5Q29ubmVjdGVkUGVlcnMocG9zaXRpb24pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgICBkaXNjb25uZWN0UGFubmVyLFxyXG4gICAgc2V0UGFubmVyT3JpZW50YXRpb25cclxufVxyXG5mcm9tIFwiLi9hdWRpb1N0cmVhbU1hbmFnZXIuanNcIlxyXG5pbXBvcnQge1xyXG4gICAgUkVRVUVTVFxyXG59XHJcbmZyb20gXCIuLi9yZXF1ZXN0VHlwZS5qc1wiO1xyXG5cclxudmFyIGNvbm5NYXAgPSB7fVxyXG5cclxudmFyIHRocmVzb2xkID0gMTAwMDtcclxuXHJcbi8vT3JpZ25hbCBmb3JtdWxhciBpcyByb290IG9mIHN1bSBvZiBzcXVhcmUgb2YgZGlmZmVyZW5jZXNcclxuZnVuY3Rpb24gZGlzdGFuY2UoY29vcmRzMSwgY29vcmRzMikge1xyXG4gICAgdmFyIHN1bSA9IDA7XHJcbiAgICBzdW0gKz0gTWF0aC5wb3coY29vcmRzMS54IC0gY29vcmRzMi54LCAyKTtcclxuICAgIHN1bSArPSBNYXRoLnBvdyhjb29yZHMxLnkgLSBjb29yZHMyLnksIDIpO1xyXG4gICAgc3VtICs9IE1hdGgucG93KGNvb3JkczEueiAtIGNvb3JkczIueiwgMik7XHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHN1bSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzSW5SYW5nZShiY29vcmRzLCBsY29vcmRzKSB7XHJcbiAgICBpZiAoZGlzdGFuY2UgPD0gdGhyZXNvbGQpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24gbm90aWZ5VG9DbG9zZShsbm9kZUlkKSB7XHJcbiAgICBjb25uTWFwW2Jub2RlSWRdLnNlbmQoe1xyXG4gICAgICAgIHR5cGU6IFJFUVVFU1QuVFlQRS5ERUxFVEUuQ0xPU0VDT05OLFxyXG4gICAgICAgIHJlc3VsdDogbG5vZGVJZFxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlZnJlc2hTb3VyY2UoYm5vZGVJZCwgbG5vZGVJZCwgYmNvb3JkcywgbGNvb3Jkcykge1xyXG4gICAgXHJcblxyXG4gICAgdmFyIGZsYWcgPSBpc0luUmFuZ2UoYmNvb3JkcywgbGNvb3Jkcyk7XHJcbiAgICBpZiAoZmxhZykge1xyXG4gICAgICAgIHNldFBhbm5lck9yaWVudGF0aW9uKGJub2RlSWQsIGJjb29yZHMpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBkaXNjb25uZWN0UGFubmVyKGJub2RlSWQpO1xyXG4gICAgICAgIG5vdGlmeVRvQ2xvc2UobG5vZGVJZCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvbkNhbGxCeUJub2RlKHBlZXIpIHtcclxuXHJcbiAgICBwZWVyLm9uKCdjYWxsJywgZnVuY3Rpb24oY2FsbCkge1xyXG4gICAgICAgIGNhbGwuYW5zd2VyKCk7XHJcbiAgICAgICAgY2FsbC5vbignc3RyZWFtJywgZnVuY3Rpb24ocmVtb3RlU3RyZWFtKSB7XHJcbiAgICAgICAgICAgIHZhciB2aWRlbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3ZpZGVvJyk7XHJcbiAgICAgICAgICAgIHZpZGVvLnNyYyA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKHJlbW90ZVN0cmVhbSk7XHJcbiAgICAgICAgICAgIHZpZGVvLm9ubG9hZGVkbWV0YWRhdGEgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB2aWRlby5wbGF5KCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbm5lY3RUb0Jub2RlKGJub2RlSWQsIGxub2RlLCBtZXRhZGF0YSkge1xyXG4gICAgdmFyIGNvbm4gPSBsbm9kZS5jb25uZWN0KGJub2RlSWQsIHtcclxuICAgICAgICBcIm1ldGFkYXRhXCI6IG1ldGFkYXRhXHJcbiAgICB9KTtcclxuICAgIHZhciBsY29vcmRzID0gbWV0YWRhdGEuY29vcmRzXHJcbiAgICBjb25uTWFwW2Jub2RlSWRdID0gY29ubjtcclxuXHJcbiAgICBjb25uLm9uKCdkYXRhJywgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGlmIChkYXRhLnR5cGUgPT0gUkVRVUVTVC5UWVBFLlVQREFURS5QT1NDSEFOR0UpIHtcclxuICAgICAgICAgICAgdmFyIGJjb29yZHMgPSBkYXRhLnJlc3VsdDtcclxuICAgICAgICAgICAgcmVmcmVzaFNvdXJjZShibm9kZUlkLCBsbm9kZS5pZCwgYmNvb3JkcywgbGNvb3Jkcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufVxyXG4iLCJpbXBvcnR7XHJcblx0Y29ubmVjdFRvQm5vZGVcclxufVxyXG5mcm9tIFwiLi9saXN0ZW5lci5qc1wiXHJcbmltcG9ydCB7XHJcbiAgICBSRVFVRVNUXHJcbn1cclxuZnJvbSBcIi4uL3JlcXVlc3RUeXBlLmpzXCI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyUmVzcG9uc2UoZGF0YSwgcGVlciwgbWV0YWRhdGEpIHtcclxuXHR2YXIgbmVhcmJ5VXNlcklkO1xyXG4gICAgaWYgKGRhdGEudHlwZSA9PSBSRVFVRVNULlRZUEUuR0VULk5FQVJVU0VSKSB7XHJcbiAgICBcdG5lYXJieVVzZXJJZCA9IGRhdGEucmVzdWx0WzBdLmlkO1xyXG4gICAgXHRjb25uZWN0VG9Cbm9kZShuZWFyYnlVc2VySWQsIHBlZXIsIG1ldGFkYXRhKTtcclxuICAgIFx0XHJcbiAgICAgICAgLypkYXRhLnJlc3VsdC5tYXAoZnVuY3Rpb24obmVhcmJ5VXNlcklkKSB7XHJcbiAgICAgICAgICAgIGNvbm5lY3RUb0Jub2RlKG5lYXJieVVzZXJJZCwgcGVlciwgbWV0YWRhdGEpXHJcbiAgICAgICAgfSkqL1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWFrZVJlcXVlc3QodHlwZSwgcGVlcikge1xyXG4gICAgcGVlci5jb25uZWN0aW9uW3N1cGVyVXNlckRldGFpbHMubmFtZV1bMF0uc2VuZCh7XHJcbiAgICAgICAgdHlwZTogdHlwZVxyXG4gICAgfSk7XHJcbn1cclxuIiwiaW1wb3J0IHtcclxuICAgIGdldEN1cnJlbnRQb3NpdGlvblxyXG59XHJcbmZyb20gXCIuL2dlb0xvY2F0aW9uTWFuYWdlci5qc1wiO1xyXG5pbXBvcnQge1xyXG4gICAgcGVlckNvbmZpZ09wdGlvbnMsIHN1cGVyVXNlckRldGFpbHNcclxufVxyXG5mcm9tIFwiLi4vY29uZmlnLmpzXCI7XHJcbmltcG9ydCB7XHJcbiAgICByZW5kZXJSZXNwb25zZVxyXG59XHJcbmZyb20gJy4vcmVxdWVzTWFuYWdlci5qcyc7XHJcbmltcG9ydCB7XHJcbiAgICBvbkNhbGxCeUJub2RlLCAgICBcclxufVxyXG5mcm9tIFwiLi9saXN0ZW5lci5qc1wiXHJcblxyXG5pbXBvcnR7XHJcbiAgICBvbkNvbm5lY3RpbmdCbm9kZVxyXG59XHJcbmZyb20gXCIuL2Jyb2FkY2FzdGVyLmpzXCJcclxuXHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGNvbm5lY3RUb1N1cGVyVXNlcihwZWVyLCBtZXRhZGF0YSkge1xyXG4gICAgdmFyIGNvbm4gPSBwZWVyLmNvbm5lY3Qoc3VwZXJVc2VyRGV0YWlscy5uYW1lLCB7XHJcbiAgICAgICAgXCJtZXRhZGF0YVwiOiBtZXRhZGF0YVxyXG4gICAgfSk7XHJcblxyXG4gICAgY29ubi5vbignZGF0YScsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICByZW5kZXJSZXNwb25zZShkYXRhLCBwZWVyLCBtZXRhZGF0YSk7XHJcbiAgICAgICAgY29ubi5jbG9zZSgpO1xyXG4gICAgfSk7XHJcblxyXG59XHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVVzZXIobWV0YWRhdGEpIHtcclxuICAgIHZhciBwZWVyLCBjb25uO1xyXG5cclxuICAgIHBlZXIgPSBuZXcgUGVlcihwZWVyQ29uZmlnT3B0aW9ucyk7XHJcblxyXG4gICAgaWYgKG1ldGFkYXRhLnR5cGUgPT0gXCJicm9hZGNhc3RlclwiKSB7XHJcbiAgICAgICAgb25Db25uZWN0aW5nQm5vZGUocGVlciwgbWV0YWRhdGEpOyAgICAgICAgXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIG9uQ2FsbEJ5Qm5vZGUocGVlcik7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q3VycmVudFBvc2l0aW9uKGZ1bmN0aW9uKGNvb3Jkcykge1xyXG4gICAgICAgIG1ldGFkYXRhLmNvb3JkcyA9IGNvb3JkcztcclxuICAgICAgICBjb25uZWN0VG9TdXBlclVzZXIocGVlciwgbWV0YWRhdGEpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHBlZXI7XHJcblxyXG59XHJcbiJdfQ==
