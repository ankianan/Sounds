import {
    disconnectPanner,
    setPannerOrientation
}
from "./audioStreamManager.js"
import {
    REQUEST
}
from "../requestType.js";

var connMap = {}

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
        type: REQUEST.TYPE.DELETE.CLOSECONN,
        result: lnodeId
    });
}

function refreshSource(bnodeId, lnodeId, bcoords, lcoords) {
    

    var flag = isInRange(bcoords, lcoords);
    if (flag) {
        setPannerOrientation(bnodeId, bcoords);
    } else {
        disconnectPanner(bnodeId);
        notifyToClose(lnodeId);
    }
}

export function onCallByBnode(peer) {

    peer.on('call', function(call) {
        call.answer();
        call.on('stream', function(remoteStream) {
            var video = document.querySelector('video');
            video.src = window.URL.createObjectURL(remoteStream);
            video.onloadedmetadata = function(e) {
                video.play();
            };
        });
    });
}

export function connectToBnode(bnodeId, lnode, metadata) {
    var conn = lnode.connect(bnodeId, {
        "metadata": metadata
    });
    var lcoords = metadata.coords
    connMap[bnodeId] = conn;

    conn.on('data', function(data) {
        if (data.type == REQUEST.TYPE.UPDATE.POSCHANGE) {
            var bcoords = data.result;
            refreshSource(bnodeId, lnode.id, bcoords, lcoords);
        }
    })
}
